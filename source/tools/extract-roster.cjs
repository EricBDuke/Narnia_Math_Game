// Extracts BOOKS from the Roster Page source into roster-raw.json
const fs=require('fs');const src=fs.readFileSync(process.argv[2],'utf8');
const s=src.indexOf('const BOOKS');const e=src.indexOf('const CONTROLS');
let code=src.slice(s,e).replace('const BOOKS: Book[] =','module.exports=');
const m={};new Function('module',code)(m);
fs.writeFileSync(process.argv[3],JSON.stringify(m.exports,null,1));
console.log(m.exports.map(b=>b.title+': '+b.chars.map(c=>c[0]).join(', ')).join('\n'));
