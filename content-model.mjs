export const sections=['home','products','series','gallery','events','collections','story','settings'];
export function safeLink(value, fallback='?') {
 if(typeof value!=='string')return fallback;
 if(/^\?[^\s<>]*$/.test(value))return value;
 try{const u=new URL(value);if(u.protocol==='https:'&&!u.username&&!u.password)return u.href;}catch{}
 return fallback;
}
export function safeImage(value){
 if(typeof value!=='string'||/[<>"'\\\x00-\x20]/.test(value)||value.includes('..'))return '';
 if(/^https:\/\//.test(value))return safeLink(value,'');
 return /^(?:\/kaffbrew\/)?(?:[a-zA-Z0-9_%.-]+\/)*[a-zA-Z0-9_%.-]+\.(?:png|jpe?g|webp)$/i.test(value)?value:'';
}
export function localDate(now=new Date()){return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Ho_Chi_Minh',year:'numeric',month:'2-digit',day:'2-digit'}).format(now);}
export function activeEvents(items,today=localDate()){return items.filter(x=>x.visible===true&&(!x.start||x.start.slice(0,10)<=today)&&(!x.end||x.end.slice(0,10)>=today));}
export function validateContent(data){
 const errors=[];const fail=m=>errors.push(m);
 for(const s of sections)if(!data[s]||typeof data[s]!=='object'||Array.isArray(data[s]))fail('Thiếu mục: '+s);
 if(errors.length)return errors;
 const limits={products:[0,40],series:[3,3],gallery:[1,12],events:[0,40],collections:[6,6]};
 for(const[s,[min,max]]of Object.entries(limits)){const a=data[s].items;if(!Array.isArray(a)||a.length<min||a.length>max)fail(`${s}: cần ${min}–${max} mục.`);else a.forEach((x,i)=>{if(!x||typeof x!=='object'||Array.isArray(x)||!String(x.title||'').trim())fail(`${s} #${i+1}: thiếu tên.`);});}
 if(typeof data.home.title!=='string'||!data.home.title.trim())fail('Thiếu tiêu đề đầu trang.');
 if(!Array.isArray(data.story.paragraphs)||!data.story.paragraphs.length)fail('Câu chuyện cần ít nhất một đoạn văn.');
 const ids=data.series.items?.map(x=>x.id)||[];if(ids.length!==3||new Set(ids).size!==3||!['phin','matcha','cold-brew'].every(id=>ids.includes(id)))fail('Ba bộ sưu tập phải là Phin, Matcha và Cold Brew.');
 const cats=['phin','matcha','cold-brew','croffle','ca-cao','specials'];const cids=data.collections.items?.map(x=>x.id)||[];if(new Set(cids).size!==6||!cats.every(x=>cids.includes(x)))fail('Không được thay đổi mã nhóm đồ uống.');
 function walk(v,path=''){
  if(typeof v==='string'&&v.length>12000)fail(path+': nội dung quá dài.');
  if(Array.isArray(v)){v.forEach((x,i)=>walk(x,path+'.'+i));return;}
  if(!v||typeof v!=='object')return;
  for(const[k,x]of Object.entries(v)){
   if(['__proto__','constructor','prototype'].includes(k))fail('Trường không hợp lệ.');
   if(k==='image'&&x&&!safeImage(x))fail(path+': ảnh không hợp lệ.');
   if(['link','orderLink','facebook','instagram','tiktok'].includes(k)&&x&&!safeLink(x,''))fail(path+': liên kết không hợp lệ.');
   if(['start','end'].includes(k)&&x){const d=String(x).slice(0,10);if(!/^\d{4}-\d{2}-\d{2}$/.test(d)||!Number.isFinite(Date.parse(d))||new Date(d).toISOString().slice(0,10)!==d)fail(path+': ngày không hợp lệ.');}
   walk(x,path+'.'+k);
  }
 }
 walk(data);
 for(const x of data.products.items||[]){if(!['phin','matcha','cold-brew','croffle','ca-cao','sinh-to'].includes(x.category))fail('Chọn nhóm cho sản phẩm '+x.title);if(x.price!==null&&x.price!==undefined&&x.price!==''&&(typeof x.price!=='number'||x.price<0||x.price>10000000))fail('Giá không hợp lệ: '+x.title);}
 for(const x of data.events.items||[])if(x.start&&x.end&&x.start.slice(0,10)>x.end.slice(0,10))fail('Ngày kết thúc trước ngày bắt đầu: '+x.title);
 return errors;
}
