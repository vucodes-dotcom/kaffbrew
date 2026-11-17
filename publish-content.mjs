import fs from 'node:fs';
import {sections,validateContent} from './content-model.mjs';
const d=Object.fromEntries(sections.map(key=>[key,JSON.parse(fs.readFileSync(new URL('draft-'+key+'.json',import.meta.url),'utf8'))]));
const errors=validateContent(d);
function checkImages(v){if(Array.isArray(v))return v.forEach(checkImages);if(!v||typeof v!=='object')return;for(const[k,x]of Object.entries(v)){if(k==='image'&&x&&!x.startsWith('https://')){let rel=x.replace(/^\/kaffbrew\//,'');try{rel=decodeURIComponent(rel);}catch{errors.push('Tên ảnh không hợp lệ.');continue;}if(rel.includes('..')||!fs.existsSync(new URL(rel,import.meta.url)))errors.push('Không tìm thấy ảnh: '+x);}else checkImages(x);}}
checkImages(d);
if(errors.length){console.error('Chưa thể đăng:\n'+errors.join('\n'));process.exit(1);}
const file=new URL('site-content.json',import.meta.url);const previous=JSON.parse(fs.readFileSync(file,'utf8'));const comparable=Object.fromEntries(sections.map(k=>[k,previous[k]]));
if(JSON.stringify(comparable)===JSON.stringify(d)){console.log('Không có thay đổi mới.');process.exit(0);}
fs.writeFileSync(new URL('site-content.previous.json',import.meta.url),JSON.stringify(previous,null,2)+'\n');
fs.writeFileSync(file,JSON.stringify({version:1,publishedAt:new Date().toISOString(),...d},null,2)+'\n');console.log('Đã chuẩn bị nội dung mới.');
