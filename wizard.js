document.body.classList.add('intro-lock');
const intro=document.getElementById('carIntro');
const finishIntro=()=>{intro.classList.add('finished');document.body.classList.remove('intro-lock')};
setTimeout(finishIntro,3500);intro.addEventListener('click',finishIntro);

const vMessages=document.getElementById('valuationMessages');
const vInput=document.getElementById('valuationAnswer');
const vSend=document.getElementById('valuationSend');
const vOptions=document.getElementById('quickOptions');
const restart=document.getElementById('restartValuation');
const allCars=[
  ...Object.entries(catalog.iranian).flatMap(([b,ms])=>Object.keys(ms).map(m=>({type:'iranian',brand:b,model:m}))),
  ...Object.entries(catalog.foreign).flatMap(([b,ms])=>Object.keys(ms).map(m=>({type:'foreign',brand:b,model:m})))
];
const state={car:null,year:null,mileage:null,body:null,color:null};
const bodyLabels={clean:'بدون رنگ',one:'یک تکه رنگ',multi:'چند تکه رنگ',full:'تمام‌رنگ',accident:'تصادف سنگین'};
const aliases=[
  {match:['بنزe250','بنز e250','مرسدسe250','مرسدس e250','e250'],model:'E250'},
  {match:['بنزe350','بنز e350','مرسدسe350','مرسدس e350','e350'],model:'E350'},
  {match:['بنزc200','بنز c200','مرسدسc200','مرسدس c200','c200'],model:'C200'},
  {match:['پژو206تیپ2','پژو 206 تیپ 2','۲۰۶ تیپ ۲','206 تیپ 2'],model:'پژو ۲۰۶ تیپ ۲'},
  {match:['پژو206تیپ5','پژو 206 تیپ 5','۲۰۶ تیپ ۵','206 تیپ 5'],model:'پژو ۲۰۶ تیپ ۵'},
  {match:['پژو207','پژو 207','پژو۲۰۷','۲۰۷ اتومات'],model:'پژو ۲۰۷ اتومات'}
];
const colors=['مشکی','سفید','خاکستری','نقره‌ای','نوک مدادی','آبی','قرمز','سبز','زرد','کرم','قهوه‌ای'];
const normalize=s=>s.replace(/[ي]/g,'ی').replace(/[ك]/g,'ک').replace(/[٬,]/g,'').replace(/‌/g,' ').toLowerCase().trim();
const digits=s=>s.replace(/[۰-۹]/g,d=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d));
const safe=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function bubble(text,who='bot',small=''){
  vMessages.insertAdjacentHTML('beforeend',`<div class="v-message ${who}">${who==='bot'?'<span class="mini-ai">AI</span>':''}<p>${safe(text)}${small?'<small>'+safe(small)+'</small>':''}</p></div>`);
  vMessages.scrollTop=vMessages.scrollHeight;
}
function options(items){
  vOptions.innerHTML=items.map(x=>`<button type="button">${safe(x)}</button>`).join('');
  vOptions.querySelectorAll('button').forEach(b=>b.onclick=()=>answer(b.textContent));
}
function ask(text,placeholder,items=[]){
  setTimeout(()=>{bubble(text);vInput.placeholder=placeholder;vInput.value='';options(items);vInput.focus()},220);
}
function findCar(text){
  const q=normalize(digits(text));
  const alias=aliases.find(a=>a.match.some(x=>q.includes(normalize(digits(x)))));
  if(alias)return allCars.find(c=>c.model===alias.model);
  return allCars.find(c=>{
    const m=normalize(digits(c.model)).replace(/مدل\s*\d{4}/,'').trim();
    return q.includes(m)||(q.includes(normalize(c.brand))&&m.split(' ').some(w=>w.length>2&&q.includes(w)));
  });
}
function readYear(text){
  const nums=digits(text).match(/\b(13[89]\d|14[0-1]\d|19[89]\d|20[0-2]\d)\b/g);
  if(!nums)return null;
  let n=Number(nums[0]);
  if(n>=1980)n-=621;
  return n>=1380&&n<=1405?n:null;
}
function readMileage(text){
  const q=digits(normalize(text));
  let m=q.match(/(\d+(?:\.\d+)?)\s*هزار(?:\s*(?:کیلومتر|تا|کارکرد|کار))?/);
  let n;
  if(m)n=Number(m[1])*1000;
  else{
    m=q.match(/(\d{3,6})\s*(?:کیلومتر|تا\s*کار|کارکرد|کار)/);
    if(!m)return null;
    n=Number(m[1]);
  }
  return n>=0&&n<=900000?Math.round(n):null;
}
function readBody(text){
  const q=normalize(text);
  if(/بدون\s*رنگ|بی\s*رنگ|بیرنگ|فابریک/.test(q))return'clean';
  if(/یک\s*(تکه|لکه)|یه\s*(تکه|لکه)/.test(q))return'one';
  if(/چند\s*(تکه|لکه)|دو\s*(تکه|لکه)|دور\s*رنگ/.test(q))return'multi';
  if(/تمام\s*رنگ|کامل\s*رنگ/.test(q))return'full';
  if(/تصادف|شاسی|چپی/.test(q))return'accident';
  return null;
}
function parse(text){
  const q=normalize(text);
  state.car=state.car||findCar(q);
  state.year=state.year||readYear(q);
  if(state.mileage===null)state.mileage=readMileage(q);
  state.body=state.body||readBody(q);
  state.color=state.color||colors.find(x=>q.includes(x));
}
function applyState(){
  const c=state.car;
  carType=c.type;
  document.querySelectorAll('.type-toggle button').forEach(x=>x.classList.toggle('active',x.dataset.type===carType));
  fillBrands();brand.value=c.brand;fillModels();model.value=c.model;
  year.value=String(state.year);mileage.value=state.mileage;body.value=state.body;
  city.value='سایر شهرها';
  window.valuationColor=state.color||'';
}
function summary(){
  if(!state.car)return'';
  const p=[`${state.car.brand} ${state.car.model}`];
  if(state.year)p.push(`مدل ${fa(state.year)}`);
  if(state.color)p.push(state.color);
  if(state.body)p.push(bodyLabels[state.body]);
  if(state.mileage!==null)p.push(`${fa(state.mileage)} کیلومتر کارکرد`);
  return p.join('، ');
}
function next(){
  if(!state.car){ask('نام خودرو را دقیق‌تر بنویس؛ برند و مدل را باهم بگو.','مثلاً: بنز E250 یا پژو ۲۰۶ تیپ ۵',['بنز E250','پژو ۲۰۶ تیپ ۵','تویوتا کرولا']);return;}
  if(!state.year){ask(`${summary()} را فهمیدم. مدل چه سالیه؟`,'مثلاً ۲۰۱۶ یا ۱۳۹۵',['۲۰۱۶','۲۰۱۵','۱۳۹۵','۱۴۰۲']);return;}
  if(state.mileage===null){ask(`${summary()}؛ چند کیلومتر کار کرده؟`,'مثلاً ۱۰۰ هزار',['صفر کار','۵۰ هزار کار','۱۰۰ هزار کار']);return;}
  if(!state.body){ask(`${summary()}؛ وضعیت بدنه چطوره؟`,'مثلاً یک تکه رنگ',Object.values(bodyLabels));return;}
  applyState();
  bubble(`مشخصات کامل شد: ${summary()}. الان بازه قیمت تقریبی را حساب می‌کنم.`);
  options([]);vInput.parentElement.style.display='none';restart.classList.remove('hidden');
  setTimeout(()=>priceForm.requestSubmit(),650);
}
function answer(raw){const q=raw.trim();if(!q)return;bubble(q,'user');parse(q);next()}
vSend.onclick=()=>answer(vInput.value);
vInput.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();answer(vInput.value)}});
vOptions.querySelectorAll('button').forEach(b=>b.onclick=()=>answer(b.textContent));
restart.onclick=()=>location.reload();
