<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Elfin İletişim — Takip Sistemi</title>
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script>
// Güvenli Login — Supabase doğrulamalı
var _SU='https://wjsonuxlcrmdaaxodsti.supabase.co';
var _SK='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indqc29udXhsY3JtZGFheG9kc3RpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1NzEyMjQsImV4cCI6MjA4ODE0NzIyNH0.y59-uIYp4ZNop-2yRm6JaighBoCzo8BpEp9K-VAglwo';
var _sb=supabase.createClient(_SU,_SK);
var _userId=null;
async function doLogin(){
  var val=document.getElementById('loginPass').value;
  if(!val){return;}
  document.getElementById('loginBtn').disabled=true;
  document.getElementById('loginBtn').textContent='⏳ Kontrol ediliyor...';
  try{
    var{data,error}=await _sb.from('kullanicilar').select('id,bayi_adi,rol,sifre_degistirme_tarihi').eq('sifre',val).eq('aktif',true).single();
    if(error||!data)throw new Error('Geçersiz');
    _userId=data.id;
    sessionStorage.setItem('tc_auth','1');
    sessionStorage.setItem('tc_bayi',data.bayi_adi);
    sessionStorage.setItem('tc_uid',data.id);
    document.getElementById('loginScreen').style.display='none';
    // Şifre süresi kontrolü (90 gün)
    var lastChange=data.sifre_degistirme_tarihi?new Date(data.sifre_degistirme_tarihi):null;
    var daysSince=lastChange?Math.round((new Date()-lastChange)/86400000):999;
    if(daysSince>=90){
      setTimeout(function(){showPasswordChangeModal(true);},1500);
    }
    if(typeof loadAll==='function')loadAll();
  }catch(e){
    var err=document.getElementById('loginErr');
    err.textContent='❌ Hatalı şifre, tekrar deneyin.';
    document.getElementById('loginPass').value='';
    document.getElementById('loginBtn').disabled=false;
    document.getElementById('loginBtn').textContent='🔐 Giriş Yap';
    setTimeout(function(){err.textContent='';},3000);
  }
}
function showPasswordChangeModal(forced){
  document.getElementById('pwOld').value='';
  document.getElementById('pwNew').value='';
  document.getElementById('pwConfirm').value='';
  document.getElementById('pwErr').textContent='';
  var closeBtn=document.getElementById('pwCloseBtn');
  if(forced){closeBtn.style.display='none';}else{closeBtn.style.display='';}
  document.getElementById('pwForceMsg').style.display=forced?'block':'none';
  document.getElementById('pwModal').style.display='flex';
}
function closePasswordModal(){document.getElementById('pwModal').style.display='none';}
async function changePassword(){
  var old=document.getElementById('pwOld').value;
  var nw=document.getElementById('pwNew').value;
  var confirm=document.getElementById('pwConfirm').value;
  var errEl=document.getElementById('pwErr');
  if(!old||!nw||!confirm){errEl.textContent='Tüm alanları doldurun!';return;}
  if(nw.length<6){errEl.textContent='Yeni şifre en az 6 karakter olmalı!';return;}
  if(nw===old){errEl.textContent='Yeni şifre eskisiyle aynı olamaz!';return;}
  if(nw!==confirm){errEl.textContent='Yeni şifreler eşleşmiyor!';return;}
  try{
    var uid=sessionStorage.getItem('tc_uid')||_userId;
    // Eski şifreyi doğrula
    var{data,error}=await _sb.from('kullanicilar').select('id').eq('id',uid).eq('sifre',old).single();
    if(error||!data){errEl.textContent='Mevcut şifre hatalı!';return;}
    // Yeni şifreyi kaydet
    var{error:ue}=await _sb.from('kullanicilar').update({sifre:nw,sifre_degistirme_tarihi:new Date().toISOString()}).eq('id',uid);
    if(ue)throw ue;
    closePasswordModal();
    if(typeof showToast==='function')showToast('✓ Şifre başarıyla değiştirildi!');
    else alert('Şifre değiştirildi!');
  }catch(e){errEl.textContent='Hata: '+e.message;}
}
window.addEventListener('load',function(){
  document.getElementById('loginBtn').onclick=doLogin;
  document.getElementById('loginPass').onkeydown=function(e){if(e.key==='Enter')doLogin();};
  if(sessionStorage.getItem('tc_auth')==='1'){
    document.getElementById('loginScreen').style.display='none';
    _userId=sessionStorage.getItem('tc_uid');
    if(typeof loadAll==='function')loadAll();
  }
});
// Anti-copy korumaları
document.addEventListener('keydown',function(e){
  if(e.key==='F12')e.preventDefault();
  if(e.ctrlKey&&e.shiftKey&&(e.key==='I'||e.key==='J'))e.preventDefault();
  if(e.ctrlKey&&e.key==='u')e.preventDefault();
  if(e.ctrlKey&&e.key==='s')e.preventDefault();
});
</script>
<style>
:root{
  --yellow:#e6a800;--yellow2:#cc9200;--dark:#f0f2f5;--card:#ffffff;
  --border:rgba(0,0,0,0.09);--green:#00a86b;--red:#e63946;
  --blue:#2b7be8;--gray:#888;--text:#1a1a2e;
  --postpaid:#2b7be8;--prepaid:#e07b00;--notr:#666;--purple:#9333ea;
}
*{margin:0;padding:0;box-sizing:border-box;}
body{font-family:'Outfit',sans-serif;background:var(--dark);color:var(--text);min-height:100vh;color:#1a1a2e;margin:0;}
input,textarea,select{-webkit-user-select:text;-moz-user-select:text;-ms-user-select:text;user-select:text;}
@media print{body{display:none !important;}}
.app{display:flex;min-height:100vh;}
.sidebar{width:248px;min-height:100vh;background:#ffffff;border-right:1px solid var(--border);display:flex;flex-direction:column;position:fixed;top:0;left:0;bottom:0;z-index:200;overflow-y:auto;box-shadow:2px 0 8px rgba(0,0,0,0.06);}
.main{margin-left:248px;flex:1;}
.logo-wrap{padding:18px 16px;border-bottom:1px solid var(--border);flex-shrink:0;}
.logo-top{display:flex;align-items:center;gap:9px;margin-bottom:3px;}
.logo-dot{width:8px;height:8px;border-radius:50%;background:var(--yellow);animation:pulse 2s infinite;}
@keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(230,168,0,0.4)}50%{box-shadow:0 0 0 5px rgba(230,168,0,0)}}
.logo-title{font-family:'Bebas Neue';font-size:18px;letter-spacing:2px;color:var(--yellow);}
.logo-sub{font-size:10px;color:var(--gray);}
.month-box{margin:8px;background:rgba(230,168,0,0.07);border:1px solid rgba(230,168,0,0.25);border-radius:10px;padding:10px;}
.month-lbl{font-size:9px;color:var(--gray);letter-spacing:1px;margin-bottom:6px;}
.month-sel{width:100%;background:rgba(255,255,255,0.9);border:1px solid rgba(230,168,0,0.3);border-radius:7px;padding:6px 9px;color:#1a1a2e;font-family:'Outfit';font-size:12px;outline:none;cursor:pointer;}
.month-sel option{background:#fff;color:#1a1a2e;}
nav{padding:10px 8px;flex:1;}
.ns{font-size:9px;color:var(--gray);letter-spacing:2px;padding:0 7px;margin:12px 0 4px;}
.ni{display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:8px;cursor:pointer;font-size:12.5px;color:#555;transition:all 0.15s;margin-bottom:1px;border:1px solid transparent;}
.ni:hover{background:rgba(230,168,0,0.08);color:var(--yellow);}
.ni.active{background:rgba(230,168,0,0.12);color:var(--yellow);border-color:rgba(230,168,0,0.3);}
.ni-ic{font-size:13px;width:15px;text-align:center;}
.page{display:none;padding:20px 26px 40px;animation:fi 0.2s ease;}
.page.active{display:block;}
@keyframes fi{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}
.ph{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px;}
.pt{font-family:'Bebas Neue';font-size:30px;letter-spacing:2px;line-height:1;}
.pt span{color:var(--yellow);}
.ps{font-size:12px;color:var(--gray);margin-top:2px;}
.kg{display:grid;gap:11px;margin-bottom:18px;}
.kg4{grid-template-columns:repeat(4,1fr);}
.kg3{grid-template-columns:repeat(3,1fr);}
.kg2{grid-template-columns:repeat(2,1fr);}
.kc{background:#fff;border-radius:12px;padding:14px 16px;border:1px solid var(--border);position:relative;overflow:hidden;transition:transform 0.2s;box-shadow:0 2px 8px rgba(0,0,0,0.05);}
.kc:hover{transform:translateY(-2px);}
.kc::after{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:var(--ac,var(--yellow));}
.kl{font-size:9px;color:var(--gray);letter-spacing:1.5px;text-transform:uppercase;margin-bottom:6px;}
.kv{font-family:'Bebas Neue';font-size:26px;letter-spacing:1px;line-height:1;color:#1a1a2e;}
.ks{font-size:11px;color:var(--gray);margin-top:2px;}
.badge{display:inline-block;font-size:10px;padding:2px 7px;border-radius:20px;font-weight:600;margin-top:4px;}
.bg{background:rgba(0,229,160,0.12);color:var(--green);}
.by{background:rgba(255,209,0,0.12);color:var(--yellow);}
.br{background:rgba(255,68,85,0.12);color:var(--red);}
.bb{background:rgba(79,163,255,0.12);color:var(--blue);}
.bp{background:rgba(192,132,252,0.12);color:var(--purple);}
.tpp{background:rgba(79,163,255,0.1);color:var(--postpaid);font-size:9px;padding:2px 6px;border-radius:20px;font-weight:600;}
.tpr{background:rgba(255,159,67,0.1);color:var(--prepaid);font-size:9px;padding:2px 6px;border-radius:20px;font-weight:600;}
.tnt{background:rgba(170,170,170,0.08);color:var(--notr);font-size:9px;padding:2px 6px;border-radius:20px;font-weight:600;}
.tzor{background:rgba(255,68,85,0.1);color:var(--red);font-size:9px;padding:2px 6px;border-radius:20px;font-weight:600;}
.tw{background:#fff;border-radius:12px;border:1px solid var(--border);overflow:hidden;margin-bottom:18px;box-shadow:0 2px 8px rgba(0,0,0,0.05);}
table{width:100%;border-collapse:collapse;}
thead th{padding:9px 13px;text-align:left;font-size:9px;color:var(--gray);letter-spacing:1.5px;text-transform:uppercase;font-weight:500;background:#f7f8fa;}
tbody tr{border-bottom:1px solid var(--border);transition:background 0.1s;}
tbody tr:last-child{border-bottom:none;}
tbody tr:hover{background:rgba(230,168,0,0.03);}
td{padding:9px 13px;font-size:12.5px;vertical-align:middle;color:#2a2a2a;}
.pw{background:rgba(255,255,255,0.06);border-radius:20px;height:5px;width:85px;overflow:hidden;display:inline-block;vertical-align:middle;}
.pf{height:100%;border-radius:20px;}
.eg{display:grid;grid-template-columns:repeat(2,1fr);gap:11px;margin-bottom:18px;}
.ec{background:#fff;border-radius:12px;border:1px solid var(--border);padding:16px;transition:all 0.2s;box-shadow:0 2px 8px rgba(0,0,0,0.05);}
.ec:hover{border-color:rgba(230,168,0,0.3);transform:translateY(-2px);}
.et{display:flex;align-items:center;gap:10px;margin-bottom:12px;}
.av{width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-family:'Bebas Neue';font-size:15px;color:#000;flex-shrink:0;}
.en{font-size:13px;font-weight:600;color:#1a1a2e;}
.er{font-size:10px;color:var(--gray);}
.es2{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:10px;}
.esb{background:#f5f6f8;border-radius:8px;padding:8px;text-align:center;}
.esv{font-family:'Bebas Neue';font-size:16px;}
.esl{font-size:9px;color:var(--gray);margin-top:1px;}
.btn{padding:7px 14px;border-radius:8px;border:none;cursor:pointer;font-family:'Outfit';font-size:12.5px;font-weight:600;transition:all 0.15s;}
.btn-p{background:var(--yellow);color:#000;}
.btn-p:hover{background:var(--yellow2);transform:translateY(-1px);}
.btn-g{background:transparent;color:#aaa;border:1px solid var(--border);}
.btn-g:hover{border-color:rgba(255,209,0,0.3);color:var(--yellow);}
.btn-d{background:rgba(255,68,85,0.1);color:var(--red);border:1px solid rgba(255,68,85,0.2);}
.btn-d:hover{background:rgba(255,68,85,0.2);}
.btn-e{background:rgba(79,163,255,0.1);color:var(--blue);border:1px solid rgba(79,163,255,0.2);}
.btn-e:hover{background:rgba(79,163,255,0.2);}
.btn-gr{background:rgba(0,229,160,0.1);color:var(--green);border:1px solid rgba(0,229,160,0.2);}
.bsm{padding:4px 9px;font-size:10.5px;}
.ov{display:none;position:fixed;inset:0;background:rgba(0,0,0,0.78);backdrop-filter:blur(4px);z-index:999;align-items:center;justify-content:center;}
.ov.open{display:flex;}
.modal{background:#fff;border-radius:15px;padding:24px;width:560px;max-width:95vw;border:1px solid rgba(230,168,0,0.2);animation:fi 0.25s ease;max-height:92vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,0.15);}
.modal h2{font-family:'Bebas Neue';font-size:21px;letter-spacing:1px;margin-bottom:2px;color:#1a1a2e;}
.modal h2 em{color:var(--yellow);font-style:normal;}
.msub{font-size:11px;color:var(--gray);margin-bottom:18px;}
.fg{margin-bottom:12px;}
.fg label{display:block;font-size:10px;color:var(--gray);letter-spacing:0.5px;margin-bottom:5px;}
.fg input,.fg select,.fg textarea{width:100%;background:#f7f8fa;border:1px solid var(--border);border-radius:8px;padding:8px 11px;color:#1a1a2e;font-family:'Outfit';font-size:13px;outline:none;transition:border 0.2s;}
.fg input:focus,.fg select:focus,.fg textarea:focus{border-color:rgba(230,168,0,0.5);}
.fg select option{background:#fff;color:#1a1a2e;}
.fg textarea{resize:vertical;min-height:65px;}
.fr{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
.mf{display:flex;gap:8px;justify-content:flex-end;margin-top:18px;}
.pvb{background:#f7f8fa;border:1px solid rgba(230,168,0,0.2);border-radius:9px;padding:12px;margin-top:4px;}
.pr2{display:flex;justify-content:space-between;font-size:12px;padding:3px 0;border-bottom:1px solid rgba(0,0,0,0.06);}
.pr2:last-child{border-bottom:none;}
.pl{color:var(--gray);}
.ts{background:#fff;border-radius:12px;border:1px solid var(--border);margin-bottom:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.04);}
.tsh{padding:13px 17px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;background:#f7f8fa;}
.tst{font-family:'Bebas Neue';font-size:15px;letter-spacing:1px;color:var(--yellow);}
.tr2{display:flex;align-items:center;justify-content:space-between;padding:8px 17px;border-bottom:1px solid rgba(0,0,0,0.05);}
.tr2:last-child{border-bottom:none;}
.tn{font-size:12.5px;color:#333;flex:1;}
.ti-wrap{display:flex;gap:6px;align-items:center;}
.ti{width:85px;background:#f7f8fa;border:1px solid var(--border);border-radius:7px;padding:5px 8px;color:#1a1a2e;font-family:'Outfit';font-size:12.5px;text-align:right;outline:none;}
.ti:focus{border-color:rgba(230,168,0,0.4);}
.tu{font-size:10px;color:var(--gray);min-width:26px;}
.cb{background:#fff;border-radius:12px;border:1px solid var(--border);padding:14px 17px;margin-bottom:18px;box-shadow:0 2px 8px rgba(0,0,0,0.04);}
.ct{font-size:9px;color:var(--gray);letter-spacing:1.5px;text-transform:uppercase;margin-bottom:10px;}
.cs{display:flex;gap:4px;}
.csi{flex:1;text-align:center;padding:10px 4px;border-radius:8px;transition:all 0.3s;}
.csi.hi{background:rgba(230,168,0,0.1);border:1px solid rgba(230,168,0,0.3);}
.csr{font-size:10px;color:var(--gray);margin-bottom:3px;}
.csm{font-family:'Bebas Neue';font-size:19px;color:#444;}
.csm.ac{color:var(--yellow);}
.csl{font-size:9px;color:var(--gray);margin-top:2px;}
.pbg{display:grid;grid-template-columns:1fr 1fr;gap:6px;padding:11px 17px;}
.pbi{background:#f5f6f8;border-radius:7px;padding:8px 12px;display:flex;justify-content:space-between;align-items:center;font-size:11px;border:1px solid transparent;}
.info-box{background:rgba(230,168,0,0.06);border:1px solid rgba(230,168,0,0.2);border-radius:10px;padding:12px 15px;margin-bottom:16px;font-size:12px;color:#444;line-height:1.7;}
.info-box strong{color:var(--yellow);}
.zor-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:16px;}
.zor-card{background:#fff;border-radius:10px;border:1px solid var(--border);padding:12px;transition:border-color 0.2s;}
.zor-ok{border-color:rgba(0,168,107,0.3);}
.zor-fail{border-color:rgba(230,57,70,0.3);}
.yillik-tabs{display:flex;gap:5px;margin-bottom:14px;flex-wrap:wrap;}
.yet{padding:6px 13px;border-radius:7px;font-size:12px;font-weight:500;cursor:pointer;color:#555;transition:all 0.15s;border:1px solid var(--border);background:#fff;font-family:'Outfit';}
.yet.active{background:var(--yellow);color:#fff;border-color:var(--yellow);}
.muaf-badge{background:rgba(192,132,252,0.15);color:var(--purple);font-size:10px;padding:2px 8px;border-radius:20px;font-weight:600;}
.sh{display:flex;justify-content:space-between;align-items:center;margin-bottom:11px;}
.st{font-family:'Bebas Neue';font-size:17px;letter-spacing:1px;}
.st em{color:var(--yellow);font-style:normal;}
.ow{overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:thin;scrollbar-color:var(--yellow) #f0f0f0;padding-bottom:4px;}
.ow::-webkit-scrollbar{height:8px;}
.ow::-webkit-scrollbar-track{background:#f0f0f0;border-radius:4px;}
.ow::-webkit-scrollbar-thumb{background:var(--yellow);border-radius:4px;}
.mw{min-width:900px;}
.toast{position:fixed;bottom:20px;right:20px;padding:10px 17px;border-radius:9px;font-weight:600;font-size:12.5px;z-index:9999;display:none;animation:fi 0.3s ease;}
.toast-ok{background:var(--green);color:#000;}
.toast-err{background:var(--red);color:#fff;}
/* LOGIN */
.login-screen{position:fixed;inset:0;background:#f0f2f5;z-index:99999;display:flex;align-items:center;justify-content:center;}
.login-screen.hidden{display:none;}
.login-box{background:#fff;border-radius:18px;padding:36px 40px;width:360px;box-shadow:0 8px 40px rgba(0,0,0,0.12);border:1px solid rgba(0,0,0,0.07);text-align:center;}
.login-logo{display:flex;align-items:center;justify-content:center;gap:10px;margin-bottom:6px;}
.login-logo-dot{width:10px;height:10px;border-radius:50%;background:var(--yellow);animation:pulse 2s infinite;}
.login-title{font-family:'Bebas Neue';font-size:22px;letter-spacing:2px;color:var(--yellow);}
.login-sub{font-size:12px;color:var(--gray);margin-bottom:28px;}
.login-label{display:block;font-size:10px;color:var(--gray);letter-spacing:0.5px;text-align:left;margin-bottom:5px;}
.login-input{width:100%;background:#f7f8fa;border:1px solid rgba(0,0,0,0.1);border-radius:10px;padding:11px 14px;color:#1a1a2e;font-family:'Outfit';font-size:14px;outline:none;transition:border 0.2s;text-align:center;letter-spacing:3px;}
.login-input:focus{border-color:rgba(230,168,0,0.5);}
.login-btn{width:100%;margin-top:14px;padding:11px;border-radius:10px;border:none;cursor:pointer;font-family:'Outfit';font-size:14px;font-weight:700;background:var(--yellow);color:#fff;transition:all 0.15s;}
.login-btn:hover{background:var(--yellow2);transform:translateY(-1px);}
.login-err{color:var(--red);font-size:12px;margin-top:10px;min-height:18px;}

.loading-overlay{position:fixed;inset:0;background:rgba(240,242,245,0.92);z-index:9998;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;}
.loading-overlay.hidden{display:none;}
.spinner{width:40px;height:40px;border:3px solid rgba(230,168,0,0.2);border-top-color:var(--yellow);border-radius:50%;animation:spin 0.8s linear infinite;}
@keyframes spin{to{transform:rotate(360deg)}}
.loading-text{color:var(--yellow);font-family:'Bebas Neue';font-size:18px;letter-spacing:2px;}
::-webkit-scrollbar{width:10px;height:8px;}
::-webkit-scrollbar-track{background:#f0f0f0;}
::-webkit-scrollbar-thumb{background:var(--yellow);border-radius:5px;border:2px solid #f0f0f0;}
::-webkit-scrollbar-thumb:hover{background:#e6a800;}
html{scrollbar-width:auto;scrollbar-color:var(--yellow) #f0f0f0;overflow-y:scroll;}

/* MOBILE RESPONSIVE */
.mob-header{display:none;}
.mob-overlay{display:none;}

@media(max-width:768px){
  .mob-header{display:flex;align-items:center;justify-content:space-between;padding:10px 14px;background:#fff;border-bottom:1px solid var(--border);position:fixed;top:0;left:0;right:0;z-index:300;box-shadow:0 2px 8px rgba(0,0,0,0.06);}
  .mob-burger{width:36px;height:36px;border-radius:8px;border:1px solid var(--border);background:#fff;display:flex;align-items:center;justify-content:center;font-size:18px;cursor:pointer;}
  .mob-logo{display:flex;align-items:center;gap:7px;}
  .mob-logo-dot{width:7px;height:7px;border-radius:50%;background:var(--yellow);animation:pulse 2s infinite;}
  .mob-logo-text{font-family:'Bebas Neue';font-size:15px;letter-spacing:2px;color:var(--yellow);}
  .mob-add{padding:6px 12px;border-radius:8px;border:none;background:var(--yellow);color:#000;font-family:'Outfit';font-size:11px;font-weight:700;cursor:pointer;}
  .mob-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:350;backdrop-filter:blur(2px);}
  .mob-overlay.open{display:block;}
  .sidebar{transform:translateX(-100%);transition:transform 0.25s ease;z-index:400;width:260px;}
  .sidebar.mob-open{transform:translateX(0);}
  .main{margin-left:0;padding-top:56px;}
  .page{padding:14px 12px 30px;}
  .pt{font-size:22px;}
  .kg4,.kg3{grid-template-columns:repeat(2,1fr);}
  .kg2{grid-template-columns:1fr;}
  .eg{grid-template-columns:1fr;}
  .es2{grid-template-columns:repeat(2,1fr);}
  .ph{flex-direction:column;gap:10px;}
  .zor-grid{grid-template-columns:1fr;}
  .modal{width:95vw;padding:18px;}
  .fr{grid-template-columns:1fr;}
  table{font-size:11px;}
  thead th,td{padding:6px 8px;}
  .kv{font-size:22px;}
}
@media(max-width:480px){
  .kg4,.kg3,.kg2{grid-template-columns:1fr;}
}
</style>
</head>
<body>

<!-- LOGIN -->
<div class="login-screen" id="loginScreen">
  <div class="login-box">
    <div class="login-logo">
      <div class="login-logo-dot"></div>
      <div class="login-title">ELFİN İLETİŞİM</div>
    </div>
    <div class="login-sub">Hedef & Prim Takip Sistemi</div>
    <div style="font-size:9px;color:var(--gray);margin-bottom:20px;letter-spacing:1px">v4.7 — Şifre Güvenliği</div>
    <label class="login-label">ŞİFRE</label>
    <input class="login-input" type="password" id="loginPass" placeholder="••••••">
    <button class="login-btn" id="loginBtn">🔐 Giriş Yap</button>
    <div class="login-err" id="loginErr"></div>
  </div>
</div>

<!-- ŞİFRE DEĞİŞTİRME MODAL -->
<div class="modal" id="pwModal" style="display:none">
  <div class="mc" style="max-width:380px">
    <div class="mh"><span>🔐 Şifre Değiştir</span><span class="mx" id="pwCloseBtn" onclick="closePasswordModal()">✕</span></div>
    <div id="pwForceMsg" style="display:none;background:#fff3cd;border:1px solid #ffc107;border-radius:8px;padding:10px;margin-bottom:12px;font-size:11px;color:#856404">
      ⚠️ <strong>Şifrenizin süresi dolmuş!</strong> Güvenlik gereği şifreniz her 90 günde bir değiştirilmelidir. Devam etmek için lütfen yeni bir şifre belirleyin.
    </div>
    <div class="fg"><label>MEVCUT ŞİFRE</label><input type="password" id="pwOld" placeholder="••••••"></div>
    <div class="fg"><label>YENİ ŞİFRE (min 6 karakter)</label><input type="password" id="pwNew" placeholder="••••••"></div>
    <div class="fg"><label>YENİ ŞİFRE (TEKRAR)</label><input type="password" id="pwConfirm" placeholder="••••••"></div>
    <div id="pwErr" style="color:var(--red);font-size:11px;min-height:18px;margin-bottom:8px"></div>
    <div class="mf"><button class="btn btn-p" onclick="changePassword()" style="width:100%">🔐 Şifreyi Değiştir</button></div>
  </div>
</div>

<!-- MOBILE HEADER -->
<div class="mob-header" id="mobHeader">
  <div class="mob-burger" onclick="toggleMobMenu()">☰</div>
  <div class="mob-logo"><div class="mob-logo-dot"></div><div class="mob-logo-text">ELFİN İLETİŞİM</div></div>
  <button class="mob-add" onclick="openSaleModal()">+ Satış</button>
</div>
<div class="mob-overlay" id="mobOverlay" onclick="closeMobMenu()"></div>

<!-- LOADING -->
<div class="loading-overlay" id="loadingOv">
  <div class="spinner"></div>
  <div class="loading-text">VERİLER YÜKLENİYOR...</div>
</div>

<div class="app">
<!-- SIDEBAR -->
<div class="sidebar">
  <div class="logo-wrap">
    <div class="logo-top"><div class="logo-dot"></div><div class="logo-title">ELFİN İLETİŞİM</div></div>
    <div class="logo-sub">Hedef & Prim Takip Sistemi</div>
  </div>
  <div class="month-box">
    <div class="month-lbl">AKTİF DÖNEM</div>
    <select class="month-sel" id="monthSel" onchange="changeMonth()"></select>
  </div>
  <nav>
    <div class="ns">GENEL</div>
    <div class="ni active" onclick="sp('dashboard',this)"><span class="ni-ic">📊</span>Dashboard</div>
    <div class="ni" onclick="sp('gunluk',this)"><span class="ni-ic">📅</span>Günlük Takip</div>
    <div class="ni" onclick="openSaleModal()"><span class="ni-ic">➕</span>Satış Ekle</div>
    <div class="ns">ÇALIŞAN</div>
    <div class="ni" onclick="sp('calisanlar',this)"><span class="ni-ic">👥</span>Çalışanlar</div>
    <div class="ni" onclick="sp('gunlukprim',this)"><span class="ni-ic">⚡</span>Canlı Prim</div>
    <div class="ni" onclick="sp('liderlik',this)"><span class="ni-ic">🥇</span>Liderlik Tablosu</div>
    <div class="ni" onclick="sp('muafiyet',this)"><span class="ni-ic">🛡️</span>Muafiyet Yönet</div>
    <div class="ni" onclick="sp('hedefler',this)"><span class="ni-ic">🎯</span>Hedef Ayarla</div>
    <div class="ns">MAĞAZA</div>
    <div class="ni" onclick="sp('prim',this)"><span class="ni-ic">💰</span>Mag. Perakendecilik</div>
    <div class="ni" onclick="sp('aktivasyon',this)"><span class="ni-ic">🏧</span>Aktivasyon Teşvik</div>
    <div class="ni" onclick="sp('cezatakip',this)"><span class="ni-ic">⚠️</span>Ceza & Kesinti</div>
    <div class="ni" onclick="sp('yillik',this)"><span class="ni-ic">📆</span>12 Aylık Plan</div>
    <div class="ni" onclick="sp('duyurular',this)"><span class="ni-ic">📢</span>Kampanya & Duyuru</div>
    <div class="ns">MÜŞTERİ TAKİP</div>
    <div class="ni" onclick="sp('crmboard',this)"><span class="ni-ic">📞</span>Bugün Ara<span id="crmBadge" style="margin-left:auto;background:var(--red);color:#fff;font-size:9px;padding:1px 6px;border-radius:10px;font-weight:700;display:none">0</span></div>
    <div class="ni" onclick="sp('crmtekrar',this)"><span class="ni-ic">🔁</span>Tekrar Aranacak</div>
    <div class="ni" onclick="sp('crmlist',this)"><span class="ni-ic">📋</span>Tüm Müşteriler</div>
    <div class="ni" onclick="sp('crmrapor',this)"><span class="ni-ic">📊</span>Arama Raporu</div>
    <div class="ni" onclick="sp('crmchurn',this)"><span class="ni-ic">📱</span>Operatör Geçişleri</div>
    <div class="ni" onclick="sp('prepmnt',this)" style="background:linear-gradient(135deg,#00b4d8,#0077b6);color:#fff;border-radius:8px;margin:4px 12px;font-weight:600"><span class="ni-ic">🔄</span>Prep MNT Takip</div>
    <div class="ni" onclick="sp('crmajanda',this)"><span class="ni-ic">📅</span>Ajanda</div>
    <div class="ni" onclick="openCrmUpload()"><span class="ni-ic">📥</span>Excel Yükle</div>
    <div class="ns">SMS & RAPORLAR</div>
    <div class="ni" onclick="sp('smsgonder',this)"><span class="ni-ic">📱</span>SMS Gönder</div>
    <div class="ni" onclick="sp('smsrapor',this)"><span class="ni-ic">💬</span>Haftalık Rapor SMS</div>
    <div class="ni" onclick="sp('smsgecmis',this)"><span class="ni-ic">📨</span>SMS Geçmişi</div>
    <div style="border-top:1px solid var(--border);margin-top:12px;padding-top:8px">
      <div class="ni" onclick="showPasswordChangeModal(false)"><span class="ni-ic">🔐</span>Şifre Değiştir</div>
      <div class="ni" onclick="sessionStorage.clear();location.reload()"><span class="ni-ic">🚪</span>Çıkış Yap</div>
    </div>
  </nav>
</div>

<div class="main">

<!-- DASHBOARD -->
<div class="page active" id="page-dashboard">
  <div class="ph">
    <div><div class="pt">MAĞAZA <span>DASHBOARD</span></div><div class="ps">Aylık performans özeti</div></div>
    <div style="display:flex;gap:7px;"><button class="btn btn-g" onclick="sp('hedefler',null)">🎯 Hedef</button><button class="btn btn-p" onclick="openSaleModal()">+ Satış Ekle</button></div>
  </div>
  <div class="kg kg4">
    <div class="kc" style="--ac:var(--yellow);cursor:pointer;position:relative" onclick="goToDsnFromDashboard()" title="DSN Bayi Raporu — Detaylı görünüm"><div style="position:absolute;top:6px;right:8px;background:var(--yellow);color:#000;font-size:8px;padding:2px 6px;border-radius:8px;font-weight:700;letter-spacing:0.5px">DETAY ▸</div><div class="kl">TOPLAM PUAN</div><div class="kv" id="k1">0</div><div class="ks">Hedef: <span id="k1h">—</span></div><div class="badge by" id="k1o">%0</div></div>
    <div class="kc" style="--ac:var(--green)"><div class="kl">ADET PRİMİ</div><div class="kv" id="k2">₺0</div><div class="ks">Satış bazlı</div><div class="badge bg">Tahakkuk</div></div>
    <div class="kc" style="--ac:var(--blue)"><div class="kl">PUAN PRİMİ</div><div class="kv" id="k3">₺0</div><div class="ks">Dilim + Çarpan</div><div class="badge bb" id="k3c">—</div></div>
    <div class="kc" style="--ac:var(--purple);cursor:pointer;perspective:600px" onclick="flipK4()">
      <div id="k4wrap" style="transition:transform 0.5s;transform-style:preserve-3d;position:relative">
        <div id="k4front"><div class="kl">TOPLAM PRİM</div><div class="kv" id="k4">₺0</div><div class="ks">Tıkla → Detay</div><div class="badge bp">Bu ay</div></div>
        <div id="k4back" style="display:none"><div class="kl">PRİM KIRILIMI</div><div id="k4detail" style="font-size:10px;line-height:1.8"></div></div>
      </div>
    </div>
  </div>
  <!-- Kampanya & Duyuru Carousel -->
  <div id="duyuruCarousel" style="display:none;margin-bottom:14px;position:relative;overflow:hidden;border-radius:18px;min-height:140px;cursor:pointer;box-shadow:0 4px 20px rgba(0,0,0,0.12)" onclick="nextDuyuru()">
    <div id="duyuruSlide" style="padding:24px 28px;min-height:140px;display:flex;align-items:center;gap:20px;transition:opacity 0.4s"></div>
    <div style="position:absolute;bottom:12px;left:50%;transform:translateX(-50%);display:flex;gap:6px" id="duyuruDots"></div>
  </div>
  <div class="sh"><div class="st">MAĞAZA <em>PERFORMANS ÖZETİ</em></div></div>
  <div id="magazaOzet" style="margin-bottom:18px;"></div>
</div>

<!-- GÜNLÜK TAKİP -->
<div class="page" id="page-gunluk">
  <div class="ph">
    <div><div class="pt">GÜNLÜK <span>TAKİP</span></div><div class="ps" id="gunlukPs">Bugünün satış durumu</div></div>
    <div style="display:flex;gap:7px;align-items:center;">
      <button class="btn btn-g" onclick="shiftGunlukDate(-1)">◀</button>
      <input type="date" id="gunlukDate" class="ti" style="width:140px;text-align:center;font-size:12px;" onchange="renderGunluk()">
      <button class="btn btn-g" onclick="shiftGunlukDate(1)">▶</button>
      <button class="btn btn-g" onclick="resetGunlukDate()">Bugün</button>
      <button class="btn btn-p" onclick="openSaleModal()">+ Satış Ekle</button>
    </div>
  </div>
  <div class="kg kg2" id="dailySummary"></div>
  <div class="sh"><div class="st" id="gunlukTableTitle">BUGÜN <em>SATIŞLAR</em></div></div>
  <div class="tw"><table><thead><tr><th>Çalışan</th><th>Ürün</th><th>Tip</th><th>Adet</th><th>Puan</th><th>Prim</th><th>Açıklama</th><th>Tarih</th><th>İşlem</th></tr></thead><tbody id="todayBody"></tbody></table></div>
</div>

<!-- ÜRÜN TAKİBİ -->
<div class="page" id="page-urunler">
  <div class="ph"><div><div class="pt">ÜRÜN <span>TAKİBİ</span></div><div class="ps">Ürün bazlı satış ve prim</div></div><button class="btn btn-p" onclick="openSaleModal()">+ Satış Ekle</button></div>
  <div class="tw"><table><thead><tr><th>Ürün</th><th>Tip</th><th>Zorunlu</th><th>Satış</th><th>Puan/Ad</th><th>Top.Puan</th><th>Prim/Ad</th><th>Top.Prim</th><th>İlerleme</th></tr></thead><tbody id="urunBody"></tbody></table></div>
</div>

<!-- ÇALIŞANLAR -->
<div class="page" id="page-calisanlar">
  <div class="ph"><div><div class="pt">ÇALIŞAN <span>YÖNETİMİ</span></div><div class="ps">5 aktif çalışan</div></div><button class="btn btn-p" onclick="openSaleModal()">+ Satış Ekle</button></div>
  <div class="eg" id="allEg"></div>
  <div class="sh"><div class="st">TÜM <em>SATIŞLAR</em></div></div>
  <div class="tw"><table><thead><tr><th>Çalışan</th><th>Ürün</th><th>Tip</th><th>Adet</th><th>Puan</th><th>Prim</th><th>Açıklama</th><th>Tarih</th><th>İşlem</th></tr></thead><tbody id="allBody"></tbody></table></div>
</div>

<!-- ÇALIŞAN PRİMLERİ -->
<div class="page" id="page-empdetay">
  <div class="ph"><div><div class="pt">ÇALIŞAN <span>PRİMLERİ</span></div><div class="ps">Aylık prim hakediş ve zorunlu ürün durumu</div></div></div>
  <div id="empDetayCards"></div>
</div>

<!-- PRİM HESABI -->
<div class="page" id="page-prim">
  <div class="ph"><div><div class="pt">MAĞAZA <span>PERAKENDECİLİK PRİMİ</span></div><div class="ps">Mağaza perakendecilik puan primleri</div></div></div>
  <div class="kg kg3">
    <div class="kc" style="--ac:var(--yellow)"><div class="kl">TOPLAM PUAN</div><div class="kv" id="pPuan">0</div><div class="ks">Bu ay</div></div>
    <div class="kc" style="--ac:var(--blue)"><div class="kl">AKTİF DİLİM</div><div class="kv" id="pDilim" style="font-size:14px;padding-top:5px">—</div><div class="ks">Puan aralığı</div></div>
    <div class="kc" style="--ac:var(--green)"><div class="kl">PUAN PRİMİ</div><div class="kv" id="pSonuc">₺0</div><div class="ks" id="pCarpan">—</div></div>
  </div>
  <div class="ts"><div class="tsh"><div class="tst">PERAKENDECİLİK DİLİMLERİ</div></div><div id="bandTable"></div></div>
  <div class="cb" style="margin-top:0;">
    <div class="ct">PUAN PRİMİ ÇARPANI</div>
    <div class="cs">
      <div class="csi" id="cs1"><div class="csr">%70–%99</div><div class="csm" id="cm1">×0.65</div><div class="csl">Düşük</div></div>
      <div class="csi" id="cs2"><div class="csr">%100–%109</div><div class="csm" id="cm2">×1.00</div><div class="csl">Hedef</div></div>
      <div class="csi" id="cs3"><div class="csr">%110+</div><div class="csm" id="cm3">×1.10</div><div class="csl">Süper</div></div>
    </div>
  </div>
</div>

<!-- CANLI PRİM -->
<div class="page" id="page-gunlukprim">
  <div class="ph"><div><div class="pt">CANLI <span>PRİM</span></div><div class="ps">600₺ canlı prim hakediş takibi</div></div></div>
  <div class="info-box"><strong>⚡ Kural:</strong> Günde <strong style="color:#fff">6 POSTPAİD</strong> veya <strong style="color:#fff">5 POSTPAİD + 1 PREPAİD</strong> → <strong style="color:var(--green)">600₺ canlı prim.</strong> &nbsp;|&nbsp; <strong style="color:#fff">12 POSTPAİD</strong> veya <strong style="color:#fff">10 POSTPAİD + 2 PREPAİD</strong> → <strong style="color:var(--yellow)">1.200₺ (×2 kat).</strong> Katlayarak devam eder. Eksik gün ertesi telafi edilirse geçmiş günün primi de kazanılır.</div>
  <div id="gpCards"></div>
</div>

<!-- HEDEF AYARLA -->
<div class="page" id="page-hedefler">
  <div class="ph"><div><div class="pt">HEDEF <span>AYARLARI</span></div><div class="ps" id="hedefMonthLabel">Nisan 2026</div></div>
    <div style="display:flex;gap:6px;align-items:center">
      <button class="btn btn-g bsm" onclick="hedefPrevMonth()">◀</button>
      <button class="btn btn-g bsm" onclick="hedefNextMonth()">▶</button>
      <button class="btn btn-e bsm" onclick="copyHedefFromPrev()" title="Önceki aydan kopyala">📋 Kopyala</button>
      <button class="btn btn-p" onclick="saveHedefler()">💾 Kaydet</button>
    </div>
  </div>
  <div class="ts">
    <div class="tsh"><div class="tst">MAĞAZA GENEL HEDEFİ</div></div>
    <div class="tr2" style="background:linear-gradient(90deg,rgba(43,123,232,0.06),transparent);border-left:3px solid var(--blue);padding-left:8px"><div class="tn"><strong style="color:var(--blue)">TDM Toplam Hedef</strong> <span style="font-size:9px;color:var(--gray)" id="tdmHedefAyEtiket">(Bu ay için)</span><div style="font-size:9px;color:var(--gray);margin-top:2px" id="tdmHedefMirasInfo"></div></div><div class="ti-wrap"><input type="number" class="ti" id="tdmTopHedef" value="316" style="width:110px;font-weight:700;color:var(--blue)" onchange="onTdmTopHedefChange(this.value)"><span class="tu">adet</span></div></div>
    <div class="tr2"><div class="tn">Aylık Toplam Abonelik Hedefi <span style="font-size:9px;color:var(--gray)">(otomatik — referans)</span></div><div class="ti-wrap"><input type="number" class="ti" id="storeAdet" value="40" style="width:110px;background:#f5f6f8" readonly><span class="tu">adet</span><span style="font-size:9px;color:var(--gray);margin-left:6px">F.YT+F.MNT+F.Data+SW+ÖÖ+Rahat+SOL</span></div></div>
    <input type="hidden" id="storeTarget" value="500"><span style="display:none" id="storeTargetInfo"></span>
  </div>
  <div class="ts">
    <div class="tsh"><div class="tst">BONUS PRİM (%100 Hedef Tamamlama)</div></div>
    <div class="tr2"><div class="tn">Bonus türü</div><div class="ti-wrap"><select class="ti" id="bonusTip" style="width:160px" onchange="toggleBonus()"><option value="sabit">Sabit Tutar (₺)</option><option value="yuzde">Yüzde (%)</option></select></div></div>
    <div class="tr2" id="bSabitRow"><div class="tn">Sabit bonus (₺)</div><div class="ti-wrap"><input type="number" class="ti" id="bonusSabit" value="1000" style="width:110px"><span class="tu">₺</span></div></div>
    <div class="tr2" id="bYuzdeRow" style="display:none"><div class="tn">Yüzde bonus</div><div class="ti-wrap"><input type="number" class="ti" id="bonusYuzde" value="15" style="width:110px"><span class="tu">%</span></div></div>
    <div class="tr2"><div class="tn">Bonus aktif</div><div class="ti-wrap"><select class="ti" id="bonusAktif" style="width:110px"><option value="1">Evet</option><option value="0">Hayır</option></select></div></div>
  </div>
  <div class="ts">
    <div class="tsh"><div class="tst">ÜRÜN HEDEFLERİ & DEĞERLER</div></div>
    <div style="background:rgba(230,168,0,0.06);border:1px solid rgba(230,168,0,0.2);border-radius:8px;padding:10px;margin-bottom:12px;font-size:11px;color:var(--gray)">
      <strong>Hakediş Kuralı:</strong> Çalışan primi, grup hedefinin gerçekleşme oranına göre → %75 altı: 0₺ (prim yok) | %75-99: primin %75'i | %100+: tamamı
    </div>
    <div class="ow"><table style="min-width:700px;font-size:11px;"><thead><tr><th>Ürün</th><th>Tip</th><th>Z</th><th>TDM Hedef</th><th>Puan</th><th>Prim (₺)</th><th>Ç.Primi (₺)</th><th>Hakediş</th></tr></thead><tbody id="hedefBody"></tbody></table></div>
    <div style="text-align:center;font-size:9px;color:var(--gray);margin-top:4px">← Tabloyu sola kaydırın →</div>
  </div>
  <div class="ts">
    <div class="tsh"><div class="tst">ÇARPAN EŞİKLERİ</div></div>
    <div style="font-size:10px;color:var(--gray);padding:8px 10px;line-height:1.6;background:rgba(43,123,232,0.04);border-radius:6px;margin:0 8px 8px">📌 Çarpan, <strong>TDM Toplam Hedef'e göre adet HGO oranından</strong> belirlenir. <strong>%70 altı → ×0</strong> (prim yok). Hem mağaza puan primine hem çalışan hakedişine uygulanır.</div>
    <div class="tr2"><div class="tn">%70–%99</div><div class="ti-wrap"><input type="number" class="ti" id="c1" value="0.65" step="0.01"><span class="tu">×</span></div></div>
    <div class="tr2"><div class="tn">%100–%109</div><div class="ti-wrap"><input type="number" class="ti" id="c2" value="1.00" step="0.01"><span class="tu">×</span></div></div>
    <div class="tr2"><div class="tn">%110+</div><div class="ti-wrap"><input type="number" class="ti" id="c3" value="1.10" step="0.01"><span class="tu">×</span></div></div>
  </div>
  <div class="sh" style="margin-top:4px;"><div class="st">AYLIK <em>HEDEF TAKVİMİ</em></div></div>
  <div id="hedefTakvim" style="margin-bottom:18px;"></div>

  <!-- TDM Ek Destekler -->
  <div class="ts" style="margin-top:16px;">
    <div class="tsh"><div class="tst">🎯 AYLIK TDM EK DESTEKLERİ</div></div>
    <div style="padding:12px;background:#fff;border:1px solid var(--border);border-radius:10px;">
      <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:10px">
        <div style="font-size:11px;color:var(--gray)">Aktif: <strong id="tdmEkCount" style="color:var(--green)">0</strong> kampanya</div>
        <button class="btn btn-p bsm" onclick="openTdmEkModal()">+ Kampanya Ekle</button>
      </div>
      <div style="font-size:10px;color:var(--gray);line-height:1.5;margin-bottom:10px">
        TDM'nin ürünlere çıkardığı ek prim kampanyaları. Tarih aralığındaki satışlara otomatik ek prim uygulanır.
      </div>
      <div id="tdmEkList"></div>
    </div>
  </div>

  <!-- TDM Ek Destek Modal -->
  <div class="modal" id="tdmEkModal" style="display:none">
    <div class="mc" style="max-width:460px">
      <div class="mh"><span>🎯 TDM Ek Destek Ekle</span><span class="mx" onclick="closeTdmEkModal()">✕</span></div>
      <input type="hidden" id="tdmEkEditId">
      <div class="fg"><label>ÜRÜN</label><select id="tdmEkUrun" style="width:100%;padding:10px;font-size:13px;border:1px solid var(--border);border-radius:8px"></select></div>
      <div class="fg"><label>KAMPANYA ADI</label><input type="text" id="tdmEkAd" placeholder="ör: NTC Ek Prim Kampanyası"></div>
      <div class="fr">
        <div class="fg"><label>BAŞLANGIÇ</label><input type="date" id="tdmEkBasla"></div>
        <div class="fg"><label>BİTİŞ</label><input type="date" id="tdmEkBitis"></div>
      </div>
      <div class="fr">
        <div class="fg"><label>EK PRİM TÜRÜ</label><select id="tdmEkTip" onchange="toggleTdmEkTip()">
          <option value="adet">Adet Başı Sabit (₺)</option>
          <option value="yuzde">Karlılık Yüzdesi (%)</option>
        </select></div>
        <div class="fg"><label>EK PRİM DEĞERİ</label><input type="number" id="tdmEkDeger" placeholder="0" min="0" step="0.01"></div>
      </div>
      <div class="fg"><label>AÇIKLAMA</label><textarea id="tdmEkNot" placeholder="Kampanya detayları..." style="min-height:40px"></textarea></div>
      <div class="mf"><button class="btn btn-g" onclick="closeTdmEkModal()">İptal</button><button class="btn btn-p" onclick="saveTdmEk()">💾 Kaydet</button></div>
    </div>
  </div>

  <!-- NTC Prim Listesi Yükleme -->
  <div class="ts" style="margin-top:16px;">
    <div class="tsh"><div class="tst">📱 NTC CİHAZ PRİM LİSTESİ</div></div>
    <div style="padding:12px;background:#fff;border:1px solid var(--border);border-radius:10px;">
      <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:10px">
        <div style="font-size:11px;color:var(--gray)">Mevcut: <strong id="ntcModelCount" style="color:var(--yellow)">0</strong> model</div>
        <label class="btn btn-p bsm" style="cursor:pointer">
          📥 Excel Yükle
          <input type="file" id="ntcFile" accept=".xlsx,.xls,.csv" style="display:none" onchange="previewNtcUpload(this)">
        </label>
        <button class="btn btn-e bsm" onclick="showNtcList()">📋 Listeyi Gör</button>
      </div>
      <div style="font-size:10px;color:var(--gray);line-height:1.5">
        Excel formatı: <strong>A sütunu</strong> = Model adı, <strong>B sütunu</strong> = Prim (₺). İlk satır başlık olabilir (otomatik atlanır).
      </div>
      <div id="ntcUploadPreview" style="display:none;margin-top:10px"></div>
      <div id="ntcUploadActions" style="display:none;margin-top:8px;gap:8px"></div>
      <div id="ntcListView" style="display:none;margin-top:10px;max-height:300px;overflow-y:auto"></div>
    </div>
  </div>
</div>

<!-- 12 AYLIK PLAN -->
<div class="page" id="page-yillik">
  <div class="ph"><div><div class="pt">12 AYLIK <span>PLAN</span></div><div class="ps">Çalışan bazlı yıllık hedef ve ilerleme</div></div><button class="btn btn-p" onclick="saveYillik()">💾 Kaydet</button></div>
  <div class="yillik-tabs" id="yillikTabs"></div>
  <div id="yillikContent"></div>
  <div class="sh" style="margin-top:10px;"><div class="st">MAĞAZA <em>YILLIK HEDEFLER</em></div></div>
  <div id="yillikUrunHedef"></div>
</div>

<!-- LİDERLİK TABLOSU -->
<!-- ============ KAMPANYA & DUYURU ============ -->
<div class="page" id="page-duyurular">
  <div class="ph">
    <div><div class="pt">KAMPANYA <span>& DUYURU</span></div><div class="ps">Çalışanlara bilgilendirme</div></div>
    <button class="btn btn-p" onclick="openDuyuruModal()">+ Yeni Duyuru</button>
  </div>
  <div id="duyuruListPage"></div>
</div>

<!-- Duyuru Ekleme Modal -->
<div class="modal" id="duyuruModal" style="display:none">
  <div class="mc" style="max-width:520px">
    <div class="mh"><span>📢 Yeni Duyuru Ekle</span><span class="mx" onclick="closeDuyuruModal()">✕</span></div>
    <div class="fg"><label>BAŞLIK</label><input type="text" id="duyuruBaslik" placeholder="Kampanya başlığı..." style="width:100%;padding:10px;font-size:14px;border:1px solid var(--border);border-radius:8px"></div>
    <div class="fg"><label>AÇIKLAMA (opsiyonel)</label><textarea id="duyuruAciklama" placeholder="Detay veya not..." style="width:100%;padding:10px;font-size:13px;border:1px solid var(--border);border-radius:8px;min-height:60px"></textarea></div>
    <div class="fg"><label>DOSYA YÜKLE (Word, Excel, PDF, JPG)</label><input type="file" id="duyuruFile" accept=".docx,.xlsx,.xls,.pdf,.jpg,.jpeg,.png" style="font-size:12px"></div>
    <div id="duyuruFilePreview" style="display:none;margin-top:8px"></div>
    <div class="fg" style="margin-top:6px"><label>ARKA PLAN RENGİ</label>
      <div style="display:flex;gap:6px" id="duyuruColorPick">
        <div onclick="pickDuyuruColor('#1a1a2e')" style="width:28px;height:28px;border-radius:6px;background:#1a1a2e;cursor:pointer;border:2px solid var(--yellow)" data-c="#1a1a2e"></div>
        <div onclick="pickDuyuruColor('#0d3b66')" style="width:28px;height:28px;border-radius:6px;background:#0d3b66;cursor:pointer;border:2px solid transparent" data-c="#0d3b66"></div>
        <div onclick="pickDuyuruColor('#3d0c02')" style="width:28px;height:28px;border-radius:6px;background:#3d0c02;cursor:pointer;border:2px solid transparent" data-c="#3d0c02"></div>
        <div onclick="pickDuyuruColor('#1b4332')" style="width:28px;height:28px;border-radius:6px;background:#1b4332;cursor:pointer;border:2px solid transparent" data-c="#1b4332"></div>
        <div onclick="pickDuyuruColor('#FFD100')" style="width:28px;height:28px;border-radius:6px;background:#FFD100;cursor:pointer;border:2px solid transparent" data-c="#FFD100"></div>
      </div>
    </div>
    <div class="mf"><button class="btn btn-g" onclick="closeDuyuruModal()">İptal</button><button class="btn btn-p" onclick="saveDuyuru()">📢 Yayınla</button></div>
  </div>
</div>

<div class="page" id="page-liderlik">
  <div class="ph">
    <div><div class="pt">LİDERLİK <span>TABLOSU</span></div><div class="ps">Aylık ve yıllık performans sıralaması</div></div>
    <div style="display:flex;gap:7px;align-items:center;">
      <button class="btn btn-g" id="liderAyBtn" onclick="setLiderMod('ay')">📅 Bu Ay</button>
      <button class="btn btn-g" id="liderYilBtn" onclick="setLiderMod('yil')">🏆 Bu Yıl</button>
      <button class="btn btn-p" onclick="openLiderPrimModal()">🎁 Lider Prim Tanımla</button>
    </div>
  </div>
  <div id="liderContent"></div>
  <div class="sh" style="margin-top:6px;"><div class="st">TANIMLANMIŞ <em>LİDER PRİMLERİ</em></div></div>
  <div id="liderPrimList"></div>
</div>

<!-- LİDER PRİM MODAL -->
<div class="ov" id="liderPrimOv">
  <div class="modal">
    <h2>LİDER <em>PRİM TANIMLA</em></h2>
    <div class="msub">Seçilen aya lider olan çalışana prim ekle</div>
    <div class="fr">
      <div class="fg"><label>AY</label><select id="lpAy" class="ti"></select></div>
      <div class="fg"><label>KATEGORİ</label><select id="lpKat" class="ti">
        <option value="puan">Puan Toplamı</option>
        <option value="faturali">Faturalı Adet</option>
        <option value="prepaid">Ön Ödemeli Adet</option>
        <option value="ntc">NTC Adet</option>
        <option value="aksesuar">Aksesuar (₺)</option>
        <option value="ikinciel">2. El Cihaz (₺)</option>
        <option value="sifir">Sıfır Cihaz (₺)</option>
        <option value="toplam">Toplam Satış</option>
      </select></div>
    </div>
    <div class="fg"><label>PRİM TUTARI (₺)</label><input type="number" id="lpTutar" class="ti" value="500" min="0"></div>
    <div class="fg"><label>NOT</label><input type="text" id="lpNot" class="ti" placeholder="Mart ayı lider primi..."></div>
    <div class="mf"><button class="btn btn-g" onclick="closeLiderPrimModal()">İptal</button><button class="btn btn-p" onclick="saveLiderPrim()">✓ Kaydet</button></div>
  </div>
</div>

<!-- MUAFİYET -->
<div class="page" id="page-muafiyet">
  <div class="ph"><div><div class="pt">MUAFİYET <span>YÖNETİMİ</span></div><div class="ps">Manuel prim muafiyet kayıtları</div></div><button class="btn btn-p" onclick="openMuafModal()">+ Muafiyet Ekle</button></div>
  <div class="info-box"><strong>🛡️ Muafiyet:</strong> Zorunlu ürün hedefini tutturamayan çalışana muafiyet tanımlayabilirsiniz — o ay primini almaya devam eder.</div>
  <div class="tw"><table><thead><tr><th>Çalışan</th><th>Ay</th><th>Neden</th><th>Kayıt Tarihi</th><th>İşlem</th></tr></thead><tbody id="muafBody"></tbody></table></div>
</div>

<!-- AKTİVASYON TEŞVİK -->
<div class="page" id="page-aktivasyon">
  <div class="ph">
    <div><div class="pt">AKTİVASYON <span>TEŞVİK PRİMİ</span></div><div class="ps">POS/ÖKC cirosu üzerinden hesaplanan ek prim</div></div>
    <div style="display:flex;align-items:center;gap:7px;">
      <button class="btn btn-g" onclick="shiftAktivasyonMonth(-1)">◀</button>
      <span id="aktivasyonMonthLabel" style="font-family:'Bebas Neue';font-size:16px;color:var(--yellow);letter-spacing:1px;min-width:110px;text-align:center;">—</span>
      <button class="btn btn-g" onclick="shiftAktivasyonMonth(1)">▶</button>
    </div>
  </div>
  <div class="info-box">
    <strong>📋 Kural:</strong> Aylık min. <strong style="color:#1a1a2e">5 faturalı aktivasyon</strong> koşulu ile;
    HGO ve toplam aktivasyon bazlı iki çarpan <strong style="color:#1a1a2e">toplanarak</strong> POS cirosuna uygulanır.
    Koşul: HGO ≥%100 <strong style="color:#1a1a2e">veya</strong> toplam aktivasyon ≥50 olmalıdır.
  </div>

  <!-- POS Cirosu Girişi -->
  <div class="ts" style="margin-bottom:16px;">
    <div class="tsh"><div class="tst">💳 AYLIK POS / ÖKC CİROSU</div></div>
    <div class="tr2">
      <div class="tn">Bu ayki toplam POS cirosu</div>
      <div class="ti-wrap" style="display:flex;align-items:center;gap:8px">
        <input type="number" class="ti" id="posCiro" value="0" style="width:130px" oninput="renderAktivasyonTesvık()">
        <span class="tu">₺</span>
        <button class="btn btn-p bsm" onclick="savePosCiro()" style="white-space:nowrap">💾 Kaydet</button>
      </div>
    </div>
  </div>

  <!-- Otomatik hesaplanan değerler -->
  <div class="kg kg3" style="margin-bottom:18px;">
    <div class="kc" style="--ac:var(--blue)">
      <div class="kl">TOPLAM HGO</div>
      <div class="kv" id="atHgo">—</div>
      <div class="ks" id="atHgoLabel">Hedef gerçekleşme</div>
    </div>
    <div class="kc" style="--ac:var(--yellow)">
      <div class="kl">TOPLAM AKTİVASYON</div>
      <div class="kv" id="atAdet">0</div>
      <div class="ks">Bu ay toplam</div>
    </div>
    <div class="kc" style="--ac:var(--green)">
      <div class="kl">FATURALI AKTİVASYON</div>
      <div class="kv" id="atFaturali">0</div>
      <div class="ks">Min. 5 gerekli</div>
    </div>
  </div>

  <!-- Çarpan tabloları -->
  <div class="kg kg2" style="margin-bottom:18px;">
    <div class="ts" style="margin-bottom:0">
      <div class="tsh"><div class="tst">📊 HGO BAZLI ÇARPAN</div></div>
      <div id="atHgoTable"></div>
    </div>
    <div class="ts" style="margin-bottom:0">
      <div class="tsh"><div class="tst">📊 AKTİVASYON BAZLI ÇARPAN</div></div>
      <div id="atAdetTable"></div>
    </div>
  </div>

  <!-- Sonuç -->
  <div id="atSonucBox"></div>
</div>

<!-- ============ DSN BAYİ RAPORU ============ -->
<div class="page" id="page-dsnrapor">
  <div class="ph"><div><div class="pt">DSN <span>BAYİ RAPORU</span></div><div class="ps">Turkcell Dijital Satış Noktası Prim Sistemi — Ocak 2026 (DSN+ Extra)</div></div></div>
  <div class="info-box"><strong>📋 DSN+ Extra Prim Sistemi:</strong> Ocak 2026 itibariyle yürürlükte. Bayi geliri = <strong>Baz Prim + Rekontratlama + Perakendecilik Desteği + Yüksek Üretim ÖÖ + Diğer Primler − Ceza Kesintileri</strong>. DSN+ Extra noktaları için Faturalı (YT&MNT&Data) puanı <strong style="color:var(--green)">4.5</strong> (standart bayi 3.5).</div>
  <div class="kg kg3" style="margin-bottom:14px;">
    <div class="kc" style="--ac:var(--yellow)"><div class="kl">BAZ PRİM TOPLAM</div><div class="kv" id="dsnBazTop">0₺</div><div class="ks">Turkcell → Bayi</div></div>
    <div class="kc" style="--ac:var(--green)"><div class="kl">PERAK. DESTEĞİ</div><div class="kv" id="dsnPerakTop">0₺</div><div class="ks" id="dsnPerakPuan" style="font-size:9px;line-height:1.5">0 puan</div></div>
    <div class="kc" style="--ac:var(--blue)"><div class="kl">DİĞER PRİMLER</div><div class="kv" id="dsnDigerTop">0₺</div><div class="ks">TV+, Netflix, vb.</div></div>
  </div>
  <div class="kg kg3" style="margin-bottom:14px;">
    <div class="kc" style="--ac:var(--purple)"><div class="kl">YÜKSEK ÜRETİM ÖÖ</div><div class="kv" id="dsnYuksekTop">0₺</div><div class="ks" id="dsnYuksekAdet">0 kaliteli ÖÖ</div></div>
    <div class="kc" style="--ac:var(--red)"><div class="kl">CEZA KESİNTİ</div><div class="kv" id="dsnCezaTop">0₺</div><div class="ks">Toplam kesinti</div></div>
    <div class="kc" style="--ac:var(--green);border:2px solid var(--green)"><div class="kl">NET BAYİ GELİRİ</div><div class="kv" id="dsnNetTop" style="font-size:22px">0₺</div><div class="ks">Tahmini</div></div>
  </div>
  <!-- Baz Prim Detay -->
  <div class="ts" style="margin-bottom:14px;"><div class="tsh"><div class="tst">💰 BAZ PRİM DETAYI (Ürün Bazlı)</div></div><div id="dsnBazDetay"></div></div>
  <!-- DSN Resmi Perakendecilik Skalası -->
  <div class="ts" style="margin-bottom:14px;"><div class="tsh"><div class="tst">🏪 DSN RESMİ PERAKENDECİLİK SKALASI</div></div>
    <div style="font-size:10px;color:var(--gray);padding:8px 10px;line-height:1.6">📌 <strong>Puanda kesinti yok</strong> — kazanılan puan net. Hedef tutturulamazsa <strong>TL primine çarpan</strong> uygulanır.<br>HGO Çarpanı (Toplam Abonelik adet üzerinden): <strong>&lt;%70→×0</strong> | %70-%100→×0.65 | ≥%100→×1.0 | ≥%110→×1.1<br>Ön Koşul: Min. 16 faturalı + 25 toplam abonelik (200+ ÖÖ varsa 16 koşulu aranmaz).</div>
    <div id="dsnPerakSkala"></div>
  </div>
  <!-- Yüksek Üretim Tablosu -->
  <div class="ts" style="margin-bottom:14px;"><div class="tsh"><div class="tst">📈 YÜKSEK ÜRETİM ÖN ÖDEMELİ YT & MNT</div></div>
    <div style="font-size:10px;color:var(--gray);padding:8px 10px;line-height:1.6">Kaliteli hat = sonraki ay 175₺+ yükleme VEYA 20dk+ arama VEYA 100MB+ data</div>
    <div id="dsnYuksekTablo"></div>
  </div>
  <!-- Diğer Primler -->
  <div class="ts"><div class="tsh"><div class="tst">📺 DİĞER PRİMLER (TV+, Yan Oda, Netflix, OTT)</div></div><div id="dsnDigerTablo"></div></div>
</div>

<!-- ============ CEZA & KESİNTİ TAKİBİ ============ -->
<div class="page" id="page-cezatakip">
  <div class="ph"><div><div class="pt">CEZA & <span>KESİNTİ TAKİBİ</span></div><div class="ps">DSN Prim Sistemi ceza uygulamaları</div></div></div>
  <div class="info-box"><strong>⚠️ Uyarı:</strong> Bu kesintiler toplam primden düşülür. Üç çeyrek üst üste ulaşmayan evrak oranı <strong style="color:var(--red)">%1.5</strong> üzeri olan noktaların yetkileri <strong style="color:var(--red)">iptal edilebilir.</strong></div>
  <div class="kg kg2" style="margin-bottom:14px;">
    <div class="kc" style="--ac:var(--red)"><div class="kl">TOPLAM KESİNTİ</div><div class="kv" id="cezaToplamKart">0₺</div><div class="ks">Bu ay toplam</div></div>
    <div class="kc" style="--ac:var(--yellow)"><div class="kl">TOPLAM ADET</div><div class="kv" id="cezaToplamAdet">0</div><div class="ks">Ceza işlem sayısı</div></div>
  </div>
  <div class="ts"><div class="tsh"><div class="tst">📋 CEZA KALEMLERİ</div></div><div id="cezaListesi"></div></div>
</div>

<!-- ============ MÜŞTERİ TAKİP: BUGÜN ARA ============ -->
<div class="page" id="page-crmboard">
  <div class="ph">
    <div><div class="pt">BUGÜN <span>ARANACAKLAR</span></div><div class="ps" id="crmBoardPs">Bugün aranması gereken müşteriler</div></div>
    <div style="display:flex;gap:7px;">
      <button class="btn btn-g" onclick="openCrmAddModal()">+ Müşteri Ekle</button>
      <button class="btn btn-p" onclick="openCrmUpload()">📥 Excel Yükle</button>
    </div>
  </div>
  <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-bottom:14px" id="crmSummaryCards"></div>
  <!-- Numara Sorgulama -->
  <div style="margin-bottom:14px;display:flex;gap:8px;align-items:center">
    <input type="tel" id="crmPhoneSearch" placeholder="📞 Numara ile müşteri ara..." style="flex:1;padding:10px 14px;border:2px solid var(--border);border-radius:10px;font-size:13px;outline:none;transition:border 0.2s" onfocus="this.style.borderColor='var(--yellow)'" onblur="this.style.borderColor='var(--border)'" oninput="searchCrmByPhone()">
    <button class="btn btn-g bsm" onclick="document.getElementById('crmPhoneSearch').value='';document.getElementById('crmPhoneResult').style.display='none'" style="white-space:nowrap">✕ Temizle</button>
  </div>
  <div id="crmPhoneResult" style="display:none;margin-bottom:14px"></div>
  <div id="crmTodayList"></div>
  <div id="crmUpcomingList" style="margin-top:18px;"></div>
</div>

<!-- ============ MÜŞTERİ TAKİP: TÜM MÜŞTERİLER ============ -->
<div class="page" id="page-crmlist">
  <div class="ph">
    <div><div class="pt">TÜM <span>MÜŞTERİLER</span></div><div class="ps" id="crmListCount">Kayıtlı müşteri listesi</div></div>
    <div style="display:flex;gap:7px;align-items:center;flex-wrap:wrap;">
      <button class="btn btn-g" onclick="openCrmAddModal()">+ Müşteri Ekle</button>
      <button class="btn btn-d" onclick="topluSilMenu()">🗑️ Toplu Sil</button>
      <select class="month-sel" id="crmGrupFilter" onchange="crmListPage=0;renderCrmList()" style="width:180px;padding:6px 9px;">
        <option value="0">Tüm Gruplar</option>
        <option value="1">Grup 1 — Postpaid 1 Yıl</option>
        <option value="2">Grup 2 — Prepaid MNT</option>
        <option value="3">Grup 3 — Prepaid Yeni Tesis</option>
        <option value="4">Grup 4 — Yapboz 6 Ay</option>
      </select>
    </div>
  </div>
  <div id="topluSilPanel" style="display:none;background:rgba(230,57,70,0.06);border:1px solid rgba(230,57,70,0.2);border-radius:10px;padding:12px;margin-bottom:14px;">
    <div style="font-size:12px;color:var(--red);font-weight:600;margin-bottom:8px">⚠️ Toplu Silme — Dikkat!</div>
    <div id="topluSilButtons" style="display:flex;gap:8px;flex-wrap:wrap;"></div>
  </div>
  <div id="crmListPagination" style="margin-bottom:10px;"></div>
  <div class="tw"><table><thead><tr><th>Müşteri</th><th>Telefon</th><th>Grup</th><th>Taahhüt Bitiş</th><th>Durum</th><th>Sonuç</th><th>İşlem</th></tr></thead><tbody id="crmListBody"></tbody></table></div>
  <div id="crmListPaginationBottom" style="margin-top:10px;"></div>
</div>

<!-- ============ MÜŞTERİ TAKİP: ARAMA RAPORU ============ -->
<div class="page" id="page-crmrapor">
  <div class="ph">
    <div><div class="pt">ARAMA <span>RAPORU</span></div><div class="ps">Haftalık ve aylık arama istatistikleri</div></div>
  </div>
  <div class="kg kg4" id="crmRaporCards"></div>
  <div id="crmRaporExtra" data-active=""></div>
  <div class="sh"><div class="st">SON <em>ARAMA KAYITLARI</em></div></div>
  <div class="tw"><table><thead><tr><th>Müşteri</th><th>Telefon</th><th>Tarih</th><th>Durum</th><th>Sonuç</th><th>Arayan</th><th>Not</th><th>İşlem</th></tr></thead><tbody id="crmRaporBody"></tbody></table></div>
</div>

<!-- ============ TEKRAR ARANACAK ============ -->
<div class="page" id="page-crmtekrar">
  <div class="ph">
    <div><div class="pt">TEKRAR <span>ARANACAK</span></div><div class="ps">Düşünüyor, ulaşılamadı ve meşgul müşteriler</div></div>
  </div>
  <div class="kg kg3" id="tekrarSummary"></div>
  <div style="display:flex;gap:6px;margin-bottom:14px;" id="tekrarFilters"></div>
  <div id="tekrarList"></div>
</div>

<!-- ============ PREP MNT TAKİP ============ -->
<div class="page" id="page-prepmnt">
  <div class="ph">
    <div><div class="pt">PREP MNT <span>TAKİP</span></div><div class="ps" id="prepMntPs">Kontörlü numara taşıma müşteri takibi</div></div>
    <button class="btn btn-p" onclick="openPrepMntModal()">+ Yeni Kayıt</button>
  </div>
  <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:14px" id="prepMntCards"></div>
  <div style="display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap" id="prepMntFilters"></div>
  <div id="prepMntList"></div>
</div>

<!-- Prep MNT Modal -->
<div class="modal" id="prepMntModal" style="display:none">
  <div class="mc" style="max-width:480px">
    <div class="mh"><span>🔄 Prep MNT Müşteri Kaydı</span><span class="mx" onclick="closePrepMntModal()">✕</span></div>
    <input type="hidden" id="prepMntEditId">
    <div class="fr">
      <div class="fg"><label>AD SOYAD</label><input type="text" id="prepMntAd" placeholder="Müşteri adı soyadı"></div>
      <div class="fg"><label>TELEFON</label><input type="tel" id="prepMntTel" placeholder="05XX XXX XX XX"></div>
    </div>
    <div class="fr">
      <div class="fg"><label>BAŞVURU TARİHİ</label><input type="date" id="prepMntBasvuru"></div>
      <div class="fg"><label>İŞLEMİ YAPAN</label><select id="prepMntCalisan"></select></div>
    </div>
    <div class="fr">
      <div class="fg"><label>ÖN ÖDEME TUTARI (₺)</label><input type="number" id="prepMntTutar" placeholder="0" min="0"></div>
      <div class="fg"><label>ÖDEME ŞEKLİ</label><select id="prepMntOdeme">
        <option value="nakit">💵 Nakit</option>
        <option value="kart">💳 Kredi Kartı</option>
      </select></div>
    </div>
    <div class="fr">
      <div class="fg"><label>PAKET YÜKLEME TARİHİ</label><input type="date" id="prepMntPaketTarih"><div style="font-size:9px;color:var(--gray);margin-top:2px">Hat açılınca paket yüklendiğinde doldurun</div></div>
      <div class="fg"><label>DURUM</label><select id="prepMntDurum">
        <option value="bekliyor">⏳ Hat Açılması Bekleniyor</option>
        <option value="paket_yuklendi">📦 Paket Yüklendi</option>
        <option value="faturali_teklif">📞 Faturalı Teklif Yapıldı</option>
        <option value="faturaliya_gecti">✅ Faturalıya Geçti</option>
        <option value="red">❌ Red / İptal</option>
      </select></div>
    </div>
    <div class="fg"><label>NOT</label><textarea id="prepMntNot" placeholder="Açıklama, not..." style="min-height:50px"></textarea></div>
    <div class="mf"><button class="btn btn-g" onclick="closePrepMntModal()">İptal</button><button class="btn btn-p" onclick="savePrepMnt()">💾 Kaydet</button></div>
  </div>
</div>

<!-- ============ AJANDA / HATIRLATMA ============ -->
<div class="page" id="page-crmajanda">
  <div class="ph">
    <div><div class="pt">AJANDA <span>& HATIRLATMA</span></div><div class="ps">Notlar, hatırlatmalar ve görevler</div></div>
    <button class="btn btn-p" onclick="openAjandaModal()">+ Hatırlatma Ekle</button>
  </div>
  <div class="kg kg3" id="ajandaSummary"></div>
  <div id="ajandaList"></div>
</div>

<!-- AJANDA MODAL -->
<div class="ov" id="ajandaOv">
  <div class="modal">
    <h2>HATIRLATMA <em>EKLE</em></h2>
    <div class="msub">Yeni hatırlatma veya görev ekle</div>
    <input type="hidden" id="ajandaEditId" value="">
    <div class="fr">
      <div class="fg"><label>TARİH</label><input type="date" id="ajandaTarih"></div>
      <div class="fg"><label>SAAT (opsiyonel)</label><input type="time" id="ajandaSaat"></div>
    </div>
    <div class="fg"><label>KAYDEDEN</label><select id="ajandaKaydedenSel"></select></div>
    <div class="fg"><label>BAŞLIK</label><input type="text" id="ajandaBaslik" placeholder="Konu başlığı..."></div>
    <div class="fg"><label>DETAY</label><textarea id="ajandaDetay" placeholder="Detaylı açıklama, müşteri adı, telefon..."></textarea></div>
    <div class="mf"><button class="btn btn-g" onclick="closeAjandaModal()">İptal</button><button class="btn btn-p" onclick="saveAjanda()">✓ Kaydet</button></div>
  </div>
</div>

<!-- ============ OPERATÖR GEÇİŞLERİ ============ -->
<div class="page" id="page-crmchurn">
  <div class="ph">
    <div><div class="pt">OPERATÖR <span>GEÇİŞLERİ</span></div><div class="ps">Başka operatöre geçmiş müşteriler ve geri kazanma takibi</div></div>
  </div>
  <div class="kg kg3" id="churnSummaryCards"></div>
  <div class="info-box">
    <strong>📋 Kural:</strong> <strong style="color:var(--red)">Vodafone</strong> müşterileri taahhüt bitişine <strong>1 ay</strong> kala arama listesine eklenir. <strong style="color:var(--purple)">Telekom</strong> müşterileri taahhüt bitişine <strong>1 hafta</strong> kala eklenir.
  </div>
  <div class="sh"><div class="st">BAŞKA OPERATÖRE <em>GEÇEN MÜŞTERİLER</em></div></div>
  <div class="tw"><table><thead><tr><th>Müşteri</th><th>Telefon</th><th>Operatör</th><th>Hat Tipi</th><th>Geçiş Tarihi</th><th>Taahhüt Bitiş</th><th>Durum</th><th>İşlem</th></tr></thead><tbody id="churnBody"></tbody></table></div>
</div>

<!-- ============ HIZLI SMS GÖNDER ============ -->
<div class="page" id="page-smsgonder">
  <div class="ph">
    <div><div class="pt">HIZLI <span>SMS GÖNDER</span></div><div class="ps">NetGSM ile SMS gönder</div></div>
  </div>
  <div class="ts" style="margin-bottom:16px;">
    <div class="tsh"><div class="tst">📱 SMS GÖNDER</div></div>
    <div style="padding:14px;">
      <div class="fr">
        <div class="fg"><label>ALICI SEÇ</label><select id="smsTekAlici" onchange="smsAliciSec()">
          <option value="">— Listeden seç veya numara gir —</option>
          <option disabled style="font-weight:700;color:var(--yellow)">── ÇALIŞANLAR ──</option>
        </select></div>
        <div class="fg"><label>TELEFON</label><input type="tel" id="smsTekTel" placeholder="0532 XXX XX XX"></div>
      </div>
      <div class="fg"><label>MESAJ <span id="smsTekCount" style="color:var(--gray);font-size:10px">(0/160)</span></label><textarea id="smsTekMesaj" placeholder="Mesajınızı yazın..." oninput="smsTekSay()" style="min-height:100px;"></textarea></div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px;flex-wrap:wrap;gap:8px;">
        <div style="font-size:10px;color:var(--gray)">SMS: NetGSM · Gönderici: ABBANELTRNK</div>
        <button class="btn btn-p" onclick="sendTekSms()">📤 SMS Gönder</button>
      </div>
    </div>
  </div>
</div>

<!-- ============ HAFTALIK RAPOR SMS ============ -->
<div class="page" id="page-smsrapor">
  <div class="ph">
    <div><div class="pt">HAFTALIK <span>RAPOR SMS</span></div><div class="ps">Çalışanlara kişiye özel performans SMS'i gönder</div></div>
    <div style="display:flex;gap:7px;">
      <button class="btn btn-g" onclick="generateWeeklyReports()">🔄 Raporları Oluştur</button>
      <button class="btn btn-p" onclick="sendAllWeeklyReports()">📤 Hepsini Gönder</button>
    </div>
  </div>
  <div class="info-box">
    <strong>💬 Nasıl çalışır:</strong> "Raporları Oluştur" butonuna basın → her çalışan için haftalık performans + kişiye özel espirili mesaj oluşturulur. Önizleyip düzenleyebilirsiniz. "Gönder" ile NetGSM üzerinden SMS olarak gider.
  </div>
  <div id="smsRaporCards"></div>
</div>

<!-- ============ SMS GEÇMİŞİ ============ -->
<div class="page" id="page-smsgecmis">
  <div class="ph">
    <div><div class="pt">SMS <span>GEÇMİŞİ</span></div><div class="ps">Gönderilen SMS kayıtları</div></div>
  </div>
  <div class="tw"><table><thead><tr><th>Tarih</th><th>Telefon</th><th>Mesaj</th><th>Durum</th></tr></thead><tbody id="smsGecmisBody"></tbody></table></div>
</div>

<!-- CRM MÜŞTERİ EKLE/DÜZENLE MODAL -->
<div class="ov" id="crmAddOv">
  <div class="modal">
    <h2>MÜŞTERİ <em id="crmAddTitle">EKLE</em></h2>
    <div class="msub">Yeni müşteri kaydı</div>
    <input type="hidden" id="crmEditId" value="">
    <div class="fr">
      <div class="fg"><label>MÜŞTERİ ADI</label><input type="text" id="crmAd" placeholder="Ad Soyad / Şirket"></div>
      <div class="fg"><label>TELEFON</label><input type="tel" id="crmTel" placeholder="0532 XXX XX XX"></div>
    </div>
    <div class="fr">
      <div class="fg"><label>GRUP</label><select id="crmGrup">
        <option value="1">Grup 1 — Postpaid (1 Yıl Taahhüt)</option>
        <option value="2">Grup 2 — Prepaid MNT</option>
        <option value="3">Grup 3 — Prepaid Yeni Tesis</option>
        <option value="4">Grup 4 — Yapboz Paket (6 Ay)</option>
      </select></div>
      <div class="fg"><label>PAKET / TARİFE</label><input type="text" id="crmPaket" placeholder="Paket adı"></div>
    </div>
    <div class="fr">
      <div class="fg"><label>TAAHHÜT BAŞLANGIÇ</label><input type="date" id="crmBaslangic"></div>
      <div class="fg"><label>TAAHHÜT BİTİŞ / AKTİVASYON</label><input type="date" id="crmBitis"></div>
    </div>
    <div class="fg"><label>E-POSTA</label><input type="email" id="crmEposta" placeholder="ornek@mail.com"></div>
    <div class="mf"><button class="btn btn-g" onclick="closeCrmAddModal()">İptal</button><button class="btn btn-p" onclick="saveCrmMusteri()">✓ Kaydet</button></div>
  </div>
</div>

<!-- CRM ARAMA MODAL -->
<div class="ov" id="crmCallOv">
  <div class="modal">
    <h2>ARAMA <em>KAYDI</em></h2>
    <div class="msub" id="crmCallSub">Müşteri arama sonucu girin</div>
    <input type="hidden" id="crmCallMusteriId" value="">
    <div class="fg"><label>ARAYAN</label><select id="crmCallArayan"></select></div>
    <div class="fg"><label>DURUM</label><select id="crmCallDurum">
      <option value="arandi">✓ Arandı — Ulaşıldı</option>
      <option value="ulasilamadi">✗ Ulaşılamadı</option>
      <option value="mesgul">📞 Meşgul / Daha Sonra</option>
    </select></div>
    <div class="fg"><label>SONUÇ</label><select id="crmCallSonuc" onchange="toggleOperatorFields()">
      <option value="">— Henüz sonuç yok —</option>
      <option value="taahhut_yenilendi">✅ Taahhüt Yenilendi</option>
      <option value="postpaide_gecti">✅ Postpaid'e Geçti</option>
      <option value="musteri_hizmet_yeniledi">❌ Müşteri Hizmetleri Yenilemiş</option>
      <option value="dusunuyor">⏳ Düşünüyor</option>
      <option value="iptal_etti">❌ Hattı İptal Etmiş</option>
      <option value="yedek_hat">📲 Yedek Hat Kullanıyor</option>
      <option value="operator_gecis">📱 Başka Operatöre Geçmiş</option>
      <option value="ikna_edilemedi">🚫 İkna Edilemedi</option>
      <option value="istemiyor">⛔ İstemiyor</option>
      <option value="yabanci_uyruklu">🌍 Yabancı Uyruklu</option>
    </select></div>
    <div id="operatorFields" style="display:none;">
      <div class="fr">
        <div class="fg"><label>HANGİ OPERATÖR</label><select id="crmCallOperator">
          <option value="vodafone">Vodafone</option>
          <option value="telekom">Türk Telekom</option>
          <option value="bilinmiyor">Bilinmiyor</option>
        </select></div>
        <div class="fg"><label>GEÇİŞ TARİHİ</label><input type="date" id="crmCallGecTarih"></div>
      </div>
      <div class="fr">
        <div class="fg"><label>HAT TİPİ</label><select id="crmCallHatTip">
          <option value="postpaid">Faturalı (Postpaid)</option>
          <option value="prepaid">Faturasız (Prepaid)</option>
        </select></div>
        <div class="fg"><label>TAAHHÜT BİTİŞ (TAHMİNİ)</label><input type="date" id="crmCallTaahhutBitis"></div>
      </div>
    </div>
    <div class="fg"><label>NOT</label><textarea id="crmCallNot" placeholder="Görüşme detayları, randevu tarihi, vb..."></textarea></div>
    <div class="mf"><button class="btn btn-g" onclick="closeCrmCallModal()">İptal</button><button class="btn btn-p" onclick="saveCrmCall()">✓ Kaydet</button></div>
  </div>
</div>

<!-- CRM EXCEL YÜKLEME MODAL -->
<div class="ov" id="crmUploadOv">
  <div class="modal">
    <h2>EXCEL <em>YÜKLE</em></h2>
    <div class="msub">Müşteri listesini Excel'den içe aktar</div>
    <div class="info-box">
      <strong>📋 Format:</strong> Excel dosyanızda şu sütunlar olmalı:<br>
      <strong>A:</strong> Müşteri Adı &nbsp;|&nbsp; <strong>B:</strong> Telefon &nbsp;|&nbsp; <strong>C:</strong> Grup (1-4) &nbsp;|&nbsp; <strong>D:</strong> Paket<br>
      <strong>E:</strong> Taahhüt Başlangıç &nbsp;|&nbsp; <strong>F:</strong> Taahhüt Bitiş / Aktivasyon Tarihi &nbsp;|&nbsp; <strong>G:</strong> E-posta (opsiyonel)
    </div>
    <div class="fg">
      <label>DOSYA SEÇ</label>
      <input type="file" id="crmFile" accept=".xlsx,.xls,.csv" style="background:#f7f8fa;border:1px solid var(--border);border-radius:8px;padding:10px;width:100%;font-family:'Outfit';cursor:pointer;">
    </div>
    <div id="crmUploadPreview" style="display:none;margin-top:12px;"></div>
    <div class="mf"><button class="btn btn-g" onclick="closeCrmUpload()">İptal</button><button class="btn btn-p" id="crmUploadBtn" onclick="processCrmUpload()" disabled>📥 İçe Aktar</button></div>
  </div>
</div>

<!-- SATIŞ MODAL -->
<div class="ov" id="saleOv">
  <div class="modal" style="width:650px;">
    <h2>SATIŞ <em id="sModalTitle">EKLE</em></h2>
    <div class="msub" id="sSub">Ürüne tıkla → anında kaydet</div>
    <input type="hidden" id="editId" value="">
    <div id="saleEditForm" style="display:none;">
      <div class="fr">
        <div class="fg"><label>ÇALIŞAN</label><select id="sEmpEdit"></select></div>
        <div class="fg"><label>ÜRÜN</label><select id="sProdEdit"></select></div>
      </div>
      <div class="fr">
        <div class="fg"><label>ADET</label><input type="number" id="sQtyEdit" value="1" min="1"></div>
        <div class="fg"><label>TARİH</label><input type="date" id="sDateEdit"></div>
      </div>
      <div class="fg" id="manuelGrpEdit" style="display:none"><label>KARLILIK (₺)</label><input type="number" id="sManuelEdit" value="0"></div>
      <div class="fg" id="acGrpEdit" style="display:none"><label>AÇIKLAMA</label><textarea id="sAcEdit"></textarea></div>
      <div class="mf"><button class="btn btn-g" onclick="closeSaleModal()">İptal</button><button class="btn btn-p" onclick="saveSaleEdit()">✓ Güncelle</button></div>
    </div>
    <div id="saleQuickForm">
      <div class="fr" style="margin-bottom:14px;">
        <div class="fg"><label>ÇALIŞAN</label><select id="sEmp" style="font-size:14px;padding:10px;" onchange="renderSaleTiles()"></select></div>
        <div class="fg"><label>TARİH</label><input type="date" id="sDate" style="font-size:14px;padding:10px;" onchange="renderSaleTiles()"></div>
      </div>
      <div style="font-size:10px;color:var(--gray);letter-spacing:1px;margin-bottom:8px">POSTPAID ÜRÜNLER</div>
      <div id="saleTilesPost" style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:14px;"></div>
      <div style="font-size:10px;color:var(--gray);letter-spacing:1px;margin-bottom:8px">PREPAID ÜRÜNLER</div>
      <div id="saleTilesPre" style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:14px;"></div>
      <div style="font-size:10px;color:var(--gray);letter-spacing:1px;margin-bottom:8px">DİĞER ÜRÜNLER</div>
      <div id="saleTilesNotr" style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:14px;"></div>
      <div id="manuelPopup" style="display:none;background:#f7f8fa;border:1px solid rgba(230,168,0,0.3);border-radius:10px;padding:14px;margin-bottom:14px;">
        <div style="font-weight:600;font-size:12px;margin-bottom:8px" id="manuelPopupTitle">—</div>
        <div id="ntcSearchRow" style="display:none;margin-bottom:10px;position:relative;">
          <label style="font-size:10px;font-weight:600;letter-spacing:1px;color:var(--gray)">MODEL ARA</label>
          <input type="text" id="ntcModelSearch" placeholder="iphone, samsung, redmi, spark..." autocomplete="off" oninput="ntcAutoComplete()" style="width:100%;padding:10px;font-size:13px;border:2px solid var(--yellow);border-radius:8px;">
          <div id="ntcSuggestions" style="display:none;position:absolute;top:100%;left:0;right:0;max-height:200px;overflow-y:auto;background:#fff;border:1px solid var(--border);border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.15);z-index:999;"></div>
        </div>
        <div class="fr">
          <div class="fg"><label>KARLILIK (₺)</label><input type="number" id="sManuelQuick" value="0" min="0"></div>
          <div class="fg"><label>AÇIKLAMA</label><input type="text" id="sAcQuick" placeholder="Model, kondisyon..."></div>
        </div>
        <div class="mf"><button class="btn btn-g bsm" onclick="cancelManuelSale()">İptal</button><button class="btn btn-p bsm" onclick="confirmManuelSale()">✓ Ekle</button></div>
      </div>
      <div id="saleTodaySummary" style="background:rgba(230,168,0,0.06);border:1px solid rgba(230,168,0,0.2);border-radius:10px;padding:10px;font-size:11px;color:var(--gray)"></div>
      <div class="mf"><button class="btn btn-g" onclick="closeSaleModal()">Kapat</button></div>
    </div>
  </div>
</div>

<!-- MUAFİYET MODAL -->
<div class="ov" id="muafOv">
  <div class="modal">
    <h2>MUAFİYET <em>EKLE</em></h2>
    <div class="msub">Bu çalışan bu ay primini almaya devam edecek</div>
    <div class="fr">
      <div class="fg"><label>ÇALIŞAN</label><select id="mEmp"></select></div>
      <div class="fg"><label>AY</label><select id="mAy"></select></div>
    </div>
    <div class="fg"><label>NEDEN</label><textarea id="mNeden" placeholder="Hastalık, izin, özel durum..."></textarea></div>
    <div class="mf"><button class="btn btn-g" onclick="closeMuafModal()">İptal</button><button class="btn btn-p" onclick="saveMuafiyet()">✓ Kaydet</button></div>
  </div>
</div>

<!-- DUYURU LIGHTBOX (Görsel Büyüt) -->
<div id="duyuruLightbox" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.92);z-index:10000;align-items:center;justify-content:center;padding:20px;cursor:zoom-out" onclick="closeDuyuruLightbox(event)">
  <div style="position:absolute;top:20px;right:20px;display:flex;gap:8px;z-index:10001">
    <button onclick="event.stopPropagation();downloadLightboxImage()" style="background:rgba(255,255,255,0.15);color:#fff;border:1px solid rgba(255,255,255,0.3);padding:8px 14px;border-radius:8px;cursor:pointer;font-family:'Outfit';font-size:12px;font-weight:600">⬇ İndir</button>
    <button onclick="closeDuyuruLightbox(event)" style="background:rgba(255,255,255,0.15);color:#fff;border:1px solid rgba(255,255,255,0.3);width:38px;height:38px;border-radius:8px;cursor:pointer;font-size:18px">✕</button>
  </div>
  <div id="duyuruLightboxNav" style="position:absolute;top:50%;left:0;right:0;transform:translateY(-50%);display:flex;justify-content:space-between;padding:0 16px;pointer-events:none;z-index:10001">
    <button onclick="event.stopPropagation();shiftLightbox(-1)" style="background:rgba(255,255,255,0.15);color:#fff;border:1px solid rgba(255,255,255,0.3);width:44px;height:44px;border-radius:50%;cursor:pointer;font-size:18px;pointer-events:auto">‹</button>
    <button onclick="event.stopPropagation();shiftLightbox(1)" style="background:rgba(255,255,255,0.15);color:#fff;border:1px solid rgba(255,255,255,0.3);width:44px;height:44px;border-radius:50%;cursor:pointer;font-size:18px;pointer-events:auto">›</button>
  </div>
  <div onclick="event.stopPropagation()" style="max-width:95vw;max-height:90vh;display:flex;flex-direction:column;align-items:center;gap:14px">
    <img id="duyuruLightboxImg" src="" style="max-width:100%;max-height:80vh;border-radius:12px;box-shadow:0 10px 40px rgba(0,0,0,0.5);cursor:default;object-fit:contain">
    <div id="duyuruLightboxInfo" style="color:#fff;text-align:center;max-width:600px"></div>
  </div>
</div>

<div class="toast" id="toast"></div>

<script>
// ============================================================
// SUPABASE
// ============================================================
const SURL='https://wjsonuxlcrmdaaxodsti.supabase.co';
const SKEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indqc29udXhsY3JtZGFheG9kc3RpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1NzEyMjQsImV4cCI6MjA4ODE0NzIyNH0.y59-uIYp4ZNop-2yRm6JaighBoCzo8BpEp9K-VAglwo';
const sb=supabase.createClient(SURL,SKEY);

// ============================================================
// SABİT VERİ
// ============================================================
const MONTHS=['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
const products=[
  {name:"SÜPERBOX",                    tip:"postpaid",puan:7,  prim:1256,bazPrim:1256,manuel:false,hedef:2, zorunlu:false, yillikHedef:10},
  {name:"FİBER",                       tip:"postpaid",puan:5,  prim:1256,bazPrim:1256,manuel:false,hedef:2, zorunlu:false, yillikHedef:12},
  {name:"ORTAK ALTYAPI",               tip:"postpaid",puan:3.5,prim:628, bazPrim:628, manuel:false,hedef:2, zorunlu:false, yillikHedef:10},
  {name:"FATURALI YENİ TESİS",         tip:"postpaid",puan:4.5,prim:564, bazPrim:564, manuel:false,hedef:3, zorunlu:true,  yillikHedef:200},
  {name:"SWİTCH",                      tip:"postpaid",puan:2,  prim:294, bazPrim:294, manuel:false,hedef:3, zorunlu:true,  yillikHedef:133},
  {name:"FATURALI DATA",               tip:"postpaid",puan:4.5,prim:338, bazPrim:338, manuel:false,hedef:4, zorunlu:false, yillikHedef:80},
  {name:"ÖN ÖDEMELİ YENİ TESİS",      tip:"prepaid", puan:1,  prim:183, bazPrim:183, manuel:false,hedef:6, zorunlu:false, yillikHedef:200},
  {name:"ÖN ÖDEMELİ MNT",             tip:"prepaid", puan:1,  prim:254, bazPrim:254, manuel:false,hedef:5, zorunlu:false, yillikHedef:200, isMNT:true},
  {name:"TURKCELL RAHAT ve MNT",       tip:"prepaid", puan:1.5,prim:338, bazPrim:338, manuel:false,hedef:4, zorunlu:false, yillikHedef:50},
  {name:"RAHATTAN FATURALIYA GEÇİŞ",   tip:"postpaid",puan:2,  prim:245, bazPrim:245, manuel:false,hedef:3, zorunlu:false, yillikHedef:40},
  {name:"ÖN ÖDEMELİDEN RAHATA GEÇİŞ", tip:"prepaid", puan:1.5,prim:270, bazPrim:270, manuel:false,hedef:3, zorunlu:false, yillikHedef:30},
  {name:"REKONTRATLAMA 1",             tip:"notr",    puan:0,  prim:370, bazPrim:60,  manuel:false,hedef:5, zorunlu:true,  yillikHedef:80, rekonTip:'upsell30'},
  {name:"REKONTRATLAMA 2",             tip:"notr",    puan:0,  prim:420, bazPrim:100, manuel:false,hedef:3, zorunlu:true,  yillikHedef:80, rekonTip:'upsell30_50'},
  {name:"REKONTRATLAMA 3",             tip:"notr",    puan:0,  prim:500, bazPrim:140, manuel:false,hedef:2, zorunlu:true,  yillikHedef:60, rekonTip:'upsell50plus'},
  {name:"AKG",                         tip:"prepaid", puan:0,  prim:0,   bazPrim:0,   manuel:false,hedef:2, zorunlu:true,  yillikHedef:23},
  {name:"NTC",                         tip:"postpaid",puan:3,  prim:0,   bazPrim:0,   manuel:true, hedef:4, zorunlu:true,  hedefTL:5000, aciklama:true, yillikHedef:240},
  {name:"2. EL CİHAZ",                 tip:"notr",    puan:0,  prim:0,   bazPrim:0,   manuel:true, hedef:0, zorunlu:false, hedefTL:12917,aciklama:true, yillikHedefTL:155000},
  {name:"SIFIR CİHAZ",                 tip:"notr",    puan:0,  prim:0,   bazPrim:0,   manuel:true, hedef:0, zorunlu:false, hedefTL:13542,aciklama:true, yillikHedefTL:162500},
  {name:"AKSESUAR",                    tip:"notr",    puan:0,  prim:0,   bazPrim:0,   manuel:true, hedef:0, zorunlu:false, hedefTL:26042,yillikHedefTL:312500},
  {name:"FATURALI MNT",                tip:"postpaid",puan:4.5,prim:564, bazPrim:564, manuel:false,hedef:3, zorunlu:true,  yillikHedef:200, isMNT:true},
];
// DSN Resmi Prim Tabloları (Ocak 2026 - Turkcell Dijital Satış Noktası Prim Sistemi)
const DSN_REKON_MOBIL=[
  {min:-999,max:0,ad:'Downsell/Samesell — Mevcut',prim:0,churnPrim:275},
  {min:0.01,max:30,ad:'Upsell ≤%30',prim:60,churnPrim:370},
  {min:30.01,max:50,ad:'%30<Upsell≤%50',prim:100,churnPrim:420},
  {min:50.01,max:999,ad:'Upsell>%50',prim:140,churnPrim:500}
];
const DSN_REKON_SOL=[{urun:'Fiber',k:1},{urun:'Superbox',k:0.75},{urun:'ADSL/Turksat/VFiber/TTFiber',k:0.88},{urun:'6 Aydan Önce',k:0.5}];
const DSN_YUKSEK_URETIM=[
  {min:100,max:149,p:3688},{min:150,max:199,p:6503},{min:200,max:299,p:9608},
  {min:300,max:399,p:17175},{min:400,max:499,p:25909},{min:500,max:599,p:36581},
  {min:600,max:799,p:51525},{min:800,max:999,p:78790},{min:1000,max:1199,p:111684},
  {min:1200,max:1499,p:146324},{min:1500,max:1799,p:220941},{min:1800,max:Infinity,p:309530}
];
const DSN_CEZA_TIPLERI=[
  {ad:'Ulaşmayan Evrak — Faturalı (60 gün)',tutar:875},
  {ad:'Ulaşmayan Evrak — Ön Ödemeli (60 gün)',tutar:350},
  {ad:'Faturalı Hat İptal/Suspend (≥%23, ilk 7 ay)',tutar:875},
  {ad:'ÖÖ YT Ceza — kullanım koşulu (≥%20)',tutar:350},
  {ad:'ÖÖ MNT Ceza — kullanım koşulu (≥%40)',tutar:350},
  {ad:'Sehven İptal — Faturalı (≥%5)',tutar:416},
  {ad:'Sehven İptal — Ön Ödemeli (≥%5)',tutar:1111},
  {ad:'Turkcell Rahat İptal/Kullanım (≥%23 / ≥%20)',tutar:640},
  {ad:'Eksik Evrak — Faturalı',tutar:116},
  {ad:'Eksik Evrak — Ön Ödemeli',tutar:62}
];
const DSN_DIGER_PRIMLER=[
  {ad:'Turkcell TV+ Giriş',p:190},
  {ad:'Turkcell TV+ Aile',p:300},
  {ad:'Turkcell TV+ Ekstra',p:375},
  {ad:'Turkcell TV+ Avantaj',p:300},
  {ad:'Turkcell TV+ Sinema',p:300},
  {ad:'TV+ Yeni Müşteri Bundle',p:50},
  {ad:'Yan Oda',p:190},
  {ad:'Netflix',p:165},
  {ad:'OTT TV (Fiber & ADSL)',p:165},
  {ad:'Turist Aktivasyon (Welcome / Tanışma)',p:165},
  {ad:'Ön Ödemeli Data Aktivasyon',p:165}
];
// Resmi DSN Perakendecilik Skalası (Ocak 2026)
const DSN_PRIM_BANDS=[
  {min:190,max:239,prim:2228},{min:240,max:289,prim:5495},{min:290,max:389,prim:7277},
  {min:390,max:489,prim:11955},{min:490,max:589,prim:17078},{min:590,max:689,prim:24354},
  {min:690,max:889,prim:29849},{min:890,max:1089,prim:43362},{min:1090,max:1289,prim:59697},
  {min:1290,max:1589,prim:77443},{min:1590,max:1889,prim:110633},{min:1890,max:Infinity,prim:149391}
];
// Ürün Grupları (Dashboard + Çalışan Kartları)
// MNT ürünleri: 7 (ÖÖ MNT), 19 (Faturalı MNT)
const MNT_PRODS=[7,19];
const PROD_GROUPS=[
  {name:'HAT SATIŞLARI',short:'A',color:'var(--postpaid)',prods:[3,4,19,6,7],hasMNT:true,useTL:false},
  {name:'NTC',short:'B',color:'var(--yellow)',prods:[15],hasMNT:false,useTL:true,alsoAdet:true},
  {name:'AKSESUAR',short:'C',color:'var(--purple)',prods:[18],hasMNT:false,useTL:true},
  {name:'CİHAZ',short:'D',color:'var(--blue)',prods:[16,17],hasMNT:false,useTL:true},
];
function getGroupStats(groupIdx,empIdx){
  const g=PROD_GROUPS[groupIdx];
  const ms=typeof empIdx==='number'?getMonthSales().filter(s=>s.emp===empIdx):getMonthSales();
  const eom=new Date(activeYear,activeMonth+1,0);
  const totalDays=eom.getDate();
  const today=new Date();
  const isThisMonth=today.getMonth()===activeMonth&&today.getFullYear()===activeYear;
  const passedDays=isThisMonth?today.getDate():totalDays;
  const remDays=Math.max(0,totalDays-passedDays);
  const effectiveDays=g.hasMNT?totalDays-3:totalDays;
  const effectiveRemDays=g.hasMNT?Math.max(0,effectiveDays-passedDays):remDays;
  let adet=0,tutar=0,hedef=0;
  g.prods.forEach(pi=>{
    const p=products[pi];
    ms.filter(s=>s.prod===pi).forEach(s=>{
      adet+=s.qty;
      if(g.useTL)tutar+=(s.manuel_prim||0)*s.qty;
    });
    hedef+=p.hedef||0;
  });
  if(typeof empIdx!=='number')hedef*=targetEmpCount;
  const calcDays=Math.max(1,Math.min(passedDays,effectiveDays));
  const gunlukOrt=g.useTL?Math.round(tutar/calcDays):Math.round(adet/calcDays*10)/10;
  const tahmini=g.useTL?Math.round(gunlukOrt*effectiveDays):Math.round(gunlukOrt*effectiveDays);
  const hedefVal=g.useTL
    ?g.prods.reduce((a,pi)=>a+(products[pi].hedefTL||0),0)*(typeof empIdx==='number'?1:targetEmpCount)
    :hedef;
  const oran=hedefVal>0?(g.useTL?tutar/hedefVal*100:adet/hedefVal*100):0;
  return{adet,tutar,hedef:hedefVal,gunlukOrt,tahmini,passedDays,calcDays,effectiveDays,remDays:effectiveRemDays,totalDays,oran:Math.round(oran),useTL:g.useTL,alsoAdet:g.alsoAdet||false};
}
const employees=[
  {name:"Abdurrahman Yıldırım",color:"#FFD100",initials:"AY",tel:"05326822277",
   karakter:"İşkolik, Beşiktaşlı, ekmeğini kes çayını kesme, evli 3 çocuk, Güneysinır Durayda köyünden, 44 yaşında"},
  {name:"Hüseyin Ergün",       color:"#00e5a0",initials:"HE",tel:"05363125015",
   karakter:"Zaman mefhumu yok, Konyasporlu, satış canavarı, 2 kızı var, Konya Başarakavaklı, 46 yaşında"},
  {name:"Kerem Ardıç",         color:"#4fa3ff",initials:"KA",tel:"05304031534",
   karakter:"Yakışıklı ama geç anlayan, Fenerbahçeli, kızlarla arası iyi, cihaz satış potansiyeli var, bekar Ermeneği, 25 yaşında, temiz tertipli"},
  {name:"Melike Erdal",        color:"#ff6b9d",initials:"ME",tel:"05385421139",
   karakter:"Güzel alımlı, çok makyaj yapar, bazen sinirli halleri olur, bekar 18 yaşında, Galatasaraylı, Niğdeli"},
  {name:"Uludağlı",            color:"#9b59b6",initials:"UL",tel:"",
   karakter:"",noTarget:true},
];
const targetEmpCount=employees.filter(e=>!e.noTarget).length;
// HGO için Toplam Abonelik kapsamı (sunum tanımı):
// Faturalı YT, F.MNT, F.Data, Switch, ÖÖ YT, ÖÖ MNT, TC Rahat YT&MNT, SOL (Süperbox, Fiber, Ortak Altyapı)
// HARİÇ: Rahattan Faturalıya, ÖÖ→Rahata, AKG, NTC, 2.El, Sıfır, Aksesuar
const TOPLAM_ABONELIK_INDEX=[0,1,2,3,4,5,6,7,8,19]; // Süperbox, Fiber, Ortak Altyapı, F.YT, Switch, F.Data, ÖÖ YT, ÖÖ MNT, TC Rahat, F.MNT
const FATURALI_ABONELIK_INDEX=[3,4,5,19]; // F.YT, Switch, F.Data, F.MNT

// TDM Toplam Hedef değiştiğinde — aylık olarak kaydet
async function onTdmTopHedefChange(val){
  const v=parseInt(val);
  if(!v||v<=0){showToast('Geçersiz değer',true);return;}
  tdmToplamHedef=v;
  // Aktif olarak hangi ayı düzenliyorsak onu kaydet
  const m=hedefEditMonth!==undefined?hedefEditMonth:activeMonth;
  const y=hedefEditYear!==undefined?hedefEditYear:activeYear;
  const key=getHedefKey(m,y);
  if(!monthlyHedefler[key])monthlyHedefler[key]={};
  monthlyHedefler[key]._tdmTopHedef=v;
  try{
    // urun_id=-1 → özel satır olarak DB'ye yaz
    const{error}=await sb.from('aylik_urun_hedefler').upsert({
      ay:m+1,yil:y,urun_id:-1,hedef:v,
      hedef_tl:0,magaza_hedef:0,magaza_hedef_tl:0,
      puan:0,prim:0,zorunlu:false,calisan_prim:0,
      updated_at:new Date().toISOString()
    },{onConflict:'ay,yil,urun_id'});
    if(error)throw error;
    // Global ayarlar tablosunda da güncelle (geriye dönük uyum için)
    await dbSaveAyarlar();
    showToast(MONTHS[m]+' '+y+' TDM Hedef: '+v+' adet kaydedildi');
    refreshAll();
  }catch(e){showToast('Kayıt hatası: '+e.message,true);}
}

function calcStoreTarget(){
  // Aylık Puan Hedefi: gösterim amaçlı (referans, hesaplamada kullanılmaz)
  let kisiPuan=0;
  let kisiAdet=0;
  products.forEach((p,i)=>{
    if(p.hidden||p.manuel)return;
    kisiPuan+=(p.hedef||0)*(p.puan||0);
    // Toplam Abonelik kapsamındaki ürünlerin adet hedefini topla
    if(TOPLAM_ABONELIK_INDEX.includes(i))kisiAdet+=(p.hedef||0);
  });
  storeTarget=Math.round(kisiPuan*targetEmpCount*10)/10;
  storeAdetHedefi=Math.round(kisiAdet*targetEmpCount);
  const el=document.getElementById('storeTarget');if(el)el.value=storeTarget;
  const info=document.getElementById('storeTargetInfo');
  if(info)info.textContent='(kişi: '+Math.round(kisiPuan*10)/10+' × '+targetEmpCount+' çalışan · referans)';
}

// Toplam Abonelik adet sayar (HGO için)
function getToplamAbonelikAdet(m=activeMonth,y=activeYear){
  const ms=getMonthSales(m,y);
  let toplam=0,faturali=0;
  ms.forEach(s=>{
    if(TOPLAM_ABONELIK_INDEX.includes(s.prod))toplam+=s.qty;
    if(FATURALI_ABONELIK_INDEX.includes(s.prod))faturali+=s.qty;
  });
  return{toplam,faturali};
}

// Toplam Puan: ürünlerin sunum tanımındaki puanları üzerinden
// (Süperbox 7, Fiber 5, Ortak Altyapı 3.5, Faturalı 4.5 [DSN+ Extra], Switch 2, Rahat 1.5, ÖÖ 1, NTC 3, YNT 2)
function getDsnPuanToplam(m=activeMonth,y=activeYear){
  const ms=getMonthSales(m,y);
  let puan=0;
  ms.forEach(s=>{
    const p=products[s.prod];
    if(p.puan>0)puan+=p.puan*s.qty;
  });
  return puan;
}
const primBands=[
  {min:190,max:239,prim:2228},{min:240,max:289,prim:5495},
  {min:290,max:389,prim:7277},{min:390,max:489,prim:11955},
  {min:490,max:589,prim:17078},{min:590,max:689,prim:24354},
  {min:690,max:889,prim:29849},{min:890,max:1089,prim:43362},
  {min:1090,max:1289,prim:59697},{min:1290,max:1589,prim:77443},
  {min:1590,max:1889,prim:110633},{min:1890,max:Infinity,prim:149391},
];

// ============================================================
// DURUM
// ============================================================
let sales=[];
let muafiyetler=[];
let yillikHedefler=employees.map(()=>MONTHS.map(()=>({puanHedef:Math.round(500/targetEmpCount)})));
let carpanlar={c1:0.65,c2:1.00,c3:1.10};
let storeTarget=500;
let storeAdetHedefi=40;
let tdmToplamHedef=316;
let posCiro=0;
let monthlyHedefler={};
let hedefEditMonth,hedefEditYear;
// Orijinal ürün varsayılanlarını sakla (sayfa yüklendiğindeki değerler)
const PRODUCT_DEFAULTS=[];

function getHedefKey(m,y){return y+'-'+String(m+1).padStart(2,'0');}

function initProductDefaults(){
  products.forEach(function(p,i){
    PRODUCT_DEFAULTS[i]={hedef:p.hedef,hedefTL:p.hedefTL!=null?p.hedefTL:0,magazaHedef:p.magazaHedef!=null?p.magazaHedef:p.hedef,magazaHedefTL:p.magazaHedefTL!=null?p.magazaHedefTL:p.hedefTL,puan:p.puan,prim:p.prim,zorunlu:p.zorunlu,calisanPrim:p.calisanPrim!=null?p.calisanPrim:0};
  });
}
initProductDefaults();

// En yakın geçmiş aydaki ürün hedefini bul (her ürün için ayrı)
function findNearestPastProductHedef(productId,m,y){
  for(let i=1;i<24;i++){  // i=1'den başla, kendi ay'ı atla
    let testM=m-i;let testY=y;
    while(testM<0){testM+=12;testY--;}
    const key=getHedefKey(testM,testY);
    const d=monthlyHedefler[key];
    if(d&&d[productId]){
      return{value:d[productId],from:MONTHS[testM]+' '+testY};
    }
  }
  return null;
}

function applyMonthHedefler(m,y){
  const key=getHedefKey(m,y);
  const data=monthlyHedefler[key];
  // TDM Toplam Hedef de aylık miras alır
  const nearestTdm=findNearestPastTdmHedef(m,y);
  if(data&&data._tdmTopHedef!=null&&data._tdmTopHedef>0){
    tdmToplamHedef=data._tdmTopHedef;
  } else if(nearestTdm){
    tdmToplamHedef=nearestTdm.value;
  }
  // Yoksa global ayarlardan gelen değer kalsın
  products.forEach(function(p,i){
    // 1) Önce hardcode varsayılana dön (en alt katman)
    const def=PRODUCT_DEFAULTS[i]||{};
    let src=Object.assign({},def);
    // 2) Sonra geçmiş aydan miras al (varsa) — bu varsayılanı override eder
    const inherited=findNearestPastProductHedef(i,m,y);
    if(inherited){
      const idata=inherited.value;
      if(idata.hedef!=null)src.hedef=idata.hedef;
      if(idata.hedefTL!=null)src.hedefTL=idata.hedefTL;
      if(idata.magazaHedef!=null)src.magazaHedef=idata.magazaHedef;
      if(idata.magazaHedefTL!=null)src.magazaHedefTL=idata.magazaHedefTL;
      if(idata.puan!=null)src.puan=idata.puan;
      if(idata.prim!=null)src.prim=idata.prim;
      if(idata.zorunlu!=null)src.zorunlu=idata.zorunlu;
      if(idata.calisanPrim!=null)src.calisanPrim=idata.calisanPrim;
    }
    // 3) Bu aya yaz
    p.hedef=src.hedef!=null?src.hedef:0;
    p.hedefTL=src.hedefTL!=null?src.hedefTL:0;
    p.magazaHedef=src.magazaHedef!=null?src.magazaHedef:p.hedef;
    p.magazaHedefTL=src.magazaHedefTL!=null?src.magazaHedefTL:p.hedefTL;
    p.puan=src.puan!=null?src.puan:0;
    p.prim=src.prim!=null?src.prim:0;
    p.zorunlu=src.zorunlu||false;
    p.calisanPrim=src.calisanPrim!=null?src.calisanPrim:0;
    // 4) Bu ay için açıkça kayıt varsa, onu üstüne yaz (en üst katman)
    if(data&&data[i]){
      const d=data[i];
      if(d.hedef!==undefined&&d.hedef!==null)p.hedef=d.hedef;
      if(d.hedefTL!==undefined&&d.hedefTL!==null)p.hedefTL=d.hedefTL;
      if(d.magazaHedef!==undefined&&d.magazaHedef!==null)p.magazaHedef=d.magazaHedef;
      if(d.magazaHedefTL!==undefined&&d.magazaHedefTL!==null)p.magazaHedefTL=d.magazaHedefTL;
      if(d.puan!==undefined&&d.puan!==null)p.puan=d.puan;
      if(d.prim!==undefined&&d.prim!==null)p.prim=d.prim;
      if(d.zorunlu!==undefined)p.zorunlu=d.zorunlu;
      if(d.calisanPrim!==undefined&&d.calisanPrim!==null)p.calisanPrim=d.calisanPrim;
    }
  });
  calcStoreTarget();
}

// En yakın geçmiş aydaki TDM hedefini bul (miras için)
function findNearestPastTdmHedef(m,y){
  for(let i=0;i<24;i++){
    let testM=m-i;let testY=y;
    while(testM<0){testM+=12;testY--;}
    const key=getHedefKey(testM,testY);
    const d=monthlyHedefler[key];
    if(d&&d._tdmTopHedef!=null&&d._tdmTopHedef>0){
      return{value:d._tdmTopHedef,from:MONTHS[testM]+' '+testY};
    }
  }
  return null;
}

async function loadMonthlyHedefler(){
  try{
    let all=[];let from=0;
    while(true){
      const{data,error}=await sb.from('aylik_urun_hedefler').select('*').range(from,from+999);
      if(error){console.log('Aylık hedef tablosu yok, varsayılan kullanılıyor');return;}
      if(!data||data.length===0)break;
      all=all.concat(data);
      if(data.length<1000)break;
      from+=1000;
    }
    all.forEach(function(row){
      const key=row.yil+'-'+String(row.ay).padStart(2,'0');
      if(!monthlyHedefler[key])monthlyHedefler[key]={};
      // urun_id=-1 → özel satır: TDM Toplam Hedef
      if(row.urun_id===-1){
        monthlyHedefler[key]._tdmTopHedef=row.hedef||0;
        return;
      }
      monthlyHedefler[key][row.urun_id]={
        hedef:row.hedef,hedefTL:row.hedef_tl,
        magazaHedef:row.magaza_hedef,magazaHedefTL:row.magaza_hedef_tl,
        puan:row.puan,prim:row.prim,zorunlu:row.zorunlu,calisanPrim:row.calisan_prim||0
      };
    });
    console.log('Aylık hedefler yüklendi:',Object.keys(monthlyHedefler).length+' ay');
  }catch(e){console.log('Aylık hedef yükleme atlandı');}
}
let bonusAyar={tip:'sabit',sabit:1000,yuzde:15,aktif:true};
const now=new Date();
let activeMonth=now.getMonth();
let activeYear=now.getFullYear();
let activeYillikEmp=0;

// ============================================================
// YARDIMCILAR
// ============================================================
const fmt=n=>(n||0).toLocaleString('tr-TR');
const fmtTL=n=>'₺'+Math.round(n||0).toLocaleString('tr-TR');
const tipLabel=t=>t==='postpaid'?'<span class="tpp">POSTPAİD</span>':t==='prepaid'?'<span class="tpr">PREPAİD</span>':'<span class="tnt">NÖTR</span>';
const tipName=t=>t==='postpaid'?'POSTPAİD':t==='prepaid'?'PREPAİD':'NÖTR';

// MNT ay sonu kaydırma: Son 3 gün MNT satışları sonraki aya kayar
function getMNTShiftZone(month,year){
  const lastDay=new Date(year,month+1,0).getDate();
  return[lastDay-2,lastDay-1,lastDay]; // Her ay son 3 gün
}

function getMonthSales(m=activeMonth,y=activeYear){
  const shiftZone=getMNTShiftZone(m,y);
  // Önceki ay
  let prevM=m-1,prevY=y;
  if(prevM<0){prevM=11;prevY--;}
  const prevShiftZone=getMNTShiftZone(prevM,prevY);

  return sales.filter(s=>{
    const d=new Date(s.date);
    const sM=d.getMonth(),sY=d.getFullYear(),sD=d.getDate();
    const isMNT=products[s.prod]?.isMNT;

    if(!isMNT){
      // Normal ürün: sadece bu ayın satışları
      return sM===m&&sY===y;
    }else{
      // MNT ürün:
      // 1) Bu ayın satışları AMA shift zone HARİÇ
      if(sM===m&&sY===y&&!shiftZone.includes(sD))return true;
      // 2) Önceki ayın shift zone'undaki satışlar (bu aya kaydırılmış)
      if(sM===prevM&&sY===prevY&&prevShiftZone.includes(sD))return true;
      return false;
    }
  });
}
function getEmpStats(ei,m=activeMonth,y=activeYear){
  let puan=0,adetPrim=0,manuelPrim=0,adet=0,calisanPrimTop=0,tdmEkPrimTop=0;
  getMonthSales(m,y).filter(s=>s.emp===ei).forEach(s=>{
    const p=products[s.prod];
    puan+=p.puan*s.qty;
    if(!p.manuel){
      adetPrim+=p.prim*s.qty;
      calisanPrimTop+=(p.calisanPrim||0)*s.qty;
    } else {
      manuelPrim+=(s.manuel_prim||0)*s.qty;
      calisanPrimTop+=Math.round((s.manuel_prim||0)*s.qty*0.1);
    }
    // TDM ek prim
    tdmEkPrimTop+=getTdmEkPrim(s.created_at,s.prod,s.qty,s.manuel_prim||0);
    adet+=s.qty;
  });
  return{puan,adetPrim,manuelPrim,adet,totalPrim:adetPrim+manuelPrim,calisanPrim:calisanPrimTop,tdmEkPrim:tdmEkPrimTop};
}
// Kademeli hakediş hesabı: %75 altı→0 (prim alamaz), %75-99→%75, %100+→%100
function getHakedisOran(oran){
  if(oran>=100)return 1;
  if(oran>=75)return 0.75;
  return 0;
}
function getEmpGroupPrim(ei){
  let toplam=0;
  const detay=[];
  PROD_GROUPS.forEach((g,gi)=>{
    const gs=getGroupStats(gi,ei);
    let grupPrim=0;
    g.prods.forEach(pi=>{
      const p=products[pi];
      if(p.manuel){
        const ms=getMonthSales().filter(s=>s.emp===ei&&s.prod===pi);
        const tlK=ms.reduce((a,s)=>a+(s.manuel_prim||0)*s.qty,0);
        grupPrim+=Math.round(tlK*0.1);
      } else {
        const qty=getMonthSales().filter(s=>s.emp===ei&&s.prod===pi).reduce((a,s)=>a+s.qty,0);
        grupPrim+=(p.calisanPrim||0)*qty;
      }
    });
    const hakedisOran=getHakedisOran(gs.oran);
    const hakedis=Math.round(grupPrim*hakedisOran);
    detay.push({grup:g,oran:gs.oran,hakedisOran,grupPrim,hakedis});
    toplam+=hakedis;
  });
  return{toplam,detay};
}
function getEmpCanliPrim(ei){
  const res=getDailyPrim(ei);
  return res.reduce((a,d)=>a+(d.earned||d.comp?600:0),0);
}
function getTotalStats(m=activeMonth,y=activeYear){
  let puan=0,adetPrim=0,manuelPrim=0,adet=0,tdmEkPrimTop=0;
  getMonthSales(m,y).forEach(s=>{
    const p=products[s.prod];
    puan+=p.puan*s.qty;
    if(!p.manuel)adetPrim+=p.prim*s.qty;
    else manuelPrim+=(s.manuel_prim||0)*s.qty;
    tdmEkPrimTop+=getTdmEkPrim(s.created_at,s.prod,s.qty,s.manuel_prim||0);
    adet+=s.qty;
  });
  return{puan,adetPrim,manuelPrim,adet,tdmEkPrim:tdmEkPrimTop};
}
function getPrimBand(puan){return primBands.find(b=>puan>=b.min&&puan<=b.max)||null;}
// HGO Çarpanı: <%70→0, %70-100→0.65, ≥%100→1.0, ≥%110→1.1 (DSN sistemi)
function getCarpan(pct){
  if(pct>=110)return carpanlar.c3;
  if(pct>=100)return carpanlar.c2;
  if(pct>=70)return carpanlar.c1;
  return 0;
}
// Mağaza HGO oranı (TDM Toplam Hedef üzerinden, adet bazlı)
function getMagazaHgoPct(){
  const ab=getToplamAbonelikAdet();
  return tdmToplamHedef>0?(ab.toplam/tdmToplamHedef)*100:0;
}
function getPuanPrim(puan){
  const band=getPrimBand(puan);if(!band)return 0;
  // Çarpan artık ADET HGO'sundan geliyor (TDM Toplam Hedef üzerinden)
  const pct=getMagazaHgoPct();
  return Math.round(band.prim*getCarpan(pct));
}
function getEmpZorunlu(ei,m=activeMonth,y=activeYear){
  const ms=getMonthSales(m,y).filter(s=>s.emp===ei);
  return products.map((p,pi)=>{
    if(!p.zorunlu||p.hidden)return null;
    let qty=0;ms.filter(s=>s.prod===pi).forEach(s=>qty+=s.qty);
    if(p.manuel){
      let tlK=0;ms.filter(s=>s.prod===pi).forEach(s=>tlK+=(s.manuel_prim||0)*s.qty);
      return{pi,name:p.name,met:tlK>=(p.hedefTL||0),qty,tlK,hedefTL:p.hedefTL||0,isManuel:true};
    }
    return{pi,name:p.name,met:qty>=p.hedef,qty,hedef:p.hedef,isManuel:false};
  }).filter(Boolean);
}
function empHasMuafiyet(ei,m=activeMonth,y=activeYear){
  return muafiyetler.some(mu=>mu.emp===ei&&mu.ay===m&&mu.yil===y);
}
function empPrimHak(ei,m=activeMonth,y=activeYear){
  if(empHasMuafiyet(ei,m,y))return{hak:true,muaf:true};
  const z=getEmpZorunlu(ei,m,y);
  const eksik=z.filter(x=>!x.met);
  return{hak:eksik.length===0,muaf:false,eksik};
}
function calcBonus(totalPrim,puan,empTarget){
  if(!bonusAyar.aktif)return 0;
  const pct=empTarget>0?(puan/empTarget)*100:0;
  if(pct<100)return 0;
  return bonusAyar.tip==='sabit'?bonusAyar.sabit:Math.round(totalPrim*(bonusAyar.yuzde/100));
}
function getDailyPrim(ei){
  const eom=new Date(activeYear,activeMonth+1,0);
  const days=eom.getDate();
  const res=[];
  for(let d=1;d<=days;d++){
    const ds=`${activeYear}-${String(activeMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    let pp=0,pr=0;
    sales.filter(s=>s.emp===ei&&s.date===ds).forEach(s=>{
      const t=products[s.prod]?.tip;
      if(t==='postpaid')pp+=s.qty;else if(t==='prepaid')pr+=s.qty;
    });
    // Kendi katını hesapla
    let kat=0,kPP=pp,kPR=pr;
    while(kPP>=6||(kPP>=5&&kPR>=1)){
      kat++;
      if(kPP>=6){kPP-=6;}else{kPP-=5;kPR-=1;}
    }
    // kPP,kPR = kendi katından arta kalan
    res.push({date:ds,day:d,pp,pr,met:kat>=1,kat,leftPP:kPP,leftPR:kPR});
  }
  // Telafi: Ertesi günün ARTANI ile önceki günü telafi et
  const final=[];
  for(let i=0;i<res.length;i++){
    const r=res[i];
    if(r.met){
      // Kendi katı var, telafi yok
      final.push({...r,earned:true,comp:false});
    }else{
      // Kendi katı yok. Ertesi günün artanına bak
      let compensated=false;
      if(i<res.length-1){
        const nx=res[i+1];
        // Ertesi gün kendi katını kazanmış mı?
        if(nx.met){
          // Ertesi günün artanı + bugünün satışları yeterli mi?
          const combPP=r.pp+nx.leftPP;
          const combPR=r.pr+nx.leftPR;
          if(combPP>=6||(combPP>=5&&combPR>=1)){
            compensated=true;
            // Ertesi günün artanını azalt (kullanıldı)
            let needPP=6,needPR=0;
            if(combPP<6&&combPP>=5&&combPR>=1){needPP=5;needPR=1;}
            const usedFromNext=Math.max(0,needPP-r.pp);
            nx.leftPP=Math.max(0,nx.leftPP-usedFromNext);
            if(needPR>0)nx.leftPR=Math.max(0,nx.leftPR-Math.max(0,needPR-r.pr));
          }
        }
      }
      final.push({...r,earned:compensated,comp:compensated,kat:compensated?1:0});
    }
  }
  return final;
}

// ============================================================
// SUPABASE CRUD
// ============================================================
async function loadAll(){
  showLoading(true);
  console.log('[1] loadAll başladı');
  try{
    console.log('[2] Birincil veri yüklemeleri (paralel)...');
    // BİRİNCİL: Dashboard için zorunlu olanlar
    const t0=performance.now();
    const[{data:sd,error:e1},{data:md,error:e2},{data:ad,error:e3},{data:ud,error:e4},{data:yd,error:e5},{data:ld,error:e6}]=await Promise.all([
      sb.from('sales').select('*').order('created_at',{ascending:false}),
      sb.from('muafiyetler').select('*').order('created_at',{ascending:false}),
      sb.from('ayarlar').select('*').eq('id',1).single(),
      sb.from('urun_ayarlar').select('*'),
      sb.from('yillik_hedefler').select('*'),
      sb.from('lider_primler').select('*').order('created_at',{ascending:false}),
    ]);
    if(e1)console.error('Sales hata:',e1);
    if(e2)console.error('Muaf hata:',e2);
    if(e3)console.error('Ayarlar hata:',e3);
    console.log('[3] Birincil tamamlandı:',Math.round(performance.now()-t0),'ms');
    sales=sd||[];
    sales.forEach(s=>{ if(s.emp>=employees.length) s.emp=0; });
    sales.forEach(s=>{ if(s.prod<0||s.prod>=products.length) s.prod=0; });
    sales=sales.filter(s=>s.emp>=0&&s.emp<employees.length&&s.prod>=0&&s.prod<products.length);
    muafiyetler=md||[];
    liderPrimler=ld||[];
    if(ad){
      storeTarget=ad.store_target||500;
      tdmToplamHedef=ad.tdm_toplam_hedef||316;
      posCiro=ad.pos_ciro||0;
      carpanlar={c1:ad.carpan_c1||0.65,c2:ad.carpan_c2||1.00,c3:ad.carpan_c3||1.10};
      bonusAyar={tip:ad.bonus_tip||'sabit',sabit:ad.bonus_sabit||1000,yuzde:ad.bonus_yuzde||15,aktif:ad.bonus_aktif!==false};
    }
    if(ud&&ud.length){
      ud.forEach(row=>{
        if(products[row.id]){
          const p=products[row.id];
          p.hedef=row.hedef;p.hedefTL=row.hedef_tl;
          p.magazaHedef=row.magaza_hedef||p.hedef;p.magazaHedefTL=row.magaza_hedef_tl||p.hedefTL;
          p.puan=row.puan;p.prim=row.prim;p.zorunlu=row.zorunlu;
          if(row.calisan_prim!==undefined)p.calisanPrim=row.calisan_prim;
        }
      });
      initProductDefaults();
    }
    if(yd&&yd.length){
      yd.forEach(row=>{
        if(yillikHedefler[row.emp]&&yillikHedefler[row.emp][row.ay])
          yillikHedefler[row.emp][row.ay].puanHedef=row.puan_hedef;
      });
    }
  }catch(e){
    console.error('[ERR] Veri yükleme hatası:',e);
    showToast('Veri yükleme hatası: '+e.message,true);
  }

  // İKİNCİL: Dashboard öncesi gerekenler (paralel) - aylık hedefler ve TDM ek destekler
  try{
    const t1=performance.now();
    await Promise.all([
      loadMonthlyHedefler().catch(e=>console.error('Aylık hedef hata:',e)),
      loadTdmEkDestekler().catch(e=>console.error('TDM Ek hata:',e)),
      loadNtcPrimler().catch(e=>console.error('NTC hata:',e)),
    ]);
    // Mart 2026 varsayılan hedefleri (yoksa)
    const martKey=getHedefKey(2,2026);
    if(!monthlyHedefler[martKey]){
      monthlyHedefler[martKey]={};
      products.forEach(function(p,i){
        monthlyHedefler[martKey][i]={hedef:p.hedef,hedefTL:p.hedefTL||0,magazaHedef:p.hedef,magazaHedefTL:p.hedefTL||0,puan:p.puan,prim:p.prim,zorunlu:p.zorunlu,calisanPrim:0};
      });
    }
    applyMonthHedefler(activeMonth,activeYear);
    try{calcStoreTarget();}catch(e){console.error('StoreTarget hata:',e);}
    console.log('[4] İkincil tamamlandı:',Math.round(performance.now()-t1),'ms');
  }catch(e){console.error('İkincil yükleme hatası:',e);}

  // DASHBOARD ŞİMDİ AÇILSIN - kullanıcı bekleme bitti
  showLoading(false);
  try{console.log('[5] Dashboard render');renderDashboard();}catch(e){console.error('Dashboard hata:',e);}

  // ÜÇÜNCÜL: Arka planda yükle (kullanıcı dashboard'u görüyor zaten)
  setTimeout(async ()=>{
    const t2=performance.now();
    await Promise.all([
      loadDuyurular().catch(e=>console.error('Duyuru hata:',e)),
      loadPrepMnt().catch(e=>console.error('PrepMNT hata:',e)),
      loadAjanda().catch(e=>console.error('Ajanda hata:',e)),
    ]);
    try{initCrmNotifications();}catch(e){console.error('CRM notif hata:',e);}
    console.log('[6] Arka plan tamamlandı:',Math.round(performance.now()-t2),'ms');
    // Duyuru carousel'ı yenile (geç yüklendi)
    if(typeof renderDuyuruCarousel==='function')renderDuyuruCarousel();
    // Aktif sayfa CRM ile ilgili ise yenile
    const activePage=document.querySelector('.page.active');
    if(activePage&&activePage.id.startsWith('page-crm'))refreshAll();
  },100);
}

// CRM verisi sadece CRM sayfasına girildiğinde yüklensin (lazy load)
let _crmDataLoaded=false;
let _crmDataLoading=null;
async function ensureCrmDataLoaded(){
  if(_crmDataLoaded)return;
  if(_crmDataLoading)return _crmDataLoading;
  _crmDataLoading=loadCrmData().then(()=>{
    _crmDataLoaded=true;
    _crmDataLoading=null;
  }).catch(e=>{
    _crmDataLoading=null;
    console.error('CRM yükleme hatası:',e);
  });
  return _crmDataLoading;
}

async function dbAddSale(obj){
  const{data,error}=await sb.from('sales').insert([obj]).select().single();
  if(error)throw error;
  return data;
}
async function dbUpdateSale(id,obj){
  const{error}=await sb.from('sales').update(obj).eq('id',id);
  if(error)throw error;
}
async function dbDeleteSale(id){
  const{error}=await sb.from('sales').delete().eq('id',id);
  if(error)throw error;
}
async function dbSaveAyarlar(){
  const{error}=await sb.from('ayarlar').upsert({
    id:1,store_target:storeTarget,tdm_toplam_hedef:tdmToplamHedef,pos_ciro:posCiro,
    carpan_c1:carpanlar.c1,carpan_c2:carpanlar.c2,carpan_c3:carpanlar.c3,
    bonus_tip:bonusAyar.tip,bonus_sabit:bonusAyar.sabit,
    bonus_yuzde:bonusAyar.yuzde,bonus_aktif:bonusAyar.aktif,
    updated_at:new Date().toISOString()
  });
  if(error)throw error;
}
async function dbSaveUrunAyarlar(){
  const rows=products.map((p,i)=>({id:i,hedef:p.hedef,hedef_tl:p.hedefTL!=null?p.hedefTL:0,magaza_hedef:p.hedef,magaza_hedef_tl:p.hedefTL!=null?p.hedefTL:0,puan:p.puan,prim:p.prim,zorunlu:p.zorunlu,calisan_prim:p.calisanPrim!=null?p.calisanPrim:0,updated_at:new Date().toISOString()}));
  let{error}=await sb.from('urun_ayarlar').upsert(rows);
  if(error){
    const coreRows=products.map((p,i)=>({id:i,hedef:p.hedef,hedef_tl:p.hedefTL!=null?p.hedefTL:0,puan:p.puan,prim:p.prim,zorunlu:p.zorunlu,updated_at:new Date().toISOString()}));
    const r2=await sb.from('urun_ayarlar').upsert(coreRows);
    if(r2.error)throw r2.error;
  }
}
async function dbAddMuafiyet(obj){
  const{data,error}=await sb.from('muafiyetler').insert([obj]).select().single();
  if(error)throw error;
  return data;
}
async function dbDeleteMuafiyet(id){
  const{error}=await sb.from('muafiyetler').delete().eq('id',id);
  if(error)throw error;
}
async function dbSaveYillik(ei,mi,hedef){
  const{error}=await sb.from('yillik_hedefler').upsert({emp:ei,ay:mi,yil:activeYear,puan_hedef:hedef},{onConflict:'emp,ay,yil'});
  if(error)throw error;
}

// ============================================================
// RENDER
// ============================================================
function renderDashboard(){
  const tot=getTotalStats();
  // ADET bazlı HGO (DSN sunum mantığı): Toplam Abonelik / TDM Toplam Hedef
  const ab=getToplamAbonelikAdet();
  const adetPct=tdmToplamHedef>0?(ab.toplam/tdmToplamHedef)*100:0;
  const puanPrim=getPuanPrim(tot.puan);
  const carpan=getCarpan(adetPct);
  document.getElementById('k1').textContent=fmt(tot.puan);
  // Hedef alanı: artık ADET hedefini gösterir (HGO için)
  document.getElementById('k1h').innerHTML='<span style="color:var(--gray)">Abonelik: '+ab.toplam+'/'+tdmToplamHedef+' adet</span>';
  document.getElementById('k2').textContent=fmtTL(tot.adetPrim);
  document.getElementById('k3').textContent=fmtTL(puanPrim);
  document.getElementById('k4').textContent=fmtTL(tot.adetPrim+puanPrim+tot.manuelPrim+tot.tdmEkPrim);
  // k4 detay (arka yüz)
  document.getElementById('k4detail').innerHTML=
    '<div style="color:var(--green)">Adet Primi: <strong>'+fmtTL(tot.adetPrim)+'</strong></div>'+
    '<div style="color:var(--blue)">Puan Primi: <strong>'+fmtTL(puanPrim)+'</strong></div>'+
    '<div style="color:var(--yellow)">NTC/Cihaz/Aks: <strong>'+fmtTL(tot.manuelPrim)+'</strong></div>'+
    (tot.tdmEkPrim>0?'<div style="color:#00b4d8">🎯 TDM Ek Destek: <strong>+'+fmtTL(tot.tdmEkPrim)+'</strong></div>':'')+
    '<div style="border-top:1px solid rgba(0,0,0,0.1);margin-top:4px;padding-top:4px;color:var(--purple);font-weight:700">Toplam: '+fmtTL(tot.adetPrim+puanPrim+tot.manuelPrim+tot.tdmEkPrim)+'</div>';
  const ob=document.getElementById('k1o');
  // %X badge artık ADET bazlı HGO gösteriyor
  ob.textContent='HGO %'+Math.round(adetPct);
  ob.className='badge '+(adetPct>=110?'bg':adetPct>=100?'bb':adetPct>=70?'by':'br');
  document.getElementById('k3c').textContent='Çarpan: ×'+carpan.toFixed(2);
  const pct=adetPct; // cs1/cs2/cs3 highlight için
  ['cs1','cs2','cs3'].forEach(id=>{const el=document.getElementById(id);if(el)el.classList.remove('hi');});
  ['cm1','cm2','cm3'].forEach(id=>{const el=document.getElementById(id);if(el)el.classList.remove('ac');});
  if(pct>=110){const e=document.getElementById('cs3');if(e)e.classList.add('hi');const f=document.getElementById('cm3');if(f)f.classList.add('ac');}
  else if(pct>=100){const e=document.getElementById('cs2');if(e)e.classList.add('hi');const f=document.getElementById('cm2');if(f)f.classList.add('ac');}
  else if(pct>=70){const e=document.getElementById('cs1');if(e)e.classList.add('hi');const f=document.getElementById('cm1');if(f)f.classList.add('ac');}
  renderMagazaOzet();
}
let k4Flipped=false;
function flipK4(){
  k4Flipped=!k4Flipped;
  document.getElementById('k4front').style.display=k4Flipped?'none':'';
  document.getElementById('k4back').style.display=k4Flipped?'':'none';
}

function renderMagazaOzet(){
  const ms=getMonthSales();
  const eom=new Date(activeYear,activeMonth+1,0);
  const totalDays=eom.getDate();
  const today=new Date();
  const isThisMonth=today.getMonth()===activeMonth&&today.getFullYear()===activeYear;
  const passedDays=isThisMonth?today.getDate():totalDays;
  const remDays=Math.max(0,totalDays-passedDays);

  // Mağaza toplam adetler — sadece 5 ürün (getMonthSales zaten MNT kaydırması yapıyor)
  let topFYT=0,topSwitch=0,topFMNT=0,topOYT=0,topOMNT=0,topAdet=0;
  ms.forEach(s=>{
    topAdet+=s.qty;
    if(s.prod===3)topFYT+=s.qty;
    else if(s.prod===4)topSwitch+=s.qty;
    else if(s.prod===19)topFMNT+=s.qty;
    else if(s.prod===6)topOYT+=s.qty;
    else if(s.prod===7)topOMNT+=s.qty;
  });

  // Günlük ortalama ve gidişat (hat satışları — efektif gün)
  const effectiveDays=totalDays-3;
  const hatAdet=topFYT+topSwitch+topFMNT+topOYT+topOMNT;
  const gunlukOrt=passedDays>0?Math.round(hatAdet/Math.min(passedDays,effectiveDays)*10)/10:0;
  const tahminiAySonu=Math.round(gunlukOrt*effectiveDays);

  // Çalışan bazlı — hedef hesapla
  const hatHedefPerEmp=[3,4,19,6,7].reduce((a,pi)=>a+(products[pi].hedef||0),0);
  const empRows=employees.map((emp,i)=>{
    const gs=getGroupStats(0,i);
    const hedef=emp.noTarget?0:hatHedefPerEmp;
    const mHedef=emp.noTarget?0:hatHedefPerEmp;
    const yapilan=gs.adet;
    const kalan=Math.max(0,hedef-yapilan);
    const mKalan=Math.max(0,mHedef-yapilan);
    const tahmini=gs.tahmini;
    const oran=hedef>0?Math.round(yapilan/hedef*100):0;
    const mOran=mHedef>0?Math.round(yapilan/mHedef*100):0;
    return {emp,i,hedef,mHedef,yapilan,kalan,mKalan,tahmini,oran,mOran};
  });
  const topHedef=empRows.reduce((a,r)=>a+r.hedef,0);
  const topMHedef=empRows.reduce((a,r)=>a+r.mHedef,0);
  const topYapilan=empRows.reduce((a,r)=>a+r.yapilan,0);
  const topKalan=Math.max(0,topHedef-topYapilan);
  const topMKalan=Math.max(0,topMHedef-topYapilan);

  const el=document.getElementById('magazaOzet');

  el.innerHTML=`
  <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:14px;">
    <div class="kc" style="--ac:var(--blue)">
      <div class="kl">GÜNLÜK ORTALAMA</div>
      <div class="kv">${gunlukOrt}</div>
      <div class="ks">hat/gün (${Math.min(passedDays,effectiveDays)} gün)</div>
    </div>
    <div class="kc" style="--ac:var(--yellow)">
      <div class="kl">AY SONU TAHMİN</div>
      <div class="kv">${tahminiAySonu}</div>
      <div class="ks">${effectiveDays} efektif gün</div>
    </div>
    <div class="kc" style="--ac:var(--green)">
      <div class="kl">KALAN GÜN</div>
      <div class="kv">${Math.max(0,effectiveDays-passedDays)}</div>
      <div class="ks">efektif kalan</div>
    </div>
    <div class="kc" style="--ac:var(--postpaid)">
      <div class="kl">HAT SATIŞLARI</div>
      <div class="kv">${hatAdet}</div>
      <div class="ks">F.YT:${topFYT} | SW:${topSwitch} | F.MNT:${topFMNT} | ÖÖ.YT:${topOYT} | ÖÖ.MNT:${topOMNT}</div>
    </div>
  </div>
  <div class="tw">
    <table>
      <thead><tr><th>Çalışan</th><th style="text-align:center"><span style="color:var(--blue)">TDM</span>/<span style="color:var(--yellow)">Mağaza</span></th><th style="text-align:center">Yapılan</th><th style="text-align:center"><span style="color:var(--blue)">T.K</span>/<span style="color:var(--yellow)">M.K</span></th><th style="text-align:center">Tahmin</th></tr></thead>
      <tbody>
        ${empRows.map(r=>{
          const badge=r.oran>=100?'bg':r.oran>=70?'by':'br';
          const mBadge=r.mOran>=100?'bg':r.mOran>=70?'by':'br';
          return `<tr style="cursor:pointer" onclick="toggleDashEmpDetail(${r.i})">
          <td><span style="font-weight:600;color:#1a1a2e">${r.emp.name}</span></td>
          <td style="text-align:center">${r.hedef?'<span style="color:var(--blue)">'+r.hedef+'</span>/<span style="color:var(--yellow);font-weight:700">'+r.mHedef+'</span>':'—'}</td>
          <td style="text-align:center"><strong>${r.yapilan}</strong></td>
          <td style="text-align:center">${r.hedef?'<span style="color:var(--blue)">'+r.kalan+'</span>/<span style="color:var(--yellow)">'+r.mKalan+'</span>':'—'}</td>
          <td style="text-align:center"><span style="color:var(--blue)">${r.tahmini}</span> <span class="badge ${badge}" style="font-size:7px">%${r.oran}</span><span class="badge ${mBadge}" style="font-size:7px;margin-left:2px">%${r.mOran}</span></td>
        </tr>
        <tr id="dashEmpDetail_${r.i}" style="display:none"><td colspan="5" style="padding:0"></td></tr>`;
        }).join('')}
        <tr style="background:#f7f8fa;font-weight:700;cursor:pointer" onclick="toggleDashStoreDetail()">
          <td>TOPLAM ▾</td>
          <td style="text-align:center"><span style="color:var(--blue)">${topHedef}</span>/<span style="color:var(--yellow)">${topMHedef}</span></td>
          <td style="text-align:center"><strong>${topYapilan}</strong></td>
          <td style="text-align:center"><span style="color:var(--blue)">${topKalan}</span>/<span style="color:var(--yellow)">${topMKalan}</span></td>
          <td style="text-align:center"><span style="color:var(--blue)">~${tahminiAySonu}</span></td>
        </tr>
        <tr id="dashStoreDetail" style="display:none"><td colspan="5" style="padding:0"></td></tr>
      </tbody>
    </table>
  </div>`;
}

function toggleDashEmpDetail(empIdx){
  const row=document.getElementById('dashEmpDetail_'+empIdx);
  if(!row)return;
  if(row.style.display!=='none'){row.style.display='none';row.querySelector('td').innerHTML='';return;}
  const emp=employees[empIdx];
  const ms=getMonthSales().filter(s=>s.emp===empIdx);
  const eom=new Date(activeYear,activeMonth+1,0);
  const totalDays=eom.getDate();
  const today=new Date();
  const isThisMonth=today.getMonth()===activeMonth&&today.getFullYear()===activeYear;
  const passedDays=isThisMonth?today.getDate():totalDays;
  const effectiveDays=totalDays-3;

  let html='<div style="background:#f9f9fb;padding:10px;border-radius:8px;margin:4px 0">';

  // A,B,C,D Grup tablosu
  html+='<table style="width:100%;font-size:10px"><thead><tr style="background:#eee"><th>Grup</th><th style="text-align:center">Hedef</th><th style="text-align:center">Yapılan</th><th style="text-align:center">Kalan</th><th style="text-align:center">Tahmin</th></tr></thead><tbody>';
  PROD_GROUPS.forEach((g,gi)=>{
    const gs=getGroupStats(gi,empIdx);
    const hedef=emp.noTarget?0:(gs.useTL?gs.hedef:gs.hedef);
    const yapilan=gs.useTL?gs.tutar:gs.adet;
    const kalan=Math.max(0,hedef-yapilan);
    const tahmini=gs.tahmini;
    const oran=hedef>0?Math.round(yapilan/hedef*100):0;
    const badge=oran>=100?'bg':oran>=70?'by':'br';
    const valFmt=gs.useTL?fmtTL:v=>v;
    html+=`<tr style="cursor:pointer" onclick="document.getElementById('dashSubGrp_${empIdx}_${gi}').style.display=document.getElementById('dashSubGrp_${empIdx}_${gi}').style.display==='none'?'':'none'">
      <td style="font-weight:600;color:${g.color}">${g.short} ${g.name} ▾</td>
      <td style="text-align:center;color:var(--gray)">${hedef?valFmt(hedef):'—'}</td>
      <td style="text-align:center;font-weight:600">${valFmt(yapilan)}</td>
      <td style="text-align:center;color:${kalan>0?'var(--red)':'var(--green)'}">${hedef?valFmt(kalan):'—'}</td>
      <td style="text-align:center"><span style="color:var(--blue)">${valFmt(tahmini)}</span> <span class="badge ${badge}" style="font-size:8px">${hedef?'%'+oran:'—'}</span></td>
    </tr>`;

    // Alt kırılım
    html+=`<tr id="dashSubGrp_${empIdx}_${gi}" style="display:none"><td colspan="5" style="padding:2px 8px">`;
    if(gi===0){
      // A grubu: Her ürünü ayrı göster
      const hatProds=[{pi:3,name:'F.Yeni Tesis'},{pi:4,name:'Switch'},{pi:19,name:'F.MNT'},{pi:6,name:'ÖÖ Yeni Tesis'},{pi:7,name:'ÖÖ MNT'}];
      html+='<table style="width:100%;font-size:9px"><tbody>';
      hatProds.forEach(hp=>{
        const p=products[hp.pi];
        const qty=ms.filter(s=>s.prod===hp.pi).reduce((a,s)=>a+s.qty,0);
        const h=emp.noTarget?0:(p.hedef||0);
        const k=Math.max(0,h-qty);
        const ed=MNT_PRODS.includes(hp.pi)?effectiveDays:totalDays;
        const tah=passedDays>0?Math.round(qty/Math.min(passedDays,ed)*ed):0;
        const o=h>0?Math.round(qty/h*100):0;
        html+=`<tr style="color:${g.color}">
          <td style="padding:2px 4px">${hp.name}</td>
          <td style="text-align:center;color:var(--gray)">${h||'—'}</td>
          <td style="text-align:center;font-weight:600">${qty}</td>
          <td style="text-align:center;color:${k>0?'var(--red)':'var(--green)'}">${h?k:'—'}</td>
          <td style="text-align:center"><span style="color:var(--blue)">${tah}</span> <span class="badge ${o>=100?'bg':o>=70?'by':'br'}" style="font-size:7px">${h?'%'+o:'—'}</span></td>
        </tr>`;
      });
      html+='</tbody></table>';
    } else if(gi===1){
      // B grubu NTC: TL ve Adet satırları
      const gs2=getGroupStats(gi,empIdx);
      const adetOrt=passedDays>0?Math.round(gs2.adet/Math.max(1,gs2.calcDays)*10)/10:0;
      const adetTah=passedDays>0?Math.round(gs2.adet/Math.max(1,gs2.calcDays)*gs2.effectiveDays):0;
      const adetH=emp.noTarget?0:(products[15].hedef||0);
      const adetK=Math.max(0,adetH-gs2.adet);
      const adetO=adetH>0?Math.round(gs2.adet/adetH*100):0;
      const tlO=gs2.hedef>0?Math.round(gs2.tutar/gs2.hedef*100):0;
      const tlK=Math.max(0,gs2.hedef-gs2.tutar);
      html+=`<table style="width:100%;font-size:9px"><tbody>
        <tr style="color:${g.color}">
          <td style="padding:2px 4px">NTC (TL)</td>
          <td style="text-align:center;color:var(--gray)">${gs2.hedef?fmtTL(gs2.hedef):'—'}</td>
          <td style="text-align:center;font-weight:600">${fmtTL(gs2.tutar)}</td>
          <td style="text-align:center;color:${tlK>0?'var(--red)':'var(--green)'}">${gs2.hedef?fmtTL(tlK):'—'}</td>
          <td style="text-align:center"><span style="color:var(--blue)">${fmtTL(gs2.tahmini)}</span> <span class="badge ${tlO>=100?'bg':tlO>=70?'by':'br'}" style="font-size:7px">${gs2.hedef?'%'+tlO:'—'}</span></td>
        </tr>
        <tr style="color:${g.color}">
          <td style="padding:2px 4px">NTC (Adet)</td>
          <td style="text-align:center;color:var(--gray)">${adetH||'—'}</td>
          <td style="text-align:center;font-weight:600">${gs2.adet}</td>
          <td style="text-align:center;color:${adetK>0?'var(--red)':'var(--green)'}">${adetH?adetK:'—'}</td>
          <td style="text-align:center"><span style="color:var(--blue)">${adetTah}</span> <span class="badge ${adetO>=100?'bg':adetO>=70?'by':'br'}" style="font-size:7px">${adetH?'%'+adetO:'—'}</span></td>
        </tr>
      </tbody></table>`;
    } else if(gi===3){
      // D grubu CİHAZ: Sıfır + 2.El ayrı göster
      const cihazProds=[{pi:17,name:'Sıfır Cihaz'},{pi:16,name:'2. El Cihaz'}];
      html+='<table style="width:100%;font-size:9px"><tbody>';
      cihazProds.forEach(cp=>{
        const p=products[cp.pi];
        const empMs=ms.filter(s=>s.prod===cp.pi);
        const tutar=empMs.reduce((a,s)=>a+(s.manuel_prim||0)*s.qty,0);
        const h=emp.noTarget?0:(p.hedefTL||0);
        const k=Math.max(0,h-tutar);
        const tah=passedDays>0?Math.round(tutar/Math.max(1,passedDays)*totalDays):0;
        const o=h>0?Math.round(tutar/h*100):0;
        html+=`<tr style="color:${g.color}">
          <td style="padding:2px 4px">${cp.name}</td>
          <td style="text-align:center;color:var(--gray)">${h?fmtTL(h):'—'}</td>
          <td style="text-align:center;font-weight:600">${fmtTL(tutar)}</td>
          <td style="text-align:center;color:${k>0?'var(--red)':'var(--green)'}">${h?fmtTL(k):'—'}</td>
          <td style="text-align:center"><span style="color:var(--blue)">${fmtTL(tah)}</span> <span class="badge ${o>=100?'bg':o>=70?'by':'br'}" style="font-size:7px">${h?'%'+o:'—'}</span></td>
        </tr>`;
      });
      html+='</tbody></table>';
    } else {
      // C grubu AKSESUAR
      const gs2=getGroupStats(gi,empIdx);
      html+=`<div style="font-size:9px;padding:2px 0;color:var(--gray)">Toplam: ${fmtTL(gs2.tutar)} · G.Ort: ${fmtTL(gs2.gunlukOrt)} · Tahmin: ${fmtTL(gs2.tahmini)} · Hedef: ${fmtTL(gs2.hedef)}</div>`;
    }
    html+='</td></tr>';
  });
  html+='</tbody></table></div>';
  row.querySelector('td').innerHTML=html;
  row.style.display='';
}

function toggleDashStoreDetail(){
  const row=document.getElementById('dashStoreDetail');
  if(!row)return;
  if(row.style.display!=='none'){row.style.display='none';row.querySelector('td').innerHTML='';return;}
  const ms=getMonthSales();
  const eom=new Date(activeYear,activeMonth+1,0);
  const totalDays=eom.getDate();
  const today=new Date();
  const isThisMonth=today.getMonth()===activeMonth&&today.getFullYear()===activeYear;
  const passedDays=isThisMonth?today.getDate():totalDays;
  const effectiveDays=totalDays-3;

  let html='<div style="background:#eef0f4;padding:10px;border-radius:8px;margin:4px 0">';
  html+='<div style="font-size:10px;font-weight:700;color:var(--gray);letter-spacing:1px;margin-bottom:6px">MAĞAZA TOPLAM KIRILIMI</div>';
  html+='<table style="width:100%;font-size:10px"><thead><tr style="background:#dde"><th>Grup</th><th style="text-align:center"><span style="color:var(--blue)">TDM</span>/<span style="color:var(--yellow)">Mağaza</span></th><th style="text-align:center">Yapılan</th><th style="text-align:center"><span style="color:var(--blue)">T.K</span>/<span style="color:var(--yellow)">M.K</span></th><th style="text-align:center">Tahmin</th></tr></thead><tbody>';
  PROD_GROUPS.forEach(function(g,gi){
    const gs=getGroupStats(gi);
    const hedef=gs.hedef;
    // Mağaza hedefi hesapla
    var mHedef=0;
    g.prods.forEach(function(pi){var p=products[pi];mHedef+=(gs.useTL?(p.hedefTL||0):(p.hedef||0));});
    mHedef*=targetEmpCount;
    const yapilan=gs.useTL?gs.tutar:gs.adet;
    const kalan=Math.max(0,hedef-yapilan);
    const mKalan=Math.max(0,mHedef-yapilan);
    const tahmini=gs.tahmini;
    const oran=hedef>0?Math.round(yapilan/hedef*100):0;
    const mOran=mHedef>0?Math.round(yapilan/mHedef*100):0;
    const badge=oran>=100?'bg':oran>=70?'by':'br';
    const mBadge=mOran>=100?'bg':mOran>=70?'by':'br';
    const valFmt=gs.useTL?fmtTL:function(v){return v;};

    html+='<tr style="cursor:pointer" onclick="var el=document.getElementById(\'dashStoreSubGrp_'+gi+'\');el.style.display=el.style.display===\'none\'?\'\':\'none\'">';
    html+='<td style="font-weight:600;color:'+g.color+'">'+g.short+' '+g.name+' ▾</td>';
    html+='<td style="text-align:center"><span style="color:var(--blue)">'+(hedef?valFmt(hedef):'—')+'</span>/<span style="color:var(--yellow);font-weight:700">'+(mHedef?valFmt(mHedef):'—')+'</span></td>';
    html+='<td style="text-align:center;font-weight:600">'+valFmt(yapilan)+'</td>';
    html+='<td style="text-align:center"><span style="color:var(--blue)">'+(hedef?valFmt(kalan):'—')+'</span>/<span style="color:var(--yellow)">'+(mHedef?valFmt(mKalan):'—')+'</span></td>';
    html+='<td style="text-align:center"><span style="color:var(--blue)">'+valFmt(tahmini)+'</span> <span class="badge '+badge+'" style="font-size:7px">%'+oran+'</span><span class="badge '+mBadge+'" style="font-size:7px;margin-left:2px">%'+mOran+'</span></td>';
    html+='</tr>';

    // Alt kırılım
    html+='<tr id="dashStoreSubGrp_'+gi+'" style="display:none"><td colspan="5" style="padding:2px 8px">';
    if(gi===0){
      // A grubu: 5 ürün
      var hatProds=[{pi:3,n:'F.Yeni Tesis'},{pi:4,n:'Switch'},{pi:19,n:'F.MNT'},{pi:6,n:'ÖÖ Yeni Tesis'},{pi:7,n:'ÖÖ MNT'}];
      html+='<table style="width:100%;font-size:9px"><tbody>';
      hatProds.forEach(function(hp){
        var p=products[hp.pi];
        var qty=ms.filter(function(s){return s.prod===hp.pi;}).reduce(function(a,s){return a+s.qty;},0);
        var h=(p.hedef||0)*targetEmpCount;
        var k=Math.max(0,h-qty);
        var ed=MNT_PRODS.includes(hp.pi)?effectiveDays:totalDays;
        var tah=passedDays>0?Math.round(qty/Math.min(passedDays,ed)*ed):0;
        var o=h>0?Math.round(qty/h*100):0;
        html+='<tr style="color:'+g.color+'">';
        html+='<td style="padding:2px 4px">'+hp.n+'</td>';
        html+='<td style="text-align:center;color:var(--gray)">'+(h||'—')+'</td>';
        html+='<td style="text-align:center;font-weight:600">'+qty+'</td>';
        html+='<td style="text-align:center;color:'+(k>0?'var(--red)':'var(--green)')+'">'+( h?k:'—')+'</td>';
        html+='<td style="text-align:center"><span style="color:var(--blue)">'+tah+'</span> <span class="badge '+(o>=100?'bg':o>=70?'by':'br')+'" style="font-size:7px">'+(h?'%'+o:'—')+'</span></td>';
        html+='</tr>';
      });
      html+='</tbody></table>';
    } else if(gi===1){
      // B grubu NTC: TL + Adet
      var gs2=getGroupStats(gi);
      var adetH=(products[15].hedef||0)*targetEmpCount;
      var adetK=Math.max(0,adetH-gs2.adet);
      var adetTah=passedDays>0?Math.round(gs2.adet/Math.max(1,gs2.calcDays)*gs2.effectiveDays):0;
      var adetO=adetH>0?Math.round(gs2.adet/adetH*100):0;
      var tlO=gs2.hedef>0?Math.round(gs2.tutar/gs2.hedef*100):0;
      var tlK2=Math.max(0,gs2.hedef-gs2.tutar);
      html+='<table style="width:100%;font-size:9px"><tbody>';
      html+='<tr style="color:'+g.color+'"><td style="padding:2px 4px">NTC (TL)</td>';
      html+='<td style="text-align:center;color:var(--gray)">'+(gs2.hedef?fmtTL(gs2.hedef):'—')+'</td>';
      html+='<td style="text-align:center;font-weight:600">'+fmtTL(gs2.tutar)+'</td>';
      html+='<td style="text-align:center;color:'+(tlK2>0?'var(--red)':'var(--green)')+'">'+( gs2.hedef?fmtTL(tlK2):'—')+'</td>';
      html+='<td style="text-align:center"><span style="color:var(--blue)">'+fmtTL(gs2.tahmini)+'</span> <span class="badge '+(tlO>=100?'bg':tlO>=70?'by':'br')+'" style="font-size:7px">'+(gs2.hedef?'%'+tlO:'—')+'</span></td></tr>';
      html+='<tr style="color:'+g.color+'"><td style="padding:2px 4px">NTC (Adet)</td>';
      html+='<td style="text-align:center;color:var(--gray)">'+(adetH||'—')+'</td>';
      html+='<td style="text-align:center;font-weight:600">'+gs2.adet+'</td>';
      html+='<td style="text-align:center;color:'+(adetK>0?'var(--red)':'var(--green)')+'">'+( adetH?adetK:'—')+'</td>';
      html+='<td style="text-align:center"><span style="color:var(--blue)">'+adetTah+'</span> <span class="badge '+(adetO>=100?'bg':adetO>=70?'by':'br')+'" style="font-size:7px">'+(adetH?'%'+adetO:'—')+'</span></td></tr>';
      html+='</tbody></table>';
    } else if(gi===3){
      // D grubu CİHAZ: Sıfır + 2.El
      var cihazProds=[{pi:17,n:'Sıfır Cihaz'},{pi:16,n:'2. El Cihaz'}];
      html+='<table style="width:100%;font-size:9px"><tbody>';
      cihazProds.forEach(function(cp){
        var p=products[cp.pi];
        var tutar=ms.filter(function(s){return s.prod===cp.pi;}).reduce(function(a,s){return a+(s.manuel_prim||0)*s.qty;},0);
        var h=(p.hedefTL||0)*targetEmpCount;
        var k=Math.max(0,h-tutar);
        var tah=passedDays>0?Math.round(tutar/Math.max(1,passedDays)*totalDays):0;
        var o=h>0?Math.round(tutar/h*100):0;
        html+='<tr style="color:'+g.color+'">';
        html+='<td style="padding:2px 4px">'+cp.n+'</td>';
        html+='<td style="text-align:center;color:var(--gray)">'+(h?fmtTL(h):'—')+'</td>';
        html+='<td style="text-align:center;font-weight:600">'+fmtTL(tutar)+'</td>';
        html+='<td style="text-align:center;color:'+(k>0?'var(--red)':'var(--green)')+'">'+( h?fmtTL(k):'—')+'</td>';
        html+='<td style="text-align:center"><span style="color:var(--blue)">'+fmtTL(tah)+'</span> <span class="badge '+(o>=100?'bg':o>=70?'by':'br')+'" style="font-size:7px">'+(h?'%'+o:'—')+'</span></td>';
        html+='</tr>';
      });
      html+='</tbody></table>';
    } else {
      // C grubu AKSESUAR
      var gs3=getGroupStats(gi);
      html+='<div style="font-size:9px;padding:2px 0;color:var(--gray)">Toplam: '+fmtTL(gs3.tutar)+' · G.Ort: '+fmtTL(gs3.gunlukOrt)+' · Tahmin: '+fmtTL(gs3.tahmini)+' · Hedef: '+fmtTL(gs3.hedef)+'</div>';
    }
    html+='</td></tr>';
  });
  html+='</tbody></table></div>';
  row.querySelector('td').innerHTML=html;
  row.style.display='';
}

function renderEmpCards(cid){
  const el=document.getElementById(cid);if(!el)return;el.innerHTML='';
  const empAdetHedef=products.reduce((a,p)=>a+((p.manuel||p.hidden)?0:(p.hedef||0)),0);
  employees.forEach((emp,i)=>{
    const st=getEmpStats(i);
    const hak=empPrimHak(i);
    const adetOran=empAdetHedef>0?Math.min(100,Math.round((st.adet/empAdetHedef)*100)):0;
    const adetFc=adetOran>=100?'var(--green)':adetOran>=70?'var(--yellow)':'var(--red)';
    const empTarget=Math.round(storeTarget/targetEmpCount);
    const bonus=hak.hak?calcBonus(st.totalPrim,st.puan,empTarget):0;
    const gprim=getEmpGroupPrim(i);
    const canliPrim=getEmpCanliPrim(i);

    // Grup özeti
    let grpCards='';
    PROD_GROUPS.forEach((g,gi)=>{
      const gs=getGroupStats(gi,i);
      const val=gs.useTL?fmtTL(gs.tutar):gs.adet;
      const hVal=gs.useTL?fmtTL(gs.hedef):gs.hedef;
      const ort=gs.useTL?fmtTL(gs.gunlukOrt):gs.gunlukOrt;
      const tah=gs.useTL?fmtTL(gs.tahmini):gs.tahmini;
      const badge=gs.oran>=100?'bg':gs.oran>=70?'by':'br';
      grpCards+=`<div style="background:#f9f9fb;border-radius:8px;padding:8px;border-left:3px solid ${g.color}">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
          <span style="font-weight:700;font-size:10px;color:${g.color}">${g.short} ${g.name}</span>
          <span class="badge ${badge}" style="font-size:9px">%${gs.oran}</span>
        </div>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:4px;font-size:9px;text-align:center">
          <div><div style="font-weight:700;font-size:12px">${val}</div><div style="color:var(--gray)">Toplam</div></div>
          <div><div style="font-weight:700;font-size:12px">${ort}</div><div style="color:var(--gray)">G.Ort</div></div>
          <div><div style="font-weight:700;font-size:12px;color:${Number(gs.oran)>=100?'var(--green)':'var(--red)'}">${tah}</div><div style="color:var(--gray)">Tahmin</div></div>
          <div><div style="font-weight:700;font-size:12px">${hVal}</div><div style="color:var(--gray)">Hedef</div></div>
        </div>
        ${gs.alsoAdet?`<div style="font-size:8px;color:var(--gray);margin-top:3px;text-align:center">${gs.adet} adet · G.Ort: ${Math.round(gs.adet/Math.max(1,gs.calcDays)*10)/10} · Tah: ${Math.round(gs.adet/Math.max(1,gs.calcDays)*gs.effectiveDays)}</div>`:''}
      </div>`;
    });

    el.insertAdjacentHTML('beforeend',`
    <div class="ec">
      <div class="et" style="cursor:pointer" onclick="toggleEmpSales(${i},this)">
        <div class="av" style="background:${emp.color}">${emp.initials}</div>
        <div><div class="en">${escapeHtml(emp.name)}</div><div class="er">Satış Temsilcisi</div></div>
        <div style="margin-left:auto;display:flex;flex-direction:column;align-items:flex-end;gap:3px">
          <span class="badge ${adetOran>=100?'bg':adetOran>=70?'by':'br'}">%${adetOran}</span>
          ${hak.muaf?'<span class="muaf-badge">Muaf</span>':hak.hak?'<span class="badge bg">✓ Prim Hak</span>':'<span class="badge br">✗ Eksik</span>'}
        </div>
      </div>
      <div class="es2">
        <div class="esb"><div class="esv" style="color:var(--green)">${fmtTL(gprim.toplam)}</div><div class="esl">HAKEDİŞ PRİMİ</div></div>
        <div class="esb"><div class="esv" style="color:var(--yellow)">${fmtTL(canliPrim)}</div><div class="esl">CANLI PRİM</div></div>
        <div class="esb"><div class="esv" style="color:var(--purple)">${fmtTL(gprim.toplam+canliPrim)}</div><div class="esl">TOPLAM</div></div>
        <div class="esb"><div class="esv">${st.adet}<span style="font-size:11px;color:var(--gray)">/${empAdetHedef}</span></div><div class="esl">SATIŞ / HEDEF</div></div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:6px;margin-top:8px">${grpCards}</div>
      <div>
        <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--gray);margin-bottom:3px;margin-top:8px"><span>Adet Hedefi</span><span>${st.adet} / ${empAdetHedef} adet</span></div>
        <div style="background:rgba(0,0,0,0.07);border-radius:20px;height:4px;overflow:hidden;">
          <div style="width:${adetOran}%;background:${adetFc};height:4px;border-radius:20px"></div>
        </div>
      </div>
      <div class="emp-sales-list" id="empSales_${i}" style="display:none;margin-top:10px;"></div>
    </div>`);
  });
}

function toggleEmpSales(empIdx,headerEl){
  const container=document.getElementById('empSales_'+empIdx);
  if(!container)return;
  if(container.style.display!=='none'){
    container.style.display='none';
    container.innerHTML='';
    return;
  }
  const ms=getMonthSales().filter(s=>s.emp===empIdx);
  if(ms.length===0){
    container.innerHTML='<div style="text-align:center;padding:10px;color:var(--gray);font-size:11px">Bu ay satış yok</div>';
    container.style.display='block';
    return;
  }
  // Tarihe göre grupla (yeniden eskiye)
  const byDate={};
  [...ms].reverse().forEach(s=>{
    if(!byDate[s.date])byDate[s.date]=[];
    byDate[s.date].push(s);
  });
  let html='<div style="font-size:10px;font-weight:700;letter-spacing:1px;color:var(--gray);margin-bottom:6px">📋 SATIŞLAR ('+ms.reduce((a,s)=>a+s.qty,0)+' adet)</div>';
  html+='<div style="max-height:300px;overflow-y:auto;border:1px solid var(--border);border-radius:8px">';
  html+='<table style="width:100%;font-size:10px;"><thead><tr style="background:#f5f6f8"><th style="padding:5px">Tarih</th><th>Ürün</th><th>Adet</th><th>Puan</th></tr></thead><tbody>';
  Object.keys(byDate).forEach(d=>{
    byDate[d].forEach(s=>{
      const p=products[s.prod];
      html+=`<tr style="border-bottom:1px solid #f0f0f0">
        <td style="padding:4px 5px;color:var(--gray)">${d.split('-').reverse().join('.')}</td>
        <td style="padding:4px 2px"><span style="color:${p.tip==='postpaid'?'var(--postpaid)':p.tip==='prepaid'?'var(--prepaid)':'var(--gray)'}">${p.name}</span></td>
        <td style="padding:4px 2px;text-align:center;font-weight:600">${s.qty}</td>
        <td style="padding:4px 2px;text-align:center">${fmt(p.puan*s.qty)}</td>
      </tr>`;
    });
  });
  html+='</tbody></table></div>';
  container.innerHTML=html;
  container.style.display='block';
}

function renderEmpDetay(){
  const el=document.getElementById('empDetayCards');if(!el)return;el.innerHTML='';
  const empTarget=Math.round(storeTarget/targetEmpCount);
  employees.forEach((emp,i)=>{
    const st=getEmpStats(i);
    const hak=empPrimHak(i);
    const zs=getEmpZorunlu(i);
    const oran=empTarget>0?(st.puan/empTarget)*100:0;
    const bonus=hak.hak?calcBonus(st.totalPrim,st.puan,empTarget):0;
    const topPrim=hak.hak?(st.totalPrim+bonus):0;
    const zorHtml=zs.map(z=>`
      <div class="zor-card ${z.met?'zor-ok':'zor-fail'}">
        <div style="font-size:11px;font-weight:600;color:${z.met?'var(--green)':'var(--red)'};margin-bottom:5px">${z.name}</div>
        <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--gray)">
          <span>${z.isManuel?fmtTL(z.tlK||0):z.qty+' adet'}</span>
          <span>/ ${z.isManuel?fmtTL(z.hedefTL):z.hedef+' hedef'}</span>
          <span>${z.met?'✓':'✗'}</span>
        </div>
      </div>`).join('');
    el.insertAdjacentHTML('beforeend',`
    <div style="background:#fff;border-radius:12px;border:1px solid ${hak.hak?'rgba(0,168,107,0.25)':hak.muaf?'rgba(147,51,234,0.2)':'rgba(230,57,70,0.2)'};padding:18px;margin-bottom:14px;box-shadow:0 2px 8px rgba(0,0,0,0.05);">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
        <div style="display:flex;align-items:center;gap:10px;">
          <div class="av" style="background:${emp.color};width:38px;height:38px;font-size:14px">${emp.initials}</div>
          <div><div style="font-weight:600;font-size:14px;color:#1a1a2e">${emp.name}</div>
            <div style="font-size:11px;color:var(--gray);margin-top:2px">
              ${hak.muaf?'<span class="muaf-badge">Muafiyet Tanımlandı</span>':hak.hak?'<span class="badge bg">✓ Tüm Zorunlu Hedefler Tamam</span>':'<span class="badge br">✗ '+hak.eksik.length+' Zorunlu Ürün Eksik</span>'}
            </div>
          </div>
        </div>
        <div style="text-align:right">
          <div style="font-family:\'Bebas Neue\';font-size:22px;color:${hak.hak?'var(--green)':'var(--red)'}">${fmtTL(topPrim)}</div>
          <div style="font-size:10px;color:var(--gray)">Toplam Hakediş</div>
        </div>
      </div>
      <div class="kg kg3" style="margin-bottom:14px;">
        <div class="kc" style="--ac:var(--green);padding:12px"><div class="kl">ÇALIŞAN PRİMİ</div><div class="kv" style="font-size:20px;color:var(--green)">${hak.hak?fmtTL(st.calisanPrim):'—'}</div><div class="ks" style="color:var(--green)">Çalışanın kazancı</div></div>
        <div class="kc" style="--ac:var(--blue);padding:12px"><div class="kl">MAĞAZA KARI</div><div class="kv" style="font-size:20px;color:var(--blue)">${hak.hak?fmtTL(st.totalPrim-st.calisanPrim):'—'}</div><div class="ks">Bayi kazancı</div></div>
        <div class="kc" style="--ac:var(--purple);padding:12px"><div class="kl">BONUS</div><div class="kv" style="font-size:20px;color:var(--purple)">${bonus>0?fmtTL(bonus):'—'}</div></div>
      </div>
      <div style="margin-bottom:10px;font-size:10px;color:var(--gray);letter-spacing:1px;text-transform:uppercase">ZORUNLU ÜRÜN DURUMU</div>
      <div class="zor-grid">${zorHtml}</div>
      ${buildEmpCalendar(i)}
      ${!hak.hak&&!hak.muaf?`<div style="display:flex;justify-content:flex-end;margin-top:10px;"><button class="btn btn-gr bsm" onclick="openMuafModalForEmp(${i})">🛡️ Muafiyet Tanımla</button></div>`:''}
    </div>`);
  });
}

function buildEmpCalendar(ei){
  const eom=new Date(activeYear,activeMonth+1,0);
  const days=eom.getDate();
  const firstDay=new Date(activeYear,activeMonth,1).getDay();
  const adjustedFirst=(firstDay+6)%7; // Pzt=0 ... Paz=6
  const DAY_LABELS=['Pzt','Sal','Çar','Per','Cum','Cmt','Paz'];
  const today=new Date();
  const todayStr=today.toISOString().split('T')[0];

  // Günlük satış özeti
  const daySales={};
  getMonthSales().filter(s=>s.emp===ei).forEach(s=>{
    if(!daySales[s.date])daySales[s.date]={puan:0,adet:0,pp:0,pr:0};
    const p=products[s.prod];
    daySales[s.date].puan+=p.puan*s.qty;
    daySales[s.date].adet+=s.qty;
    if(p.tip==='postpaid')daySales[s.date].pp+=s.qty;
    else if(p.tip==='prepaid')daySales[s.date].pr+=s.qty;
  });

  const emp=employees[ei];
  let cells='';
  // Gün başlıkları
  const headers=DAY_LABELS.map(d=>`<div style="text-align:center;font-size:9px;color:var(--gray);font-weight:600;padding:4px 0;letter-spacing:0.5px">${d}</div>`).join('');
  // Boş hücreler
  for(let b=0;b<adjustedFirst;b++)cells+=`<div></div>`;
  // Günler
  for(let d=1;d<=days;d++){
    const ds=`${activeYear}-${String(activeMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const sd=daySales[ds];
    const isFuture=new Date(ds)>today;
    const isToday=ds===todayStr;
    const isWeekend=((adjustedFirst+d-1)%7)>=5;
    let bg,border,numColor,dot='';
    if(sd&&sd.adet>0){
      bg=`rgba(${emp.color.startsWith('#')?hexToRgb(emp.color):'230,168,0'},0.12)`;
      border=`2px solid ${emp.color}`;
      numColor=emp.color;
      dot=`<div style="display:flex;justify-content:center;gap:2px;margin-top:2px">${sd.pp>0?`<span style="width:5px;height:5px;border-radius:50%;background:var(--postpaid);display:inline-block" title="${sd.pp} postpaid"></span>`:''}${sd.pr>0?`<span style="width:5px;height:5px;border-radius:50%;background:var(--prepaid);display:inline-block" title="${sd.pr} prepaid"></span>`:''}</div>`;
    } else if(isFuture){
      bg='#f7f8fa';border='1px solid #e8eaed';numColor='#bbb';
    } else if(isWeekend){
      bg='#f7f8fa';border='1px solid #e8eaed';numColor='#ccc';
    } else {
      bg='#fff0f1';border='1px solid rgba(230,57,70,0.15)';numColor='var(--red)';
    }
    if(isToday){border=`2px solid var(--yellow)`;}
    cells+=`<div style="background:${bg};border:${border};border-radius:8px;padding:6px 4px;text-align:center;cursor:default;transition:transform 0.1s" title="${ds}${sd?' | '+sd.adet+' satış, '+fmt(sd.puan)+' puan':''}">
      <div style="font-family:'Bebas Neue';font-size:15px;color:${numColor};line-height:1">${d}</div>
      ${sd&&sd.adet>0?`<div style="font-size:8px;color:${numColor};margin-top:1px">${sd.adet} sat</div>${dot}`:`<div style="font-size:8px;color:#ddd">—</div>`}
    </div>`;
  }
  return `
  <div style="margin-top:16px;">
    <div style="font-size:10px;color:var(--gray);letter-spacing:1px;text-transform:uppercase;margin-bottom:8px">📅 ${MONTHS[activeMonth]} TAKVİMİ</div>
    <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px;">
      ${headers}
      ${cells}
    </div>
    <div style="display:flex;gap:12px;margin-top:8px;font-size:10px;color:var(--gray)">
      <span><span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:rgba(230,168,0,0.2);border:1px solid #e6a800;margin-right:3px"></span>Satış var</span>
      <span><span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:#fff0f1;border:1px solid rgba(230,57,70,0.2);margin-right:3px"></span>Satış yok</span>
      <span><span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:#f7f8fa;border:1px solid #e8eaed;margin-right:3px"></span>Gelecek</span>
      <span style="margin-left:4px"><span style="width:5px;height:5px;border-radius:50%;background:var(--postpaid);display:inline-block;margin-right:3px"></span>PP</span>
      <span><span style="width:5px;height:5px;border-radius:50%;background:var(--prepaid);display:inline-block;margin-right:3px"></span>PR</span>
    </div>
  </div>`;
}
function hexToRgb(hex){
  const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);
  return`${r},${g},${b}`;
}

function renderUrunler(){
  const tbody=document.getElementById('urunBody');if(!tbody)return;tbody.innerHTML='';
  const ms=getMonthSales();
  products.forEach((p,i)=>{
    if(p.hidden)return;
    let qty=0;ms.filter(s=>s.prod===i).forEach(s=>qty+=s.qty);
    let oran=0;
    if(p.manuel){
      let tlK=0;ms.filter(s=>s.prod===i).forEach(s=>tlK+=(s.manuel_prim||0)*s.qty);
      oran=p.hedefTL>0?Math.min(100,Math.round((tlK/((p.hedefTL||0)*targetEmpCount))*100)):0;
    }else{
      const th=p.hedef*targetEmpCount;
      oran=th>0?Math.min(100,Math.round((qty/th)*100)):0;
    }
    const fc=oran>=100?'var(--green)':oran>=70?'var(--yellow)':'var(--red)';
    let tp=0;
    if(p.manuel)ms.filter(s=>s.prod===i).forEach(s=>tp+=(s.manuel_prim||0)*s.qty);
    else tp=p.prim*qty;
    tbody.insertAdjacentHTML('beforeend',`<tr>
      <td style="font-weight:600">${escapeHtml(p.name)}${p.manuel?'<span style="font-size:9px;color:var(--blue);margin-left:4px">M</span>':''}</td>
      <td>${tipLabel(p.tip)}</td>
      <td>${p.zorunlu?'<span class="tzor">ZORUNLU</span>':'<span style="color:var(--gray);font-size:9px">—</span>'}</td>
      <td><strong>${qty}</strong></td>
      <td><span class="badge by">${p.puan}</span></td>
      <td style="color:var(--yellow)">${fmt(p.puan*qty)}</td>
      <td style="color:var(--gray)">${p.manuel?'<span style="color:var(--blue)">Manuel</span>':fmtTL(p.prim)}</td>
      <td style="color:var(--green)">${fmtTL(tp)}</td>
      <td><div style="display:flex;align-items:center;gap:6px"><div class="pw"><div class="pf" style="width:${oran}%;background:${fc}"></div></div><span style="font-size:10px;color:var(--gray)">%${oran}</span></div></td>
    </tr>`);
  });
}

function renderSalesTable(tbodyId, salesArr){
  const tbody=document.getElementById(tbodyId);if(!tbody)return;tbody.innerHTML='';
  if(!salesArr.length){tbody.innerHTML='<tr><td colspan="9" style="text-align:center;color:var(--gray);padding:20px">Satış kaydı yok</td></tr>';return;}
  salesArr.forEach(s=>{
    const p=products[s.prod];
    const pr=p.manuel?fmtTL((s.manuel_prim||0)*s.qty):(p.prim>0?fmtTL(p.prim*s.qty):'—');
    tbody.insertAdjacentHTML('beforeend',`<tr>
      <td style="color:${employees[s.emp].color}">${escapeHtml(employees[s.emp].name)}</td>
      <td>${p.name}</td><td>${tipLabel(p.tip)}</td><td>${s.qty}</td>
      <td style="color:var(--yellow)">${p.puan*s.qty>0?fmt(p.puan*s.qty):'—'}</td>
      <td style="color:var(--green)">${pr}</td>
      <td style="color:var(--gray);font-size:11px;max-width:130px;overflow:hidden;text-overflow:ellipsis">${s.aciklama||'—'}</td>
      <td style="color:var(--gray);font-size:11px">${s.date}</td>
      <td><div style="display:flex;gap:4px">
        <button class="btn btn-e bsm" onclick="editSale('${s.id}')">✏️</button>
        <button class="btn btn-d bsm" onclick="deleteSale('${s.id}')">🗑️</button>
      </div></td>
    </tr>`);
  });
}

function renderCalisanlar(){
  renderEmpCards('allEg');
  renderSalesTable('allBody',[...getMonthSales()].reverse());
}

function getGunlukDate(){
  const inp=document.getElementById('gunlukDate');
  return inp&&inp.value?inp.value:new Date().toISOString().split('T')[0];
}
function resetGunlukDate(){
  document.getElementById('gunlukDate').value=new Date().toISOString().split('T')[0];
  renderGunluk();
}
function shiftGunlukDate(delta){
  const inp=document.getElementById('gunlukDate');
  const cur=new Date(getGunlukDate());
  cur.setDate(cur.getDate()+delta);
  inp.value=cur.toISOString().split('T')[0];
  renderGunluk();
}

function renderGunluk(){
  const today=new Date().toISOString().split('T')[0];
  // Tarih input başlangıçta boşsa bugünü ata
  const inp=document.getElementById('gunlukDate');
  if(inp&&!inp.value)inp.value=today;
  const selDate=getGunlukDate();
  const isToday=selDate===today;

  const ts=sales.filter(s=>s.date===selDate);

  // Başlık ve alt yazı güncelle
  const dateLabel=new Date(selDate+'T12:00:00').toLocaleDateString('tr-TR',{day:'numeric',month:'long',year:'numeric',weekday:'long'});
  document.getElementById('gunlukPs').textContent=isToday?'Bugünün satış durumu':dateLabel;
  const titleEl=document.getElementById('gunlukTableTitle');
  titleEl.innerHTML=isToday?'BUGÜN <em>SATIŞLAR</em>':`<em>${dateLabel.toUpperCase()}</em> SATIŞLARI`;

  let html='';
  employees.forEach((emp,i)=>{
    let tp=0,tpp=0,tpr=0;
    ts.filter(s=>s.emp===i).forEach(s=>{const p=products[s.prod];tp+=p.puan*s.qty;if(p.tip==='postpaid')tpp+=s.qty;else if(p.tip==='prepaid')tpr+=s.qty;});
    const met=tpp>=6||(tpp>=5&&tpr>=1);
    html+=`<div style="background:#fff;border:1px solid ${met?'rgba(0,168,107,0.3)':'var(--border)'};border-radius:12px;padding:14px;box-shadow:0 2px 6px rgba(0,0,0,0.05);">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
        <div style="font-weight:600;color:${emp.color};font-size:13px">${emp.name}</div>
        <span class="badge ${met?'bg':tpp>0||tpr>0?'by':'br'}">${met?'✓ 600₺ Canlı Prim':tpp>0||tpr>0?'Satış Var':'Satış Yok'}</span>
      </div>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px">
        <div style="background:#f5f6f8;border-radius:7px;padding:7px;text-align:center"><div style="font-family:'Bebas Neue';font-size:17px;color:var(--postpaid)">${tpp}</div><div style="color:var(--gray);font-size:9px">POSTPAİD</div></div>
        <div style="background:#f5f6f8;border-radius:7px;padding:7px;text-align:center"><div style="font-family:'Bebas Neue';font-size:17px;color:var(--prepaid)">${tpr}</div><div style="color:var(--gray);font-size:9px">PREPAİD</div></div>
        <div style="background:#f5f6f8;border-radius:7px;padding:7px;text-align:center"><div style="font-family:'Bebas Neue';font-size:17px;color:var(--yellow)">${fmt(tp)}</div><div style="color:var(--gray);font-size:9px">PUAN</div></div>
        <div style="background:#f5f6f8;border-radius:7px;padding:7px;text-align:center"><div style="font-family:'Bebas Neue';font-size:17px;color:${met?'var(--green)':'var(--gray)'}">${met?'600₺':'—'}</div><div style="color:var(--gray);font-size:9px">PRİM</div></div>
      </div>
    </div>`;
  });
  // Günlük toplam adet
  const gunlukToplamAdet=ts.reduce((a,s)=>a+s.qty,0);
  html+=`<div style="text-align:center;padding:14px;margin-top:6px;background:linear-gradient(135deg,rgba(230,168,0,0.08),rgba(230,168,0,0.02));border:1px solid rgba(230,168,0,0.2);border-radius:12px;">
    <div style="font-size:10px;letter-spacing:1px;color:var(--gray);margin-bottom:4px">GÜNÜN TOPLAM İŞLEM ADETİ</div>
    <div style="font-family:'Bebas Neue';font-size:32px;color:#1a1a2e;font-weight:700">${gunlukToplamAdet}</div>
  </div>`;
  document.getElementById('dailySummary').innerHTML=html;
  renderSalesTable('todayBody',[...ts].reverse());
}

function renderGunlukPrim(){
  const el=document.getElementById('gpCards');if(!el)return;el.innerHTML='';
  const eom=new Date(activeYear,activeMonth+1,0);
  const days=eom.getDate();
  employees.forEach((emp,i)=>{
    const res=getDailyPrim(i);
    const totalKat=res.reduce((a,r)=>a+(r.earned?r.kat:0),0);
    const dHtml=res.slice(0,days).map(r=>{
      const isF=new Date(r.date)>new Date();
      let bg='rgba(230,57,70,0.08)',bc='rgba(230,57,70,0.2)',c='var(--red)';
      if(r.earned&&r.comp){bg='rgba(43,123,232,0.08)';bc='rgba(43,123,232,0.2)';c='var(--blue)';}
      else if(r.earned&&r.kat>=2){bg='rgba(230,168,0,0.1)';bc='rgba(230,168,0,0.35)';c='var(--yellow)';}
      else if(r.earned){bg='rgba(0,168,107,0.08)';bc='rgba(0,168,107,0.2)';c='var(--green)';}
      else if(isF){bg='#f7f8fa';bc='var(--border)';c='var(--gray)';}
      const lbl=isF?'—':r.earned?(r.comp?'tel':r.kat>=2?`×${r.kat}`:'✓'):'✗';
      return`<div style="background:${bg};border:1px solid ${bc};border-radius:6px;padding:5px;text-align:center" title="${r.date} PP:${r.pp} PR:${r.pr}">
        <div style="font-family:'Bebas Neue';font-size:14px;color:${c}">${r.day}</div>
        <div style="font-size:8px;color:${c}">${lbl}</div>
      </div>`;
    }).join('');
    el.insertAdjacentHTML('beforeend',`<div style="background:#fff;border-radius:12px;border:1px solid var(--border);padding:14px;margin-bottom:12px;box-shadow:0 2px 6px rgba(0,0,0,0.05);">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
        <div style="display:flex;align-items:center;gap:9px;">
          <div class="av" style="background:${emp.color};width:36px;height:36px;font-size:13px">${emp.initials}</div>
          <div><div style="font-weight:600;font-size:13px;color:#1a1a2e">${emp.name}</div><div style="font-size:10px;color:var(--gray)">${totalKat} canlı prim birimi × 600₺</div></div>
        </div>
        <div style="font-family:'Bebas Neue';font-size:20px;color:var(--green)">${fmtTL(totalKat*600)}</div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(${Math.min(days,10)},1fr);gap:4px;margin-bottom:7px">${dHtml}</div>
      <div style="font-size:10px;color:var(--gray)"><span style="color:var(--green)">■</span> 600₺ &nbsp;<span style="color:var(--yellow)">■</span> ×2+ Kat &nbsp;<span style="color:var(--blue)">■</span> Telafi &nbsp;<span style="color:var(--red)">■</span> Kazanamadı</div>
    </div>`);
  });
}

function renderPrim(){
  const tot=getTotalStats();
  const band=getPrimBand(tot.puan);
  const pct=getMagazaHgoPct(); // Adet HGO
  const carpan=getCarpan(pct);
  document.getElementById('pPuan').textContent=fmt(tot.puan);
  document.getElementById('pDilim').textContent=band?`${fmt(band.min)}–${band.max===Infinity?'∞':fmt(band.max)}`:'<190 puan';
  document.getElementById('pSonuc').textContent=fmtTL(getPuanPrim(tot.puan));
  document.getElementById('pCarpan').textContent=band?`${fmtTL(band.prim)} × ${carpan}`:'—';
  document.getElementById('bandTable').innerHTML='<div class="pbg">'+primBands.map(b=>{
    const ac=tot.puan>=b.min&&(b.max===Infinity||tot.puan<=b.max);
    return`<div class="pbi" style="${ac?'border:1px solid rgba(0,168,107,0.3);background:rgba(0,168,107,0.06)':''}">
      <span style="color:var(--gray)">${fmt(b.min)}–${b.max===Infinity?'∞':fmt(b.max)} ${ac?'✓':''}</span>
      <span style="color:var(--green);font-weight:600">${fmtTL(b.prim)}</span>
    </div>`;
  }).join('')+'</div>';
}

function renderHedefler(){
  if(hedefEditMonth===undefined){hedefEditMonth=activeMonth;hedefEditYear=activeYear;}
  // Aylık hedefleri uygula
  applyMonthHedefler(hedefEditMonth,hedefEditYear);
  const mLabel=document.getElementById('hedefMonthLabel');
  const key=getHedefKey(hedefEditMonth,hedefEditYear);
  const hasSavedData=!!monthlyHedefler[key];
  if(mLabel)mLabel.innerHTML='<span style="font-weight:700;color:var(--yellow)">'+MONTHS[hedefEditMonth]+' '+hedefEditYear+'</span> hedef ayarları'+(hasSavedData?' <span style="font-size:9px;color:var(--green)">✓ Kayıtlı</span>':' <span style="font-size:9px;color:var(--gray)">⚪ Varsayılan</span>');
  document.getElementById('storeTarget').value=storeTarget;
  const storeAdetEl=document.getElementById('storeAdet');
  if(storeAdetEl)storeAdetEl.value=storeAdetHedefi;
  const tdmTopHedefEl=document.getElementById('tdmTopHedef');
  if(tdmTopHedefEl)tdmTopHedefEl.value=tdmToplamHedef;
  // Aylık etiket ve miras bilgisi
  const ayEtiketEl=document.getElementById('tdmHedefAyEtiket');
  if(ayEtiketEl)ayEtiketEl.textContent='('+MONTHS[hedefEditMonth]+' '+hedefEditYear+' için)';
  const tdmMirasEl=document.getElementById('tdmHedefMirasInfo');
  if(tdmMirasEl){
    const editKey=getHedefKey(hedefEditMonth,hedefEditYear);
    const editData=monthlyHedefler[editKey];
    if(editData&&editData._tdmTopHedef!=null&&editData._tdmTopHedef>0){
      tdmMirasEl.innerHTML='<span style="color:var(--green)">✓ Bu ay için kayıtlı</span>';
    } else {
      const nearest=findNearestPastTdmHedef(hedefEditMonth,hedefEditYear);
      if(nearest){
        tdmMirasEl.innerHTML='<span style="color:var(--blue)">↩ '+nearest.from+'\'dan miras (henüz kaydedilmedi)</span>';
      } else {
        tdmMirasEl.innerHTML='<span style="color:var(--gray)">⚪ Varsayılan</span>';
      }
    }
  }
  document.getElementById('c1').value=carpanlar.c1;
  document.getElementById('c2').value=carpanlar.c2;
  document.getElementById('c3').value=carpanlar.c3;
  document.getElementById('bonusTip').value=bonusAyar.tip;
  document.getElementById('bonusSabit').value=bonusAyar.sabit;
  document.getElementById('bonusYuzde').value=bonusAyar.yuzde;
  document.getElementById('bonusAktif').value=bonusAyar.aktif?'1':'0';
  toggleBonus();
  document.getElementById('hedefBody').innerHTML=products.map((p,i)=>p.hidden?'':`<tr>
    <td style="font-size:10px;white-space:nowrap">${p.name}${p.manuel?'<span style="font-size:8px;color:var(--blue)">M</span>':''}</td>
    <td style="font-size:9px">${tipLabel(p.tip)}</td>
    <td><input type="checkbox" id="hz_${i}" ${p.zorunlu?'checked':''}></td>
    <td>${p.manuel
      ?`<input type="number" class="ti" id="hTL_${i}" value="${p.hedefTL||0}" style="width:65px;font-size:11px">₺<br><input type="number" class="ti" id="ht_${i}" value="${p.hedef||0}" min="0" style="width:50px;font-size:11px;margin-top:2px">ad`
      :`<input type="number" class="ti" id="ht_${i}" value="${p.hedef}" min="0" style="width:55px;font-size:11px">ad`
    }</td>
    <td style="background:rgba(230,168,0,0.04)">${p.manuel
      ?`<input type="number" class="ti" id="htTL_${i}" value="${p.hedefTL!=null?p.hedefTL:0}" style="width:65px;font-size:11px">₺<br><input type="number" class="ti" id="ht_${i}" value="${p.hedef||0}" min="0" style="width:50px;font-size:11px;margin-top:2px">ad`
      :`<input type="number" class="ti" id="ht_${i}" value="${p.hedef||0}" min="0" style="width:55px;font-size:11px">ad`
    }</td>
    <td><input type="number" class="ti" id="hp_${i}" value="${p.puan}" step="0.5" min="0" style="width:50px;font-size:11px"></td>
    <td>${p.manuel?'<span style="color:var(--blue);font-size:9px">Manuel</span>':`<input type="number" class="ti" id="hpr_${i}" value="${p.prim}" min="0" style="width:60px;font-size:11px">`}</td>
    <td><input type="number" class="ti" id="hcp_${i}" value="${p.calisanPrim||0}" min="0" style="width:60px;font-size:11px" placeholder="0"></td>
    <td style="font-size:8px;color:var(--gray);white-space:nowrap;line-height:1.6">
      <span style="color:var(--red)">‹%75→0₺</span><br>
      <span style="color:var(--yellow)">%75→${fmtTL((p.calisanPrim||0)*0.75)}</span><br>
      <span style="color:var(--green)">%100→${fmtTL(p.calisanPrim||0)}</span>
    </td>
  </tr>`).join('');
  renderHedefTakvim();
  renderTdmEkList();
  updateNtcCount();
}

function renderHedefTakvim(){
  const el=document.getElementById('hedefTakvim');
  if(!el) return;
  const ms=getMonthSales();
  const eom=new Date(activeYear,activeMonth+1,0);
  const totalDays=eom.getDate();
  const today=new Date();
  const isThisMonth=today.getMonth()===activeMonth&&today.getFullYear()===activeYear;
  const passedDays=isThisMonth?today.getDate():totalDays;

  // Ürün bazlı gerçekleşme
  const urunData=products.map((p,i)=>{
    let qty=0,tlK=0;
    ms.filter(s=>s.prod===i).forEach(s=>{qty+=s.qty;tlK+=(s.manuel_prim||0)*s.qty;});
    const hedef=p.manuel?(p.hedefTL*targetEmpCount):(p.hedef*employees.length);
    const gercek=p.manuel?tlK:qty;
    const oran=hedef>0?Math.min(100,Math.round(gercek/hedef*100)):0;
    const gunlukOrt=passedDays>0?gercek/passedDays:0;
    const tahmini=Math.round(gunlukOrt*totalDays);
    const tahminiOran=hedef>0?Math.min(150,Math.round(tahmini/hedef*100)):0;
    return{p,qty,tlK,hedef,gercek,oran,tahmini,tahminiOran};
  }).filter(d=>(d.hedef>0||d.gercek>0)&&!d.p.hidden);

  el.innerHTML=`<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;">
  ${urunData.map(d=>{
    const fc=d.oran>=100?'var(--green)':d.oran>=70?'var(--yellow)':'var(--red)';
    const tf=d.tahminiOran>=100?'var(--green)':d.tahminiOran>=70?'var(--yellow)':'var(--red)';
    const gercekStr=d.p.manuel?fmtTL(d.gercek):d.gercek+' adet';
    const hedefStr=d.p.manuel?fmtTL(d.hedef):d.hedef+' adet';
    const tahStr=d.p.manuel?fmtTL(d.tahmini):d.tahmini+' adet';
    return`<div style="background:#fff;border-radius:10px;border:1px solid var(--border);padding:13px;box-shadow:0 1px 5px rgba(0,0,0,0.04);">
      <div style="font-size:10px;font-weight:600;color:#1a1a2e;margin-bottom:8px;letter-spacing:0.3px">${d.p.name}</div>
      <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--gray);margin-bottom:4px;">
        <span>Gerçekleşen</span><strong style="color:${fc}">${gercekStr}</strong>
      </div>
      <div style="background:rgba(0,0,0,0.07);border-radius:20px;height:5px;overflow:hidden;margin-bottom:6px;">
        <div style="width:${d.oran}%;background:${fc};height:5px;border-radius:20px;transition:width 0.5s"></div>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--gray);margin-bottom:2px;">
        <span>Hedef (mağaza)</span><span>${hedefStr}</span>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:10px;margin-top:5px;padding-top:5px;border-top:1px solid rgba(0,0,0,0.06);">
        <span style="color:var(--gray)">Ay sonu tahmini</span>
        <strong style="color:${tf}">${tahStr} <span style="font-weight:400;font-size:9px">(%${d.tahminiOran})</span></strong>
      </div>
    </div>`;
  }).join('')}
  </div>`;
}

async function saveHedefler(){
  carpanlar.c1=parseFloat(document.getElementById('c1').value)||carpanlar.c1;
  carpanlar.c2=parseFloat(document.getElementById('c2').value)||carpanlar.c2;
  carpanlar.c3=parseFloat(document.getElementById('c3').value)||carpanlar.c3;
  bonusAyar.tip=document.getElementById('bonusTip').value;
  bonusAyar.sabit=parseFloat(document.getElementById('bonusSabit').value)||0;
  bonusAyar.yuzde=parseFloat(document.getElementById('bonusYuzde').value)||0;
  bonusAyar.aktif=document.getElementById('bonusAktif').value==='1';

  // Ürün değerlerini inputlardan oku
  const monthData={};
  products.forEach((p,i)=>{
    p.zorunlu=document.getElementById(`hz_${i}`)?.checked||false;
    const puanVal=parseFloat(document.getElementById(`hp_${i}`)?.value);
    p.puan=isNaN(puanVal)?p.puan:puanVal;
    if(p.manuel){
      const tlVal=parseFloat(document.getElementById(`hTL_${i}`)?.value);
      p.hedefTL=isNaN(tlVal)?p.hedefTL:tlVal;
      const htVal=parseInt(document.getElementById(`ht_${i}`)?.value);
      p.hedef=isNaN(htVal)?p.hedef:htVal;
    }else{
      const htVal=parseInt(document.getElementById(`ht_${i}`)?.value);
      p.hedef=isNaN(htVal)?p.hedef:htVal;
      const prVal=parseFloat(document.getElementById(`hpr_${i}`)?.value);
      p.prim=isNaN(prVal)?p.prim:prVal;
    }
    const cpVal=parseFloat(document.getElementById(`hcp_${i}`)?.value);
    p.calisanPrim=isNaN(cpVal)?0:cpVal;
    // magazaHedef artık TDM hedefiyle aynı (mağaza hedefi kaldırıldı)
    p.magazaHedef=p.hedef;
    p.magazaHedefTL=p.hedefTL;
    monthData[i]={hedef:p.hedef,hedefTL:p.hedefTL,magazaHedef:p.hedef,magazaHedefTL:p.hedefTL,puan:p.puan,prim:p.prim,zorunlu:p.zorunlu,calisanPrim:p.calisanPrim};
  });

  // Aylık hedefleri JS objesine kaydet
  const key=getHedefKey(hedefEditMonth,hedefEditYear);
  monthlyHedefler[key]=monthData;
  calcStoreTarget();

  try{
    // 1) Genel ayarları kaydet
    await dbSaveAyarlar();
    // 2) Her zaman urun_ayarlar'a da kaydet (fallback/base)
    await dbSaveUrunAyarlar();
    // 3) Aylık hedefleri Supabase'e kaydet
    let aylikOk=false;
    try{
      const rows=products.map(function(p,i){
        return{urun_id:i,ay:hedefEditMonth+1,yil:hedefEditYear,hedef:p.hedef,hedef_tl:p.hedefTL!=null?p.hedefTL:0,magaza_hedef:p.hedef,magaza_hedef_tl:p.hedefTL!=null?p.hedefTL:0,puan:p.puan,prim:p.prim,zorunlu:p.zorunlu,calisan_prim:p.calisanPrim!=null?p.calisanPrim:0};
      });
      const{error}=await sb.from('aylik_urun_hedefler').upsert(rows,{onConflict:'urun_id,ay,yil'});
      if(error)throw error;
      aylikOk=true;
    }catch(ae){console.log('Aylık tablo yok veya hata:',ae.message);}
    showToast('✓ '+MONTHS[hedefEditMonth]+' '+hedefEditYear+' hedefleri kaydedildi!'+(aylikOk?'':' (aylık tablo oluşturulmamış)'));
    // Defaults güncelle
    initProductDefaults();
    if(hedefEditMonth===activeMonth&&hedefEditYear===activeYear){
      applyMonthHedefler(activeMonth,activeYear);
      renderDashboard();
    }
  }catch(e){showToast('Kayıt hatası: '+e.message,true);}
}

async function hedefPrevMonth(){
  hedefEditMonth--;
  if(hedefEditMonth<0){hedefEditMonth=11;hedefEditYear--;}
  await loadMonthHedefFromDB(hedefEditMonth,hedefEditYear);
  applyMonthHedefler(hedefEditMonth,hedefEditYear);
  renderHedefler();
}
async function hedefNextMonth(){
  hedefEditMonth++;
  if(hedefEditMonth>11){hedefEditMonth=0;hedefEditYear++;}
  await loadMonthHedefFromDB(hedefEditMonth,hedefEditYear);
  applyMonthHedefler(hedefEditMonth,hedefEditYear);
  renderHedefler();
}
async function loadMonthHedefFromDB(m,y){
  try{
    const ay=m+1;
    const{data,error}=await sb.from('aylik_urun_hedefler').select('*').eq('ay',ay).eq('yil',y);
    if(error||!data||data.length===0)return;
    const key=getHedefKey(m,y);
    monthlyHedefler[key]={};
    data.forEach(function(row){
      monthlyHedefler[key][row.urun_id]={
        hedef:row.hedef,hedefTL:row.hedef_tl,
        magazaHedef:row.magaza_hedef,magazaHedefTL:row.magaza_hedef_tl,
        puan:row.puan,prim:row.prim,zorunlu:row.zorunlu,calisanPrim:row.calisan_prim||0
      };
    });
  }catch(e){console.log('Ay hedefi çekilemedi:',e.message);}
}
async function copyHedefFromPrev(){
  let pm=hedefEditMonth-1,py=hedefEditYear;
  if(pm<0){pm=11;py--;}
  await loadMonthHedefFromDB(pm,py);
  const prevKey=getHedefKey(pm,py);
  const prevData=monthlyHedefler[prevKey];
  if(!prevData){showToast(MONTHS[pm]+' '+py+' için kayıtlı hedef bulunamadı',true);return;}
  // Önceki ayın verilerini mevcut aya kopyala
  const key=getHedefKey(hedefEditMonth,hedefEditYear);
  monthlyHedefler[key]=JSON.parse(JSON.stringify(prevData));
  applyMonthHedefler(hedefEditMonth,hedefEditYear);
  renderHedefler();
  showToast('✓ '+MONTHS[pm]+' hedefleri '+MONTHS[hedefEditMonth]+'\'a kopyalandı. Kaydetmeyi unutmayın!');
}

function toggleBonus(){
  const t=document.getElementById('bonusTip').value;
  document.getElementById('bSabitRow').style.display=t==='sabit'?'flex':'none';
  document.getElementById('bYuzdeRow').style.display=t==='yuzde'?'flex':'none';
}

function renderYillik(){
  document.getElementById('yillikTabs').innerHTML=employees.map((e,i)=>`<button class="yet ${i===activeYillikEmp?'active':''}" onclick="setYillikEmp(${i})">${e.name.split(' ')[0]}</button>`).join('');
  const yh=yillikHedefler[activeYillikEmp];
  const emp=employees[activeYillikEmp];
  const yillikTop=yh.reduce((a,b)=>a+b.puanHedef,0);
  let yillikGercek=0;
  MONTHS.forEach((_,mi)=>yillikGercek+=getEmpStats(activeYillikEmp,mi,activeYear).puan);
  document.getElementById('yillikContent').innerHTML=`
  <div class="kg kg3" style="margin-bottom:16px;">
    <div class="kc" style="--ac:var(--yellow)"><div class="kl">YILLIK HEDEF</div><div class="kv">${fmt(yillikTop)}</div><div class="ks">puan</div></div>
    <div class="kc" style="--ac:var(--green)"><div class="kl">GERÇEKLEŞen</div><div class="kv">${fmt(yillikGercek)}</div><div class="ks">puan</div></div>
    <div class="kc" style="--ac:var(--red)"><div class="kl">KALAN</div><div class="kv">${fmt(Math.max(0,yillikTop-yillikGercek))}</div><div class="ks">puan</div></div>
  </div>
  <div style="background:rgba(0,0,0,0.06);border-radius:20px;height:7px;overflow:hidden;margin-bottom:18px;">
    <div style="width:${Math.min(100,yillikTop>0?Math.round(yillikGercek/yillikTop*100):0)}%;background:var(--green);height:7px;border-radius:20px;transition:width 1s"></div>
  </div>
  <div class="tw ow"><table class="mw"><thead><tr><th>Ay</th><th>Puan Hedefi</th><th>Gerçekleşen</th><th>Adet Prim</th><th>Bonus</th><th>Toplam Prim</th><th>Durum</th></tr></thead>
  <tbody>${MONTHS.map((m,mi)=>{
    const st=getEmpStats(activeYillikEmp,mi,activeYear);
    const h=yh[mi];
    const hak=empPrimHak(activeYillikEmp,mi,activeYear);
    const bonus=hak.hak?calcBonus(st.totalPrim,st.puan,h.puanHedef):0;
    const top=hak.hak?(st.totalPrim+bonus):0;
    const oran=h.puanHedef>0?Math.round((st.puan/h.puanHedef)*100):0;
    const isAct=mi===activeMonth;
    return`<tr style="${isAct?'background:rgba(230,168,0,0.05)':''}">
      <td style="font-weight:600;${isAct?'color:var(--yellow)':''}">${m}${isAct?' ←':''}</td>
      <td><input type="number" class="ti" id="yph_${activeYillikEmp}_${mi}" value="${h.puanHedef}" style="width:85px"></td>
      <td style="color:var(--yellow)">${fmt(st.puan)}</td>
      <td style="color:var(--green)">${hak.hak?fmtTL(st.totalPrim):'—'}</td>
      <td style="color:var(--purple)">${bonus>0?fmtTL(bonus):'—'}</td>
      <td style="font-weight:600">${fmtTL(top)}</td>
      <td>${oran>0?`<span class="badge ${oran>=110?'bg':oran>=100?'bb':oran>=70?'by':'br'}">%${oran}</span>`:'—'}</td>
    </tr>`;
  }).join('')}</tbody></table></div>`;

  // Yıllık ürün hedefleri tablosu
  const yilEl=document.getElementById('yillikUrunHedef');
  if(yilEl){
    // Yıllık gerçekleşen veriler
    let topFaturali=0,topPrepaid=0,topRekon=0,topNTC=0,topAKG=0,topSOL=0;
    let tlAksesuar=0,tl2El=0,tlSifir=0;
    const today=new Date();
    const passedMonths=today.getFullYear()===activeYear?today.getMonth()+1:12;
    const passedDayOfYear=today.getFullYear()===activeYear
      ?(Math.floor((today-new Date(activeYear,0,1))/86400000)+1):365;
    const totalDays=365;

    sales.filter(s=>s.date&&parseInt(s.date.split('-')[0])===activeYear).forEach(s=>{
      const p=products[s.prod];
      if(p.tip==='postpaid'&&s.prod<=4)topFaturali+=s.qty;
      if(p.tip==='prepaid')topPrepaid+=s.qty;
      if(p.name.includes('REKON'))topRekon+=s.qty;
      if(p.name==='NTC')topNTC+=s.qty;
      if(p.name==='AKG')topAKG+=s.qty;
      if(s.prod<=2)topSOL+=s.qty;
      if(p.name==='AKSESUAR')tlAksesuar+=(s.manuel_prim||0)*s.qty;
      if(p.name==='2. EL CİHAZ')tl2El+=(s.manuel_prim||0)*s.qty;
      if(p.name==='SIFIR CİHAZ')tlSifir+=(s.manuel_prim||0)*s.qty;
    });

    const N=targetEmpCount;
    // kisiH = kişi başı yıllık hedef (verilen), magazaH = kisiH * N (mağaza toplamı)
    const rows=[
      {lbl:'FATURALI (NTC,SOL hariç)', kisiH:1596,   magazaH:1596*N,   gercek:topFaturali, birim:'adet'},
      {lbl:'ÖN ÖDEMELİ (AKG hariç)',  kisiH:400,    magazaH:400*N,    gercek:topPrepaid,  birim:'adet'},
      {lbl:'NTC',                      kisiH:240,    magazaH:240*N,    gercek:topNTC,      birim:'adet'},
      {lbl:'REKONTRATLAMA (1-2-3)',    kisiH:220,    magazaH:220*N,    gercek:topRekon,    birim:'adet'},
      {lbl:'AKG',                      kisiH:23,     magazaH:23*N,     gercek:topAKG,      birim:'adet'},
      {lbl:'SOL (SB+FİB+OA)',          kisiH:32,     magazaH:32*N,     gercek:topSOL,      birim:'adet'},
      {lbl:'AKSESUAR',                 kisiH:312500, magazaH:312500*N, gercek:tlAksesuar,  birim:'₺'},
      {lbl:'2. EL CİHAZ',              kisiH:155000, magazaH:155000*N, gercek:tl2El,       birim:'₺'},
      {lbl:'SIFIR CİHAZ',              kisiH:162500, magazaH:162500*N, gercek:tlSifir,     birim:'₺'},
    ];

    const fmtVal=(v,b)=>b==='₺'?fmtTL(v):v+' '+b;
    const tahminiYilSonu=(g)=>passedMonths>0?Math.round(g/passedMonths*12):0;

    // Kişi başı tablo
    let kisiHtml=`<div class="sh" style="margin-top:6px;"><div class="st">KİŞİ BAŞI <em>YILLIK HEDEFLER</em></div></div>
    <div class="tw"><table><thead><tr><th>Ürün/Kategori</th><th>Kişi Başı Hedef</th><th>Kişi Başı Gerçekleşen</th><th>Kişi Başı Kalan</th><th>Gidişat (Yıl Sonu)</th><th>İlerleme</th></tr></thead><tbody>
    ${rows.map(r=>{
      const kisiGercek=Math.round(r.gercek/N);
      const oran=r.kisiH>0?Math.min(100,Math.round(kisiGercek/r.kisiH*100)):0;
      const kalan=Math.max(0,r.kisiH-kisiGercek);
      const tahmin=Math.round(tahminiYilSonu(r.gercek)/N);
      const tahOran=r.kisiH>0?Math.min(150,Math.round(tahmin/r.kisiH*100)):0;
      const tf=tahOran>=100?'var(--green)':tahOran>=70?'var(--yellow)':'var(--red)';
      return`<tr>
        <td style="font-weight:600">${r.lbl}</td>
        <td>${fmtVal(r.kisiH,r.birim)}</td>
        <td style="color:var(--green)">${fmtVal(kisiGercek,r.birim)}</td>
        <td style="color:var(--red)">${fmtVal(kalan,r.birim)}</td>
        <td><span style="color:${tf};font-weight:600">${fmtVal(tahmin,r.birim)}</span> <span class="badge ${tahOran>=100?'bg':tahOran>=70?'by':'br'}">%${tahOran}</span></td>
        <td><div style="display:flex;align-items:center;gap:7px"><div style="background:rgba(0,0,0,0.07);border-radius:20px;height:6px;width:80px;overflow:hidden"><div style="width:${oran}%;background:${oran>=100?'var(--green)':oran>=50?'var(--yellow)':'var(--red)'};height:6px;border-radius:20px"></div></div><span class="badge ${oran>=100?'bg':oran>=50?'by':'br'}">%${oran}</span></div></td>
      </tr>`;
    }).join('')}
    </tbody></table></div>`;

    // Mağaza toplam tablo
    let magazaHtml=`<div class="sh" style="margin-top:10px;"><div class="st">MAĞAZA TOPLAM <em>YILLIK HEDEFLER</em></div></div>
    <div class="tw"><table><thead><tr><th>Ürün/Kategori</th><th>Yıllık Hedef</th><th>Gerçekleşen</th><th>Kalan</th><th>Gidişat (Yıl Sonu)</th><th>İlerleme</th></tr></thead><tbody>
    ${rows.map(r=>{
      const oran=r.magazaH>0?Math.min(100,Math.round(r.gercek/r.magazaH*100)):0;
      const kalan=Math.max(0,r.magazaH-r.gercek);
      const tahmin=tahminiYilSonu(r.gercek);
      const tahOran=r.magazaH>0?Math.min(150,Math.round(tahmin/r.magazaH*100)):0;
      const tf=tahOran>=100?'var(--green)':tahOran>=70?'var(--yellow)':'var(--red)';
      return`<tr>
        <td style="font-weight:600">${r.lbl}</td>
        <td>${fmtVal(r.magazaH,r.birim)}</td>
        <td style="color:var(--green)">${fmtVal(r.gercek,r.birim)}</td>
        <td style="color:var(--red)">${fmtVal(kalan,r.birim)}</td>
        <td><span style="color:${tf};font-weight:600">${fmtVal(tahmin,r.birim)}</span> <span class="badge ${tahOran>=100?'bg':tahOran>=70?'by':'br'}">%${tahOran}</span></td>
        <td><div style="display:flex;align-items:center;gap:7px"><div style="background:rgba(0,0,0,0.07);border-radius:20px;height:6px;width:80px;overflow:hidden"><div style="width:${oran}%;background:${oran>=100?'var(--green)':oran>=50?'var(--yellow)':'var(--red)'};height:6px;border-radius:20px"></div></div><span class="badge ${oran>=100?'bg':oran>=50?'by':'br'}">%${oran}</span></div></td>
      </tr>`;
    }).join('')}
    </tbody></table></div>`;

    yilEl.innerHTML=kisiHtml+magazaHtml;
  }
}

function setYillikEmp(i){activeYillikEmp=i;renderYillik();}

async function saveYillik(){
  const promises=[];
  employees.forEach((_,ei)=>{
    MONTHS.forEach((_,mi)=>{
      const inp=document.getElementById(`yph_${ei}_${mi}`);
      if(inp){
        const val=parseInt(inp.value)||0;
        yillikHedefler[ei][mi].puanHedef=val;
        promises.push(dbSaveYillik(ei,mi,val));
      }
    });
  });
  try{await Promise.all(promises);showToast('✓ Yıllık plan kaydedildi!');}
  catch(e){showToast('Kayıt hatası: '+e.message,true);}
}

// ============================================================
// LİDERLİK TABLOSU
// ============================================================
let liderMod='ay'; // 'ay' veya 'yil'
let liderPrimler=[]; // [{ay,yil,kat,tutar,not,kazanan}]

function setLiderMod(mod){
  liderMod=mod;
  document.getElementById('liderAyBtn').className='btn '+(mod==='ay'?'btn-p':'btn-g');
  document.getElementById('liderYilBtn').className='btn '+(mod==='yil'?'btn-p':'btn-g');
  renderLiderlik();
}

function getLiderStats(mod){
  return employees.map((emp,i)=>{
    let puan=0,faturali=0,prepaid=0,toplam=0,ntc=0,aksesuar=0,ikinciel=0,sifir=0;
    const filtSales=mod==='ay'
      ?getMonthSales(activeMonth,activeYear).filter(s=>s.emp===i)
      :sales.filter(s=>s.emp===i&&s.date&&parseInt(s.date.split('-')[0])===activeYear);
    filtSales.forEach(s=>{
      const p=products[s.prod];
      puan+=p.puan*s.qty;toplam+=s.qty;
      if(p.tip==='postpaid')faturali+=s.qty;
      else if(p.tip==='prepaid')prepaid+=s.qty;
      if(p.name==='NTC')ntc+=s.qty;
      if(p.name==='AKSESUAR')aksesuar+=(s.manuel_prim||0)*s.qty;
      if(p.name==='2. EL CİHAZ')ikinciel+=(s.manuel_prim||0)*s.qty;
      if(p.name==='SIFIR CİHAZ')sifir+=(s.manuel_prim||0)*s.qty;
    });
    return{emp,i,puan,faturali,prepaid,toplam,ntc,aksesuar,ikinciel,sifir};
  });
}

async function savePosCiro(){
  posCiro=parseFloat(document.getElementById('posCiro').value)||0;
  try{
    await dbSaveAyarlar();
    showToast('✓ POS cirosu kaydedildi: '+fmtTL(posCiro));
  }catch(e){showToast('Kayıt hatası: '+e.message,true);}
}

function renderLiderlik(){
  const stats=getLiderStats(liderMod);
  const donem=liderMod==='ay'?MONTHS[activeMonth]+' '+activeYear:activeYear+' Yılı';
  const cats=[
    {key:'puan',    lbl:'PUAN TOPLAMI',  birim:'puan',icon:'⭐',color:'var(--yellow)', tl:false},
    {key:'faturali',lbl:'FATURALI',      birim:'adet',icon:'📱',color:'var(--blue)',   tl:false},
    {key:'prepaid', lbl:'ÖN ÖDEMELİ',   birim:'adet',icon:'💳',color:'var(--prepaid)',tl:false},
    {key:'ntc',     lbl:'NTC',           birim:'adet',icon:'🔄',color:'var(--purple)', tl:false},
    {key:'toplam',  lbl:'TOPLAM SATIŞ',  birim:'adet',icon:'🏆',color:'var(--green)',  tl:false},
    {key:'aksesuar',lbl:'AKSESUAR',      birim:'₺',   icon:'🎧',color:'var(--green)',  tl:true},
    {key:'ikinciel',lbl:'2. EL CİHAZ',  birim:'₺',   icon:'📦',color:'var(--notr)',   tl:true},
    {key:'sifir',   lbl:'SIFIR CİHAZ',  birim:'₺',   icon:'✨',color:'var(--blue)',   tl:true},
  ];
  let html=`<div style="margin-bottom:12px;font-family:'Bebas Neue';font-size:14px;color:var(--gray);letter-spacing:1px">${donem}</div>`;
  html+=`<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:18px;">`;
  cats.forEach(cat=>{
    const sorted=[...stats].sort((a,b)=>b[cat.key]-a[cat.key]);
    html+=`<div style="background:#fff;border-radius:12px;border:1px solid var(--border);padding:14px;box-shadow:0 2px 8px rgba(0,0,0,0.05);">
      <div style="font-size:10px;color:var(--gray);letter-spacing:1px;margin-bottom:10px">${cat.icon} ${cat.lbl}</div>
      ${sorted.map((s,rank)=>{
        const isFirst=rank===0;
        const pct=sorted[0][cat.key]>0?Math.round(s[cat.key]/sorted[0][cat.key]*100):0;
        const val=cat.tl?fmtTL(s[cat.key]):s[cat.key]+' '+cat.birim;
        return`<div style="display:flex;align-items:center;gap:7px;margin-bottom:7px;">
          <div style="font-size:14px;width:18px">${rank===0?'🥇':rank===1?'🥈':'🥉'}</div>
          <div class="av" style="background:${s.emp.color};width:24px;height:24px;font-size:10px;flex-shrink:0;border-radius:6px">${s.emp.initials}</div>
          <div style="flex:1;min-width:0">
            <div style="font-size:11px;font-weight:600;color:${isFirst?'#1a1a2e':'#777'};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${s.emp.name.split(' ')[0]}</div>
            <div style="background:rgba(0,0,0,0.07);border-radius:20px;height:3px;margin-top:2px;overflow:hidden"><div style="width:${pct}%;background:${cat.color};height:3px;border-radius:20px"></div></div>
          </div>
          <div style="font-family:'Bebas Neue';font-size:13px;color:${isFirst?cat.color:'var(--gray)'};white-space:nowrap">${val}</div>
        </div>`;
      }).join('')}
    </div>`;
  });
  html+='</div>';
  document.getElementById('liderContent').innerHTML=html;

  // Lider prim listesi
  const lpEl=document.getElementById('liderPrimList');
  if(!liderPrimler.length){
    lpEl.innerHTML='<div style="color:var(--gray);font-size:12px;padding:14px">Henüz tanımlanmış lider primi yok.</div>';
    return;
  }
  lpEl.innerHTML=`<div class="tw"><table><thead><tr><th>Dönem</th><th>Kategori</th><th>Kazanan</th><th>Prim</th><th>Not</th><th>İşlem</th></tr></thead><tbody>
  ${liderPrimler.map(lp=>{
    const katLabel={'puan':'Puan','faturali':'Faturalı','prepaid':'Ön Ödemeli','ntc':'NTC','aksesuar':'Aksesuar','ikinciel':'2. El Cihaz','sifir':'Sıfır Cihaz','toplam':'Toplam'}[lp.kategori||lp.kat]||(lp.kategori||lp.kat);
    return`<tr>
    <td>${MONTHS[lp.ay]} ${lp.yil}</td>
    <td>${katLabel}</td>
    <td style="color:${employees[lp.kazanan]?.color||'var(--gray)'};font-weight:600">${employees[lp.kazanan]?.name||'—'}</td>
    <td style="color:var(--green);font-weight:600">${fmtTL(lp.tutar)}</td>
    <td style="color:var(--gray);font-size:11px">${lp.not_text||lp.not||'—'}</td>
    <td><button class="btn btn-d bsm" onclick="deleteLiderPrim('${lp.id}')">🗑️</button></td>
  </tr>`;}).join('')}
  </tbody></table></div>`;
}

function openLiderPrimModal(){
  const sel=document.getElementById('lpAy');
  sel.innerHTML=MONTHS.map((m,i)=>`<option value="${i}" ${i===activeMonth?'selected':''}>${m} ${activeYear}</option>`).join('');
  // Otomatik lider seç
  const stats=getLiderStats('ay');
  const lider=stats.sort((a,b)=>b.puan-a.puan)[0];
  document.getElementById('liderPrimOv').style.display='flex';
}

function closeLiderPrimModal(){
  document.getElementById('liderPrimOv').style.display='none';
}

async function saveLiderPrim(){
  const ay=parseInt(document.getElementById('lpAy').value);
  const kat=document.getElementById('lpKat').value;
  const tutar=parseFloat(document.getElementById('lpTutar').value)||0;
  const notText=document.getElementById('lpNot').value.trim();
  const stats=getLiderStats('ay');
  const sorted=[...stats].sort((a,b)=>{
    if(kat==='puan')return b.puan-a.puan;
    if(kat==='faturali')return b.faturali-a.faturali;
    if(kat==='prepaid')return b.prepaid-a.prepaid;
    if(kat==='ntc')return b.ntc-a.ntc;
    if(kat==='aksesuar')return b.aksesuar-a.aksesuar;
    if(kat==='ikinciel')return b.ikinciel-a.ikinciel;
    if(kat==='sifir')return b.sifir-a.sifir;
    return b.toplam-a.toplam;
  });
  const kazanan=sorted[0].i;
  const obj={ay,yil:activeYear,kategori:kat,tutar,not_text:notText,kazanan};
  try{
    const{data,error}=await sb.from('lider_primler').upsert(obj,{onConflict:'ay,yil,kategori'}).select().single();
    if(error)throw error;
    const existing=liderPrimler.findIndex(lp=>lp.ay===ay&&lp.yil===activeYear&&(lp.kategori||lp.kat)===kat);
    if(existing>=0)liderPrimler[existing]=data;
    else liderPrimler.push(data);
    closeLiderPrimModal();
    showToast(`✓ ${employees[kazanan].name} için ${fmtTL(tutar)} lider primi tanımlandı!`);
    renderLiderlik();
  }catch(e){showToast('Hata: '+e.message,true);}
}

async function deleteLiderPrim(id){
  if(!confirm('Lider primini silmek istiyor musunuz?'))return;
  try{
    const{error}=await sb.from('lider_primler').delete().eq('id',id);
    if(error)throw error;
    liderPrimler=liderPrimler.filter(lp=>lp.id!==id);
    showToast('Lider primi silindi');
    renderLiderlik();
  }catch(e){showToast('Hata: '+e.message,true);}
}

function renderMuafiyet(){
  const tbody=document.getElementById('muafBody');if(!tbody)return;tbody.innerHTML='';
  if(!muafiyetler.length){tbody.innerHTML='<tr><td colspan="5" style="text-align:center;color:var(--gray);padding:20px">Henüz muafiyet kaydı yok</td></tr>';return;}
  muafiyetler.forEach(m=>{
    tbody.insertAdjacentHTML('beforeend',`<tr>
      <td style="color:${employees[m.emp].color}">${escapeHtml(employees[m.emp].name)}</td>
      <td>${MONTHS[m.ay]} ${m.yil}</td>
      <td style="color:var(--gray)">${m.neden}</td>
      <td style="color:var(--gray);font-size:11px">${m.tarih}</td>
      <td><button class="btn btn-d bsm" onclick="deleteMuafiyet('${m.id}')">🗑️ Sil</button></td>
    </tr>`);
  });
}

// ============================================================
// MODAL — SATIŞ (Tile-based)
// ============================================================
let pendingManuelProd=null;

function openSaleModal(editId=''){
  document.getElementById('editId').value=editId;
  if(editId){
    // Düzenleme modu
    const s=sales.find(x=>x.id===editId);
    document.getElementById('sModalTitle').textContent='DÜZENLE';
    document.getElementById('sSub').textContent='Kaydı güncelle';
    document.getElementById('saleQuickForm').style.display='none';
    document.getElementById('saleEditForm').style.display='block';
    document.getElementById('sEmpEdit').innerHTML=employees.map((e,i)=>`<option value="${i}">${e.name}</option>`).join('');
    document.getElementById('sProdEdit').innerHTML=products.map((p,i)=>p.hidden?'':`<option value="${i}">${p.name}</option>`).join('');
    document.getElementById('sEmpEdit').value=s.emp;
    document.getElementById('sProdEdit').value=s.prod;
    document.getElementById('sQtyEdit').value=s.qty;
    document.getElementById('sDateEdit').value=s.date;
    const p=products[s.prod];
    document.getElementById('manuelGrpEdit').style.display=p.manuel?'block':'none';
    document.getElementById('acGrpEdit').style.display=p.aciklama?'block':'none';
    document.getElementById('sManuelEdit').value=s.manuel_prim||0;
    document.getElementById('sAcEdit').value=s.aciklama||'';
  }else{
    // Hızlı ekleme modu
    document.getElementById('sModalTitle').textContent='EKLE';
    document.getElementById('sSub').textContent='Ürüne tıkla → anında kaydet';
    document.getElementById('saleQuickForm').style.display='block';
    document.getElementById('saleEditForm').style.display='none';
    document.getElementById('sEmp').innerHTML=employees.map((e,i)=>`<option value="${i}">${e.name}</option>`).join('');
    document.getElementById('sDate').value=new Date().toISOString().split('T')[0];
    document.getElementById('manuelPopup').style.display='none';
    renderSaleTiles();
  }
  document.getElementById('saleOv').classList.add('open');
}

function renderSaleTiles(){
  const date=document.getElementById('sDate').value;
  const ei=parseInt(document.getElementById('sEmp').value);
  const daySales=sales.filter(s=>s.date===date&&s.emp===ei);

  ['Post','Pre','Notr'].forEach(cat=>{
    const tipFilter=cat==='Post'?'postpaid':cat==='Pre'?'prepaid':'notr';
    const el=document.getElementById('saleTiles'+cat);if(!el)return;
    el.innerHTML=products.map((p,i)=>{
      if(p.hidden)return'';
      if(p.tip!==tipFilter)return'';
      const cnt=daySales.filter(s=>s.prod===i).reduce((a,s)=>a+s.qty,0);
      const tipColor=p.tip==='postpaid'?'var(--postpaid)':p.tip==='prepaid'?'var(--prepaid)':'var(--notr)';
      return`<div onclick="quickAddSale(${i})" style="background:#fff;border:2px solid ${cnt>0?tipColor:'var(--border)'};border-radius:10px;padding:10px 8px;cursor:pointer;text-align:center;position:relative;transition:all 0.15s;user-select:none;" onmousedown="this.style.transform='scale(0.95)'" onmouseup="this.style.transform=''" onmouseleave="this.style.transform=''">
        ${cnt>0?`<div style="position:absolute;top:-8px;right:-8px;width:22px;height:22px;background:${tipColor};color:#fff;border-radius:50%;font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;">${cnt}</div>`:''}
        <div style="font-size:11px;font-weight:600;color:#1a1a2e;line-height:1.3;margin-bottom:4px">${p.name}</div>
        <div style="font-size:9px;color:var(--gray)">${p.puan>0?p.puan+' puan':'—'} ${p.prim>0?' · '+fmtTL(p.prim):''}</div>
      </div>`;
    }).join('');
  });

  // Bugünkü özet
  let topPP=0,topPR=0,topPuan=0;
  daySales.forEach(s=>{
    const p=products[s.prod];
    topPuan+=p.puan*s.qty;
    if(p.tip==='postpaid')topPP+=s.qty;
    else if(p.tip==='prepaid')topPR+=s.qty;
  });
  document.getElementById('saleTodaySummary').innerHTML=`<strong>${employees[ei]?.name?.split(' ')[0]||''}</strong> — ${date}: <strong style="color:var(--postpaid)">${topPP} PP</strong> + <strong style="color:var(--prepaid)">${topPR} PR</strong> = <strong style="color:var(--yellow)">${fmt(topPuan)} puan</strong> · Toplam ${daySales.reduce((a,s)=>a+s.qty,0)} satış`;
}

// NTC Ürün Veritabanı (222 model)
let NTC_DB={"105 4G DS TA 1551 TR CHARCOAL":255.81,"110 4G":372.97,"12 LITE 6GB 128GB":910.0,"12 LITE 8GB 256GB":1035.0,"235 4G":514.12,"A49 8GB 128GB":708.99,"A5 5G 8GB 256GB":1411.87,"A5 5G 8GB 256GB ONLINE OZEL":1003.1,"A5 5G 8GB 256GB TAKSIT OTELEME":1311.52,"A5 6GB RAM 128GB":1102.9,"A5 6GB RAM 128GB ONLINE OZEL":755.88,"A5 8GB RAM 256GB":1269.63,"A5 8GB RAM 256GB ONLINE OZEL":867.74,"A6 PRO 5G 8GB 256GB":1647.5,"A6 PRO 5G 8GB 256GB ONLINE OZEL":1252.09,"A6 PRO 8GB 256GB":1622.23,"A6 PRO 8GB 256GB ONLINE OZEL":1122.79,"A6T 5G 128GB":1294.91,"A6T 5G 256GB":1479.51,"AIR 5G 8GB 256GB":1539.88,"C61 6GB 128GB":801.0,"C61 8GB 256GB":860.0,"C75 128 GB":1077.45,"C75 256 GB":1260.0,"CAMON 40 256 GB":1663.76,"CAMON 40 PRO 5G 256 GB":2174.5,"ERA 30 DUAL SIM 4GB 128GB":882.26,"ERA 30 PRO 8GB 256GB":905.97,"GALAXY A07 4GB 128GB":786.77,"GALAXY A07 4GB 128GB 3G SUNSET":769.44,"GALAXY A07 4GB 128GB ONLINE OZEL":563.17,"GALAXY A07 4GB 128GB TAKSIT OTELEME":772.34,"GALAXY A07 5G 4GB 128GB":1124.29,"GALAXY A17 4GB 128GB":1086.14,"GALAXY A17 4GB 128GB 3G SUNSET":1081.92,"GALAXY A17 4GB 128GB TAKSIT OTELEME":1099.21,"GALAXY A17 5G 6GB 128GB":1181.99,"GALAXY A17 5G 6GB 128GB TAKSIT OTELEME":1216.01,"GALAXY A26 5G 6GB 128GB":1242.44,"GALAXY A26 5G 6GB 128GB 3G SUNSET":1281.13,"GALAXY A26 5G 6GB 128GB EGYG":1251.4,"GALAXY A26 5G 6GB 128GB EGYG PESIN":874.75,"GALAXY A26 5G 6GB 128GB ONLINE OZEL":1012.99,"GALAXY A26 5G 6GB 128GB UPGRADERS":1282.35,"GALAXY A36 5G 8GB 128GB":1633.55,"GALAXY A36 5G 8GB 128GB TAKSIT OTELEME":1655.66,"GALAXY A56 5G 8GB 128GB":2166.17,"GALAXY S25 256 GB":4162.56,"GALAXY S25 256 GB EGYG":4180.0,"GALAXY S25 256 GB EGYG PESIN":3142.79,"GALAXY S25 256 GB UPGRADERS":4177.0,"GALAXY S25 FE 8GB 256GB":3002.92,"GALAXY S25 FE 8GB 256GB EGYG":3003.71,"GALAXY S25 FE 8GB 256GB EGYG PESIN":2038.55,"GALAXY S25 FE 8GB 256GB UPGRADERS":3003.72,"GALAXY S25 PLUS 256 GB":4998.92,"GALAXY S25 PLUS 256 GB EGYG":4973.57,"GALAXY S25 PLUS 256 GB EGYG PESIN":3312.11,"GALAXY S25 PLUS 256 GB UPGRADERS":4973.59,"GALAXY S25 ULTRA 1 TB":8565.63,"GALAXY S25 ULTRA 1 TB EGYG":8487.97,"GALAXY S25 ULTRA 1 TB EGYG PESIN":5796.76,"GALAXY S25 ULTRA 1 TB UPGRADERS":8487.98,"GALAXY S25 ULTRA 512 GB":6708.84,"GALAXY S25 ULTRA 512 GB EGYG":6683.49,"GALAXY S25 ULTRA 512 GB EGYG PESIN":4420.23,"GALAXY S25 ULTRA 512 GB UPGRADERS":6683.49,"GALAXY S26 12GB 256GB":5618.72,"GALAXY S26 PLUS 12GB 256GB":6532.05,"GALAXY S26 ULTRA 12GB 256GB":8454.5,"GALAXY S26 ULTRA 12GB 512GB":9307.1,"GALAXY S26 ULTRA 16GB 1TB":10761.3,"GALAXY Z FLIP 7 12GB 256GB":5487.26,"GALAXY Z FLIP 7 12GB 512GB":6173.6,"GALAXY Z FLIP 7 FE 8GB 128GB":4683.94,"GALAXY Z FLIP 7 FE 8GB 256GB":4975.32,"GALAXY Z FOLD 7 12GB 256GB":8482.72,"GALAXY Z FOLD 7 12GB 512GB":8950.87,"GALAXY Z FOLD 7 16GB 1TB":9854.92,"GM 26 PRO 5G 8GB 256GB":1754.56,"HOT 60 PRO 8GB 256GB":1634.85,"HOT 60 PRO PLUS 8GB 256GB":2113.58,"HOT 60I 6GB 128GB":1182.15,"HOT 60I 8GB 256GB":1350.52,"IPHONE 13 128GB":2926.26,"IPHONE 13 128GB SEGMENTED":2926.26,"IPHONE 14 128GB":3263.94,"IPHONE 14 128GB SEGMENTED":3263.94,"IPHONE 14 256GB":3714.14,"IPHONE 15 128GB":3555.62,"IPHONE 15 128GB EGYG":3468.95,"IPHONE 15 128GB EGYG PESIN":2802.36,"IPHONE 15 128GB MUSTERI OZEL":3398.38,"IPHONE 15 128GB SEGMENTED":3272.53,"IPHONE 15 256GB":3940.71,"IPHONE 15 512GB":5740.1,"IPHONE 15 PLUS 128GB":5252.42,"IPHONE 15 PLUS 256GB":5665.05,"IPHONE 15 PLUS 512GB":6490.5,"IPHONE 16 128GB":4239.43,"IPHONE 16 128GB EGYG":4137.93,"IPHONE 16 128GB EGYG PESIN":3502.96,"IPHONE 16 128GB SEGMENTED":4069.56,"IPHONE 16 PLUS 128GB":5777.67,"IPHONE 16 PLUS 128GB SEGMENTED":5777.67,"IPHONE 16E 128 GB":3270.68,"IPHONE 16E 128 GB EGYG":2849.09,"IPHONE 16E 128 GB EGYG PESIN":2460.17,"IPHONE 16E 128 GB SEGMENTED":2657.73,"IPHONE 16E 256 GB":3617.88,"IPHONE 16E 512 GB":4467.7,"IPHONE 17 256 GB":5111.3,"IPHONE 17 256 GB EGYG":4987.99,"IPHONE 17 256 GB EGYG PESIN":4368.75,"IPHONE 17 256 GB SEGMENTED":5112.8,"IPHONE 17 512 GB":5891.86,"IPHONE 17 PRO 1 TB":9904.54,"IPHONE 17 PRO 256 GB":7069.69,"IPHONE 17 PRO 256 GB  EGYG":6900.75,"IPHONE 17 PRO 256 GB EGYG PESIN":5905.53,"IPHONE 17 PRO 256 GB SEGMENTED":7071.71,"IPHONE 17 PRO 512 GB":7858.28,"IPHONE 17 PRO MAX 1TB":10805.05,"IPHONE 17 PRO MAX 256 GB":7858.51,"IPHONE 17 PRO MAX 256 GB EGYG":7667.12,"IPHONE 17 PRO MAX 256 GB EGYG PESIN":6668.04,"IPHONE 17 PRO MAX 256 GB SEGMENTED":7858.28,"IPHONE 17 PRO MAX 2TB":12680.91,"IPHONE 17 PRO MAX 512 GB":8644.85,"IPHONE 17E 256GB":3323.7,"IPHONE 17E 256GB EGYG":3189.5,"IPHONE 17E 256GB EGYG PESIN":3366.12,"IPHONE 17E 512GB":5027.27,"IPHONE AIR 1TB":9154.24,"IPHONE AIR 256 GB":6421.73,"IPHONE AIR 256 GB SEGMENTED":5909.74,"IPHONE AIR 512 GB":7202.84,"MATE X7 ONLINE OZEL":11051.24,"NEO 3 5G 8GB 12GB 256GB":1370.87,"NEO 3 5G 8GB 256GB TAKSIT OTELEME":1293.15,"NOVA 13 256 GB":2505.15,"NOVA 14 PRO ONLINE OZEL":3400.17,"O1 NEXT 5G 8GB 128GB":1015.38,"ONETOUCH 4042S":361.3,"ONETOUCH 4042S 3G SUNSET":377.12,"ONETOUCH 5041":301.93,"ONETOUCH 5041 3G SUNSET":332.56,"P10 TUSLU CEP TELEFONU":347.77,"PHILIPS E6105 4G TUSLU CEP TELEFONU":313.13,"PHONE 1 8GB 256GB":1691.1,"PHONE 1 8GB 256GB TAKSIT OTELEME":1691.1,"REDMI 15 8GB 256GB":1224.29,"REDMI 15C 5G 8GB 256GB":1207.25,"REDMI 15C 5G 8GB 256GB TAKSIT OTELEME":1232.3,"REDMI 15C 6GB 128GB":797.18,"REDMI 15T 12GB 256GB":3501.67,"REDMI 15T 12GB 512GB":3737.12,"REDMI 15T PRO 12GB 256GB":4397.88,"REDMI 15T PRO 12GB 512GB":4684.57,"REDMI NOTE 14 5G 8GB 256GB":1647.18,"REDMI NOTE 14 8GB 128GB":1190.58,"REDMI NOTE 14 8GB 256GB":1395.13,"REDMI NOTE 14 PRO 5G 512GB":2391.49,"REDMI NOTE 14 PRO 8GB 256GB":1862.49,"REDMI NOTE 15 8GB 256GB":1446.97,"REDMI NOTE 15 8GB 256GB EGYG PESIN":1194.6,"REDMI NOTE 15 PRO 5G 8GB 256GB":2237.25,"REDMI NOTE 15 PRO 8GB 256GB":1609.49,"REDMI NOTE 15 PRO 8GB 256GB EGYG":1649.05,"REDMI NOTE 15 PRO PLUS 5G 8GB 256GB":2747.0,"REDMI15C 8GB 256GB":977.28,"RENO14 F 5G 12GB 256GB":2530.92,"RENO14 F 5G 12GB 256GB ONLINE OZEL":1674.17,"RENO15 5G 12GB 256GB":2765.51,"RENO15 F 5G 12GB 256GB":3203.58,"RENO15 F 5G 12GB 256GB ONLINE OZEL":3203.57,"SPARK 40 5G 6GB 128GB":1203.81,"SPARK 40 5G 6GB 128GB 6 AY OZEL":1204.19,"SPARK 40 5G 6GB 128GB EGYG":1197.32,"SPARK 40 5G 6GB 128GB EGYG PESIN":853.57,"SPARK 40 5G 8GB 256GB":1547.69,"SPARK 40 8GB 256GB":1350.07,"SPARK 40C 4GB 128GB":1009.74,"SPARK 40C 4GB 128GB ONLINE OZEL":777.64,"SPARK 40C 4GB 128GB TAKSIT OTELEME":964.3,"SPARK SLIM 5G 8GB 256GB":1670.75,"SPARK SLIM 5G 8GB 256GB MUSTERI OZEL":1579.45,"SPARK SLIM 5G 8GB 256GB ONLINE OZEL":1290.87,"SPARK SLIM 5G 8GB 256GB TAKSIT OTELEME":1663.76,"SUPERBOX PLUG PLAY MF286R ZTE":40.0,"V50 DESIGN 8GB 256GB":871.12,"V60 LITE 5G 12GB 256GB":2021.64,"V60 LITE 5G 12GB 256GB EGYG":1923.2,"V60 LITE 5G 12GB 256GB EGYG PESIN":1299.55,"V60 LITE 5G 12GB 256GB MUSTERI OZEL":1960.46,"V60 LITE 8GB 256GB":1603.07,"V60 LITE 8GB 256GB ONLINE OZEL":1274.41,"V70 5G 12GB 256GB":4697.16,"V70 8GB 256GB":1082.56,"V70 FE 5G 8GB 256GB":3197.92,"VIA A40 256 GB":1225.36,"VIA M45 6GB 128GB":862.37,"VIA M45 6GB 128GB TAKSIT OTELEME":880.65,"VIA X45 8GB 256GB":1394.73,"X200 FE 12GB 256GB":4471.0,"X300 16GB 512GB":6639.8,"X300 16GB 512GB EGYG":6477.8,"X300 16GB 512GB EGYG PESIN":4179.44,"X300 PRO 16GB 512GB":8416.22,"X300 PRO 16GB 512GB EGYG":8246.75,"X300 PRO 16GB 512GB EGYG PESIN":5491.81,"X4 6GB 128GB":613.91,"XENIUM E6500":278.88,"XENIUM E6500 3G SUNSET":278.88,"Y04 4GB 128GB":919.62,"Y29S 5G 6GB 128GB":1178.01,"Y29S 5G 6GB 128GB TAKSIT OTELEME":1062.48,"Y29S 5G 8GB 256GB":1288.54,"Y29S 5G 8GB 256GB ONLINE OZEL":975.23,"Y29S 5G 8GB 256GB TAKSIT OTELEME":1284.36,"Y31 5G 6GB 256GB":1645.52,"Y31 5G 8GB 256GB":1883.78};

let NTC_KEYS=Object.keys(NTC_DB);
const NTC_ALIASES={'SAMSUNG':'GALAXY','APPLE':'IPHONE','OPPO':'RENO','INFINIX':'HOT'};
function ntcAutoComplete(){
  let q=document.getElementById('ntcModelSearch').value.trim().toUpperCase();
  q=q.replace(/İ/g,'I').replace(/Ğ/g,'G').replace(/Ü/g,'U').replace(/Ş/g,'S').replace(/Ö/g,'O').replace(/Ç/g,'C');
  const box=document.getElementById('ntcSuggestions');
  if(q.length<2){box.style.display='none';return;}
  // Marka kısayolları
  Object.keys(NTC_ALIASES).forEach(a=>{if(q.startsWith(a))q=q.replace(a,NTC_ALIASES[a]);});
  const matches=NTC_KEYS.filter(k=>k.includes(q)).slice(0,10);
  if(!matches.length){box.innerHTML='<div style="padding:10px;color:var(--gray);font-size:11px">Sonuç yok. Samsung→Galaxy, Apple→iPhone olarak arayın</div>';box.style.display='block';return;}
  box.innerHTML=matches.map(k=>{
    const prim=NTC_DB[k];
    const safeK=k.replace(/"/g,'&quot;');
    return `<div style="padding:8px 12px;cursor:pointer;border-bottom:1px solid #f0f0f0;font-size:12px;display:flex;justify-content:space-between" onmouseover="this.style.background='#f5f6f8'" onmouseout="this.style.background=''" onclick="ntcSelectModel(&quot;${safeK}&quot;)"><span style="font-weight:600">${k}</span><span style="color:var(--green);font-weight:700">${fmtTL(prim)}</span></div>`;
  }).join('');
  box.style.display='block';
}
function ntcSelectModel(model){
  const prim=NTC_DB[model]||0;
  document.getElementById('ntcModelSearch').value=model;
  document.getElementById('sManuelQuick').value=Math.round(prim);
  document.getElementById('sAcQuick').value=model;
  document.getElementById('ntcSuggestions').style.display='none';
  showToast('📱 '+model+' — Prim: '+fmtTL(prim));
}

// NTC Excel Yükleme
let _ntcUploadData=null;
async function previewNtcUpload(input){
  const file=input.files[0];if(!file)return;
  const prev=document.getElementById('ntcUploadPreview');
  const acts=document.getElementById('ntcUploadActions');
  try{
    let rows=[];
    if(file.name.endsWith('.csv')){
      const txt=await file.text();
      rows=txt.split('\n').filter(r=>r.trim()).map(r=>r.split(/[,;\t]/).map(c=>c.trim().replace(/^"|"$/g,'')));
    }else{
      const XLSX=await import('https://cdn.sheetjs.com/xlsx-0.20.1/package/xlsx.mjs');
      const ab=await file.arrayBuffer();
      const wb=XLSX.read(ab);
      const ws=wb.Sheets[wb.SheetNames[0]];
      rows=XLSX.utils.sheet_to_json(ws,{header:1});
    }
    if(rows.length<2){throw new Error('Dosyada yeterli veri yok');}

    // Sütun başlıklarını göster — kullanıcı doğru sütunu seçsin
    const headers=rows[0]||[];
    let colHtml='<div style="background:#fff3cd;border:1px solid #ffc107;border-radius:8px;padding:10px;margin-bottom:10px;font-size:11px">';
    colHtml+='<strong>📋 Sütunlar ('+headers.length+' adet):</strong><br>';
    colHtml+='<div style="display:flex;gap:6px;margin-top:6px;flex-wrap:wrap">';
    colHtml+='<div><label style="font-size:10px;color:var(--gray)">Model Sütunu:</label><select id="ntcColModel" style="font-size:11px;padding:4px;border-radius:4px;border:1px solid var(--border)" onchange="refreshNtcPreview()">';
    headers.forEach(function(h,ci){colHtml+='<option value="'+ci+'"'+(ci===0?' selected':'')+'>'+ci+': '+String(h).substring(0,20)+'</option>';});
    colHtml+='</select></div>';
    colHtml+='<div><label style="font-size:10px;color:var(--gray)">Prim (₺) Sütunu:</label><select id="ntcColPrim" style="font-size:11px;padding:4px;border-radius:4px;border:1px solid var(--border)" onchange="refreshNtcPreview()">';
    headers.forEach(function(h,ci){colHtml+='<option value="'+ci+'"'+(ci===1?' selected':'')+'>'+ci+': '+String(h).substring(0,20)+'</option>';});
    colHtml+='</select></div></div></div>';

    window._ntcRawRows=rows;
    prev.innerHTML=colHtml+'<div id="ntcPreviewTable"></div>';
    prev.style.display='block';
    refreshNtcPreview();
  }catch(e){
    prev.innerHTML='<div style="color:var(--red);font-size:11px">Dosya okunamadı: '+e.message+'</div>';
    prev.style.display='block';acts.style.display='none';
  }
}
function refreshNtcPreview(){
  const rows=window._ntcRawRows;if(!rows)return;
  const colM=parseInt(document.getElementById('ntcColModel').value)||0;
  const colP=parseInt(document.getElementById('ntcColPrim').value)||1;
  const acts=document.getElementById('ntcUploadActions');

  const dataRows=rows.slice(1).filter(function(r){return r[colM]&&String(r[colM]).trim()&&!isNaN(parseFloat(r[colP]));});

  // Duplikat temizle
  const unique={};
  dataRows.forEach(function(r){
    const model=String(r[colM]).trim().toUpperCase();
    const prim=parseFloat(r[colP])||0;
    unique[model]=prim;
  });
  const uniqueList=Object.keys(unique).map(function(k){return[k,unique[k]];});
  _ntcUploadData=uniqueList;

  // Prim kontrolü — çoğu ₺10'dan azsa uyarı ver
  const lowCount=uniqueList.filter(function(r){return r[1]<10;}).length;
  const warnHtml=lowCount>uniqueList.length*0.5?'<div style="background:#fff3cd;border:1px solid #ffc107;border-radius:6px;padding:8px;margin-bottom:8px;font-size:10px;color:#856404">⚠️ Primlerin çoğu ₺10 altında! <strong>Yanlış sütun seçmiş olabilirsiniz.</strong> Prim sütununu kontrol edin.</div>':'';

  const dupCount=dataRows.length-uniqueList.length;
  let html=warnHtml+'<div style="background:#f7f8fa;border-radius:8px;padding:10px;font-size:11px">';
  html+='<div style="color:var(--green);font-weight:700;margin-bottom:6px">✓ '+uniqueList.length+' benzersiz model'+(dupCount>0?' <span style="color:var(--yellow)">('+dupCount+' duplikat temizlendi)</span>':'')+'</div>';
  html+='<table style="width:100%;font-size:10px"><thead><tr style="background:#eee"><th>Model</th><th style="text-align:right">Prim (₺)</th></tr></thead><tbody>';
  uniqueList.slice(0,5).forEach(function(r){
    html+='<tr><td>'+r[0]+'</td><td style="text-align:right;color:var(--green);font-weight:600">'+fmtTL(r[1])+'</td></tr>';
  });
  if(uniqueList.length>5)html+='<tr><td colspan="2" style="text-align:center;color:var(--gray)">... ve '+(uniqueList.length-5)+' model daha</td></tr>';
  html+='</tbody></table></div>';
  document.getElementById('ntcPreviewTable').innerHTML=html;
  acts.innerHTML='<button class="btn btn-p" onclick="processNtcUpload()">✓ '+uniqueList.length+' Modeli Yükle</button><button class="btn btn-g" onclick="cancelNtcUpload()">İptal</button>';
  acts.style.display='flex';
}
function cancelNtcUpload(){
  _ntcUploadData=null;
  window._ntcRawRows=null;
  document.getElementById('ntcUploadPreview').style.display='none';
  document.getElementById('ntcUploadActions').style.display='none';
  document.getElementById('ntcFile').value='';
}
async function processNtcUpload(){
  if(!_ntcUploadData||!_ntcUploadData.length){showToast('Yüklenecek veri yok!',true);return;}
  showLoading(true);
  try{
    const batch=_ntcUploadData.map(function(r){return{model:r[0],prim:r[1]||0};});
    // Tabloyu temizle
    const delRes=await sb.from('ntc_primler').delete().gt('prim',-999999);
    if(delRes.error)console.log('Silme uyarı:',delRes.error.message);
    // 200'er batch yükle (daha küçük batch = daha güvenli)
    let loaded=0;
    for(var i=0;i<batch.length;i+=200){
      var chunk=batch.slice(i,i+200);
      var res=await sb.from('ntc_primler').insert(chunk);
      if(res.error){
        console.error('Batch hatası ('+i+'):',res.error.message);
        // Hatalı batch'i tek tek dene
        for(var j=0;j<chunk.length;j++){
          var r2=await sb.from('ntc_primler').upsert([chunk[j]],{onConflict:'model'});
          if(!r2.error)loaded++;
        }
      }else{loaded+=chunk.length;}
    }
    NTC_DB={};
    batch.forEach(function(r){NTC_DB[r.model]=r.prim;});
    NTC_KEYS=Object.keys(NTC_DB);
    showToast('✓ '+loaded+'/'+batch.length+' model yüklendi!');
    cancelNtcUpload();
    updateNtcCount();
  }catch(e){showToast('Yükleme hatası: '+e.message,true);}
  showLoading(false);
}
async function loadNtcPrimler(){
  try{
    let all=[];let from=0;
    while(true){
      const{data,error}=await sb.from('ntc_primler').select('model,prim').range(from,from+999);
      if(error)throw error;
      if(!data||data.length===0)break;
      all=all.concat(data);
      if(data.length<1000)break;
      from+=1000;
    }
    if(all.length>0){
      NTC_DB={};
      all.forEach(function(r){NTC_DB[r.model]=r.prim;});
      NTC_KEYS=Object.keys(NTC_DB);
      console.log('NTC Supabase: '+all.length+' model yüklendi');
    }
  }catch(e){console.log('NTC tablo yok veya hata, varsayılan kullanılıyor:',e.message);}
}
function updateNtcCount(){
  const el=document.getElementById('ntcModelCount');
  if(el)el.textContent=NTC_KEYS.length;
}
function showNtcList(){
  const el=document.getElementById('ntcListView');
  if(!el)return;
  if(el.style.display!=='none'){el.style.display='none';return;}
  const sorted=NTC_KEYS.slice().sort();
  let html='<table style="width:100%;font-size:10px"><thead><tr style="background:#f5f6f8;position:sticky;top:0"><th>Model</th><th style="text-align:right">Prim (₺)</th></tr></thead><tbody>';
  sorted.forEach(function(k){
    html+='<tr><td>'+k+'</td><td style="text-align:right;color:var(--green);font-weight:600">'+fmtTL(NTC_DB[k])+'</td></tr>';
  });
  html+='</tbody></table>';
  el.innerHTML=html;el.style.display='block';
}
// Dışarı tıklayınca kapan
document.addEventListener('click',function(e){
  const box=document.getElementById('ntcSuggestions');
  if(box&&!e.target.closest('#ntcSearchRow'))box.style.display='none';
});

async function quickAddSale(pi){
  const p=products[pi];
  if(p.manuel){
    pendingManuelProd=pi;
    document.getElementById('manuelPopupTitle').textContent=p.name+' — Karlılık girin';
    document.getElementById('sManuelQuick').value=0;
    document.getElementById('sAcQuick').value='';
    // NTC ise model arama göster
    const ntcRow=document.getElementById('ntcSearchRow');
    if(pi===15&&typeof NTC_DB!=='undefined'){
      ntcRow.style.display='block';
      document.getElementById('ntcModelSearch').value='';
      document.getElementById('ntcSuggestions').style.display='none';
    }else{
      ntcRow.style.display='none';
    }
    document.getElementById('manuelPopup').style.display='block';
    if(pi===15&&typeof NTC_DB!=='undefined'){
      document.getElementById('ntcModelSearch').focus();
    }else{
      document.getElementById('sManuelQuick').focus();
    }
    return;
  }
  const obj={
    emp:parseInt(document.getElementById('sEmp').value),
    prod:pi,qty:1,
    date:document.getElementById('sDate').value,
    manuel_prim:0,aciklama:''
  };
  try{
    const data=await dbAddSale(obj);
    sales.unshift(data);
    showToast('✓ '+p.name+' eklendi!');
    renderSaleTiles();refreshAll();
  }catch(e){showToast('Hata: '+e.message,true);}
}


async function confirmManuelSale(){
  if(pendingManuelProd===null)return;
  const p=products[pendingManuelProd];
  const obj={
    emp:parseInt(document.getElementById('sEmp').value),
    prod:pendingManuelProd,qty:1,
    date:document.getElementById('sDate').value,
    manuel_prim:parseFloat(document.getElementById('sManuelQuick').value)||0,
    aciklama:document.getElementById('sAcQuick').value.trim()
  };
  try{
    const data=await dbAddSale(obj);
    sales.unshift(data);
    showToast('✓ '+p.name+' eklendi!');
    document.getElementById('manuelPopup').style.display='none';
    document.getElementById('ntcSearchRow').style.display='none';
    pendingManuelProd=null;
    renderSaleTiles();refreshAll();
  }catch(e){showToast('Hata: '+e.message,true);}
}
function cancelManuelSale(){document.getElementById('manuelPopup').style.display='none';document.getElementById('ntcSearchRow').style.display='none';pendingManuelProd=null;}

function closeSaleModal(){document.getElementById('saleOv').classList.remove('open');}

async function saveSaleEdit(){
  const editId=document.getElementById('editId').value;
  const pi=parseInt(document.getElementById('sProdEdit').value);
  const p=products[pi];
  const obj={
    emp:parseInt(document.getElementById('sEmpEdit').value),
    prod:pi,
    qty:parseInt(document.getElementById('sQtyEdit').value)||1,
    date:document.getElementById('sDateEdit').value,
    manuel_prim:p.manuel?parseFloat(document.getElementById('sManuelEdit').value)||0:0,
    aciklama:p.aciklama?document.getElementById('sAcEdit').value.trim():''
  };
  try{
    await dbUpdateSale(editId,obj);
    const idx=sales.findIndex(s=>s.id===editId);
    if(idx>=0)sales[idx]={...sales[idx],...obj};
    showToast('✓ Satış güncellendi!');
    closeSaleModal();refreshAll();
  }catch(e){showToast('Hata: '+e.message,true);}
}

// Toplu silme
function topluSilMenu(){
  const p=document.getElementById('topluSilPanel');
  const b=document.getElementById('topluSilButtons');
  const g1=crmMusteriler.filter(m=>m.grup===1).length;
  const g2=crmMusteriler.filter(m=>m.grup===2).length;
  const g3=crmMusteriler.filter(m=>m.grup===3).length;
  const g4=crmMusteriler.filter(m=>m.grup===4).length;
  b.innerHTML=`
    <button class="btn btn-d bsm" onclick="topluSil(0)">Tümünü Sil (${crmMusteriler.length})</button>
    <button class="btn btn-d bsm" onclick="topluSil(1)">Grup 1 (${g1})</button>
    <button class="btn btn-d bsm" onclick="topluSil(2)">Grup 2 (${g2})</button>
    <button class="btn btn-d bsm" onclick="topluSil(3)">Grup 3 (${g3})</button>
    <button class="btn btn-d bsm" onclick="topluSil(4)">Grup 4 (${g4})</button>
    <button class="btn btn-g bsm" onclick="document.getElementById('topluSilPanel').style.display='none'">İptal</button>`;
  p.style.display=p.style.display==='none'?'block':'none';
}
async function topluSil(grup){
  const list=grup===0?crmMusteriler:crmMusteriler.filter(m=>m.grup===grup);
  const cnt=list.length;
  if(!cnt){showToast('Silinecek müşteri yok',true);return;}
  const msg=grup===0?`TÜM ${cnt} müşteri silinecek!`:`Grup ${grup}: ${cnt} müşteri silinecek!`;
  if(!confirm('⚠️ '+msg+'\n\nBu işlem geri alınamaz!\nDevam etmek istiyor musunuz?'))return;
  if(!confirm('EMIN MISINIZ? '+cnt+' müşteri kalıcı olarak silinecek.'))return;
  try{
    showToast('⏳ Siliniyor...');
    if(grup===0){
      await sb.from('musteriler').delete().neq('id','00000000-0000-0000-0000-000000000000');
      crmMusteriler=[];
    }else{
      const ids=list.map(m=>m.id);
      for(let i=0;i<ids.length;i+=100){
        const batch=ids.slice(i,i+100);
        await sb.from('musteriler').delete().in('id',batch);
      }
      crmMusteriler=crmMusteriler.filter(m=>m.grup!==grup);
    }
    document.getElementById('topluSilPanel').style.display='none';
    showToast(`✓ ${cnt} müşteri silindi`);
    renderCrmList();updateCrmBadge();
  }catch(e){showToast('Hata: '+e.message,true);}
}

async function editSale(id){openSaleModal(id);}

async function deleteSale(id){
  if(!confirm('Bu satışı silmek istiyor musunuz?'))return;
  try{
    await dbDeleteSale(id);
    sales=sales.filter(s=>s.id!==id);
    showToast('Satış silindi');refreshAll();
  }catch(e){showToast('Hata: '+e.message,true);}
}

function openMuafModal(){
  document.getElementById('mEmp').innerHTML=employees.map((e,i)=>`<option value="${i}">${e.name}</option>`).join('');
  document.getElementById('mAy').innerHTML=MONTHS.map((m,i)=>`<option value="${i}" ${i===activeMonth?'selected':''}>${m} ${activeYear}</option>`).join('');
  document.getElementById('mNeden').value='';
  document.getElementById('muafOv').classList.add('open');
}
function openMuafModalForEmp(ei){openMuafModal();document.getElementById('mEmp').value=ei;}
function closeMuafModal(){document.getElementById('muafOv').classList.remove('open');}

async function saveMuafiyet(){
  const emp=parseInt(document.getElementById('mEmp').value);
  const ay=parseInt(document.getElementById('mAy').value);
  if(muafiyetler.some(m=>m.emp===emp&&m.ay===ay&&m.yil===activeYear)){showToast('⚠️ Bu çalışan için bu ay zaten muafiyet var!',true);return;}
  const obj={emp,ay,yil:activeYear,neden:document.getElementById('mNeden').value.trim()||'Belirtilmedi',tarih:new Date().toLocaleDateString('tr-TR')};
  try{
    const data=await dbAddMuafiyet(obj);
    muafiyetler.unshift(data);
    closeMuafModal();showToast('✓ Muafiyet kaydedildi!');refreshAll();
  }catch(e){showToast('Hata: '+e.message,true);}
}

async function deleteMuafiyet(id){
  if(!confirm('Muafiyeti silmek istiyor musunuz?'))return;
  try{
    await dbDeleteMuafiyet(id);
    muafiyetler=muafiyetler.filter(m=>m.id!==id);
    showToast('Muafiyet silindi');refreshAll();
  }catch(e){showToast('Hata: '+e.message,true);}
}

let aktivasyonMonth=null,aktivasyonYear=null;
function shiftAktivasyonMonth(d){
  if(aktivasyonMonth===null){aktivasyonMonth=activeMonth;aktivasyonYear=activeYear;}
  aktivasyonMonth+=d;
  if(aktivasyonMonth<0){aktivasyonMonth=11;aktivasyonYear--;}
  if(aktivasyonMonth>11){aktivasyonMonth=0;aktivasyonYear++;}
  renderAktivasyonTesvık();
}

function renderAktivasyonTesvık(){
  if(aktivasyonMonth===null){aktivasyonMonth=activeMonth;aktivasyonYear=activeYear;}
  const lbl=document.getElementById('aktivasyonMonthLabel');
  if(lbl) lbl.textContent=MONTHS[aktivasyonMonth]+' '+aktivasyonYear;
  // POS ciro input'a kaydedilmiş değeri yükle
  const posCiroEl=document.getElementById('posCiro');
  if(posCiroEl&&posCiroEl!==document.activeElement)posCiroEl.value=posCiro;
  const ms=getMonthSales(aktivasyonMonth,aktivasyonYear);
  const tot=getTotalStats(aktivasyonMonth,aktivasyonYear);
  // HGO adet bazlı (sunum: Toplam_HGO = Toplam abonelik / Toplam hedef)
  const _ab=getToplamAbonelikAdet(aktivasyonMonth,aktivasyonYear);
  const pct=tdmToplamHedef>0?(_ab.toplam/tdmToplamHedef)*100:0;

  // Toplam aktivasyon (Faturalı YT+MNT+Data+Switch + ÖnÖd YT+MNT + TC Rahat YT+MNT + SOL)
  let toplamAkt=0, faturaliAkt=0;
  ms.forEach(s=>{
    const p=products[s.prod];
    toplamAkt+=s.qty;
    // Faturalı: postpaid tip (Rahat hariç — indekse göre)
    if(p.tip==='postpaid'&&s.prod!==9)faturaliAkt+=s.qty; // 9=Rahattan Faturalıya
  });

  // HGO çarpanı
  let hgoCarpan=0;
  if(pct>=110)hgoCarpan=3;
  else if(pct>=100)hgoCarpan=2;

  // Aktivasyon çarpanı
  let adetCarpan=0;
  if(toplamAkt>=100)adetCarpan=2;
  else if(toplamAkt>=50)adetCarpan=1;

  const toplamCarpan=hgoCarpan+adetCarpan;
  const currentPosCiro=parseFloat(document.getElementById('posCiro').value)||0;
  const primTutari=Math.round(currentPosCiro*(toplamCarpan/100));

  // Koşul kontrolü
  const kosulOk=faturaliAkt>=5&&(pct>=100||toplamAkt>=50);

  // HGO göster
  document.getElementById('atHgo').textContent='%'+Math.round(pct);
  document.getElementById('atHgoLabel').textContent=pct>=110?'🔥 Süper (×1.1)':pct>=100?'✓ Hedef (×1.0)':pct>=70?'⚠️ Düşük':'✗ Hedef Altı';
  document.getElementById('atAdet').textContent=toplamAkt;
  document.getElementById('atFaturali').textContent=faturaliAkt;

  // HGO tablo
  const hgoRows=[
    {label:'HGO <%100',carpan:'%0',active:pct<100},
    {label:'HGO ≥%100',carpan:'%2',active:pct>=100&&pct<110},
    {label:'HGO ≥%110',carpan:'%3',active:pct>=110},
  ];
  document.getElementById('atHgoTable').innerHTML=hgoRows.map(r=>`
    <div class="tr2" style="${r.active?'background:rgba(230,168,0,0.06);':''}">
      <div class="tn" style="${r.active?'font-weight:700;color:var(--yellow)':''}">${r.label} ${r.active?'◀':''}</div>
      <div style="font-family:'Bebas Neue';font-size:18px;color:${r.active?'var(--yellow)':'var(--gray)'}">${r.carpan}</div>
    </div>`).join('');

  // Aktivasyon tablo
  const adetRows=[
    {label:'0 – 50 adet',carpan:'%0',active:toplamAkt<50},
    {label:'50 – 100 adet',carpan:'%1',active:toplamAkt>=50&&toplamAkt<100},
    {label:'≥100 adet',carpan:'%2',active:toplamAkt>=100},
  ];
  document.getElementById('atAdetTable').innerHTML=adetRows.map(r=>`
    <div class="tr2" style="${r.active?'background:rgba(230,168,0,0.06);':''}">
      <div class="tn" style="${r.active?'font-weight:700;color:var(--yellow)':''}">${r.label} ${r.active?'◀':''}</div>
      <div style="font-family:'Bebas Neue';font-size:18px;color:${r.active?'var(--yellow)':'var(--gray)'}">${r.carpan}</div>
    </div>`).join('');

  // Sonuç kutusu
  const sonucRenk=kosulOk?'var(--green)':'var(--red)';
  document.getElementById('atSonucBox').innerHTML=`
  <div style="background:#fff;border-radius:14px;border:2px solid ${kosulOk?'rgba(0,168,107,0.3)':'rgba(230,57,70,0.2)'};padding:20px;box-shadow:0 2px 10px rgba(0,0,0,0.06);">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
      <div>
        <div style="font-family:'Bebas Neue';font-size:16px;letter-spacing:1px;color:var(--gray)">TAHMİNİ AKTİVASYON TEŞVİK PRİMİ</div>
        <div style="font-size:11px;color:var(--gray);margin-top:2px">${MONTHS[activeMonth]} ${activeYear}</div>
      </div>
      <div style="font-family:'Bebas Neue';font-size:36px;color:${kosulOk?'var(--green)':'var(--red)'}">${kosulOk?fmtTL(primTutari):'Koşul Sağlanmadı'}</div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:14px;">
      <div style="background:#f5f6f8;border-radius:9px;padding:10px;text-align:center;">
        <div style="font-size:9px;color:var(--gray);letter-spacing:1px;margin-bottom:4px">POS CİROSU</div>
        <div style="font-family:'Bebas Neue';font-size:18px;color:#1a1a2e">${fmtTL(currentPosCiro)}</div>
      </div>
      <div style="background:#f5f6f8;border-radius:9px;padding:10px;text-align:center;">
        <div style="font-size:9px;color:var(--gray);letter-spacing:1px;margin-bottom:4px">HGO ÇARPANI</div>
        <div style="font-family:'Bebas Neue';font-size:18px;color:${hgoCarpan>0?'var(--green)':'var(--red)'}">%${hgoCarpan}</div>
      </div>
      <div style="background:#f5f6f8;border-radius:9px;padding:10px;text-align:center;">
        <div style="font-size:9px;color:var(--gray);letter-spacing:1px;margin-bottom:4px">AKT. ÇARPANI</div>
        <div style="font-family:'Bebas Neue';font-size:18px;color:${adetCarpan>0?'var(--green)':'var(--red)'}">%${adetCarpan}</div>
      </div>
      <div style="background:${kosulOk?'rgba(0,168,107,0.08)':'rgba(230,57,70,0.06)'};border-radius:9px;padding:10px;text-align:center;border:1px solid ${kosulOk?'rgba(0,168,107,0.2)':'rgba(230,57,70,0.2)'}">
        <div style="font-size:9px;color:var(--gray);letter-spacing:1px;margin-bottom:4px">TOPLAM ÇARPAN</div>
        <div style="font-family:'Bebas Neue';font-size:18px;color:${sonucRenk}">%${toplamCarpan}</div>
      </div>
    </div>
    <div style="background:#f5f6f8;border-radius:9px;padding:10px 14px;">
      <div style="font-size:11px;color:var(--gray);margin-bottom:6px;font-weight:600">KOŞUL KONTROLÜ</div>
      <div style="display:flex;gap:16px;font-size:12px;flex-wrap:wrap;">
        <span style="color:${faturaliAkt>=5?'var(--green)':'var(--red)'}">${faturaliAkt>=5?'✓':'✗'} Min. 5 Faturalı (${faturaliAkt} adet)</span>
        <span style="color:${pct>=100?'var(--green)':'var(--gray)'}">${pct>=100?'✓':'—'} HGO ≥%100 (%${Math.round(pct)})</span>
        <span style="color:${toplamAkt>=50?'var(--green)':'var(--gray)'}">${toplamAkt>=50?'✓':'—'} Toplam ≥50 Aktivasyon (${toplamAkt})</span>
      </div>
      ${!kosulOk?`<div style="margin-top:8px;font-size:11px;color:var(--red);">⚠️ Prim için HGO ≥%100 VEYA toplam aktivasyon ≥50 koşullarından biri sağlanmalıdır.</div>`:''}
    </div>
  </div>`;
}

// ============================================================
// MÜŞTERİ TAKİP (CRM) SİSTEMİ
// ============================================================
let crmMusteriler=[];
let crmAramalar=[];
const CRM_GRUP_LABELS={1:'Postpaid 1 Yıl',2:'Prepaid MNT',3:'Prepaid Yeni Tesis',4:'Yapboz 6 Ay'};
const CRM_GRUP_COLORS={1:'var(--postpaid)',2:'var(--prepaid)',3:'var(--purple)',4:'var(--yellow)'};
const CRM_DURUM_LABELS={arandi:'✓ Arandı',ulasilamadi:'✗ Ulaşılamadı',mesgul:'📞 Meşgul'};
const CRM_SONUC_LABELS={taahhut_yenilendi:'✅ Taahhüt Yenilendi',postpaide_gecti:'✅ Postpaid\'e Geçti',musteri_hizmet_yeniledi:'❌ MH Yenilemiş',dusunuyor:'⏳ Düşünüyor',iptal_etti:'❌ Hattı İptal Etmiş',yedek_hat:'📲 Yedek Hat',operator_gecis:'📱 Operatör Geçişi',ikna_edilemedi:'🚫 İkna Edilemedi',istemiyor:'⛔ İstemiyor',yabanci_uyruklu:'🌍 Yabancı Uyruklu'};

// Kesin sonuçlar — müşteri döngüden çıkar
const KESIN_SONUCLAR=['taahhut_yenilendi','postpaide_gecti','musteri_hizmet_yeniledi','iptal_etti','operator_gecis','ikna_edilemedi','istemiyor','yedek_hat','yabanci_uyruklu'];

function calcHatirlatma(m){
  const g=parseInt(m.grup);
  const dates=[];
  if(g===1&&m.taahhut_bitis){
    const b=new Date(m.taahhut_bitis);
    [-60,-30,-7].forEach(d=>{const dt=new Date(b);dt.setDate(dt.getDate()+d);dates.push(dt);});
  } else if(g===2&&m.aktivasyon_tarihi){
    const a=new Date(m.aktivasyon_tarihi);
    [56,75].forEach(d=>{const dt=new Date(a);dt.setDate(dt.getDate()+d);dates.push(dt);});
  } else if(g===3&&(m.aktivasyon_tarihi||m.taahhut_bitis)){
    const t=new Date(m.aktivasyon_tarihi||m.taahhut_bitis);
    [35,60,85].forEach(d=>{const dt=new Date(t);dt.setDate(dt.getDate()+d);dates.push(dt);});
  } else if(g===4&&m.taahhut_bitis){
    const b=new Date(m.taahhut_bitis);
    [-60,-30,-7].forEach(d=>{const dt=new Date(b);dt.setDate(dt.getDate()+d);dates.push(dt);});
  }
  return dates.sort((a,b)=>a-b);
}

function getTodayCrmList(){
  const today=new Date().toISOString().split('T')[0];
  const todayD=new Date(today);
  return crmMusteriler.filter(m=>{
    // 1) Kesin sonuç varsa → döngüden çık
    if(KESIN_SONUCLAR.includes(m.sonuc))return false;
    // 2) Düşünüyor → Tekrar Aranacak listesinde, ana listede gösterme
    if(m.sonuc==='dusunuyor')return false;

    // Operatör geçişi özel kuralı
    if(m.sonuc==='operator_gecis'&&m.operator_taahhut_bitis){
      const bitis=new Date(m.operator_taahhut_bitis);
      const diff=Math.round((bitis-todayD)/86400000);
      if(m.operator_adi==='vodafone'&&diff<=30&&diff>=-7)return true;
      if(m.operator_adi==='telekom'&&diff<=7&&diff>=-3)return true;
      return false;
    }

    // 3) Hatırlatma tarihlerini al
    const dates=calcHatirlatma(m);
    if(!dates.length)return false;

    // Bugüne kadar olan hatırlatmaları bul
    const activeDates=dates.filter(d=>d.toISOString().split('T')[0]<=today);
    if(!activeDates.length)return false;

    // 30 günden eski hatırlatmaları atla
    const recentDates=activeDates.filter(d=>Math.round((todayD-d)/86400000)<=30);
    if(!recentDates.length)return false;

    // 4) Bu müşterinin arama geçmişini kontrol et
    const musteriAramalar=crmAramalar.filter(a=>a.musteri_id===m.id).sort((a,b)=>new Date(b.tarih)-new Date(a.tarih));

    if(!musteriAramalar.length)return true; // Hiç aranmamış → göster

    // En güncel aktif hatırlatma tarihini bul
    const currentReminder=recentDates[recentDates.length-1];
    const crStr=currentReminder.toISOString().split('T')[0];

    // Bu hatırlatma tarihinden sonraki aramalar
    const aramaAfter=musteriAramalar.filter(a=>a.tarih&&a.tarih.split('T')[0]>=crStr);

    if(!aramaAfter.length)return true; // Bu hatırlatma için henüz aranmamış → göster

    // Aramalar var — sonuçlarına bak
    const sonArama=aramaAfter[0]; // En son arama
    const sonSonuc=sonArama.sonuc||sonArama.durum||'';

    // Kesin sonuç aldıysa → bu hatırlatma bitti
    if(KESIN_SONUCLAR.includes(sonSonuc))return false;
    if(sonSonuc==='dusunuyor')return false;

    // Ulaşılamadı/Meşgul → max 3 deneme, 3 gün arayla
    if(sonSonuc==='ulasilamadi'||sonSonuc==='mesgul'){
      if(aramaAfter.length>=3)return false; // 3 kez denendi, bu döngü bitti
      const sonTarih=new Date(sonArama.tarih);
      const gunFark=Math.round((todayD-sonTarih)/86400000);
      if(gunFark<3)return false; // 3 gün bekle
      return true; // 3 gün geçti, tekrar göster
    }

    // Arandı ama sonuç girilmemiş → gösterme (zaten işlem yapılmış)
    if(aramaAfter.length>0)return false;

    return true;
  }).sort((a,b)=>{
    const da=calcHatirlatma(a)[0]||new Date('2099-01-01');
    const db=calcHatirlatma(b)[0]||new Date('2099-01-01');
    return da-db;
  });
}

function getUpcomingCrmList(){
  const today=new Date().toISOString().split('T')[0];
  const next7=new Date();next7.setDate(next7.getDate()+7);
  const next7s=next7.toISOString().split('T')[0];
  return crmMusteriler.filter(m=>{
    if(KESIN_SONUCLAR.includes(m.sonuc))return false;
    if(m.sonuc==='dusunuyor')return false;
    const dates=calcHatirlatma(m);
    return dates.some(d=>{
      const ds=d.toISOString().split('T')[0];
      return ds>today&&ds<=next7s;
    });
  });
}

function getMusteriSonArama(mid){
  const aramalar=crmAramalar.filter(a=>a.musteri_id===mid);
  return aramalar.length>0?aramalar[0]:null;
}

function getDayLabel(ds){
  const today=new Date().toISOString().split('T')[0];
  if(ds===today)return 'Bugün';
  const d=new Date(ds);const t=new Date(today);
  const diff=Math.round((t-d)/86400000);
  if(diff===1)return 'Dün';
  if(diff>1)return diff+' gün gecikmiş';
  if(diff===-1)return 'Yarın';
  return Math.abs(diff)+' gün sonra';
}

// CRM CRUD
async function loadCrmData(){
  try{
    // Müşterileri sayfalayarak çek (Supabase max 1000 satır limiti)
    let allMusteriler=[];
    let from=0;const batchSize=1000;
    while(true){
      const{data,error}=await sb.from('musteriler').select('*').order('created_at',{ascending:false}).range(from,from+batchSize-1);
      if(error)throw error;
      if(!data||data.length===0)break;
      allMusteriler=allMusteriler.concat(data);
      if(data.length<batchSize)break;
      from+=batchSize;
    }
    crmMusteriler=allMusteriler;
    // 2025'e ait Prepaid (ÖÖ YT + ÖÖ MNT) müşterileri görmezden gel
    crmMusteriler=crmMusteriler.filter(m=>{
      if((m.grup===2||m.grup===3)){
        const dateStr=m.taahhut_bitis||m.aktivasyon_tarihi||m.created_at||'';
        if(dateStr&&new Date(dateStr).getFullYear()<=2025)return false;
      }
      return true;
    });
    crmMusteriler.forEach(m=>{if(m.telefon)m.telefon=fixPhone(m.telefon);});

    // Arama kayıtları
    let allAramalar=[];
    from=0;
    while(true){
      const{data,error}=await sb.from('arama_kayitlari').select('*').order('tarih',{ascending:false}).range(from,from+batchSize-1);
      if(error)throw error;
      if(!data||data.length===0)break;
      allAramalar=allAramalar.concat(data);
      if(data.length<batchSize)break;
      from+=batchSize;
    }
    crmAramalar=allAramalar;
    updateCrmBadge();
    console.log('CRM yüklendi: '+crmMusteriler.length+' müşteri, '+crmAramalar.length+' arama');
  }catch(e){console.error('CRM yükleme hatası:',e);}
}

function updateCrmBadge(){
  const badge=document.getElementById('crmBadge');
  if(!badge)return;
  const count=getTodayCrmList().length;
  badge.textContent=count;
  badge.style.display=count>0?'inline-block':'none';
  if(count>0&&Notification.permission==='granted'){
    // Bildirim sesi yalnızca ilk yüklemede
  }
}

async function saveCrmMusteri(){
  const editId=document.getElementById('crmEditId').value;
  const grup=parseInt(document.getElementById('crmGrup').value);
  const bitis=document.getElementById('crmBitis').value;
  const baslangic=document.getElementById('crmBaslangic').value;
  const obj={
    ad:document.getElementById('crmAd').value.trim(),
    telefon:fixPhone(document.getElementById('crmTel').value.trim()),
    grup:grup,
    paket:document.getElementById('crmPaket').value.trim(),
    eposta:document.getElementById('crmEposta').value.trim(),
    taahhut_baslangic:baslangic||null,
    taahhut_bitis:(grup===1||grup===4)?bitis||null:null,
    aktivasyon_tarihi:(grup===2||grup===3)?bitis||null:null,
    durum:'aktif',
    updated_at:new Date().toISOString()
  };
  if(!obj.ad){showToast('Müşteri adı gerekli!',true);return;}
  // Hatırlatma tarihlerini hesapla
  const tempM={...obj};
  const hDates=calcHatirlatma(tempM);
  if(hDates.length>=1)obj.hatirlatma_gun1=hDates[0].toISOString().split('T')[0];
  if(hDates.length>=2)obj.hatirlatma_gun2=hDates[1].toISOString().split('T')[0];
  try{
    if(editId){
      const{error}=await sb.from('musteriler').update(obj).eq('id',editId);
      if(error)throw error;
      const idx=crmMusteriler.findIndex(m=>m.id===editId);
      if(idx>=0)crmMusteriler[idx]={...crmMusteriler[idx],...obj};
      showToast('✓ Müşteri güncellendi!');
    }else{
      const{data,error}=await sb.from('musteriler').insert([obj]).select().single();
      if(error)throw error;
      crmMusteriler.unshift(data);
      showToast('✓ Müşteri eklendi!');
    }
    closeCrmAddModal();updateCrmBadge();renderCrmBoard();renderCrmList();
  }catch(e){showToast('Hata: '+e.message,true);}
}

async function deleteCrmMusteri(id){
  if(!confirm('Bu müşteriyi silmek istiyor musunuz?'))return;
  try{
    const{error}=await sb.from('musteriler').delete().eq('id',id);
    if(error)throw error;
    crmMusteriler=crmMusteriler.filter(m=>m.id!==id);
    showToast('Müşteri silindi');updateCrmBadge();renderCrmBoard();renderCrmList();
  }catch(e){showToast('Hata: '+e.message,true);}
}

async function saveCrmCall(){
  const mid=document.getElementById('crmCallMusteriId').value;
  const durum=document.getElementById('crmCallDurum').value;
  const sonuc=document.getElementById('crmCallSonuc').value;
  const notText=document.getElementById('crmCallNot').value.trim();
  const arayanIdx=parseInt(document.getElementById('crmCallArayan').value);
  const arayanAd=employees[arayanIdx]?.name||'';
  const obj={musteri_id:mid,durum,sonuc,not_text:notText,arayan:arayanAd,tarih:new Date().toISOString()};
  try{
    const{data,error}=await sb.from('arama_kayitlari').insert([obj]).select().single();
    if(error)throw error;
    crmAramalar.unshift(data);
    // Müşteri sonucunu güncelle
    const updateObj={sonuc,updated_at:new Date().toISOString()};
    if(sonuc==='operator_gecis'){
      updateObj.operator_adi=document.getElementById('crmCallOperator').value;
      updateObj.operator_hat_tipi=document.getElementById('crmCallHatTip').value;
      updateObj.operator_gecis_tarihi=document.getElementById('crmCallGecTarih').value||null;
      updateObj.operator_taahhut_bitis=document.getElementById('crmCallTaahhutBitis').value||null;
    }
    if(sonuc){
      await sb.from('musteriler').update(updateObj).eq('id',mid);
      const idx=crmMusteriler.findIndex(m=>m.id===mid);
      if(idx>=0)Object.assign(crmMusteriler[idx],updateObj);
    }
    closeCrmCallModal();showToast('✓ Arama kaydedildi!');updateCrmBadge();renderCrmBoard();renderCrmRapor();
  }catch(e){showToast('Hata: '+e.message,true);}
}

// CRM MODALS
function openCrmAddModal(editId=''){
  document.getElementById('crmEditId').value=editId;
  if(editId){
    const m=crmMusteriler.find(x=>x.id===editId);
    document.getElementById('crmAddTitle').textContent='DÜZENLE';
    document.getElementById('crmAd').value=m.ad||'';
    document.getElementById('crmTel').value=m.telefon||'';
    document.getElementById('crmGrup').value=m.grup||1;
    document.getElementById('crmPaket').value=m.paket||'';
    document.getElementById('crmEposta').value=m.eposta||'';
    document.getElementById('crmBaslangic').value=m.taahhut_baslangic||'';
    document.getElementById('crmBitis').value=m.taahhut_bitis||m.aktivasyon_tarihi||'';
  }else{
    document.getElementById('crmAddTitle').textContent='EKLE';
    ['crmAd','crmTel','crmPaket','crmEposta','crmBaslangic','crmBitis'].forEach(id=>document.getElementById(id).value='');
    document.getElementById('crmGrup').value='1';
  }
  document.getElementById('crmAddOv').classList.add('open');
}
function closeCrmAddModal(){document.getElementById('crmAddOv').classList.remove('open');}

function openCrmCallModal(mid){
  const m=crmMusteriler.find(x=>x.id===mid);
  document.getElementById('crmCallMusteriId').value=mid;
  document.getElementById('crmCallSub').textContent=m?m.ad+' — '+m.telefon:'';
  document.getElementById('crmCallArayan').innerHTML=employees.map((e,i)=>`<option value="${i}">${e.name}</option>`).join('');
  document.getElementById('crmCallDurum').value='arandi';
  document.getElementById('crmCallSonuc').value='';
  document.getElementById('crmCallNot').value='';
  document.getElementById('crmCallGecTarih').value=new Date().toISOString().split('T')[0];
  document.getElementById('crmCallTaahhutBitis').value='';
  toggleOperatorFields();
  document.getElementById('crmCallOv').classList.add('open');
}
function closeCrmCallModal(){document.getElementById('crmCallOv').classList.remove('open');}

function toggleOperatorFields(){
  const sonuc=document.getElementById('crmCallSonuc').value;
  document.getElementById('operatorFields').style.display=sonuc==='operator_gecis'?'block':'none';
}

function openCrmUpload(){document.getElementById('crmUploadOv').classList.add('open');document.getElementById('crmFile').value='';document.getElementById('crmUploadPreview').style.display='none';document.getElementById('crmUploadBtn').disabled=true;}
function closeCrmUpload(){document.getElementById('crmUploadOv').classList.remove('open');}

// Excel yükleme
document.addEventListener('DOMContentLoaded',function(){
  const fi=document.getElementById('crmFile');
  if(fi)fi.addEventListener('change',async function(){
    const file=this.files[0];if(!file)return;
    const prev=document.getElementById('crmUploadPreview');
    const btn=document.getElementById('crmUploadBtn');
    try{
      let rows=[];
      if(file.name.endsWith('.csv')){
        const txt=await file.text();
        rows=txt.split('\n').filter(r=>r.trim()).map(r=>r.split(/[,;\t]/).map(c=>c.trim().replace(/^"|"$/g,'')));
      }else{
        const XLSX=await import('https://cdn.sheetjs.com/xlsx-0.20.1/package/xlsx.mjs');
        const ab=await file.arrayBuffer();
        const wb=XLSX.read(ab);
        const ws=wb.Sheets[wb.SheetNames[0]];
        rows=XLSX.utils.sheet_to_json(ws,{header:1});
      }
      // İlk satır başlık, atla
      const dataRows=rows.slice(1).filter(r=>r[0]&&String(r[0]).trim());
      prev.style.display='block';
      prev.innerHTML=`<div style="background:#f7f8fa;border-radius:8px;padding:10px;font-size:12px;color:var(--gray)">
        <strong style="color:var(--green)">${dataRows.length} müşteri</strong> bulundu. İçe aktarmak için butona basın.
      </div>`;
      btn.disabled=false;
      window._crmUploadData=dataRows;
    }catch(e){
      prev.style.display='block';
      prev.innerHTML=`<div style="color:var(--red);font-size:12px">Dosya okunamadı: ${e.message}</div>`;
      btn.disabled=true;
    }
  });
});

async function processCrmUpload(){
  const rows=window._crmUploadData;
  if(!rows||!rows.length){showToast('Yüklenecek veri yok!',true);return;}
  showLoading(true);
  let ok=0,fail=0;
  for(const r of rows){
    const grup=parseInt(r[2])||1;
    const bitis=r[5]?parseExcelDate(r[5]):null;
    const baslangic=r[4]?parseExcelDate(r[4]):null;
    const obj={
      ad:String(r[0]||'').trim(),
      telefon:fixPhone(String(r[1]||'').trim()),
      grup,
      paket:String(r[3]||'').trim(),
      taahhut_baslangic:baslangic,
      taahhut_bitis:(grup===1||grup===4)?bitis:null,
      aktivasyon_tarihi:(grup===2||grup===3)?bitis:null,
      eposta:String(r[6]||'').trim(),
      durum:'aktif',sonuc:'bekliyor'
    };
    const hDates=calcHatirlatma(obj);
    if(hDates.length>=1)obj.hatirlatma_gun1=hDates[0].toISOString().split('T')[0];
    if(hDates.length>=2)obj.hatirlatma_gun2=hDates[1].toISOString().split('T')[0];
    try{
      const{data,error}=await sb.from('musteriler').insert([obj]).select().single();
      if(error)throw error;
      crmMusteriler.unshift(data);ok++;
    }catch(e){fail++;console.error(e);}
  }
  showLoading(false);
  closeCrmUpload();
  showToast(`✓ ${ok} müşteri eklendi${fail>0?' ('+fail+' hata)':''}`);
  updateCrmBadge();renderCrmBoard();renderCrmList();
}

function fixPhone(tel){
  if(!tel)return '';
  let t=tel.replace(/[\s\-\(\)\.]/g,'');
  // 5XXXXXXXXX (10 hane, başında 0 yok) → 05XXXXXXXXX
  if(/^5\d{9}$/.test(t))t='0'+t;
  // 905XXXXXXXXX (12 hane) → 05XXXXXXXXX
  if(/^90\d{10}$/.test(t))t='0'+t.slice(2);
  // +905XXXXXXXXX → 05XXXXXXXXX
  if(/^\+90\d{10}$/.test(t))t='0'+t.slice(3);
  // Formatla: 0XXX XXX XX XX
  if(/^0\d{10}$/.test(t))return t.replace(/^(\d{4})(\d{3})(\d{2})(\d{2})$/,'$1 $2 $3 $4');
  return t;
}

function parseExcelDate(val){
  if(!val)return null;
  if(typeof val==='number'){
    const d=new Date((val-25569)*86400000);
    return d.toISOString().split('T')[0];
  }
  const s=String(val).trim();
  // GG.AA.YYYY
  const m1=s.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/);
  if(m1)return `${m1[3]}-${m1[2].padStart(2,'0')}-${m1[1].padStart(2,'0')}`;
  // YYYY-MM-DD
  const m2=s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if(m2)return s;
  return s;
}

// CRM RENDER
let crmBoardView='today';
let crmEmpFilter=-1;
let crmGrupFilter='all'; // 'all','pp','pr'

function searchCrmByPhone(){
  const q=(document.getElementById('crmPhoneSearch').value||'').replace(/\s/g,'').replace(/^0/,'');
  const el=document.getElementById('crmPhoneResult');
  if(!el)return;
  if(q.length<4){el.style.display='none';return;}
  const results=crmMusteriler.filter(function(m){
    return(m.telefon||'').replace(/\s/g,'').includes(q)||(m.ad||'').toUpperCase().includes(q.toUpperCase());
  }).slice(0,10);
  if(!results.length){
    el.innerHTML='<div style="background:#fff;border:1px solid var(--border);border-radius:10px;padding:14px;text-align:center;color:var(--gray);font-size:12px">Müşteri bulunamadı</div>';
    el.style.display='block';return;
  }
  let html='<div style="background:#fff;border:1px solid var(--yellow);border-radius:10px;padding:10px">';
  html+='<div style="font-size:10px;font-weight:700;color:var(--gray);letter-spacing:1px;margin-bottom:8px">🔍 '+results.length+' SONUÇ</div>';
  results.forEach(function(m){
    var son=getMusteriSonArama(m.id);
    var sonuc=CRM_SONUC_LABELS[m.sonuc]||'Bekliyor';
    var sonTarih=son?new Date(son.tarih).toLocaleDateString('tr-TR'):'—';
    var grupLabel=CRM_GRUP_LABELS[m.grup]||'';
    html+='<div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid #f0f0f0">';
    html+='<div style="flex:1;min-width:0"><div style="font-weight:600;font-size:13px">'+m.ad+'</div>';
    html+='<div style="font-size:10px;color:var(--gray)">'+(m.telefon||'—')+' · '+grupLabel+' · '+(m.paket||'')+'</div>';
    html+='<div style="font-size:9px;color:var(--gray);margin-top:2px">Sonuç: <span style="color:var(--yellow)">'+sonuc+'</span> · Son arama: '+sonTarih+'</div></div>';
    html+='<div style="display:flex;gap:4px;flex-shrink:0">';
    html+='<a href="tel:'+(m.telefon||'').replace(/\s/g,'')+'" class="btn btn-p bsm" style="text-decoration:none">📞</a>';
    html+='<button class="btn btn-gr bsm" onclick="openCrmCallModal(\''+m.id+'\')">✍</button>';
    html+='<button class="btn btn-e bsm" onclick="openCrmAddModal(\''+m.id+'\')">✏️</button>';
    html+='</div></div>';
  });
  html+='</div>';
  el.innerHTML=html;el.style.display='block';
}

function renderCrmBoard(){
  const todayList=getTodayCrmList();
  const upcoming=getUpcomingCrmList();
  const today=new Date().toISOString().split('T')[0];
  const arandiCount=crmAramalar.filter(a=>a.tarih&&a.tarih.startsWith(today)).length;
  const basarili=crmMusteriler.filter(m=>m.sonuc==='taahhut_yenilendi'||m.sonuc==='postpaide_gecti').length;

  // Çalışanlara eşit dağıt — hash bazlı benzersiz atama
  const assignableEmps=employees.map((e,i)=>({...e,idx:i})).filter(e=>!e.noTarget);
  const assignCount=assignableEmps.length;
  function hashAssign(id){
    let h=0;for(let c=0;c<id.length;c++)h=((h<<5)-h)+id.charCodeAt(c);
    return assignableEmps[Math.abs(h)%assignCount].idx;
  }
  const todayAssign=todayList.map(m=>({...m,_atanan:hashAssign(m.id)}));
  const upcomingAssign=upcoming.map(m=>({...m,_atanan:hashAssign(m.id)}));

  // Bugün arandı listesi
  const arandiIds=new Set(crmAramalar.filter(a=>a.tarih&&a.tarih.startsWith(today)).map(a=>a.musteri_id));
  const arandiList=crmMusteriler.filter(m=>arandiIds.has(m.id));
  // Başarılı listesi
  const basariliList=crmMusteriler.filter(m=>m.sonuc==='taahhut_yenilendi'||m.sonuc==='postpaide_gecti');
  // Tekrar aranacak
  const tekrarList=crmMusteriler.filter(m=>m.sonuc==='dusunuyor');

  // Çalışan başına düşen sayılar
  const perEmpToday=employees.map((_,ei)=>todayAssign.filter(m=>m._atanan===ei).length);
  const perEmpUpcoming=employees.map((_,ei)=>upcomingAssign.filter(m=>m._atanan===ei).length);
  const activeList=(crmBoardView==='today')?todayAssign:(crmBoardView==='upcoming')?upcomingAssign:todayAssign;
  const perEmp=crmBoardView==='today'?perEmpToday:perEmpUpcoming;

  // Filtrelenmiş liste
  let filtered=crmEmpFilter>=0?activeList.filter(m=>m._atanan===crmEmpFilter):activeList;
  if(crmGrupFilter==='pp')filtered=filtered.filter(m=>m.grup===1||m.grup===4);
  else if(crmGrupFilter==='pr')filtered=filtered.filter(m=>m.grup===2||m.grup===3);

  const ppCount=todayList.filter(m=>m.grup===1||m.grup===4).length;
  const prCount=todayList.filter(m=>m.grup===2||m.grup===3).length;
  document.getElementById('crmBoardPs').textContent=todayList.length>0?todayList.length+' müşteri aranacak ('+ppCount+' PP / '+prCount+' PR)':'Bugün aranacak müşteri yok';
  const tekrarCount=crmMusteriler.filter(m=>m.sonuc==='dusunuyor').length;
  document.getElementById('crmSummaryCards').innerHTML=`
    <div class="kc" style="--ac:var(--red);cursor:pointer;${crmBoardView==='today'?'border:2px solid var(--red)':''}" onclick="setCrmView('today')"><div class="kl">BUGÜN ARANACAK</div><div class="kv" style="color:var(--red)">${todayList.length}</div><div class="ks">Acil + Gecikmiş</div></div>
    <div class="kc" style="--ac:var(--yellow);cursor:pointer;${crmBoardView==='upcoming'?'border:2px solid var(--yellow)':''}" onclick="setCrmView('upcoming')"><div class="kl">YAKIN 7 GÜN</div><div class="kv" style="color:var(--yellow)">${upcoming.length}</div><div class="ks">Tıkla → Listele</div></div>
    <div class="kc" style="--ac:var(--blue);cursor:pointer;${crmBoardView==='arandi'?'border:2px solid var(--blue)':''}" onclick="setCrmView('arandi')"><div class="kl">BUGÜN ARANDI</div><div class="kv" style="color:var(--blue)">${arandiCount}</div><div class="ks">Tıkla → Liste</div></div>
    <div class="kc" style="--ac:var(--green);cursor:pointer;${crmBoardView==='basarili'?'border:2px solid var(--green)':''}" onclick="setCrmView('basarili')"><div class="kl">BAŞARILI</div><div class="kv" style="color:var(--green)">${basarili}</div><div class="ks">Tıkla → Liste</div></div>
    <div class="kc" style="--ac:var(--purple);cursor:pointer;${crmBoardView==='tekrar'?'border:2px solid var(--purple)':''}" onclick="setCrmView('tekrar')"><div class="kl">TEKRAR ARA</div><div class="kv" style="color:var(--purple)">${tekrarCount}</div><div class="ks">Düşünüyor</div></div>`;

  // Çalışan filtre butonları
  let empBtns=`<div style="display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap;">
    <div onclick="setCrmEmpFilter(-1)" style="cursor:pointer;background:${crmEmpFilter===-1?'var(--yellow)':'#fff'};border-radius:8px;border:1px solid ${crmEmpFilter===-1?'var(--yellow)':'var(--border)'};padding:6px 14px;display:flex;align-items:center;gap:6px;">
      <span style="font-size:11px;font-weight:600;color:${crmEmpFilter===-1?'#000':'var(--gray)'}">Hepsi</span>
      <span style="font-family:'Bebas Neue';font-size:16px;color:${crmEmpFilter===-1?'#000':'var(--gray)'}">${activeList.length}</span>
    </div>`;
  employees.forEach((emp,ei)=>{
    if(emp.noTarget)return;
    const isActive=crmEmpFilter===ei;
    const isPP=crmEmpFilter===ei&&crmGrupFilter==='pp';
    const isPR=crmEmpFilter===ei&&crmGrupFilter==='pr';
    const empList=activeList.filter(m=>m._atanan===ei);
    const ppCount=empList.filter(m=>m.grup===1||m.grup===4).length;
    const prCount=empList.filter(m=>m.grup===2||m.grup===3).length;
    empBtns+=`<div style="background:${isActive?emp.color+'15':'#fff'};border-radius:8px;border:${isActive?'2px':'1px'} solid ${isActive?emp.color:emp.color+'40'};padding:6px 10px;display:flex;align-items:center;gap:6px;">
      <div onclick="setCrmEmpFilter(${ei})" style="cursor:pointer;display:flex;align-items:center;gap:5px">
        <div style="width:22px;height:22px;border-radius:6px;background:${emp.color};display:flex;align-items:center;justify-content:center;font-family:'Bebas Neue';font-size:10px;color:#000">${emp.initials}</div>
        <span style="font-size:11px;font-weight:600;color:#1a1a2e">${emp.name.split(' ')[0]}</span>
      </div>
      <div style="display:flex;gap:3px">
        <span onclick="setCrmEmpGrupFilter(${ei},'pp')" style="cursor:pointer;font-size:9px;font-weight:700;padding:2px 5px;border-radius:4px;background:${isPP?'var(--postpaid)':'rgba(0,122,255,0.1)'};color:${isPP?'#fff':'var(--postpaid)'}">${ppCount}PP</span>
        <span onclick="setCrmEmpGrupFilter(${ei},'pr')" style="cursor:pointer;font-size:9px;font-weight:700;padding:2px 5px;border-radius:4px;background:${isPR?'var(--prepaid)':'rgba(0,168,107,0.1)'};color:${isPR?'#fff':'var(--prepaid)'}">${prCount}PR</span>
      </div>
    </div>`;
  });
  empBtns+='</div>';

  // Liste render
  let listHtml='';
  if(crmBoardView==='arandi'||crmBoardView==='basarili'||crmBoardView==='tekrar'){
    // Özel listeler — çalışan filtresi gösterme
    const specList=crmBoardView==='arandi'?arandiList:crmBoardView==='basarili'?basariliList:tekrarList;
    const specTitle=crmBoardView==='arandi'?'📞 BUGÜN ARANANLAR':crmBoardView==='basarili'?'✅ BAŞARILI DÖNÜŞLER':'⏳ TEKRAR ARANACAKLAR';
    const specColor=crmBoardView==='arandi'?'var(--blue)':crmBoardView==='basarili'?'var(--green)':'var(--purple)';
    if(!specList.length){
      listHtml='<div style="background:#fff;border-radius:12px;border:1px solid var(--border);padding:30px;text-align:center;color:var(--gray)">Bu kategoride müşteri yok</div>';
    }else{
      listHtml+='<div class="sh"><div class="st" style="color:'+specColor+'">'+specTitle+' ('+specList.length+')</div></div>';
      specList.forEach(function(m){
        var son=getMusteriSonArama(m.id);
        var sonuc=CRM_SONUC_LABELS[m.sonuc]||'Bekliyor';
        var sonTarih=son?new Date(son.tarih).toLocaleDateString('tr-TR'):'—';
        listHtml+='<div style="background:#fff;border-radius:12px;border:1px solid var(--border);padding:14px;margin-bottom:8px;display:flex;align-items:center;gap:12px;flex-wrap:wrap">';
        listHtml+='<div style="flex:1;min-width:150px"><div style="font-weight:600;font-size:13px">'+m.ad+'</div>';
        listHtml+='<div style="font-size:11px;color:var(--gray)">'+(m.telefon||'—')+' · '+(CRM_GRUP_LABELS[m.grup]||'')+'</div>';
        listHtml+='<div style="font-size:9px;color:var(--gray)">'+sonuc+' · Son: '+sonTarih+'</div></div>';
        listHtml+='<div style="display:flex;gap:5px"><a href="tel:'+(m.telefon||'').replace(/\s/g,'')+'" class="btn btn-p bsm" style="text-decoration:none">📞</a>';
        listHtml+='<button class="btn btn-gr bsm" onclick="openCrmCallModal(\''+m.id+'\')">✍</button>';
        listHtml+='<button class="btn btn-e bsm" onclick="openCrmAddModal(\''+m.id+'\')">✏️</button></div>';
        listHtml+='</div>';
      });
    }
    document.getElementById('crmTodayList').innerHTML=listHtml;
    document.getElementById('crmUpcomingList').innerHTML='';
    return;
  }

  // Normal today/upcoming listeleri
  if(filtered.length===0){
    const emptyMsg=crmEmpFilter>=0
      ?employees[crmEmpFilter].name.split(' ')[0]+' için aranacak müşteri yok.'
      :(crmBoardView==='today'?'🎉 Bugün aranacak müşteri yok!':'Yakın 7 günde aranacak müşteri yok.');
    listHtml=`<div style="background:#fff;border-radius:12px;border:1px solid var(--border);padding:30px;text-align:center;color:var(--gray)">${emptyMsg}</div>`;
  }else{
    const titleColor=crmBoardView==='today'?'var(--red)':'var(--yellow)';
    const titleIcon=crmBoardView==='today'?'🔴':'🟡';
    const titleText=crmBoardView==='today'?'BUGÜN <em>ARANACAKLAR</em>':'YAKIN 7 GÜN <em>İÇİNDE</em>';
    const filterLabel=crmEmpFilter>=0?' — '+employees[crmEmpFilter].name.split(' ')[0]:'';
    listHtml+=`<div class="sh"><div class="st" style="color:${titleColor}">${titleIcon} ${titleText}${filterLabel?` <span style="color:${employees[crmEmpFilter]?.color||titleColor}">${filterLabel}</span>`:''}</div></div>`;
    filtered.forEach(m=>{
      listHtml+=buildCrmCard(m,today,crmBoardView==='today',m._atanan);
    });
  }

  document.getElementById('crmTodayList').innerHTML=empBtns+listHtml;
  document.getElementById('crmUpcomingList').innerHTML='';
}

function setCrmView(view){
  crmBoardView=view;
  crmEmpFilter=-1;
  crmGrupFilter='all';
  renderCrmBoard();
}
function setCrmEmpFilter(idx){
  crmEmpFilter=idx;
  crmGrupFilter='all';
  renderCrmBoard();
}
function setCrmEmpGrupFilter(idx,grup){
  if(crmEmpFilter===idx&&crmGrupFilter===grup){crmGrupFilter='all';} else {crmEmpFilter=idx;crmGrupFilter=grup;}
  renderCrmBoard();
}

function buildCrmCard(m,today,isTodayView,atananIdx){
  const son=getMusteriSonArama(m.id);
  const dates=calcHatirlatma(m);
  const nextDate=isTodayView
    ?dates.find(d=>d.toISOString().split('T')[0]<=today)
    :dates.find(d=>d.toISOString().split('T')[0]>today);
  const label=nextDate?getDayLabel(nextDate.toISOString().split('T')[0]):'';
  const gecikmi=isTodayView&&nextDate&&nextDate.toISOString().split('T')[0]<today;
  const emp=typeof atananIdx==='number'?employees[atananIdx]:null;
  // Bugün arandı mı kontrol
  const bugunArandi=son&&son.tarih&&son.tarih.startsWith(today);
  const bugunDurum=bugunArandi?son.durum:null;
  // Renklendirme
  let cardBg='#fff',borderColor='var(--border)',statusBadge='';
  if(bugunDurum==='arandi'){
    cardBg='rgba(0,168,107,0.06)';borderColor='rgba(0,168,107,0.35)';
    statusBadge='<span style="background:rgba(0,168,107,0.15);color:var(--green);font-size:9px;padding:2px 7px;border-radius:10px;font-weight:700">✓ Arandı</span>';
  }else if(bugunDurum==='ulasilamadi'){
    cardBg='rgba(230,168,0,0.06)';borderColor='rgba(230,168,0,0.35)';
    statusBadge='<span style="background:rgba(230,168,0,0.15);color:var(--yellow);font-size:9px;padding:2px 7px;border-radius:10px;font-weight:700">✗ Ulaşılamadı</span>';
  }else if(bugunDurum==='mesgul'){
    cardBg='rgba(43,123,232,0.06)';borderColor='rgba(43,123,232,0.35)';
    statusBadge='<span style="background:rgba(43,123,232,0.15);color:var(--blue);font-size:9px;padding:2px 7px;border-radius:10px;font-weight:700">📞 Meşgul</span>';
  }else if(gecikmi){
    cardBg='rgba(230,57,70,0.04)';borderColor='rgba(230,57,70,0.3)';
  }
  const labelColor=gecikmi?'var(--red)':'var(--yellow)';
  // Deneme sayısı (ulaşılamadı/mesgul için)
  const musteriAramalar=crmAramalar.filter(a=>a.musteri_id===m.id);
  const denemeSayisi=musteriAramalar.filter(a=>a.durum==='ulasilamadi'||a.durum==='mesgul').length;
  const denemeBadge=denemeSayisi>0?'<span style="font-size:8px;color:var(--gray);margin-top:1px">Deneme '+denemeSayisi+'/3</span>':'';
  return`<div style="background:${cardBg};border-radius:12px;border:1px solid ${borderColor};padding:14px;margin-bottom:8px;box-shadow:0 2px 6px rgba(0,0,0,0.04);display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
    <div style="flex:0 0 8px;height:8px;border-radius:50%;background:${CRM_GRUP_COLORS[m.grup]||'var(--gray)'}"></div>
    <div style="flex:1;min-width:150px;">
      <div style="display:flex;align-items:center;gap:6px"><span style="font-weight:600;font-size:13px;color:#1a1a2e">${escapeHtml(m.ad)}</span>${statusBadge}</div>
      <div style="font-size:11px;color:var(--gray)">${m.telefon||'—'} &nbsp;·&nbsp; ${CRM_GRUP_LABELS[m.grup]||'—'} &nbsp;·&nbsp; ${m.paket||''}</div>
    </div>
    ${emp?`<div style="display:flex;align-items:center;gap:5px;background:${emp.color}15;border:1px solid ${emp.color}40;border-radius:8px;padding:4px 8px;">
      <div style="width:20px;height:20px;border-radius:5px;background:${emp.color};display:flex;align-items:center;justify-content:center;font-family:'Bebas Neue';font-size:9px;color:#000">${emp.initials}</div>
      <span style="font-size:10px;font-weight:600;color:${emp.color}">${emp.name.split(' ')[0]}</span>
    </div>`:''}
    <div style="text-align:center;min-width:70px;">
      <div style="font-size:10px;color:${labelColor};font-weight:600">${label}</div>
      ${denemeBadge}
      ${son&&!bugunArandi?'<div style="font-size:9px;color:var(--gray);margin-top:2px">Son: '+(CRM_DURUM_LABELS[son.durum]||son.durum)+'</div>':''}
    </div>
    <div style="display:flex;gap:5px;">
      <a href="tel:${(m.telefon||'').replace(/\s/g,'')}" class="btn btn-p bsm" style="text-decoration:none">📞</a>
      <button class="btn btn-gr bsm" onclick="openCrmCallModal('${m.id}')">✍ Sonuç</button>
      <button class="btn btn-e bsm" onclick="openCrmAddModal('${m.id}')">✏️</button>
    </div>
  </div>`;
}

let crmListPage=0;
const CRM_PAGE_SIZE=50;

function renderCrmList(){
  const tbody=document.getElementById('crmListBody');if(!tbody)return;tbody.innerHTML='';
  const filter=parseInt(document.getElementById('crmGrupFilter')?.value||0);
  const list=filter>0?crmMusteriler.filter(m=>m.grup===filter):crmMusteriler;
  const total=list.length;
  const totalPages=Math.ceil(total/CRM_PAGE_SIZE);
  if(crmListPage>=totalPages)crmListPage=Math.max(0,totalPages-1);
  const start=crmListPage*CRM_PAGE_SIZE;
  const pageList=list.slice(start,start+CRM_PAGE_SIZE);

  // Sayaç
  const countEl=document.getElementById('crmListCount');
  if(countEl)countEl.textContent=`Toplam ${total} müşteri${filter>0?' ('+CRM_GRUP_LABELS[filter]+')':''}`;

  // Sayfalama
  const pagHtml=totalPages>1?`<div style="display:flex;gap:5px;align-items:center;justify-content:center;flex-wrap:wrap;">
    <button class="btn btn-g bsm" onclick="crmListPage=0;renderCrmList()" ${crmListPage===0?'disabled':''}>«</button>
    <button class="btn btn-g bsm" onclick="crmListPage--;renderCrmList()" ${crmListPage===0?'disabled':''}>‹</button>
    <span style="font-size:11px;color:var(--gray);padding:0 8px">Sayfa ${crmListPage+1} / ${totalPages} (${start+1}-${Math.min(start+CRM_PAGE_SIZE,total)} / ${total})</span>
    <button class="btn btn-g bsm" onclick="crmListPage++;renderCrmList()" ${crmListPage>=totalPages-1?'disabled':''}>›</button>
    <button class="btn btn-g bsm" onclick="crmListPage=${totalPages-1};renderCrmList()" ${crmListPage>=totalPages-1?'disabled':''}>»</button>
  </div>`:'';
  const pagEl=document.getElementById('crmListPagination');if(pagEl)pagEl.innerHTML=pagHtml;
  const pagElB=document.getElementById('crmListPaginationBottom');if(pagElB)pagElB.innerHTML=pagHtml;

  if(!pageList.length){tbody.innerHTML='<tr><td colspan="7" style="text-align:center;color:var(--gray);padding:20px">Henüz müşteri kaydı yok</td></tr>';return;}
  pageList.forEach(m=>{
    const sonucLabel=CRM_SONUC_LABELS[m.sonuc]||m.sonuc||'Bekliyor';
    const sonucColor=m.sonuc==='taahhut_yenilendi'||m.sonuc==='postpaide_gecti'?'var(--green)':m.sonuc==='reddetti'||m.sonuc==='iptal_etti'||m.sonuc==='operator_gecis'||m.sonuc==='ikna_edilemedi'||m.sonuc==='istemiyor'||m.sonuc==='musteri_hizmet_yeniledi'||m.sonuc==='yabanci_uyruklu'?'var(--red)':'var(--gray)';
    tbody.insertAdjacentHTML('beforeend',`<tr>
      <td style="font-weight:600">${escapeHtml(m.ad)}</td>
      <td>${m.telefon||'—'}</td>
      <td><span style="color:${CRM_GRUP_COLORS[m.grup]};font-weight:600;font-size:11px">${CRM_GRUP_LABELS[m.grup]||m.grup}</span></td>
      <td style="font-size:11px">${m.taahhut_bitis||m.aktivasyon_tarihi||'—'}</td>
      <td style="font-size:11px">${m.durum||'aktif'}</td>
      <td style="color:${sonucColor};font-size:11px;font-weight:600">${sonucLabel}</td>
      <td><div style="display:flex;gap:4px">
        <a href="tel:${(m.telefon||'').replace(/\s/g,'')}" class="btn btn-p bsm" style="text-decoration:none">📞</a>
        <button class="btn btn-gr bsm" onclick="openCrmCallModal('${m.id}')">✍</button>
        <button class="btn btn-e bsm" onclick="openCrmAddModal('${m.id}')">✏️</button>
        <button class="btn btn-d bsm" onclick="deleteCrmMusteri('${m.id}')">🗑️</button>
      </div></td>
    </tr>`);
  });
}

function renderCrmChurn(){
  const churnList=crmMusteriler.filter(m=>m.sonuc==='operator_gecis');
  const today=new Date();
  const vodafone=churnList.filter(m=>m.operator_adi==='vodafone');
  const telekom=churnList.filter(m=>m.operator_adi==='telekom');

  const el=document.getElementById('churnSummaryCards');
  if(el)el.innerHTML=`
    <div class="kc" style="--ac:var(--red)"><div class="kl">TOPLAM GEÇİŞ</div><div class="kv" style="color:var(--red)">${churnList.length}</div><div class="ks">Başka operatöre</div></div>
    <div class="kc" style="--ac:var(--red)"><div class="kl">VODAFONE</div><div class="kv" style="color:var(--red)">${vodafone.length}</div><div class="ks">1 ay önce ara</div></div>
    <div class="kc" style="--ac:var(--purple)"><div class="kl">TELEKOM</div><div class="kv" style="color:var(--purple)">${telekom.length}</div><div class="ks">1 hafta önce ara</div></div>`;

  const tbody=document.getElementById('churnBody');if(!tbody)return;tbody.innerHTML='';
  if(!churnList.length){tbody.innerHTML='<tr><td colspan="8" style="text-align:center;color:var(--gray);padding:20px">Operatör geçişi kaydı yok</td></tr>';return;}
  churnList.forEach(m=>{
    const opColor=m.operator_adi==='vodafone'?'var(--red)':'var(--purple)';
    const opLabel=m.operator_adi==='vodafone'?'Vodafone':'Türk Telekom';
    const hatLabel=m.operator_hat_tipi==='postpaid'?'Faturalı':'Faturasız';
    const bitis=m.operator_taahhut_bitis||'—';
    // Arama listesinde mi?
    let aramaStatus='—';
    if(m.operator_taahhut_bitis){
      const bitisD=new Date(m.operator_taahhut_bitis);
      const diff=Math.round((bitisD-today)/86400000);
      if(m.operator_adi==='vodafone'&&diff<=30&&diff>0)aramaStatus='<span class="badge br">Arama listesinde</span>';
      else if(m.operator_adi==='telekom'&&diff<=7&&diff>0)aramaStatus='<span class="badge br">Arama listesinde</span>';
      else if(diff<=0)aramaStatus='<span class="badge bg">Taahhüt bitti</span>';
      else aramaStatus=diff+' gün kaldı';
    }
    tbody.insertAdjacentHTML('beforeend',`<tr>
      <td style="font-weight:600">${escapeHtml(m.ad)}</td>
      <td>${m.telefon||'—'}</td>
      <td style="color:${opColor};font-weight:700">${opLabel}</td>
      <td>${hatLabel}</td>
      <td style="font-size:11px">${m.operator_gecis_tarihi||'—'}</td>
      <td style="font-size:11px">${bitis}</td>
      <td>${aramaStatus}</td>
      <td><div style="display:flex;gap:4px">
        <a href="tel:${(m.telefon||'').replace(/\s/g,'')}" class="btn btn-p bsm" style="text-decoration:none">📞</a>
        <button class="btn btn-gr bsm" onclick="openCrmCallModal('${m.id}')">✍</button>
      </div></td>
    </tr>`);
  });
}

function renderCrmRapor(){
  const today=new Date();
  const todayS=today.toISOString().split('T')[0];
  const bugunArama=crmAramalar.filter(a=>a.tarih&&a.tarih.startsWith(todayS));
  const tekrarSayisi=crmMusteriler.filter(m=>m.sonuc==='dusunuyor').length;
  const operatorGecis=crmMusteriler.filter(m=>m.sonuc==='operator_gecis').length;
  const basariliList=crmMusteriler.filter(m=>m.sonuc==='taahhut_yenilendi'||m.sonuc==='postpaide_gecti');
  const iknaEdilemedi=crmMusteriler.filter(m=>m.sonuc==='ikna_edilemedi'||m.sonuc==='istemiyor').length;
  document.getElementById('crmRaporCards').innerHTML=`
    <div class="kc" style="--ac:var(--blue);cursor:pointer" onclick="toggleRaporList('arandi')"><div class="kl">BUGÜN ARANDI</div><div class="kv" style="color:var(--blue)">${bugunArama.length}</div><div class="ks">Tıkla → Liste</div></div>
    <div class="kc" style="--ac:var(--yellow);cursor:pointer" onclick="sp('crmtekrar',null)"><div class="kl">TEKRAR ARANACAK</div><div class="kv" style="color:var(--yellow)">${tekrarSayisi}</div><div class="ks">→ Tekrar</div></div>
    <div class="kc" style="--ac:var(--red);cursor:pointer" onclick="sp('crmchurn',null)"><div class="kl">OPR. GEÇİŞ</div><div class="kv" style="color:var(--red)">${operatorGecis}</div><div class="ks">→ Geçişler</div></div>
    <div class="kc" style="--ac:var(--green);cursor:pointer" onclick="toggleRaporList('basarili')"><div class="kl">BAŞARILI</div><div class="kv" style="color:var(--green)">${basariliList.length}</div><div class="ks">Tıkla → Liste</div></div>`;

  // Toggle listeler
  const raporExtra=document.getElementById('crmRaporExtra');
  if(raporExtra&&!raporExtra.innerHTML){raporExtra.innerHTML='';}

  const tbody=document.getElementById('crmRaporBody');if(!tbody)return;tbody.innerHTML='';
  const recent=crmAramalar.slice(0,50);
  if(!recent.length){tbody.innerHTML='<tr><td colspan="8" style="text-align:center;color:var(--gray);padding:20px">Henüz arama kaydı yok</td></tr>';return;}
  recent.forEach(a=>{
    const m=crmMusteriler.find(x=>x.id===a.musteri_id);
    const durumLabel=CRM_DURUM_LABELS[a.durum]||a.durum;
    const sonucLabel=CRM_SONUC_LABELS[a.sonuc]||a.sonuc||'—';
    tbody.insertAdjacentHTML('beforeend',`<tr>
      <td style="font-weight:600">${m?escapeHtml(m.ad):'Bilinmiyor'}</td>
      <td style="font-size:11px">${m?m.telefon||'—':'—'}</td>
      <td style="font-size:11px">${new Date(a.tarih).toLocaleString('tr-TR',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</td>
      <td>${durumLabel}</td>
      <td style="font-size:11px">${sonucLabel}</td>
      <td style="font-size:11px;color:var(--gray)">${a.arayan||'—'}</td>
      <td style="font-size:11px;color:var(--gray);max-width:150px;overflow:hidden;text-overflow:ellipsis">${a.not_text||'—'}</td>
      <td><div style="display:flex;gap:3px">${m?`<button class="btn btn-gr bsm" onclick="openCrmCallModal('${a.musteri_id}')">✍</button><button class="btn btn-e bsm" onclick="openCrmAddModal('${a.musteri_id}')">✏️</button>`:''}</div></td>
    </tr>`);
  });
}
function toggleRaporList(type){
  const extra=document.getElementById('crmRaporExtra');
  if(!extra)return;
  if(extra.dataset.active===type){extra.innerHTML='';extra.dataset.active='';return;}
  extra.dataset.active=type;
  const todayS=new Date().toISOString().split('T')[0];
  let list=[];let title='';
  if(type==='arandi'){
    const aramaIds=crmAramalar.filter(a=>a.tarih&&a.tarih.startsWith(todayS)).map(a=>a.musteri_id);
    list=crmMusteriler.filter(m=>aramaIds.includes(m.id));
    title='BUGÜN ARANANLAR';
  }else if(type==='basarili'){
    list=crmMusteriler.filter(m=>m.sonuc==='taahhut_yenilendi'||m.sonuc==='postpaide_gecti');
    title='BAŞARILI DÖNÜŞLER';
  }
  let html='<div style="margin:12px 0;background:#fff;border:1px solid var(--border);border-radius:12px;padding:14px">';
  html+='<div style="font-size:11px;font-weight:700;letter-spacing:1px;color:var(--gray);margin-bottom:8px">'+title+' ('+list.length+')</div>';
  if(!list.length){html+='<div style="color:var(--gray);text-align:center;padding:10px">Kayıt yok</div>';}
  else{
    html+='<div style="max-height:300px;overflow-y:auto">';
    list.forEach(function(m){
      html+='<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid #f0f0f0">';
      html+='<div style="flex:1"><div style="font-weight:600;font-size:12px">'+m.ad+'</div><div style="font-size:10px;color:var(--gray)">'+(m.telefon||'')+' · '+(CRM_GRUP_LABELS[m.grup]||'')+'</div></div>';
      html+='<div style="font-size:10px;color:var(--yellow)">'+(CRM_SONUC_LABELS[m.sonuc]||'—')+'</div>';
      html+='<div style="display:flex;gap:4px"><a href="tel:'+(m.telefon||'').replace(/\s/g,'')+'" class="btn btn-p bsm" style="text-decoration:none;font-size:10px">📞</a>';
      html+='<button class="btn btn-gr bsm" style="font-size:10px" onclick="openCrmCallModal(\''+m.id+'\')">✍</button></div>';
      html+='</div>';
    });
    html+='</div>';
  }
  html+='</div>';
  extra.innerHTML=html;
}

let tekrarFilter='all';
function renderCrmTekrar(){
  const dusunuyor=crmMusteriler.filter(m=>m.sonuc==='dusunuyor');
  const ulasilamadiIds=new Set(crmAramalar.filter(a=>a.durum==='ulasilamadi').map(a=>a.musteri_id));
  const mesgulIds=new Set(crmAramalar.filter(a=>a.durum==='mesgul').map(a=>a.musteri_id));
  const ulasilamadi=crmMusteriler.filter(m=>ulasilamadiIds.has(m.id)&&!KESIN_SONUCLAR.includes(m.sonuc));
  const mesgul=crmMusteriler.filter(m=>mesgulIds.has(m.id)&&!KESIN_SONUCLAR.includes(m.sonuc));
  const el=document.getElementById('tekrarSummary');
  if(el)el.innerHTML=`
    <div class="kc" style="--ac:var(--yellow);cursor:pointer;${tekrarFilter==='dusunuyor'?'border:2px solid var(--yellow)':''}" onclick="tekrarFilter='dusunuyor';renderCrmTekrar()"><div class="kl">D\u00dc\u015e\u00dcN\u00dcYOR</div><div class="kv" style="color:var(--yellow)">${dusunuyor.length}</div></div>
    <div class="kc" style="--ac:var(--red);cursor:pointer;${tekrarFilter==='ulasilamadi'?'border:2px solid var(--red)':''}" onclick="tekrarFilter='ulasilamadi';renderCrmTekrar()"><div class="kl">ULA\u015eILAMADI</div><div class="kv" style="color:var(--red)">${ulasilamadi.length}</div></div>
    <div class="kc" style="--ac:var(--blue);cursor:pointer;${tekrarFilter==='mesgul'?'border:2px solid var(--blue)':''}" onclick="tekrarFilter='mesgul';renderCrmTekrar()"><div class="kl">ME\u015eGUL</div><div class="kv" style="color:var(--blue)">${mesgul.length}</div></div>`;
  const filEl=document.getElementById('tekrarFilters');
  if(filEl)filEl.innerHTML=`
    <button class="btn ${tekrarFilter==='all'?'btn-p':'btn-g'} bsm" onclick="tekrarFilter='all';renderCrmTekrar()">Hepsi</button>
    <button class="btn ${tekrarFilter==='dusunuyor'?'btn-p':'btn-g'} bsm" onclick="tekrarFilter='dusunuyor';renderCrmTekrar()">\u23f3 D\u00fc\u015f\u00fcn\u00fcyor</button>
    <button class="btn ${tekrarFilter==='ulasilamadi'?'btn-p':'btn-g'} bsm" onclick="tekrarFilter='ulasilamadi';renderCrmTekrar()">\u2717 Ula\u015f\u0131lamad\u0131</button>
    <button class="btn ${tekrarFilter==='mesgul'?'btn-p':'btn-g'} bsm" onclick="tekrarFilter='mesgul';renderCrmTekrar()">\ud83d\udcde Me\u015fgul</button>`;
  let list=[];
  if(tekrarFilter==='dusunuyor')list=dusunuyor;else if(tekrarFilter==='ulasilamadi')list=ulasilamadi;else if(tekrarFilter==='mesgul')list=mesgul;else list=[...dusunuyor,...ulasilamadi,...mesgul];
  const seen=new Set();list=list.filter(m=>{if(seen.has(m.id))return false;seen.add(m.id);return true;});
  const listEl=document.getElementById('tekrarList');
  if(!list.length){listEl.innerHTML='<div style="background:#fff;border-radius:12px;border:1px solid var(--border);padding:30px;text-align:center;color:var(--gray)">Bu kategoride m\u00fc\u015fteri yok.</div>';return;}
  listEl.innerHTML=list.map(m=>{
    const son=getMusteriSonArama(m.id);
    return`<div style="background:#fff;border-radius:12px;border:1px solid var(--border);padding:14px;margin-bottom:8px;display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
      <div style="flex:1;min-width:150px;"><div style="font-weight:600;font-size:13px">${escapeHtml(m.ad)}</div><div style="font-size:11px;color:var(--gray)">${m.telefon||'\u2014'} \u00b7 ${CRM_GRUP_LABELS[m.grup]||''}</div></div>
      <div style="text-align:center;min-width:90px;"><div style="font-size:10px;color:var(--yellow);font-weight:600">${CRM_SONUC_LABELS[m.sonuc]||'\u2014'}</div>${son?`<div style="font-size:9px;color:var(--gray)">Son: ${new Date(son.tarih).toLocaleDateString('tr-TR')}</div>`:''}</div>
      <div style="display:flex;gap:5px;"><a href="tel:${(m.telefon||'').replace(/\s/g,'')}" class="btn btn-p bsm" style="text-decoration:none">\ud83d\udcde</a><button class="btn btn-gr bsm" onclick="openCrmCallModal('${m.id}')">\u270d Sonu\u00e7</button><button class="btn btn-e bsm" onclick="openCrmAddModal('${m.id}')">\u270f\ufe0f</button></div>
    </div>`;
  }).join('');
}

let ajandaItems=[];
async function loadAjanda(){try{const{data}=await sb.from('ajanda').select('*').order('tarih',{ascending:true});ajandaItems=data||[];}catch(e){ajandaItems=[];}}
function renderCrmAjanda(){
  const today=new Date().toISOString().split('T')[0];
  const bugun=ajandaItems.filter(a=>a.tarih===today);
  const gelecek=ajandaItems.filter(a=>a.tarih>today);
  const gecmis=ajandaItems.filter(a=>a.tarih<today&&!a.tamamlandi);
  const el=document.getElementById('ajandaSummary');
  if(el)el.innerHTML=`<div class="kc" style="--ac:var(--red)"><div class="kl">GEC\u0130KM\u0130\u015e</div><div class="kv" style="color:var(--red)">${gecmis.length}</div></div><div class="kc" style="--ac:var(--yellow)"><div class="kl">BUG\u00dcN</div><div class="kv" style="color:var(--yellow)">${bugun.length}</div></div><div class="kc" style="--ac:var(--blue)"><div class="kl">GELECEK</div><div class="kv" style="color:var(--blue)">${gelecek.length}</div></div>`;
  const listEl=document.getElementById('ajandaList');
  const all=[...gecmis,...bugun,...gelecek];
  if(!all.length){listEl.innerHTML='<div style="background:#fff;border-radius:12px;border:1px solid var(--border);padding:30px;text-align:center;color:var(--gray)">Hen\u00fcz hat\u0131rlatma yok.</div>';return;}
  listEl.innerHTML=all.map(a=>{
    const gecikmi=a.tarih<today&&!a.tamamlandi;const bugunMu=a.tarih===today;
    const bc=gecikmi?'rgba(230,57,70,0.1)':bugunMu?'rgba(230,168,0,0.08)':'#fff';
    const bdr=gecikmi?'rgba(230,57,70,0.3)':bugunMu?'rgba(230,168,0,0.3)':'var(--border)';
    return`<div style="background:${bc};border-radius:12px;border:1px solid ${bdr};padding:14px;margin-bottom:8px;${a.tamamlandi?'opacity:0.5;':''}">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
        <div style="display:flex;align-items:center;gap:8px;"><span style="font-size:12px;font-weight:700;color:${gecikmi?'var(--red)':bugunMu?'var(--yellow)':'var(--gray)'}">${a.tarih}${a.saat?' '+a.saat:''}</span>${gecikmi?'<span class="badge br">Gecikmi\u015f</span>':bugunMu?'<span class="badge by">Bug\u00fcn</span>':''}</div>
        <div style="display:flex;gap:4px;">${!a.tamamlandi?`<button class="btn btn-gr bsm" onclick="tamamlaAjanda('${a.id}')">\u2713</button>`:'<span class="badge bg">\u2713</span>'}<button class="btn btn-d bsm" onclick="silAjanda('${a.id}')">\ud83d\uddd1\ufe0f</button></div>
      </div>
      <div style="font-weight:600;font-size:13px;${a.tamamlandi?'text-decoration:line-through':''}">${a.baslik||'\u2014'}</div>
      ${a.detay?`<div style="font-size:11px;color:var(--gray);margin-top:4px">${a.detay}</div>`:''}
      <div style="font-size:10px;color:var(--gray);margin-top:4px">Kaydeden: ${a.kaydeden||'\u2014'}</div>
    </div>`;
  }).join('');
}
function openAjandaModal(){document.getElementById('ajandaEditId').value='';document.getElementById('ajandaTarih').value=new Date().toISOString().split('T')[0];document.getElementById('ajandaSaat').value='';document.getElementById('ajandaBaslik').value='';document.getElementById('ajandaDetay').value='';document.getElementById('ajandaKaydedenSel').innerHTML=employees.map((e,i)=>`<option value="${i}">${e.name}</option>`).join('');document.getElementById('ajandaOv').classList.add('open');}
function closeAjandaModal(){document.getElementById('ajandaOv').classList.remove('open');}
async function saveAjanda(){const obj={tarih:document.getElementById('ajandaTarih').value,saat:document.getElementById('ajandaSaat').value||null,baslik:document.getElementById('ajandaBaslik').value.trim(),detay:document.getElementById('ajandaDetay').value.trim(),kaydeden:employees[parseInt(document.getElementById('ajandaKaydedenSel').value)]?.name||'',tamamlandi:false};if(!obj.baslik){showToast('Ba\u015fl\u0131k girin!',true);return;}try{const{data,error}=await sb.from('ajanda').insert([obj]).select().single();if(error)throw error;ajandaItems.push(data);ajandaItems.sort((a,b)=>a.tarih>b.tarih?1:-1);closeAjandaModal();showToast('\u2713 Hat\u0131rlatma eklendi!');renderCrmAjanda();}catch(e){showToast('Hata: '+e.message,true);}}
async function tamamlaAjanda(id){try{await sb.from('ajanda').update({tamamlandi:true}).eq('id',id);const idx=ajandaItems.findIndex(a=>a.id===id);if(idx>=0)ajandaItems[idx].tamamlandi=true;renderCrmAjanda();}catch(e){showToast('Hata: '+e.message,true);}}
async function silAjanda(id){if(!confirm('Silmek istiyor musunuz?'))return;try{await sb.from('ajanda').delete().eq('id',id);ajandaItems=ajandaItems.filter(a=>a.id!==id);renderCrmAjanda();showToast('Silindi');}catch(e){showToast('Hata: '+e.message,true);}}

// CRM Bildirim
function initCrmNotifications(){
  if('Notification' in window&&Notification.permission==='default'){
    Notification.requestPermission();
  }
  // CRM verisi yüklenince badge'i güncelle ve interval başlat
  ensureCrmDataLoaded().then(()=>{
    updateCrmBadge();
  });
  // Her 5 dakikada kontrol (CRM yüklenmemişse atla)
  setInterval(()=>{
    if(!_crmDataLoaded)return;
    const count=getTodayCrmList().length;
    updateCrmBadge();
    if(count>0&&Notification.permission==='granted'){
      new Notification('📞 Elfin İletişim',{body:count+' müşteri aranmayı bekliyor!',icon:'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">📞</text></svg>'});
      try{
        const audio=new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdH+Jj4yCbF1dc3+Ij4+CbF5ddH+Ij46CbF5ddH+Hj46DbF5edH+Hj46DdF5edH+Hjo6DdF5edX+Hjo2DdF9fdX+Hjo2DdF9fdX+Gjo2EdF9fdX+Gjo2EdF9fdX+Gjo2EdV9fdX+Gjo2EdV9fdX+Gjo2EdV9fdX+GjY2EdV9fdQ==');
        audio.volume=0.3;audio.play().catch(()=>{});
      }catch(e){}
    }
  },300000);
}

// ============================================================
// SMS & HAFTALIK RAPOR SİSTEMİ
// ============================================================

// Hızlı SMS fonksiyonları
// ============ KAMPANYA & DUYURU ============
let duyurular=[];
let duyuruIdx=0;
let duyuruTimer=null;
let duyuruColor='#1a1a2e';

// ============ LIGHTBOX ============
let _lightboxList=[];
let _lightboxIdx=0;

function openDuyuruLightbox(idx,list){
  _lightboxList=list||duyurular;
  _lightboxIdx=idx;
  // Carousel timer'ı durdur (lightbox açıkken sıradakine geçmesin)
  if(duyuruTimer){clearInterval(duyuruTimer);duyuruTimer=null;}
  showLightboxAt(idx);
  document.getElementById('duyuruLightbox').style.display='flex';
  // ESC ile kapat
  document.addEventListener('keydown',_lightboxKeyHandler);
}
function _lightboxKeyHandler(e){
  if(e.key==='Escape')closeDuyuruLightbox();
  else if(e.key==='ArrowLeft')shiftLightbox(-1);
  else if(e.key==='ArrowRight')shiftLightbox(1);
}
function showLightboxAt(idx){
  if(idx<0)idx=_lightboxList.length-1;
  if(idx>=_lightboxList.length)idx=0;
  _lightboxIdx=idx;
  const d=_lightboxList[idx];
  const img=document.getElementById('duyuruLightboxImg');
  const info=document.getElementById('duyuruLightboxInfo');
  const nav=document.getElementById('duyuruLightboxNav');
  if(d.gorsel){
    img.src=d.gorsel;
    img.style.display='';
  }else{
    img.style.display='none';
  }
  info.innerHTML='<div style="font-size:14px;font-weight:700;margin-bottom:4px">'+(d.baslik||'')+'</div>'+
    (d.aciklama?'<div style="font-size:11px;color:rgba(255,255,255,0.75);line-height:1.5">'+d.aciklama+'</div>':'')+
    (_lightboxList.length>1?'<div style="font-size:10px;color:rgba(255,255,255,0.5);margin-top:6px">'+(idx+1)+' / '+_lightboxList.length+'</div>':'');
  nav.style.display=_lightboxList.length>1?'flex':'none';
}
function shiftLightbox(delta){showLightboxAt(_lightboxIdx+delta);}
function closeDuyuruLightbox(e){
  if(e&&e.target&&e.target.id!=='duyuruLightbox'&&!e.target.closest('button'))return;
  document.getElementById('duyuruLightbox').style.display='none';
  document.removeEventListener('keydown',_lightboxKeyHandler);
  // Carousel timer'ı yeniden başlat
  if(duyurular.length>1&&!duyuruTimer)duyuruTimer=setInterval(nextDuyuru,5000);
}
function downloadLightboxImage(){
  const d=_lightboxList[_lightboxIdx];
  if(!d||!d.gorsel)return;
  const a=document.createElement('a');
  a.href=d.gorsel;
  const ext=(d.dosya_tipi||'jpg').toLowerCase();
  a.download=(d.baslik||'duyuru').replace(/[^a-z0-9-_]/gi,'_')+'.'+ext;
  document.body.appendChild(a);a.click();document.body.removeChild(a);
}
// Carousel'da görsele tıklayınca lightbox aç (sıradakine geçme)
function openCurrentDuyuruImage(e){
  if(e)e.stopPropagation();
  if(!duyurular.length)return;
  const d=duyurular[duyuruIdx];
  if(!d.gorsel){showToast('Bu duyuruda görsel yok',true);return;}
  // Sadece görseli olan duyuruları lightbox listesine al
  const withImages=duyurular.filter(x=>x.gorsel);
  const realIdx=withImages.findIndex(x=>x.id===d.id);
  openDuyuruLightbox(realIdx>=0?realIdx:0,withImages);
}

async function loadDuyurular(){
  try{
    const{data,error}=await sb.from('duyurular').select('*').order('created_at',{ascending:false});
    if(error){duyurular=[];return;}
    duyurular=data||[];
    startDuyuruCarousel();
  }catch(e){duyurular=[];}
}

function startDuyuruCarousel(){
  const el=document.getElementById('duyuruCarousel');
  if(!el)return;
  if(!duyurular.length){el.style.display='none';return;}
  el.style.display='block';
  duyuruIdx=0;
  renderDuyuruSlide();
  if(duyuruTimer)clearInterval(duyuruTimer);
  duyuruTimer=setInterval(nextDuyuru,5000);
}

function nextDuyuru(){
  if(!duyurular.length)return;
  duyuruIdx=(duyuruIdx+1)%duyurular.length;
  renderDuyuruSlide();
}

function renderDuyuruSlide(){
  const slide=document.getElementById('duyuruSlide');
  const dots=document.getElementById('duyuruDots');
  const car=document.getElementById('duyuruCarousel');
  if(!slide||!duyurular.length)return;
  const d=duyurular[duyuruIdx];
  const bg=d.renk||'#1a1a2e';
  // Gradient background like elfiniletisim.com
  const gradients={
    '#1a1a2e':'linear-gradient(135deg,#1a1a2e 0%,#2d3561 100%)',
    '#0d3b66':'linear-gradient(135deg,#0d3b66 0%,#1a6fb5 100%)',
    '#3d0c02':'linear-gradient(135deg,#3d0c02 0%,#8b1a1a 100%)',
    '#1b4332':'linear-gradient(135deg,#1b4332 0%,#2d6a4f 100%)',
    '#FFD100':'linear-gradient(135deg,#e6a800 0%,#FFD100 50%,#ffe066 100%)'
  };
  car.style.background=gradients[bg]||bg;
  const isLight=bg==='#FFD100';
  const titleColor=isLight?'#1a1a2e':'#fff';
  const textColor=isLight?'rgba(0,0,0,0.7)':'rgba(255,255,255,0.85)';
  const labelColor=isLight?'rgba(0,0,0,0.5)':'rgba(255,255,255,0.5)';

  let imgHtml='';
  if(d.gorsel){
    imgHtml='<div onclick="openCurrentDuyuruImage(event)" style="flex:0 0 100px;height:100px;border-radius:14px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.2);cursor:zoom-in;position:relative" title="Büyütmek için tıkla"><img src="'+d.gorsel+'" style="width:100%;height:100%;object-fit:cover;pointer-events:none"><div style="position:absolute;bottom:4px;right:4px;background:rgba(0,0,0,0.6);color:#fff;font-size:10px;padding:2px 5px;border-radius:4px;pointer-events:none">🔍</div></div>';
  }

  const label=d.dosya_tipi?('📎 '+d.dosya_tipi.toUpperCase()):'📢 DUYURU';

  slide.innerHTML=imgHtml+
    '<div style="flex:1;min-width:0">'+
      '<div style="font-size:10px;letter-spacing:2px;color:'+labelColor+';margin-bottom:6px;font-weight:600">'+label+'</div>'+
      '<div style="font-weight:800;font-size:18px;color:'+titleColor+';margin-bottom:6px;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+d.baslik+'</div>'+
      '<div style="font-size:12px;color:'+textColor+';line-height:1.5;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">'+(d.ozet||d.aciklama||'')+'</div>'+
    '</div>';

  // Centered dots like elfiniletisim.com
  if(dots&&duyurular.length>1){
    dots.innerHTML=duyurular.map(function(_,i){
      const active=i===duyuruIdx;
      return '<div style="width:'+(active?'20px':'8px')+';height:8px;border-radius:4px;background:'+(active?titleColor:'rgba(255,255,255,0.35)')+';transition:all 0.3s;opacity:'+(active?'1':'0.6')+'"></div>';
    }).join('');
  }
}

function openDuyuruModal(){
  document.getElementById('duyuruBaslik').value='';
  document.getElementById('duyuruAciklama').value='';
  document.getElementById('duyuruFile').value='';
  document.getElementById('duyuruFilePreview').style.display='none';
  duyuruColor='#1a1a2e';
  document.querySelectorAll('#duyuruColorPick div').forEach(function(el){
    el.style.borderColor=el.dataset.c==='#1a1a2e'?'var(--yellow)':'transparent';
  });
  document.getElementById('duyuruModal').style.display='flex';
}
function closeDuyuruModal(){document.getElementById('duyuruModal').style.display='none';}
function pickDuyuruColor(c){
  duyuruColor=c;
  document.querySelectorAll('#duyuruColorPick div').forEach(function(el){
    el.style.borderColor=el.dataset.c===c?'var(--yellow)':'transparent';
  });
}

async function saveDuyuru(){
  const baslik=document.getElementById('duyuruBaslik').value.trim();
  if(!baslik){showToast('Başlık gerekli!',true);return;}
  const aciklama=document.getElementById('duyuruAciklama').value.trim();
  const file=document.getElementById('duyuruFile').files[0];
  showLoading(true);
  let ozet=aciklama;
  let gorsel=null;
  let dosya_tipi=null;

  try{
    if(file){
      const ext=file.name.split('.').pop().toLowerCase();
      dosya_tipi=ext;

      if(ext==='jpg'||ext==='jpeg'||ext==='png'){
        // Resim: base64 olarak kaydet
        gorsel=await new Promise(function(res){
          const r=new FileReader();
          r.onload=function(){res(r.result);};
          r.readAsDataURL(file);
        });
        if(!ozet)ozet='📸 Görsel kampanya';
      }else if(ext==='pdf'){
        // PDF: İlk sayfa metnini çıkar
        try{
          const pdfjsLib=await import('https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/+esm');
          pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/build/pdf.worker.min.mjs';
          const ab=await file.arrayBuffer();
          const pdf=await pdfjsLib.getDocument({data:ab}).promise;
          let txt='';
          for(let i=1;i<=Math.min(pdf.numPages,3);i++){
            const pg=await pdf.getPage(i);
            const tc=await pg.getTextContent();
            txt+=tc.items.map(function(it){return it.str;}).join(' ')+' ';
          }
          if(!ozet)ozet=txt.trim().substring(0,300);
        }catch(pe){if(!ozet)ozet='📄 PDF kampanya dokümanı';}
      }else if(ext==='xlsx'||ext==='xls'){
        try{
          const XLSX=await import('https://cdn.sheetjs.com/xlsx-0.20.1/package/xlsx.mjs');
          const ab=await file.arrayBuffer();
          const wb=XLSX.read(ab);
          const ws=wb.Sheets[wb.SheetNames[0]];
          const txt=XLSX.utils.sheet_to_csv(ws).substring(0,500);
          if(!ozet)ozet=txt.split('\n').slice(0,5).join(' · ');
        }catch(xe){if(!ozet)ozet='📊 Excel kampanya tablosu';}
      }else if(ext==='docx'){
        try{
          const mammoth=await import('https://cdn.jsdelivr.net/npm/mammoth@1.6.0/+esm');
          const ab=await file.arrayBuffer();
          const result=await mammoth.extractRawText({arrayBuffer:ab});
          if(!ozet)ozet=result.value.trim().substring(0,300);
        }catch(we){if(!ozet)ozet='📝 Word kampanya dokümanı';}
      }
    }

    if(!ozet)ozet=baslik;
    // Görsel 1MB'dan büyükse kırp
    if(gorsel&&gorsel.length>1000000)gorsel=null;

    const{error}=await sb.from('duyurular').insert([{baslik,aciklama,ozet:ozet.substring(0,500),gorsel,dosya_tipi,renk:duyuruColor}]);
    if(error){
      if(error.message.includes('schema cache')||error.message.includes('not find'))
        throw new Error('Duyuru tablosu henüz oluşturulmamış! Supabase SQL Editor\'da tabloyu oluşturun.');
      throw error;
    }
    showToast('📢 Duyuru yayınlandı!');
    closeDuyuruModal();
    await loadDuyurular();
    renderDuyuruList();
  }catch(e){showToast('Hata: '+e.message,true);}
  showLoading(false);
}

async function deleteDuyuru(id){
  if(!confirm('Bu duyuruyu silmek istiyor musunuz?'))return;
  try{
    await sb.from('duyurular').delete().eq('id',id);
    showToast('Duyuru silindi');
    await loadDuyurular();
    renderDuyuruList();
  }catch(e){showToast('Hata: '+e.message,true);}
}

function renderDuyuruList(){
  const el=document.getElementById('duyuruListPage');
  if(!el)return;
  if(!duyurular.length){el.innerHTML='<div style="background:#fff;border-radius:12px;border:1px solid var(--border);padding:40px;text-align:center;color:var(--gray)"><div style="font-size:40px;margin-bottom:10px">📢</div>Henüz duyuru eklenmedi.<br><br><button class="btn btn-p" onclick="openDuyuruModal()">+ İlk Duyuruyu Ekle</button></div>';return;}
  // Görseli olan duyuruları lightbox listesi için sıraya koy
  const withImages=duyurular.filter(x=>x.gorsel);
  let html='<div style="display:grid;gap:12px">';
  duyurular.forEach(function(d){
    const tarih=new Date(d.created_at).toLocaleDateString('tr-TR',{day:'numeric',month:'short',year:'numeric'});
    const icons={'pdf':'📄','xlsx':'📊','docx':'📝','jpg':'🖼️','jpeg':'🖼️','png':'🖼️'};
    const icon=icons[d.dosya_tipi]||'📢';
    const imgIdx=withImages.findIndex(x=>x.id===d.id);
    html+='<div style="background:#fff;border-radius:12px;border:1px solid var(--border);overflow:hidden;box-shadow:0 2px 6px rgba(0,0,0,0.04)">';
    html+='<div style="background:'+(d.renk||'#1a1a2e')+';padding:14px 16px;display:flex;align-items:center;gap:12px">';
    if(d.gorsel){
      html+='<div onclick="openDuyuruLightbox('+imgIdx+',duyurular.filter(x=>x.gorsel))" style="position:relative;cursor:zoom-in;flex-shrink:0" title="Büyütmek için tıkla"><img src="'+d.gorsel+'" style="width:50px;height:50px;border-radius:8px;object-fit:cover;display:block"><div style="position:absolute;bottom:2px;right:2px;background:rgba(0,0,0,0.6);color:#fff;font-size:9px;padding:1px 4px;border-radius:3px">🔍</div></div>';
    }else{
      html+='<span style="font-size:24px">'+icon+'</span>';
    }
    html+='<div style="flex:1"><div style="font-weight:700;font-size:14px;color:#FFD100">'+d.baslik+'</div>';
    html+='<div style="font-size:10px;color:rgba(255,255,255,0.6)">'+tarih+(d.dosya_tipi?' · '+d.dosya_tipi.toUpperCase():'')+'</div></div>';
    if(d.gorsel){
      html+='<button class="btn btn-e bsm" style="font-size:10px;background:rgba(255,255,255,0.15);color:#fff;border:none;margin-right:4px" onclick="openDuyuruLightbox('+imgIdx+',duyurular.filter(x=>x.gorsel))" title="Büyüt">🔍</button>';
    }
    html+='<button class="btn btn-e bsm" style="font-size:10px;background:rgba(255,255,255,0.15);color:#fff;border:none" onclick="deleteDuyuru(\''+d.id+'\')">🗑</button>';
    html+='</div>';
    html+='<div style="padding:12px 16px;font-size:12px;color:var(--gray);line-height:1.5">'+(d.ozet||d.aciklama||'')+'</div>';
    html+='</div>';
  });
  html+='</div>';
  el.innerHTML=html;
}

// ============ TDM EK DESTEKLER ============
let tdmEkDestekler=[];

async function loadTdmEkDestekler(){
  try{
    const{data,error}=await sb.from('tdm_ek_destekler').select('*').order('baslangic',{ascending:false});
    if(error){tdmEkDestekler=[];return;}
    tdmEkDestekler=data||[];
  }catch(e){tdmEkDestekler=[];}
}

function openTdmEkModal(editId){
  document.getElementById('tdmEkEditId').value=editId||'';
  document.getElementById('tdmEkAd').value='';
  document.getElementById('tdmEkBasla').value=new Date().toISOString().split('T')[0];
  const eom=new Date(activeYear,activeMonth+1,0);
  document.getElementById('tdmEkBitis').value=eom.toISOString().split('T')[0];
  document.getElementById('tdmEkTip').value='adet';
  document.getElementById('tdmEkDeger').value='';
  document.getElementById('tdmEkNot').value='';
  // Ürün listesi doldur
  const sel=document.getElementById('tdmEkUrun');
  sel.innerHTML=products.map(function(p,i){return p.hidden?'':'<option value="'+i+'">'+p.name+'</option>';}).join('');
  // Edit mode
  if(editId){
    const k=tdmEkDestekler.find(function(x){return x.id===editId;});
    if(k){
      sel.value=k.urun_id;
      document.getElementById('tdmEkAd').value=k.kampanya_adi||'';
      document.getElementById('tdmEkBasla').value=k.baslangic||'';
      document.getElementById('tdmEkBitis').value=k.bitis||'';
      document.getElementById('tdmEkTip').value=k.prim_tipi||'adet';
      document.getElementById('tdmEkDeger').value=k.prim_degeri||'';
      document.getElementById('tdmEkNot').value=k.aciklama||'';
    }
  }
  toggleTdmEkTip();
  document.getElementById('tdmEkModal').style.display='flex';
}
function closeTdmEkModal(){document.getElementById('tdmEkModal').style.display='none';}
function toggleTdmEkTip(){
  const tip=document.getElementById('tdmEkTip').value;
  document.getElementById('tdmEkDeger').placeholder=tip==='adet'?'ör: 150 (₺/adet)':'ör: 5 (%)';
}

async function saveTdmEk(){
  const urunId=parseInt(document.getElementById('tdmEkUrun').value);
  const ad=document.getElementById('tdmEkAd').value.trim();
  const basla=document.getElementById('tdmEkBasla').value;
  const bitis=document.getElementById('tdmEkBitis').value;
  const tip=document.getElementById('tdmEkTip').value;
  const deger=parseFloat(document.getElementById('tdmEkDeger').value)||0;
  if(!ad){showToast('Kampanya adı gerekli!',true);return;}
  if(!basla||!bitis){showToast('Tarih aralığı gerekli!',true);return;}
  if(deger<=0){showToast('Prim değeri giriniz!',true);return;}
  const obj={urun_id:urunId,kampanya_adi:ad,baslangic:basla,bitis:bitis,prim_tipi:tip,prim_degeri:deger,aciklama:document.getElementById('tdmEkNot').value.trim()};
  const editId=document.getElementById('tdmEkEditId').value;
  try{
    if(editId){
      const{error}=await sb.from('tdm_ek_destekler').update(obj).eq('id',editId);
      if(error)throw error;
      showToast('✓ Kampanya güncellendi!');
    }else{
      const{error}=await sb.from('tdm_ek_destekler').insert([obj]);
      if(error)throw error;
      showToast('✓ Ek destek kampanyası eklendi!');
    }
    closeTdmEkModal();
    await loadTdmEkDestekler();
    renderTdmEkList();
  }catch(e){showToast('Hata: '+e.message,true);}
}

async function deleteTdmEk(id){
  if(!confirm('Bu kampanyayı silmek istiyor musunuz?'))return;
  try{
    await sb.from('tdm_ek_destekler').delete().eq('id',id);
    showToast('Kampanya silindi');
    await loadTdmEkDestekler();renderTdmEkList();
  }catch(e){showToast('Hata: '+e.message,true);}
}

function renderTdmEkList(){
  const el=document.getElementById('tdmEkList');
  const countEl=document.getElementById('tdmEkCount');
  if(!el)return;
  const today=new Date().toISOString().split('T')[0];
  const aktifler=tdmEkDestekler.filter(function(k){return k.baslangic<=today&&k.bitis>=today;});
  if(countEl)countEl.textContent=aktifler.length;

  if(!tdmEkDestekler.length){el.innerHTML='<div style="text-align:center;color:var(--gray);font-size:11px;padding:10px">Henüz ek destek kampanyası eklenmedi.</div>';return;}

  let html='';
  tdmEkDestekler.forEach(function(k){
    const p=products[k.urun_id];
    const pName=p?p.name:'Ürün #'+k.urun_id;
    const aktif=k.baslangic<=today&&k.bitis>=today;
    const gecmis=k.bitis<today;
    const gelecek=k.baslangic>today;
    const durumLabel=aktif?'🟢 AKTİF':gecmis?'⚫ BİTTİ':'🟡 BAŞLAMADI';
    const durumColor=aktif?'var(--green)':gecmis?'var(--gray)':'var(--yellow)';
    const bg=aktif?'rgba(0,168,107,0.05)':gecmis?'rgba(0,0,0,0.02)':'rgba(230,168,0,0.05)';
    const primLabel=k.prim_tipi==='adet'?fmtTL(k.prim_degeri)+'/adet':'%'+k.prim_degeri+' karlılık';

    // Tarih aralığındaki satışları say
    let etkilenenAdet=0;
    if(p){
      const ms=getMonthSales().filter(function(s){
        if(s.prod!==k.urun_id)return false;
        const sd=s.created_at?s.created_at.split('T')[0]:'';
        return sd>=k.baslangic&&sd<=k.bitis;
      });
      etkilenenAdet=ms.reduce(function(a,s){return a+s.qty;},0);
    }
    const ekPrimToplam=k.prim_tipi==='adet'?k.prim_degeri*etkilenenAdet:0;

    html+='<div style="background:'+bg+';border:1px solid var(--border);border-radius:10px;padding:12px;margin-bottom:8px;'+(gecmis?'opacity:0.6;':'')+'">';
    html+='<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">';
    html+='<div style="flex:1;min-width:180px">';
    html+='<div style="display:flex;align-items:center;gap:8px;margin-bottom:3px">';
    html+='<span style="font-weight:700;font-size:13px;color:#1a1a2e">'+k.kampanya_adi+'</span>';
    html+='<span style="font-size:8px;padding:2px 6px;border-radius:8px;background:'+durumColor+'20;color:'+durumColor+';font-weight:700">'+durumLabel+'</span>';
    html+='</div>';
    html+='<div style="font-size:11px;color:var(--gray)">📦 '+pName+' · <strong style="color:var(--green)">+'+primLabel+'</strong></div>';
    html+='<div style="font-size:10px;color:var(--gray);margin-top:2px">📅 '+new Date(k.baslangic).toLocaleDateString('tr-TR')+' → '+new Date(k.bitis).toLocaleDateString('tr-TR');
    if(etkilenenAdet>0)html+=' · <span style="color:var(--blue)">'+etkilenenAdet+' satış etkilendi'+(ekPrimToplam>0?' (+'+fmtTL(ekPrimToplam)+')':'')+'</span>';
    html+='</div>';
    if(k.aciklama)html+='<div style="font-size:9px;color:var(--gray);margin-top:2px;font-style:italic">📝 '+k.aciklama+'</div>';
    html+='</div>';
    html+='<div style="display:flex;gap:4px">';
    html+='<button class="btn btn-gr bsm" onclick="openTdmEkModal(\''+k.id+'\')" style="font-size:10px">✏️</button>';
    html+='<button class="btn btn-e bsm" onclick="deleteTdmEk(\''+k.id+'\')" style="font-size:10px">🗑</button>';
    html+='</div></div></div>';
  });
  el.innerHTML=html;
}

// TDM ek prim hesaplama (satış bazlı)
function getTdmEkPrim(saleDate,prodIdx,qty,manuelPrim){
  let ekPrim=0;
  const sd=saleDate?saleDate.split('T')[0]:'';
  tdmEkDestekler.forEach(function(k){
    if(k.urun_id!==prodIdx)return;
    if(sd<k.baslangic||sd>k.bitis)return;
    if(k.prim_tipi==='adet'){ekPrim+=k.prim_degeri*qty;}
    else if(k.prim_tipi==='yuzde'){ekPrim+=Math.round((manuelPrim||0)*qty*(k.prim_degeri/100));}
  });
  return ekPrim;
}

// ============ PREP MNT TAKİP ============
let prepMntList=[];
let prepMntFilter='all';

async function loadPrepMnt(){
  try{
    const{data,error}=await sb.from('prep_mnt_takip').select('*').order('created_at',{ascending:false});
    if(error){prepMntList=[];return;}
    prepMntList=data||[];
  }catch(e){prepMntList=[];}
}

function openPrepMntModal(editId){
  document.getElementById('prepMntEditId').value=editId||'';
  document.getElementById('prepMntAd').value='';
  document.getElementById('prepMntTel').value='';
  document.getElementById('prepMntBasvuru').value=new Date().toISOString().split('T')[0];
  document.getElementById('prepMntTutar').value='';
  document.getElementById('prepMntOdeme').value='nakit';
  document.getElementById('prepMntPaketTarih').value='';
  document.getElementById('prepMntDurum').value='bekliyor';
  document.getElementById('prepMntNot').value='';
  // Çalışan select doldur
  const sel=document.getElementById('prepMntCalisan');
  sel.innerHTML=employees.map(function(e,i){return '<option value="'+i+'">'+e.name+'</option>';}).join('');
  // Edit mode
  if(editId){
    const m=prepMntList.find(function(x){return x.id===editId;});
    if(m){
      document.getElementById('prepMntAd').value=m.ad||'';
      document.getElementById('prepMntTel').value=m.telefon||'';
      document.getElementById('prepMntBasvuru').value=m.basvuru_tarihi||'';
      document.getElementById('prepMntTutar').value=m.on_odeme||'';
      document.getElementById('prepMntOdeme').value=m.odeme_sekli||'nakit';
      document.getElementById('prepMntPaketTarih').value=m.paket_tarihi||'';
      document.getElementById('prepMntDurum').value=m.durum||'bekliyor';
      document.getElementById('prepMntNot').value=m.not_text||'';
      sel.value=m.calisan||0;
    }
  }
  document.getElementById('prepMntModal').style.display='flex';
}
function closePrepMntModal(){document.getElementById('prepMntModal').style.display='none';}

async function savePrepMnt(){
  const ad=document.getElementById('prepMntAd').value.trim();
  const tel=document.getElementById('prepMntTel').value.trim();
  if(!ad||!tel){showToast('Ad ve telefon gerekli!',true);return;}
  const obj={
    ad:ad,
    telefon:fixPhone(tel),
    basvuru_tarihi:document.getElementById('prepMntBasvuru').value||null,
    calisan:parseInt(document.getElementById('prepMntCalisan').value)||0,
    on_odeme:parseFloat(document.getElementById('prepMntTutar').value)||0,
    odeme_sekli:document.getElementById('prepMntOdeme').value,
    paket_tarihi:document.getElementById('prepMntPaketTarih').value||null,
    durum:document.getElementById('prepMntDurum').value,
    not_text:document.getElementById('prepMntNot').value.trim()
  };
  const editId=document.getElementById('prepMntEditId').value;
  try{
    if(editId){
      const{error}=await sb.from('prep_mnt_takip').update(obj).eq('id',editId);
      if(error)throw error;
      showToast('✓ Kayıt güncellendi!');
    }else{
      const{error}=await sb.from('prep_mnt_takip').insert([obj]);
      if(error)throw error;
      showToast('✓ Yeni müşteri eklendi!');
    }
    closePrepMntModal();
    await loadPrepMnt();
    renderPrepMnt();
  }catch(e){showToast('Hata: '+e.message,true);}
}

async function deletePrepMnt(id){
  if(!confirm('Bu kaydı silmek istiyor musunuz?'))return;
  try{
    await sb.from('prep_mnt_takip').delete().eq('id',id);
    showToast('Kayıt silindi');
    await loadPrepMnt();renderPrepMnt();
  }catch(e){showToast('Hata: '+e.message,true);}
}

async function updatePrepMntDurum(id,durum){
  try{
    const update={durum:durum};
    if(durum==='paket_yuklendi')update.paket_tarihi=new Date().toISOString().split('T')[0];
    await sb.from('prep_mnt_takip').update(update).eq('id',id);
    showToast('✓ Durum güncellendi!');
    await loadPrepMnt();renderPrepMnt();
  }catch(e){showToast('Hata: '+e.message,true);}
}

const PREP_MNT_DURUM={
  bekliyor:{label:'⏳ Hat Bekleniyor',color:'var(--yellow)',bg:'rgba(230,168,0,0.08)'},
  paket_yuklendi:{label:'📦 Paket Yüklendi',color:'var(--blue)',bg:'rgba(43,123,232,0.08)'},
  faturali_teklif:{label:'📞 Faturalı Teklif',color:'var(--purple)',bg:'rgba(155,89,182,0.08)'},
  faturaliya_gecti:{label:'✅ Faturalıya Geçti',color:'var(--green)',bg:'rgba(0,168,107,0.08)'},
  red:{label:'❌ Red / İptal',color:'var(--red)',bg:'rgba(230,57,70,0.08)'}
};

function renderPrepMnt(){
  const today=new Date();
  const todayS=today.toISOString().split('T')[0];

  // İstatistikler
  const bekliyor=prepMntList.filter(function(m){return m.durum==='bekliyor';}).length;
  const paketYuklendi=prepMntList.filter(function(m){return m.durum==='paket_yuklendi';}).length;
  const teklifYapildi=prepMntList.filter(function(m){return m.durum==='faturali_teklif';}).length;
  const gecti=prepMntList.filter(function(m){return m.durum==='faturaliya_gecti';}).length;
  const topTutar=prepMntList.reduce(function(a,m){return a+(m.on_odeme||0);},0);

  document.getElementById('prepMntPs').textContent=prepMntList.length+' müşteri · Toplam ön ödeme: '+fmtTL(topTutar);
  document.getElementById('prepMntCards').innerHTML=
    '<div class="kc" style="--ac:var(--yellow);cursor:pointer;'+(prepMntFilter==='bekliyor'?'border:2px solid var(--yellow)':'')+'" onclick="prepMntFilter=\'bekliyor\';renderPrepMnt()"><div class="kl">BEKLİYOR</div><div class="kv" style="color:var(--yellow)">'+bekliyor+'</div></div>'+
    '<div class="kc" style="--ac:var(--blue);cursor:pointer;'+(prepMntFilter==='paket_yuklendi'?'border:2px solid var(--blue)':'')+'" onclick="prepMntFilter=\'paket_yuklendi\';renderPrepMnt()"><div class="kl">PAKET YÜKLENDİ</div><div class="kv" style="color:var(--blue)">'+paketYuklendi+'</div></div>'+
    '<div class="kc" style="--ac:var(--purple);cursor:pointer;'+(prepMntFilter==='faturali_teklif'?'border:2px solid var(--purple)':'')+'" onclick="prepMntFilter=\'faturali_teklif\';renderPrepMnt()"><div class="kl">TEKLİF YAPILDI</div><div class="kv" style="color:var(--purple)">'+teklifYapildi+'</div></div>'+
    '<div class="kc" style="--ac:var(--green);cursor:pointer;'+(prepMntFilter==='faturaliya_gecti'?'border:2px solid var(--green)':'')+'" onclick="prepMntFilter=\'faturaliya_gecti\';renderPrepMnt()"><div class="kl">FATURALIYA GEÇTİ</div><div class="kv" style="color:var(--green)">'+gecti+'</div></div>';

  // Filtre butonları
  document.getElementById('prepMntFilters').innerHTML=
    '<button class="btn '+(prepMntFilter==='all'?'btn-p':'btn-g')+' bsm" onclick="prepMntFilter=\'all\';renderPrepMnt()">Hepsi ('+prepMntList.length+')</button>'+
    '<button class="btn '+(prepMntFilter==='aksiyonlu'?'btn-p':'btn-g')+' bsm" onclick="prepMntFilter=\'aksiyonlu\';renderPrepMnt()">🔔 Aksiyon Gerekli</button>';

  // Filtreleme
  var list=prepMntList;
  if(prepMntFilter==='aksiyonlu'){
    list=prepMntList.filter(function(m){
      if(m.durum==='faturaliya_gecti'||m.durum==='red')return false;
      if(m.durum==='bekliyor')return true; // Hat hala açılmamış
      if(m.durum==='paket_yuklendi'&&m.paket_tarihi){
        // 30 gün geçtiyse faturalı teklif zamanı
        var diff=Math.round((today-new Date(m.paket_tarihi))/86400000);
        if(diff>=30)return true;
      }
      return false;
    });
  }else if(prepMntFilter!=='all'){
    list=prepMntList.filter(function(m){return m.durum===prepMntFilter;});
  }

  // Liste
  var el=document.getElementById('prepMntList');
  if(!list.length){el.innerHTML='<div style="background:#fff;border-radius:12px;border:1px solid var(--border);padding:30px;text-align:center;color:var(--gray)">'+
    (prepMntFilter==='all'?'Henüz kayıt yok. <button class="btn btn-p bsm" onclick="openPrepMntModal()" style="margin-top:8px">+ İlk Kaydı Ekle</button>':'Bu kategoride kayıt yok.')+
    '</div>';return;}

  var html='';
  list.forEach(function(m){
    var d=PREP_MNT_DURUM[m.durum]||PREP_MNT_DURUM.bekliyor;
    var emp=employees[m.calisan]||{name:'—',color:'#999',initials:'?'};
    var basvuruGun=m.basvuru_tarihi?Math.round((today-new Date(m.basvuru_tarihi))/86400000):0;
    var paketGun=m.paket_tarihi?Math.round((today-new Date(m.paket_tarihi))/86400000):null;
    var faturaliReady=m.durum==='paket_yuklendi'&&paketGun!==null&&paketGun>=30;

    // Aksiyon butonu
    var aksiyonBtn='';
    if(m.durum==='bekliyor'){
      aksiyonBtn='<button class="btn btn-p bsm" onclick="updatePrepMntDurum(\''+m.id+'\',\'paket_yuklendi\')" style="font-size:10px">📦 Paket Yüklendi</button>';
    }else if(m.durum==='paket_yuklendi'&&faturaliReady){
      aksiyonBtn='<button class="btn btn-p bsm" onclick="updatePrepMntDurum(\''+m.id+'\',\'faturali_teklif\')" style="font-size:10px;background:var(--purple)">📞 Teklif Yapıldı</button>';
    }else if(m.durum==='faturali_teklif'){
      aksiyonBtn='<button class="btn btn-p bsm" onclick="updatePrepMntDurum(\''+m.id+'\',\'faturaliya_gecti\')" style="font-size:10px;background:var(--green)">✅ Faturalıya Geçti</button>';
    }

    // Zaman bilgisi
    var zamanInfo='';
    if(m.durum==='bekliyor'){zamanInfo='<span style="color:var(--yellow)">'+basvuruGun+' gündür bekleniyor</span>';}
    else if(m.durum==='paket_yuklendi'&&paketGun!==null){
      var kalanGun=Math.max(0,30-paketGun);
      zamanInfo=kalanGun>0?'<span style="color:var(--blue)">Faturalı teklife '+kalanGun+' gün</span>':'<span style="color:var(--purple);font-weight:700">🔔 Faturalı teklif zamanı!</span>';
    }

    html+='<div style="background:'+d.bg+';border-radius:12px;border:1px solid var(--border);padding:14px;margin-bottom:8px">';
    html+='<div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">';
    // Sol: müşteri bilgi
    html+='<div style="flex:1;min-width:180px">';
    html+='<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">';
    html+='<span style="font-weight:700;font-size:14px;color:#1a1a2e">'+m.ad+'</span>';
    html+='<span style="font-size:9px;padding:2px 8px;border-radius:10px;background:'+d.bg+';color:'+d.color+';font-weight:700;border:1px solid '+d.color+'40">'+d.label+'</span>';
    html+='</div>';
    html+='<div style="font-size:11px;color:var(--gray)">'+(m.telefon||'—')+' · Başvuru: '+(m.basvuru_tarihi?new Date(m.basvuru_tarihi).toLocaleDateString('tr-TR'):'—')+'</div>';
    html+='<div style="font-size:11px;color:var(--gray);margin-top:2px">';
    html+='Ön Ödeme: <strong style="color:#1a1a2e">'+fmtTL(m.on_odeme||0)+'</strong> ('+(m.odeme_sekli==='kart'?'💳 Kart':'💵 Nakit')+')';
    if(m.paket_tarihi)html+=' · Paket: '+new Date(m.paket_tarihi).toLocaleDateString('tr-TR');
    html+='</div>';
    if(zamanInfo)html+='<div style="font-size:10px;margin-top:3px">'+zamanInfo+'</div>';
    if(m.not_text)html+='<div style="font-size:10px;color:var(--gray);margin-top:2px;font-style:italic">📝 '+m.not_text+'</div>';
    html+='</div>';
    // Sağ: çalışan + butonlar
    html+='<div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px">';
    html+='<div style="display:flex;align-items:center;gap:4px"><div style="width:20px;height:20px;border-radius:5px;background:'+emp.color+';display:flex;align-items:center;justify-content:center;font-family:\'Bebas Neue\';font-size:9px;color:#000">'+emp.initials+'</div><span style="font-size:10px;color:var(--gray)">'+emp.name.split(' ')[0]+'</span></div>';
    html+='<div style="display:flex;gap:4px">';
    html+='<a href="tel:'+(m.telefon||'').replace(/\\s/g,'')+'" class="btn btn-p bsm" style="text-decoration:none;font-size:10px">📞</a>';
    if(aksiyonBtn)html+=aksiyonBtn;
    html+='<button class="btn btn-gr bsm" onclick="openPrepMntModal(\''+m.id+'\')" style="font-size:10px">✏️</button>';
    html+='<button class="btn btn-e bsm" onclick="deletePrepMnt(\''+m.id+'\')" style="font-size:10px">🗑</button>';
    html+='</div></div>';
    html+='</div></div>';
  });
  el.innerHTML=html;
}

function renderSmsGonder(){
  const sel=document.getElementById('smsTekAlici');
  if(!sel)return;
  let html='<option value="">— Listeden seç veya numara gir —</option>';
  html+='<option disabled style="font-weight:700;color:var(--yellow)">── ÇALIŞANLAR ──</option>';
  employees.forEach((e,i)=>html+=`<option value="emp_${i}">${e.name} (${e.tel})</option>`);
  // CRM müşterilerinden son 20
  const recent=crmMusteriler.filter(m=>m.telefon).slice(0,20);
  if(recent.length){
    html+='<option disabled style="font-weight:700;color:var(--blue)">── SON MÜŞTERİLER ──</option>';
    recent.forEach(m=>html+=`<option value="crm_${m.id}">${m.ad} (${m.telefon})</option>`);
  }
  sel.innerHTML=html;
  document.getElementById('smsTekTel').value='';
  document.getElementById('smsTekMesaj').value='';
  smsTekSay();
}

function smsAliciSec(){
  const sel=document.getElementById('smsTekAlici');
  const tel=document.getElementById('smsTekTel');
  const val=sel.value;
  if(val.startsWith('emp_')){
    tel.value=employees[parseInt(val.split('_')[1])]?.tel||'';
  }else if(val.startsWith('crm_')){
    const m=crmMusteriler.find(x=>x.id===val.split('_')[1]);
    tel.value=m?m.telefon:'';
  }else{
    tel.value='';
  }
}

function smsTekSay(){
  const msg=document.getElementById('smsTekMesaj')?.value||'';
  const el=document.getElementById('smsTekCount');
  if(el)el.textContent=`(${msg.length}/160 · ${Math.ceil(msg.length/160)||1} SMS)`;
}

async function sendTekSms(){
  const tel=document.getElementById('smsTekTel').value.trim();
  const msg=document.getElementById('smsTekMesaj').value.trim();
  if(!tel){showToast('Telefon numarası girin!',true);return;}
  if(!msg){showToast('Mesaj yazın!',true);return;}
  if(!confirm(tel+' numarasına SMS göndermek istiyor musunuz?'))return;
  try{
    const{data,error}=await sb.rpc('send_sms',{p_telefon:tel,p_mesaj:msg});
    if(error)throw error;
    showToast('✓ SMS gönderildi!');
    document.getElementById('smsTekMesaj').value='';
    smsTekSay();
  }catch(e){showToast('SMS hatası: '+e.message,true);}
}

const SMS_ESPRI_TEMPLATES=[
  // Beşiktaş - Abdurrahman
  {takim:'Beşiktaşlı',espri:[
    'Kara Kartal gibi sahada ol haftaya!',
    'Beşiktaş ruhuyla haftaya dalış yap!',
    'Vodafone Park kadar dolu dolu bir hafta olsun!',
  ]},
  // Konyaspor - Hüseyin
  {takim:'Konyasporlu',espri:[
    'Konya ovası gibi geniş hedeflerle haftaya başla!',
    'Konyaspor gibi savaşçı ruhunla devam!',
    'Mevlana gibi dön ama satışta dön!',
  ]},
  // Fenerbahçe - Kerem
  {takim:'Fenerbahçeli',espri:[
    'Kadıköy tribünü gibi coşkulu bir hafta olsun!',
    'Fener ol sahayı aydınlat!',
    'Alex gibi asist yap, satışı kap!',
  ]},
  // Galatasaray - Melike
  {takim:'Galatasaraylı',espri:[
    'Cimbom ruhuyla rakipleri ez geç!',
    'Galatasaray gibi şampiyon performans!',
    'Aslan kız, sahaya çık!',
  ]},
];

function getRandomEspri(emp){
  const t=SMS_ESPRI_TEMPLATES.find(x=>emp.karakter&&emp.karakter.includes(x.takim));
  if(t&&t.espri.length)return t.espri[Math.floor(Math.random()*t.espri.length)];
  return 'Haftaya güzel bir başlangıç yap!';
}

function generateWeeklyReport(ei){
  const emp=employees[ei];
  const st=getEmpStats(ei);
  const ms=getMonthSales();
  const empSales=ms.filter(s=>s.emp===ei);

  // Haftalık (son 7 gün) verileri
  const today=new Date();
  const week=new Date(today);week.setDate(week.getDate()-7);
  const weekStr=week.toISOString().split('T')[0];
  let hPP=0,hPR=0,hAdet=0,hPuan=0;
  sales.filter(s=>s.emp===ei&&s.date>=weekStr).forEach(s=>{
    const p=products[s.prod];
    hAdet+=s.qty;hPuan+=p.puan*s.qty;
    if(p.tip==='postpaid')hPP+=s.qty;
    else if(p.tip==='prepaid')hPR+=s.qty;
  });

  // En az satılan ürün kategorisi
  const urunSayilari={};
  products.forEach((p,pi)=>{
    if(p.hidden)return;
    let qty=0;empSales.filter(s=>s.prod===pi).forEach(s=>qty+=s.qty);
    if(p.hedef>0)urunSayilari[p.name]={qty,hedef:p.hedef,oran:Math.round(qty/p.hedef*100)};
  });
  const eksikler=Object.entries(urunSayilari).filter(([k,v])=>v.oran<70).sort((a,b)=>a[1].oran-b[1].oran);
  const enIyi=Object.entries(urunSayilari).filter(([k,v])=>v.oran>=100).sort((a,b)=>b[1].oran-a[1].oran);

  // Mesaj oluştur
  const ad=emp.name.split(' ')[0];
  const espri=getRandomEspri(emp);
  let msg=`Merhaba ${ad}! 🎯\n\n`;
  msg+=`📊 HAFTALIK RAPOR:\n`;
  msg+=`Toplam: ${hAdet} satış (${hPP} PP + ${hPR} PR)\n`;
  msg+=`Puan: ${fmt(hPuan)}\n\n`;

  if(enIyi.length>0){
    msg+=`✅ Güçlü: ${enIyi.slice(0,2).map(([k])=>k).join(', ')}\n`;
  }
  if(eksikler.length>0){
    msg+=`⚠️ Dikkat: ${eksikler.slice(0,2).map(([k,v])=>k+' (%'+v.oran+')').join(', ')}\n`;
  }
  msg+=`\n${espri}\n`;
  msg+=`\n- Elfin İletişim`;

  return{emp,msg,hAdet,hPP,hPR,hPuan,eksikler,enIyi};
}

let weeklyReports=[];

function generateWeeklyReports(){
  weeklyReports=employees.map((_,i)=>generateWeeklyReport(i));
  renderSmsRapor();
  showToast('✓ Raporlar oluşturuldu!');
}

function renderSmsRapor(){
  const el=document.getElementById('smsRaporCards');if(!el)return;
  if(!weeklyReports.length){
    el.innerHTML='<div style="color:var(--gray);text-align:center;padding:30px">Henüz rapor oluşturulmadı. "Raporları Oluştur" butonuna basın.</div>';
    return;
  }
  el.innerHTML=weeklyReports.map((r,i)=>{
    const emp=r.emp;
    return`<div style="background:#fff;border-radius:12px;border:1px solid ${emp.color}40;padding:18px;margin-bottom:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
        <div style="display:flex;align-items:center;gap:10px;">
          <div class="av" style="background:${emp.color};width:38px;height:38px;font-size:14px">${emp.initials}</div>
          <div>
            <div style="font-weight:600;font-size:14px;color:#1a1a2e">${emp.name}</div>
            <div style="font-size:10px;color:var(--gray)">${emp.tel} · Haftalık: ${r.hAdet} satış, ${fmt(r.hPuan)} puan</div>
          </div>
        </div>
        <div style="display:flex;gap:6px;">
          <button class="btn btn-p bsm" onclick="sendWeeklyReport(${i})">📤 Gönder</button>
        </div>
      </div>
      <div style="background:#f7f8fa;border-radius:10px;padding:14px;position:relative;">
        <textarea id="smsMsg_${i}" style="width:100%;min-height:140px;background:transparent;border:none;font-family:'Outfit';font-size:12px;color:#1a1a2e;resize:vertical;outline:none;line-height:1.6">${r.msg}</textarea>
        <div style="display:flex;justify-content:space-between;margin-top:8px;font-size:10px;color:var(--gray)">
          <span>${r.msg.length} karakter</span>
          <span>${Math.ceil(r.msg.length/160)} SMS</span>
        </div>
      </div>
    </div>`;
  }).join('');
}

async function sendWeeklyReport(idx){
  const r=weeklyReports[idx];
  const msg=document.getElementById('smsMsg_'+idx)?.value||r.msg;
  const tel=r.emp.tel;
  if(!tel){showToast('Telefon numarası yok!',true);return;}
  if(!confirm(r.emp.name+' kişisine SMS göndermek istiyor musunuz?'))return;
  try{
    const{data,error}=await sb.rpc('send_sms',{p_telefon:tel,p_mesaj:msg});
    if(error)throw error;
    showToast('✓ '+r.emp.name.split(' ')[0]+' kişisine SMS gönderildi!');
  }catch(e){showToast('SMS hatası: '+e.message,true);}
}

async function sendAllWeeklyReports(){
  if(!weeklyReports.length){showToast('Önce raporları oluşturun!',true);return;}
  if(!confirm(employees.length+' çalışana SMS göndermek istiyor musunuz?'))return;
  let ok=0,fail=0;
  for(let i=0;i<weeklyReports.length;i++){
    const r=weeklyReports[i];
    const msg=document.getElementById('smsMsg_'+i)?.value||r.msg;
    try{
      const{data,error}=await sb.rpc('send_sms',{p_telefon:r.emp.tel,p_mesaj:msg});
      if(error)throw error;
      ok++;
    }catch(e){fail++;console.error(e);}
  }
  showToast(`✓ ${ok} SMS gönderildi${fail>0?' ('+fail+' hata)':''}`);
}

async function renderSmsGecmis(){
  const tbody=document.getElementById('smsGecmisBody');if(!tbody)return;tbody.innerHTML='';
  try{
    const{data,error}=await sb.from('sms_kuyruk').select('*').order('created_at',{ascending:false}).limit(50);
    if(error)throw error;
    if(!data||!data.length){tbody.innerHTML='<tr><td colspan="4" style="text-align:center;color:var(--gray);padding:20px">Henüz SMS kaydı yok</td></tr>';return;}
    data.forEach(s=>{
      const durumColor=s.durum==='gonderildi'?'var(--green)':s.durum==='hata'?'var(--red)':'var(--gray)';
      tbody.insertAdjacentHTML('beforeend',`<tr>
        <td style="font-size:11px">${new Date(s.created_at).toLocaleString('tr-TR',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</td>
        <td>${s.telefon}</td>
        <td style="font-size:11px;max-width:300px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${s.mesaj}</td>
        <td style="color:${durumColor};font-weight:600;font-size:11px">${s.durum}</td>
      </tr>`);
    });
  }catch(e){tbody.innerHTML='<tr><td colspan="4" style="color:var(--red);padding:20px">Yükleme hatası: '+e.message+'</td></tr>';}
}

// ============================================================
// MOBILE MENU
// ============================================================
function toggleMobMenu(){
  document.querySelector('.sidebar').classList.toggle('mob-open');
  document.getElementById('mobOverlay').classList.toggle('open');
}
function closeMobMenu(){
  document.querySelector('.sidebar').classList.remove('mob-open');
  document.getElementById('mobOverlay').classList.remove('open');
}

// ============================================================
// ============================================================
// DSN BAYİ RAPORU
// ============================================================
function renderDsnRapor(){
  const ms=getMonthSales();
  // Baz Prim hesapla
  let bazTop=0;
  const bazDetay=[];
  products.forEach(function(p,pi){
    if(!p.bazPrim||p.bazPrim<=0)return;
    let adet=0;ms.filter(function(s){return s.prod===pi;}).forEach(function(s){adet+=s.qty;});
    if(adet<=0)return;
    const t=adet*p.bazPrim;
    bazTop+=t;
    bazDetay.push({ad:p.name,adet:adet,birim:p.bazPrim,toplam:t,tip:p.tip});
  });
  document.getElementById('dsnBazTop').textContent=fmtTL(bazTop);
  // Baz Detay tablosu
  var bd=document.getElementById('dsnBazDetay');
  var bh='<table style="width:100%;font-size:11px;"><thead><tr><th style="text-align:left;padding:6px">Ürün</th><th>Adet</th><th>Birim</th><th>Toplam</th></tr></thead><tbody>';
  bazDetay.forEach(function(r){
    var tc=r.tip==='postpaid'?'var(--postpaid)':r.tip==='prepaid'?'var(--prepaid)':'var(--gray)';
    bh+='<tr><td style="padding:5px 6px;font-size:11px"><span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:'+tc+';margin-right:4px"></span>'+r.ad+'</td><td style="text-align:center">'+r.adet+'</td><td style="text-align:center">'+fmtTL(r.birim)+'</td><td style="text-align:right;font-weight:700;color:var(--green)">'+fmtTL(r.toplam)+'</td></tr>';
  });
  if(bazDetay.length===0)bh+='<tr><td colspan="4" style="text-align:center;color:var(--gray);padding:16px">Bu ay henüz satış yok</td></tr>';
  bh+='<tr style="border-top:2px solid var(--border);font-weight:700"><td style="padding:6px" colspan="2">TOPLAM BAZ PRİM</td><td></td><td style="text-align:right;color:var(--green);font-size:14px">'+fmtTL(bazTop)+'</td></tr>';
  bh+='</tbody></table>';
  bd.innerHTML=bh;
  // Perakendecilik Desteği (DSN Resmi - Ocak 2026)
  // KURAL: Puan tutarı net, çarpan yok. HGO ADET üzerinden hesaplanır.
  // 1) Puan topla → Bandı bul → TL prim
  // 2) HGO = Toplam Abonelik adet / Toplam Hedef adet
  // 3) HGO çarpanı (×0, ×0.65, ×1.0, ×1.1) TL prime uygulanır
  var topPuan=0;
  products.forEach(function(p,pi){if(p.puan>0){var a=0;ms.filter(function(s){return s.prod===pi;}).forEach(function(s){a+=s.qty;});topPuan+=a*p.puan;}});
  // Toplam Abonelik adet üzerinden HGO (TDM hedefine göre)
  var ab=getToplamAbonelikAdet();
  var toplamAbonelik=ab.toplam;
  var faturaliAbonelik=ab.faturali;
  var hgoPct=tdmToplamHedef>0?(toplamAbonelik/tdmToplamHedef)*100:0;
  // Ocak 2026 HGO çarpanları: <%70→0, %70-%100→0.65, ≥%100→1.0, ≥%110→1.1
  var hgoCrp=hgoPct>=110?1.1:hgoPct>=100?1.0:hgoPct>=70?0.65:0;
  // Puan bandını bul (puan kesintisiz)
  var bandPrim=0,bandLabel='';
  DSN_PRIM_BANDS.forEach(function(b){if(topPuan>=b.min&&topPuan<=b.max){bandPrim=b.prim;bandLabel=b.min+'-'+(b.max===Infinity?'üzeri':b.max);}});
  // Ön koşul: min 16 faturalı + 25 toplam abonelik (200+ ÖÖ varsa 16 koşulu aranmaz)
  var oOdemeliAdet=0;
  [6,7].forEach(function(pi){ms.filter(function(s){return s.prod===pi;}).forEach(function(s){oOdemeliAdet+=s.qty;});});
  var faturaliKosulu=faturaliAbonelik>=16||oOdemeliAdet>=200;
  var toplamKosulu=toplamAbonelik>=25;
  var kosulOk=faturaliKosulu&&toplamKosulu;
  // Final TL prim = bandPrim × hgoCrp (koşul sağlanmazsa 0)
  var dsnPerak=kosulOk?Math.round(bandPrim*hgoCrp):0;
  document.getElementById('dsnPerakTop').textContent=fmtTL(dsnPerak);
  // Detay göstergesi: net puan + HGO bilgisi
  var hgoEtiket=hgoPct>=110?'×1.1 (Süper)':hgoPct>=100?'×1.0 (Hedef)':hgoPct>=70?'×0.65 (Düşük)':'×0 (Hedef altı)';
  var kosulHtml=kosulOk?'<span style="color:var(--green)">✓ Koşul sağlandı</span>':'<span style="color:var(--red)">✗ Koşul sağlanmadı</span>';
  document.getElementById('dsnPerakPuan').innerHTML=
    '<div style="font-size:10px;line-height:1.6">'+
    '<div><strong>'+Math.round(topPuan)+'</strong> puan → '+bandLabel+' bandı → '+fmtTL(bandPrim)+'</div>'+
    '<div>HGO: '+toplamAbonelik+'/'+tdmToplamHedef+' = <strong>%'+Math.round(hgoPct)+'</strong> · '+hgoEtiket+'</div>'+
    '<div>Faturalı: '+faturaliAbonelik+' '+(faturaliKosulu?'✓':'✗')+' (min 16) · Toplam: '+toplamAbonelik+' '+(toplamKosulu?'✓':'✗')+' (min 25)</div>'+
    '<div>'+kosulHtml+'</div>'+
    '</div>';
  // DSN Perakendecilik Skalası — puan üzerinden aktif satır
  var ps=document.getElementById('dsnPerakSkala');
  var ph='<table style="width:100%;font-size:11px"><thead><tr><th style="padding:5px">Puan Aralığı</th><th>Aylık Prim</th><th>×HGO</th><th>Net</th></tr></thead><tbody>';
  DSN_PRIM_BANDS.forEach(function(b){
    var aktif=topPuan>=b.min&&topPuan<=b.max;
    var net=aktif&&kosulOk?Math.round(b.prim*hgoCrp):0;
    ph+='<tr style="'+(aktif?'background:rgba(0,168,107,0.08);font-weight:700':'')+'"><td style="padding:5px 8px">'+b.min+' - '+(b.max===Infinity?'üzeri':b.max)+'</td><td style="text-align:right;color:'+(aktif?'var(--gray)':'var(--gray)')+'">'+fmtTL(b.prim)+'</td><td style="text-align:center;color:'+(aktif?'var(--yellow)':'var(--gray)')+'">'+(aktif?'×'+hgoCrp:'—')+'</td><td style="text-align:right;color:'+(aktif?'var(--green)':'var(--gray)')+';font-weight:700">'+(aktif?fmtTL(net):'—')+'</td></tr>';
  });
  ph+='</tbody></table>';ps.innerHTML=ph;
  // Yüksek Üretim ÖÖ
  var ooAdet=0;
  [6,7].forEach(function(pi){ms.filter(function(s){return s.prod===pi;}).forEach(function(s){ooAdet+=s.qty;});});
  var yPrim=0;DSN_YUKSEK_URETIM.forEach(function(y){if(ooAdet>=y.min&&ooAdet<=y.max)yPrim=y.p;});
  document.getElementById('dsnYuksekTop').textContent=fmtTL(yPrim);
  document.getElementById('dsnYuksekAdet').textContent=ooAdet+' kaliteli ÖÖ';
  // Yüksek Üretim Tablosu
  var yt=document.getElementById('dsnYuksekTablo');
  var yh='<table style="width:100%;font-size:11px"><thead><tr><th style="padding:5px">Adet Aralığı</th><th>Prim</th></tr></thead><tbody>';
  DSN_YUKSEK_URETIM.forEach(function(y){
    var aktif=ooAdet>=y.min&&ooAdet<=y.max;
    yh+='<tr style="'+(aktif?'background:rgba(230,168,0,0.08);font-weight:700':'')+'"><td style="padding:5px 8px">'+y.min+' - '+(y.max===Infinity?'üzeri':y.max)+'</td><td style="text-align:right;color:'+(aktif?'var(--yellow)':'var(--gray)')+'">'+fmtTL(y.p)+'</td></tr>';
  });
  yh+='</tbody></table>';yt.innerHTML=yh;
  // Diğer Primler
  var dt=document.getElementById('dsnDigerTablo');
  var dh='<table style="width:100%;font-size:11px"><tbody>';
  DSN_DIGER_PRIMLER.forEach(function(d){dh+='<tr><td style="padding:5px 8px">'+d.ad+'</td><td style="text-align:right;font-weight:600">'+fmtTL(d.p)+'</td></tr>';});
  dh+='</tbody></table>';dt.innerHTML=dh;
  var digerTop=0; // Diğer primler manuel takip — şimdilik 0
  document.getElementById('dsnDigerTop').textContent=fmtTL(digerTop);
  // Ceza toplam (cezaKayitlari varsa)
  var cTop=0;
  if(typeof cezaKayitlari!=='undefined')cezaKayitlari.forEach(function(c){cTop+=c.tutar*c.adet;});
  document.getElementById('dsnCezaTop').textContent='-'+fmtTL(cTop);
  // Net
  var net=bazTop+dsnPerak+yPrim+digerTop-cTop;
  document.getElementById('dsnNetTop').textContent=fmtTL(net);
}
// ============================================================
// CEZA & KESİNTİ TAKİBİ
// ============================================================
var cezaKayitlari=DSN_CEZA_TIPLERI.map(function(c){return{ad:c.ad,tutar:c.tutar,adet:0};});
function renderCezaTakip(){
  var el=document.getElementById('cezaListesi');if(!el)return;
  var h='<table style="width:100%;font-size:11px"><thead><tr><th style="text-align:left;padding:6px">Ceza Kalemi</th><th>Birim</th><th style="width:60px">Adet</th><th>Toplam</th></tr></thead><tbody>';
  var topTutar=0,topAdet=0;
  cezaKayitlari.forEach(function(c,i){
    var t=c.tutar*c.adet;topTutar+=t;topAdet+=c.adet;
    h+='<tr style="border-bottom:1px solid var(--border)"><td style="padding:7px 6px;font-size:11px">'+c.ad+'</td><td style="text-align:center;color:var(--red)">-'+fmtTL(c.tutar)+'</td><td style="text-align:center"><input type="number" min="0" value="'+c.adet+'" style="width:50px;padding:4px;border:1px solid var(--border);border-radius:6px;text-align:center;font-size:12px;background:var(--card)" onchange="updateCeza('+i+',this.value)"></td><td style="text-align:right;font-weight:700;color:'+(t>0?'var(--red)':'var(--gray)')+'">-'+fmtTL(t)+'</td></tr>';
  });
  h+='<tr style="border-top:2px solid var(--border);font-weight:700"><td style="padding:8px 6px" colspan="2">TOPLAM KESİNTİ</td><td style="text-align:center">'+topAdet+'</td><td style="text-align:right;color:var(--red);font-size:14px">-'+fmtTL(topTutar)+'</td></tr>';
  h+='</tbody></table>';
  el.innerHTML=h;
  document.getElementById('cezaToplamKart').textContent='-'+fmtTL(topTutar);
  document.getElementById('cezaToplamAdet').textContent=topAdet;
}
function updateCeza(idx,val){
  cezaKayitlari[idx].adet=parseInt(val)||0;
  renderCezaTakip();
}
// ============================================================
// NAV
// ============================================================
function sp(page,navEl){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.getElementById('page-'+page).classList.add('active');
  if(navEl){document.querySelectorAll('.ni').forEach(n=>n.classList.remove('active'));navEl.classList.add('active');}
  closeMobMenu();
  // CRM, SMS sayfalarına ilk girişte CRM verisini lazy yükle
  const needsCrm=['crmboard','crmlist','crmrapor','crmchurn','crmtekrar','crmajanda','smsgonder','smsrapor','smsgecmis','prepmnt'];
  if(needsCrm.includes(page)&&!_crmDataLoaded){
    showLoading(true);
    ensureCrmDataLoaded().then(()=>{
      showLoading(false);
      const m={dashboard:renderDashboard,gunluk:renderGunluk,urunler:renderUrunler,calisanlar:renderCalisanlar,empdetay:renderEmpDetay,prim:renderPrim,gunlukprim:renderGunlukPrim,hedefler:renderHedefler,yillik:renderYillik,muafiyet:renderMuafiyet,aktivasyon:renderAktivasyonTesvık,liderlik:renderLiderlik,duyurular:renderDuyuruList,crmboard:renderCrmBoard,crmlist:renderCrmList,crmrapor:renderCrmRapor,crmchurn:renderCrmChurn,crmtekrar:renderCrmTekrar,prepmnt:renderPrepMnt,crmajanda:renderCrmAjanda,smsgonder:renderSmsGonder,smsrapor:renderSmsRapor,smsgecmis:renderSmsGecmis,dsnrapor:renderDsnRapor,cezatakip:renderCezaTakip};
      if(m[page])m[page]();
    });
    return;
  }
  const m={dashboard:renderDashboard,gunluk:renderGunluk,urunler:renderUrunler,calisanlar:renderCalisanlar,empdetay:renderEmpDetay,prim:renderPrim,gunlukprim:renderGunlukPrim,hedefler:renderHedefler,yillik:renderYillik,muafiyet:renderMuafiyet,aktivasyon:renderAktivasyonTesvık,liderlik:renderLiderlik,duyurular:renderDuyuruList,crmboard:renderCrmBoard,crmlist:renderCrmList,crmrapor:renderCrmRapor,crmchurn:renderCrmChurn,crmtekrar:renderCrmTekrar,prepmnt:renderPrepMnt,crmajanda:renderCrmAjanda,smsgonder:renderSmsGonder,smsrapor:renderSmsRapor,smsgecmis:renderSmsGecmis,dsnrapor:renderDsnRapor,cezatakip:renderCezaTakip};
  if(m[page])m[page]();
}

function refreshAll(){const a=document.querySelector('.page.active');if(a)sp(a.id.replace('page-',''),null);}

// Dashboard'daki Toplam Puan kartı → DSN Bayi Raporu sayfasını açar
function goToDsnFromDashboard(){
  sp('dsnrapor',null);
}
function changeMonth(){activeMonth=parseInt(document.getElementById('monthSel').value);hedefEditMonth=activeMonth;hedefEditYear=activeYear;applyMonthHedefler(activeMonth,activeYear);refreshAll();}

function initMonthSel(){
  const s=document.getElementById('monthSel');
  s.innerHTML=MONTHS.map((m,i)=>`<option value="${i}" ${i===activeMonth?'selected':''}>${m} ${activeYear}</option>`).join('');
}

function escapeHtml(str){if(str===null||str===undefined)return '';return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');}

function showLoading(v){document.getElementById('loadingOv').classList.toggle('hidden',!v);}

let _toastQueue=[];
let _toastActive=false;
function _processToastQueue(){
  if(_toastActive||!_toastQueue.length)return;
  _toastActive=true;
  const {msg,err}=_toastQueue.shift();
  const t=document.getElementById('toast');
  t.textContent=msg;
  t.className='toast '+(err?'toast-err':'toast-ok');
  t.style.display='block';
  setTimeout(()=>{
    t.style.display='none';
    _toastActive=false;
    setTimeout(_processToastQueue,200);
  },3000);
}
function showToast(msg,err=false){
  _toastQueue.push({msg,err});
  _processToastQueue();
}

document.getElementById('saleOv').addEventListener('click',function(e){if(e.target===this)closeSaleModal();});
document.getElementById('muafOv').addEventListener('click',function(e){if(e.target===this)closeMuafModal();});
document.getElementById('crmAddOv').addEventListener('click',function(e){if(e.target===this)closeCrmAddModal();});
document.getElementById('crmCallOv').addEventListener('click',function(e){if(e.target===this)closeCrmCallModal();});
document.getElementById('crmUploadOv').addEventListener('click',function(e){if(e.target===this)closeCrmUpload();});
document.getElementById('ajandaOv').addEventListener('click',function(e){if(e.target===this)closeAjandaModal();});

// ============================================================
// INIT
// ============================================================
initMonthSel();
</script>
</body>
</html>
