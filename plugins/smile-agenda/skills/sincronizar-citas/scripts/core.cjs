'use strict';
const {createHash} = require('node:crypto');
const ZONE='America/Guatemala';
const hash=s=>createHash('sha256').update(s).digest('hex');
function date(s){if(typeof s!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(s))throw Error('Fecha inválida');const d=new Date(s+'T12:00:00Z');if(!Number.isFinite(+d)||d.toISOString().slice(0,10)!==s)throw Error('Fecha inexistente');return s;}
function add(s,n){date(s);const d=new Date(s+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10);}
function today(now=new Date()){const p=new Intl.DateTimeFormat('en-US',{timeZone:ZONE,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);const get=k=>p.find(x=>x.type===k).value;return `${get('year')}-${get('month')}-${get('day')}`;}
function weeks(now=new Date()){const t=today(now),dow=new Date(t+'T12:00:00Z').getUTCDay();const from=add(t,-((dow+6)%7));return {from,to:add(from,13),time_min:from+'T00:00:00-06:00',time_max:add(from,14)+'T00:00:00-06:00',timezone_str:ZONE};}
function sentence(s){const t=s.trim().toLocaleLowerCase('es');return t.charAt(0).toLocaleUpperCase('es')+t.slice(1);}
function titleName(s){return s.trim().toLocaleLowerCase('es').replace(/(^|[\s-])\p{L}/gu,m=>m.toLocaleUpperCase('es'));}
function scopeKey(smileIdentity,calendarId){if(!smileIdentity?.trim()||!calendarId?.trim())throw Error('Falta identificar las dos cuentas');return hash(JSON.stringify(['smile-ag.ufm.edu',smileIdentity.trim().normalize('NFC'),calendarId.trim()]));}
function sourceKey(scope,id){if(!/^[a-f0-9]{64}$/.test(scope)||!/^\d+$/.test(String(id)))throw Error('Identificador inválido');return hash(scope+':'+id);}
function clinic(row){const dep=sentence(row.department),physical=row.clinic.trim();if(/jornada/i.test(physical))return dep+' / Jornada';if(/^(RESTA|CL RES)$/i.test(physical)&&/restaurativa/i.test(dep))return dep;const cleaned=physical.replace(/^CL[ÍI]NICA DE\s+/i,'');if(cleaned.toLocaleLowerCase('es')===row.department.toLocaleLowerCase('es'))return dep;return physical?sentence(physical):dep;}
function event(row,firstName){
 date(row.date);if(!/^([01]\d|2[0-3]):[0-5]\d$/.test(row.time))throw Error('Hora inválida');
 if(!/^\d{2}:[0-5]\d$/.test(row.duration))throw Error('Duración ausente o inválida');
 const [h,m]=row.duration.split(':').map(Number),minutes=h*60+m;if(minutes<=0||minutes>24*60)throw Error('Duración fuera de rango');
 if(!row.department?.trim()||!row.clinic?.trim()||!row.status?.trim()||!firstName?.trim())throw Error('Datos de cita incompletos');
 const generic=/^ODONTOLOGIA PACIENTE CLINICA$/i.test(row.patient.trim());
 const name=generic?'Paciente sin identificar':titleName(firstName),dep=sentence(row.department),place=clinic(row);
 const start=row.date+'T'+row.time+':00-06:00';
 const end=new Date(new Date(start).getTime()+minutes*60000-6*3600000).toISOString().slice(0,19)+'-06:00';
 return {title:`Cita: ${name} · ${dep}`,description:`Clínica: ${place}\nEstado: ${sentence(row.status)}${generic?'\nLa agenda no identifica al paciente.':''}`,location:'',start_time:start,end_time:end,timezone_str:ZONE,attendees:[],visibility:'private',add_google_meet:false,reminders:{use_default:false,overrides:[{method:'popup',minutes:30}]}};
}
function fingerprint(e){return hash(JSON.stringify([e.title,e.description,e.start_time,e.end_time,e.location,e.visibility]));}
function plan(rows,names,ledger,scope,existing,calendarId){
 const ids=new Set(),claimed=new Set(),actions=[];
 const byId=new Map(existing.map(e=>[e.id,e]));
 for(const row of rows){
  if(ids.has(row.id))throw Error('Cita duplicada en la extracción');ids.add(row.id);
  const key=sourceKey(scope,row.id),saved=ledger.entries[key],desired=event(row,names[row.id]),fp=fingerprint(desired);
  if(!saved && /CANCELAD/i.test(row.status)){actions.push({kind:'omit-cancelled',key});continue;}
  if(saved?.pending){actions.push({kind:'review-pending',key});continue;}
  if(saved){
   const current=byId.get(saved.eventId);
   if(!current){actions.push({kind:'read-mapped-event',key,eventId:saved.eventId});continue;}
   if(claimed.has(current.id))throw Error('Registro inconsistente');claimed.add(current.id);
   const normalize=s=>(s||'').replace(/\s+/g,' ').trim();
   const equal=current.summary===desired.title && normalize(current.description)===normalize(desired.description) && current.start===desired.start_time && current.end===desired.end_time && current.visibility==='private' && !current.location;
   const fields={title:desired.title,description:desired.description,location:'',start_time:desired.start_time,end_time:desired.end_time,timezone_str:ZONE};
   if(/CANCELAD/i.test(row.status))fields.transparency='transparent';
   actions.push({kind:equal&&(!/CANCELAD/i.test(row.status)||current.transparency==='transparent')?'unchanged':'update',key,eventId:current.id,fingerprint:fp,args:{calendar_id:calendarId,event_id:current.id,...fields}});
  }else{
   const candidates=existing.filter(e=>e.summary===desired.title && e.start===desired.start_time && e.end===desired.end_time);
   actions.push(candidates.length?{kind:'review-existing',key,candidateIds:candidates.map(e=>e.id)}:{kind:'create',key,fingerprint:fp,args:{calendar_id:calendarId,...desired}});
  }
 }
 return actions;
}
module.exports={ZONE,date,add,today,weeks,scopeKey,sourceKey,event,fingerprint,plan};
