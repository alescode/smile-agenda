const test=require('node:test');
const assert=require('node:assert/strict');
const os=require('node:os');
const fs=require('node:fs/promises');
const path=require('node:path');
const c=require('../skills/sincronizar-citas/scripts/core.cjs');
const ledger=require('../skills/sincronizar-citas/scripts/ledger.cjs');
const row={id:'100',date:'2026-10-23',time:'23:30',duration:'02:00',patient:'APELLIDO EJEMPLO ANA',department:'RESTAURATIVA',clinic:'CL RES',status:'NO CONFIRMADA'};
const scope=c.scopeKey('alumno-de-prueba','calendario-de-prueba');
const key=c.sourceKey(scope,row.id);
test('dos semanas de lunes a domingo, incluido viernes y límite de año',()=>{
 assert.deepEqual(c.weeks(new Date('2026-10-23T12:00:00Z')),{from:'2026-10-19',to:'2026-11-01',time_min:'2026-10-19T00:00:00-06:00',time_max:'2026-11-02T00:00:00-06:00',timezone_str:'America/Guatemala'});
 assert.equal(c.weeks(new Date('2026-10-26T05:59:59Z')).from,'2026-10-19');
 assert.equal(c.weeks(new Date('2026-10-26T06:00:00Z')).from,'2026-10-26');
 assert.equal(c.weeks(new Date('2027-01-01T12:00:00Z')).from,'2026-12-28');
 assert.throws(()=>c.date('2026-02-29'));assert.equal(c.date('2028-02-29'),'2028-02-29');
});
test('formato acordado, duración que cruza medianoche y datos mínimos',()=>{
 const e=c.event(row,'ANA');assert.equal(e.title,'Cita: Ana · Restaurativa');
 assert.equal(e.description,'Clínica: Restaurativa\nEstado: No confirmada');
 assert.equal(e.end_time,'2026-10-24T01:30:00-06:00');assert.equal(e.location,'');
 assert.equal(e.visibility,'private');assert.equal(e.add_google_meet,false);assert.deepEqual(e.attendees,[]);
 assert.doesNotMatch(JSON.stringify(e),/APELLIDO|EJEMPLO|Origen|Duración|Smile/);
 assert.throws(()=>c.event({...row,duration:''},'Ana'));
});
test('la jornada se conserva y el paciente genérico no se inventa',()=>{
 const e=c.event({...row,patient:'ODONTOLOGIA PACIENTE CLINICA',department:'ODONTOPEDIATRÍA',clinic:'CLÍNICA DE ODONTOLOGÍA PEDIÁTRICA / JORNADA'},'desconocido');
 assert.equal(e.title,'Cita: Paciente sin identificar · Odontopediatría');assert.match(e.description,/Odontopediatría \/ Jornada/);
});
test('aislamiento de cuentas y calendarios',()=>{
 assert.notEqual(scope,c.scopeKey('otro-alumno','calendario-de-prueba'));
 assert.notEqual(scope,c.scopeKey('alumno-de-prueba','otro-calendario'));
 assert.notEqual(key,c.sourceKey(c.scopeKey('otro-alumno','calendario-de-prueba'),row.id));
});
test('crear una vez y actualizar por ID aunque cambie el horario',()=>{
 const names={'100':'Ana'},empty={entries:{}};
 assert.equal(c.plan([row],names,empty,scope,[],'primary')[0].kind,'create');
 const desired=c.event(row,'Ana');const saved={entries:{[key]:{eventId:'evento-prueba'}}};
 const current={id:'evento-prueba',summary:desired.title,description:desired.description,start:desired.start_time,end:desired.end_time,visibility:'private',location:''};
 assert.equal(c.plan([row],names,saved,scope,[current],'primary')[0].kind,'unchanged');
 const moved=c.plan([{...row,time:'10:00'}],names,saved,scope,[current],'primary')[0];
 assert.equal(moved.kind,'update');assert.equal(moved.eventId,'evento-prueba');
 assert.equal(c.plan([row],names,saved,scope,[],'primary')[0].kind,'read-mapped-event');
 assert.equal(c.plan([row],names,empty,scope,[current],'primary')[0].kind,'review-existing');
 assert.equal(c.plan([row],names,{entries:{[key]:{pending:true}}},scope,[],'primary')[0].kind,'review-pending');
});
test('cancelaciones no crean ni borran citas',()=>{
 const cancelled={...row,status:'CANCELADA'};
 assert.equal(c.plan([cancelled],{'100':'Ana'},{entries:{}},scope,[],'primary')[0].kind,'omit-cancelled');
 assert.deepEqual(c.plan([],{}, {entries:{[key]:{eventId:'evento-prueba'}}},scope,[],'primary'),[]);
});
test('registro privado, bloqueo y rechazo de datos personales',async()=>{
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'smile-test-'));
 let opened;
 try{
  opened=await ledger.open(dir,scope);await assert.rejects(ledger.open(dir,scope),/activa/);
  opened.value.entries[key]={eventId:'evento-prueba',fingerprint:c.fingerprint(c.event(row,'Ana')),pending:false};await opened.save();
  assert.equal((await fs.stat(path.join(dir,scope+'.json'))).mode&0o777,0o600);
  assert.doesNotMatch(await fs.readFile(path.join(dir,scope+'.json'),'utf8'),/Ana|APELLIDO|2026|NO CONFIRMADA/);
  opened.value.entries[key].patient='Ana';await assert.rejects(opened.save(),/Registro inválido/);delete opened.value.entries[key].patient;
  await opened.close();opened=await ledger.open(dir,scope);assert.equal(opened.value.entries[key].eventId,'evento-prueba');
 }finally{if(opened)await opened.close();await fs.rm(dir,{recursive:true,force:true});}
});
