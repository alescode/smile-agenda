const fs=require('node:fs');const path=require('node:path');const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');const read=f=>JSON.parse(fs.readFileSync(path.join(root,f),'utf8'));
const market=read('.agents/plugins/marketplace.json'),plugin=read('plugins/smile-agenda/plugin.json'),compat=read('plugins/smile-agenda/.codex-plugin/plugin.json');
assert.equal(market.name,'smile-agenda-distribution');assert.equal(market.plugins[0].source.path,'./plugins/smile-agenda');
assert.equal(plugin.name,market.plugins[0].name);assert.equal(plugin.$schema,'https://agent-plugins.org/schemas/1.0.0/plugin.schema.json');
assert.match(plugin.version,/^\d+\.\d+\.\d+$/);
assert.equal(plugin.version,compat.version);assert.equal(plugin.version,read('package.json').version);assert.equal(plugin.version,read('plugins/smile-agenda/package.json').version);
assert.equal(compat.name,plugin.name);assert.deepEqual(compat.interface,plugin.extensions['com.openai'].interface);
assert.ok(plugin.extensions['com.openai'].interface.shortDescription.length<=30);
for(const icon of ['logo','composerIcon'])assert.ok(fs.existsSync(path.join(root,'plugins/smile-agenda',plugin.extensions['com.openai'].interface[icon])));
function scan(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){if(e.name==='.git')continue;const p=path.join(dir,e.name);assert.ok(!e.isSymbolicLink(),'No distribuir enlaces simbólicos');assert.ok(!['.session','node_modules','.env','calendar-map.json','state.json','browser-endpoint'].includes(e.name),'Archivo privado: '+e.name);if(e.isDirectory())scan(p);else if(p!==__filename && /\.(json|md|cjs|js|yml)$/.test(e.name)){const s=fs.readFileSync(p,'utf8');assert.ok(!/alejandromachado@|\/Users\/mach\/|ci_session_web|gho_[a-zA-Z0-9]{20}/.test(s),'Datos locales en '+p);}}}
scan(root);console.log('Catálogo, versiones, iconos y exclusión de datos locales: OK');
