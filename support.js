const supportPanel=document.getElementById('supportPanel');
const supportMessages=document.getElementById('supportMessages');
const supportQuestion=document.getElementById('supportQuestion');
const toggleSupport=open=>{supportPanel.classList.toggle('open',open);supportPanel.setAttribute('aria-hidden',String(!open));if(open)setTimeout(()=>supportQuestion.focus(),120)};
document.getElementById('supportFab').onclick=()=>toggleSupport(true);
document.getElementById('openSupport').onclick=()=>toggleSupport(true);
document.getElementById('closeSupport').onclick=()=>toggleSupport(false);
const supportAnswers=[
  {keys:['قیمت','محاسبه','چنده'],text:'مشخصات خودرو را در چت قیمت‌گذاری بنویس؛ نام دقیق، سال ساخت، کارکرد و وضعیت رنگ بدنه برای تخمین لازم است.'},
  {keys:['عکس','کارشناسی','آپلود','ارسال'],text:'از بخش «کارشناسی با عکس» تصویر خودرو یا برگه کارشناسی را انتخاب کن. برای نتیجه بهتر، عکس روشن و واضح بفرست.'},
  {keys:['تماس','تلفن','شماره'],text:'شماره تماس پشتیبانی در حال ثبت است. به‌محض اضافه‌شدن، دکمه تماس تلفنی همین پایین فعال می‌شود.'},
  {keys:['خطا','کار نمی','مشکل'],text:'بگو در کدام بخش مشکل داری و چه پیامی می‌بینی؛ اگر ممکن است متن خطا را هم بنویس تا مرحله‌به‌مرحله راهنمایی‌ات کنم.'}
];
function supportReply(text,who='bot'){supportMessages.insertAdjacentHTML('beforeend',`<div class="support-message ${who}">${String(text).replace(/[<>]/g,'')}</div>`);supportMessages.scrollTop=supportMessages.scrollHeight}
function answerSupport(q){const hit=supportAnswers.find(a=>a.keys.some(k=>q.includes(k)));return hit?hit.text:'سؤالت ثبت شد. برای راهنمایی بهتر، نام بخش و توضیح کوتاهی از مشکلت را بنویس.'}
document.getElementById('phoneLink').onclick=e=>{if(e.currentTarget.classList.contains('pending')){e.preventDefault();toggleSupport(true);supportReply('شماره تماس پشتیبانی به‌زودی در این بخش ثبت می‌شود. فعلاً سؤالت را همین‌جا بنویس.')}};
document.getElementById('supportForm').onsubmit=e=>{e.preventDefault();const q=supportQuestion.value.trim();if(!q)return;supportReply(q,'user');supportQuestion.value='';setTimeout(()=>supportReply(answerSupport(q)),350)};
document.querySelectorAll('#supportSuggestions button').forEach(b=>b.onclick=()=>{supportQuestion.value=b.textContent;document.getElementById('supportForm').requestSubmit()});
