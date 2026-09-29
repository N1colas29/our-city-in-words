const B=document.body,city=B.dataset.city||'katy',cityName=B.dataset.cityName||'Katy',page=B.dataset.page;
const SITE='Our City in Words';
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const load=f=>fetch(`data/${city}/${f}`).then(r=>{if(!r.ok)throw Error(f);return r.json()});
const fail=()=>{$('#app').innerHTML='<p>The content could not load. Open the site through a local server (for example, run <code>python3 -m http.server</code> in this folder) rather than double-clicking the file.</p>'};
const nm=i=>i.anonymous?'Anonymous interviewee':i.name;
const initials=i=>i.anonymous?'?':i.name.split(' ').map(w=>w[0]).join('').slice(0,2);
const thumb=(i,alt='')=>i.photo&&!i.anonymous?`<img class="thumb" src="${esc(i.photo)}" alt="${esc(alt)}">`:`<div class="thumb ph" aria-hidden="true">${esc(initials(i))}</div>`;
const yn=v=>v===true?'Yes':v===false?'No':'Not recorded';
const setMeta=(t,d)=>{document.title=`${t} | ${SITE}`;const m=document.querySelector('meta[name=description]');if(m&&d)m.content=d};

const links=[['index.html','home',cityName],['story.html','story','The Story'],['methodology.html','methodology','Methodology'],['sources.html','sources','Sources'],['about.html','about','About'],['contact.html','contact','Contact']];
B.insertAdjacentHTML('afterbegin',`<a class="skip" href="#app">Skip to content</a><header class="site"><div class="wrap"><a class="brand" href="index.html">${SITE}</a><nav aria-label="Main">${links.map(([h,p,l])=>`<a href="${h}"${p===page||(p==='home'&&page==='interview')?' aria-current="page"':''}>${l}</a>`).join('')}</nav></div></header>`);
B.insertAdjacentHTML('beforeend',`<footer class="site"><div class="wrap foot"><div><p class="fb">${SITE}</p><p>Local leaders in ${cityName}, in their own voices.</p></div><nav aria-label="Footer">${links.map(([h,p,l])=>`<a href="${h}">${l}</a>`).join('')}</nav></div></footer>`);
if(page==='home')Promise.all([load('interviews.json'),load('story.json')]).then(([iv,st])=>{
  const q=st.pullQuotes||[];
  $('#quote').innerHTML=q[0]?`<blockquote class="hero-quote">${esc(q[0])}</blockquote><p><a href="story.html">Read the full story</a></p>`:'';
  $('#list').innerHTML=iv.map(i=>`<li class="item">${thumb(i)}<div><a class="t" href="interview.html?id=${encodeURIComponent(i.id)}">${esc(nm(i))}</a><p class="meta">${esc(i.role)}</p><p>${esc(i.summary)}</p></div></li>`).join('');
  $('#more').innerHTML=q.slice(1).map(x=>`<blockquote>${esc(x)}</blockquote>`).join('');
}).catch(fail);

if(page==='interview')load('interviews.json').then(iv=>{
  const i=iv.find(x=>x.id===new URLSearchParams(location.search).get('id'));
  if(!i){setMeta('Interview not found');$('#app').innerHTML='<h1>Interview not found</h1><p><a href="index.html">Back to all interviews</a></p>';return}
  setMeta(nm(i),i.summary);
  const c=i.consent||{};
  $('#app').innerHTML=`<a href="index.html">Back to all interviews</a><div class="profile"><figure>${thumb(i,i.photoAlt||'Photo of '+i.name)}</figure><div><h1>${esc(nm(i))}</h1><p class="meta">${esc(i.role)}</p>${i.audio?`<audio controls preload="none" src="${esc(i.audio)}" aria-label="Audio of interview with ${esc(nm(i))}"></audio>`:'<p class="meta">Audio coming soon.</p>'}<h2>Transcript</h2><div class="tx">${(i.transcript||[]).map(t=>`<p class="q">${esc(t.q)}</p><p>${esc(t.a)}</p>`).join('')}</div>
<section class="info" aria-labelledby="ci"><h2 id="ci">Consent and background</h2>
<h3>Consent</h3><dl class="facts"><dt>Agreed to be interviewed</dt><dd>${yn(c.interview)}</dd><dt>Agreed to be recorded</dt><dd>${yn(c.record)}</dd><dt>Agreed to publication</dt><dd>${yn(c.publish)}</dd>${c.date?`<dt>Consent given</dt><dd>${esc(c.date)}</dd>`:''}${i.date?`<dt>Interviewed on</dt><dd>${esc(i.date)}</dd>`:''}</dl>${c.note?`<p>${esc(c.note)}</p>`:''}
<h3>Background</h3>${i.anonymous?'<p>This person asked to remain anonymous.</p>':''}${(i.background||[]).map(p=>`<p>${esc(p)}</p>`).join('')}<p class="meta"><a href="methodology.html">How these interviews were done</a></p></section></div></div>`;
}).catch(fail);

if(page==='story')load('story.json').then(s=>{
  setMeta(s.title,s.intro);
  $('#app').innerHTML=`<div class="story"><h1>${esc(s.title)}</h1><p class="lede">${esc(s.intro)}</p>${(s.sections||[]).map(x=>`<h2>${esc(x.heading)}</h2>${x.body.map(p=>`<p>${esc(p)}</p>`).join('')}`).join('')}</div>`;
}).catch(fail);

if(page==='sources')load('sources.json').then(s=>{
  $('#list').innerHTML=s.length?s.map(x=>{const m=[x.author,x.type,x.year].filter(Boolean).join(', ');return`<li class="src"><p class="t">${x.url?`<a href="${esc(x.url)}">${esc(x.title)}</a>`:esc(x.title)}</p><p class="meta">${esc(m)}${x.accessed?`. Accessed ${esc(x.accessed)}`:''}</p>${x.note?`<p>${esc(x.note)}</p>`:''}</li>`}).join(''):'<li class="src">No sources added yet.</li>';
}).catch(fail);
if(page==='contact'){
  const f=$('form'),s=$('#status');
  f.addEventListener('submit',async e=>{
    e.preventDefault();
    s.textContent='Sending...';
    try{
      const r=await fetch(f.action,{method:'POST',body:new FormData(f),headers:{Accept:'application/json'}});
      if(!r.ok)throw Error();
      f.reset();
      s.textContent='Thanks, your message was sent.';
    }catch{
      s.textContent='Something went wrong. Please try again.';
    }
  });
}