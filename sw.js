const C='ufr-v29';
const U='https://ukrznseniopoyrrljjvv.supabase.co',K='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrcnpuc2VuaW9wb3lycmxqanZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMwNjY0MzAsImV4cCI6MjEwODY0MjQzMH0.iEn8d6h5dlrud2sWm9dmhtpcIG_6meYTp8adc_tOFPw';
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(C).then(c=>c.addAll(['./','icon-192.png','icon-512.png','fondateur.jpg','manifest.webmanifest']).catch(()=>{})))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x.indexOf('ufr-v')===0&&x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET'||new URL(r.url).origin!==location.origin)return;
e.respondWith(fetch(r).then(res=>{const cp=res.clone();caches.open(C).then(c=>c.put(r,cp));return res}).catch(()=>caches.match(r).then(m=>m||caches.match('./'))))});
self.addEventListener('notificationclick',e=>{e.notification.close();e.waitUntil(clients.matchAll({type:'window'}).then(l=>l.length?l[0].focus():clients.openWindow('./')))});

/* Notifications quand le téléphone retrouve internet (application fermée) */
async function rs(){try{const r=await (await caches.open('ufr-state')).match('state');return r?await r.json():null}catch(e){return null}}
async function ws(o){await (await caches.open('ufr-state')).put('state',new Response(JSON.stringify(o)))}
const lvm=(t,m)=>t==null||t===m||(m||'').indexOf(t+' ')===0;
const fd=d=>new Date(d).toLocaleDateString('fr-FR');
function dd(d){const t=new Date();t.setHours(0,0,0,0);return Math.round((new Date(d+'T00:00:00')-t)/86400000)}
const wh=n=>n<=0?'aujourd’hui':n===1?'demain':'dans '+n+' jours';
async function api(p,t){const r=await fetch(U+p,{headers:{apikey:K,Authorization:'Bearer '+t}});if(!r.ok)throw new Error('http'+r.status);return r.json()}
async function check(){
  const s=await rs();if(!s||!s.lv)return;
  s.nk=s.nk||{};const out=[];
  const add=(k,tx)=>{if(!s.nk[k]){s.nk[k]=1;out.push(tx)}};
  let ex=s.exams||[];
  if(s.t&&Date.now()<s.exp-60000){
    try{
      const E=(await api('/rest/v1/exam_calendar?select=*&order=exam_date.asc',s.t)).filter(x=>lvm(x.level,s.lv));ex=E;s.exams=E;
      const t0=s.seen&&s.seen.t,ex0=(s.seen&&s.seen.ex)||0;
      if(t0){const q=encodeURIComponent(t0);
        const A=await api('/rest/v1/announcements?select=id,title,created_at&created_at=gt.'+q+'&order=created_at.desc&limit=10',s.t);
        const B=await api('/rest/v1/subjects?select=id,subject,year,created_at&created_at=gt.'+q+'&order=created_at.desc&limit=40',s.t);
        A.forEach(x=>add('ann-'+x.id,'Annonce : '+x.title));
        if(B.length>3)add('sub-'+B[0].id+'-'+B.length,B.length+' nouveaux sujets ajoutés');
        else B.forEach(x=>add('sub-'+x.id,'Nouveau sujet : '+x.subject+' '+(x.year-1)+'-'+x.year));
        E.filter(x=>x.id>ex0).forEach(x=>add('ex-'+x.id,'Nouvelle date : '+x.title+', le '+fd(x.exam_date)))}
    }catch(e){if(e instanceof TypeError)throw e}
  }
  ex.forEach(x=>{const n=dd(x.exam_date);if([0,1,3,7].includes(n))add('rap-'+x.id+'-'+n,'Composition de '+x.title+' '+wh(n))});
  await ws(s);
  if(out.length)await self.registration.showNotification('UFR SEG sujets',{body:out.length===1?out[0]:out.length+' nouveautés : '+out.slice(0,2).join(' ; ')+(out.length>2?' …':''),icon:'icon-192.png',badge:'icon-192.png',tag:'ufr-news',renotify:true,vibrate:[200,100,200]});
}
self.addEventListener('sync',e=>{if(e.tag==='ufr-news')e.waitUntil(check())});
self.addEventListener('periodicsync',e=>{if(e.tag==='ufr-news')e.waitUntil(check())});
