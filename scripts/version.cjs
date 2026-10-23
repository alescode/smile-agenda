const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const next=process.argv[2];
if(!/^\d+\.\d+\.\d+$/.test(next||''))throw Error('Uso: npm run release:version -- 0.1.2');
const files=['package.json','plugins/smile-agenda/package.json','plugins/smile-agenda/plugin.json','plugins/smile-agenda/.codex-plugin/plugin.json'];
const docs=files.map(f=>({file:path.join(root,f),data:JSON.parse(fs.readFileSync(path.join(root,f),'utf8'))}));
for(const {data} of docs){const a=next.split('.').map(Number),b=data.version.split('.').map(Number);const i=a.findIndex((v,i)=>v!==b[i]);if(i<0||a[i]<b[i])throw Error('La versión debe ser mayor que '+data.version);}
for(const {file,data} of docs){data.version=next;fs.writeFileSync(file,JSON.stringify(data,null,2)+'\n');}
console.log('Versión actualizada a '+next+'. Ejecuta npm test, revisa el diff y publica el commit.');
