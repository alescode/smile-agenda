'use strict';
const fs=require('node:fs/promises');
const path=require('node:path');
function validate(value,scope){
 if(value.version!==1||value.scope!==scope||!value.entries||typeof value.entries!=='object'||Array.isArray(value.entries))throw Error('Registro incompatible con esta cuenta');
 for(const [key,e] of Object.entries(value.entries)){
  if(!/^[a-f0-9]{64}$/.test(key)||!e||Object.keys(e).some(k=>!['eventId','fingerprint','pending'].includes(k)))throw Error('Registro inválido');
  if(e.eventId!==undefined&&(typeof e.eventId!=='string'||!e.eventId))throw Error('Evento inválido');
  if(e.fingerprint!==undefined&&!/^[a-f0-9]{64}$/.test(e.fingerprint))throw Error('Huella inválida');
  if(e.pending!==undefined&&typeof e.pending!=='boolean')throw Error('Operación inválida');
 }
 return value;
}
async function open(directory,scope){
 if(!path.isAbsolute(directory)||!/^[a-f0-9]{64}$/.test(scope))throw Error('Se necesita una carpeta local absoluta y un ámbito válido');
 await fs.mkdir(directory,{recursive:true,mode:0o700});await fs.chmod(directory,0o700);
 await fs.writeFile(path.join(directory,'.gitignore'),'*\n',{mode:0o600});
 const lock=path.join(directory,scope+'.lock');
 try {await fs.mkdir(lock,{mode:0o700});}catch(e){if(e.code==='EEXIST')throw Error('Ya hay una sincronización activa o una operación interrumpida. No iniciar otra hasta resolverla.');throw e;}
 const file=path.join(directory,scope+'.json');
 let closed=false;
 try {
  let value;
  try{value=validate(JSON.parse(await fs.readFile(file,'utf8')),scope);}catch(e){if(e.code!=='ENOENT')throw e;value={version:1,scope,entries:{}};}
  return {value,async save(){validate(value,scope);const tmp=file+'.tmp';await fs.writeFile(tmp,JSON.stringify(value),{mode:0o600});await fs.chmod(tmp,0o600);await fs.rename(tmp,file);},async close(){if(!closed){closed=true;await fs.rmdir(lock);}}};
 }catch(e){await fs.rmdir(lock);throw e;}
}
module.exports={open,validate};
