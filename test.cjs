const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const html=fs.readFileSync('index.html','utf8');
const code=html.split('<script>')[1].split('</script>')[0];
const ctx={};vm.createContext(ctx);vm.runInContext(code.split('const $ =')[0],ctx);
const calc=ctx.calculateLoan;
const a=calc(1000000,2.5,20);
assert.ok(Math.abs(a.monthly-5299.0289303223)<0.000001);assert.equal(a.months,240);
let balance=1000000,interest=0;
for(let i=0;i<240;i++){const charge=balance*0.025/12;interest+=charge;balance+=charge-a.monthly;}
assert.ok(Math.abs(balance)<0.00001);assert.ok(Math.abs(interest-a.interest)<0.00001);
const b=calc(120000,0,1);assert.equal(b.monthly,10000);assert.equal(b.interest,0);assert.equal(b.total,120000);
for(const args of [[0,2,20],[-1,2,20],[1,-1,20],[1,101,20],[1,2,0],[1,2,1.5],[NaN,2,20],[1,Infinity,20],[1e11,2,20]])assert.throws(()=>calc(...args));
assert.ok(Number.isFinite(calc(1e10,100,50).total));assert.ok(Math.abs(calc(120000,1e-12,1).monthly-10000)<0.00001);
// 執行實際網頁腳本，驗證表單事件、空白防護與結果顯示。
const els={};for(const id of ['principal','rate','years','monthly','months','p-result','interest','total','bar','p-percent','i-percent','error','status','form'])els[id]={value:'',textContent:'',style:{},events:{},setAttribute(){},removeAttribute(){},focus(){},addEventListener(n,f){this.events[n]=f}};
[els.principal.value,els.rate.value,els.years.value]=['1000000','2.5','20'];
vm.runInNewContext(code,{document:{getElementById:id=>els[id]},setTimeout:fn=>fn()});
assert.equal(els.monthly.textContent,'5,299.03');els.rate.value='';els.form.events.submit({preventDefault(){}});assert.equal(els.error.hidden,false);assert.match(els.error.textContent,/完整/);
els.rate.value='0';els.form.events.submit({preventDefault(){}});assert.equal(els.interest.textContent,'NT$ 0.00');
console.log('全部通過：標準貸款、逐期餘額驗算、零利率、9 種無效輸入、極端值、極低利率、表單送出與空白防護。');
console.log(JSON.stringify(a,null,2));
