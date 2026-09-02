(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=`Aadu`,t=`./aadu.jpg`,n=`./aadu.svg`,r=`atreus0103@gmail.com`,i=`patiladarsh65@gmail.com`,a=[{id:`light`,label:`Wants to just hit someone lightly`,blurb:`Messy, petty, cartoon splats.`},{id:`hard`,label:`Wants to just hit someone hard`,blurb:`Kitchen drawer energy.`},{id:`extreme`,label:`Kill someone`,blurb:`Cartoon only. This is a venting toy, not real life.`}],o={light:[{id:`rotten-fruits`,label:`Rotten fruits`,glyph:`🍅`},{id:`rotten-eggs`,label:`Rotten eggs`,glyph:`🥚`}],hard:[{id:`spoons-forks`,label:`Spoon & forks`,glyph:`🍴`},{id:`kitchen-utensils`,label:`Kitchen utensils`,glyph:`🍳`}],extreme:[{id:`gun`,label:`Gun`,glyph:`💥`},{id:`knife`,label:`Knife`,glyph:`🔪`}]},s=1;function c(){return{screen:`reason`,reason:``,intensity:null,instrument:null,hitGoal:5,hitsDone:0,lastTick:performance.now(),shake:0,toast:`Hint: “someone” is none other than ${e}.`,toastTimer:4,photoUrl:t,projectiles:[],splat:0}}function l(e,t){e.reason=t}function u(e,t){e.intensity=t,e.instrument=null,e.screen=`instrument`}function d(e,t){e.intensity&&o[e.intensity].some(e=>e.id===t)&&(e.instrument=t,e.screen=`hits`)}function f(e,t){e.hitGoal=Math.min(10,Math.max(1,Math.round(t)))}function p(t){t.intensity&&t.instrument&&t.reason.trim()&&(t.hitsDone=0,t.projectiles=[],t.splat=0,t.shake=0,t.screen=`play`,t.toast=`${e}. ${t.hitGoal} hit${t.hitGoal===1?``:`s`} to cool off.`,t.toastTimer=2.4)}function m(e){for(let t of Object.values(o)){let n=t.find(t=>t.id===e);if(n)return n.glyph}return`💢`}function h(e){if(e.screen!==`play`||!e.instrument||e.hitsDone>=e.hitGoal)return;let t=e.instrument===`gun`,n=t?-8:18+Math.random()*64,r=t?38+Math.random()*24:92,i=28+Math.random()*44,a=22+Math.random()*42;e.projectiles.push({id:s++,sx:n,sy:r,tx:i,ty:a,t:0,glyph:m(e.instrument),kind:e.instrument})}function g(e,t){let n=Math.min(.05,(t-e.lastTick)/1e3);if(e.lastTick=t,e.shake>0&&(e.shake=Math.max(0,e.shake-n*36)),e.splat>0&&(e.splat=Math.max(0,e.splat-n*1.6)),e.toastTimer>0&&(e.toastTimer-=n,e.toastTimer<=0&&(e.toast=null)),e.screen!==`play`)return[];let r=e.instrument===`gun`?3.4:e.instrument===`knife`?2.6:2.1,i=[];for(let t of e.projectiles)t.t=Math.min(1,t.t+n*r),t.t>=1&&i.push(t.id);let a=e.projectiles.filter(e=>i.includes(e.id)).map(e=>e.kind);if(i.length){e.projectiles=e.projectiles.filter(e=>!i.includes(e.id));for(let t=0;t<i.length;t++)if(e.hitsDone+=1,e.shake=Math.min(16,7+e.hitsDone),e.splat=1,e.hitsDone>=e.hitGoal){e.screen=`over`,e.toast=null,e.projectiles=[];break}}return a}function _(e){return Math.max(0,e.hitGoal-e.hitsDone)}function v(e){Object.assign(e,c())}var y=null;function b(){if(typeof window>`u`)return null;if(!y){let e=window.AudioContext||window.webkitAudioContext;if(!e)return null;y=new e}return y.state===`suspended`&&y.resume(),y}function x(e,t,n,r=.08,i,a=0){let o=b();if(!o)return;let s=o.currentTime+a,c=o.createOscillator(),l=o.createGain();c.type=n,c.frequency.setValueAtTime(e,s),i!==void 0&&c.frequency.exponentialRampToValueAtTime(Math.max(40,i),s+t),l.gain.setValueAtTime(1e-4,s),l.gain.exponentialRampToValueAtTime(r,s+.012),l.gain.exponentialRampToValueAtTime(1e-4,s+t),c.connect(l),l.connect(o.destination),c.start(s),c.stop(s+t)}function S(e,t,n,r=`lowpass`,i=0){let a=b();if(!a)return;let o=a.currentTime+i,s=Math.max(1,Math.floor(a.sampleRate*e)),c=a.createBuffer(1,s,a.sampleRate),l=c.getChannelData(0);for(let e=0;e<s;e++)l[e]=Math.random()*2-1;let u=a.createBufferSource();u.buffer=c;let d=a.createBiquadFilter();d.type=r,d.frequency.setValueAtTime(n,o);let f=a.createGain();f.gain.setValueAtTime(t,o),f.gain.exponentialRampToValueAtTime(1e-4,o+e),u.connect(d),d.connect(f),f.connect(a.destination),u.start(o),u.stop(o+e)}function C(){x(240,.18,`square`,.05,90)}function w(){x(160,.22,`sawtooth`,.06,50)}function T(){x(90,.28,`square`,.07,40),x(420,.08,`triangle`,.04)}function E(){x(392,.12,`triangle`,.05),setTimeout(()=>x(523,.14,`triangle`,.05),90)}function D(e){if(e===`gun`){T();return}if(e===`knife`){S(.12,.08,2400,`highpass`),x(720,.14,`sawtooth`,.05,180);return}if(e===`spoons-forks`||e===`kitchen-utensils`){x(280,.16,`square`,.04,110),x(880,.06,`triangle`,.03);return}C()}function O(e,t=0){switch(e){case`rotten-fruits`:S(.22,.14,700,`lowpass`,t),x(190,.2,`sawtooth`,.08,55,t);break;case`rotten-eggs`:S(.08,.12,3200,`highpass`,t),S(.2,.11,500,`lowpass`,t+.04),x(210,.18,`square`,.06,70,t);break;case`spoons-forks`:x(920,.16,`triangle`,.09,420,t),x(1380,.1,`square`,.05,700,t),S(.08,.06,1800,`bandpass`,t);break;case`kitchen-utensils`:x(240,.22,`square`,.1,90,t),x(640,.18,`triangle`,.07,280,t),S(.16,.1,900,`lowpass`,t);break;case`gun`:S(.18,.16,400,`lowpass`,t),x(70,.32,`square`,.12,40,t),x(380,.08,`triangle`,.05,void 0,t);break;case`knife`:S(.14,.12,2800,`highpass`,t),x(980,.12,`sawtooth`,.07,220,t),x(160,.16,`square`,.05,80,t);break;default:w()}}function k(){b()}var A=document.querySelector(`#app`),j=c(),M=``,N=-1,P=0,F=`idle`,I=!1;function L(e){let t=1-(1-e.t)*(1-e.t);return{x:e.sx+(e.tx-e.sx)*t,y:e.sy+(e.ty-e.sy)*t}}A.innerHTML=`
  <main class="shell">
    <header class="top">
      <h1 class="brand"><span>Anger vent</span>Hit ${e}</h1>
      <div class="stats">
        <div class="chip" data-hits>0 / 0</div>
      </div>
    </header>

    <section class="stage">
      <div class="clouds">
        <div class="cloud a"></div>
        <div class="cloud b"></div>
      </div>
      <div data-toast></div>
      <div class="photo-wrap" data-photo-wrap>
        <img class="aadu" data-photo alt="${e}" src="${t}" />
        <div class="splat" data-splat hidden></div>
        <div class="projectiles" data-projectiles></div>
      </div>
      <div data-overlay></div>
    </section>

    <p class="hint" data-hint></p>
    <div class="actions" data-actions></div>
    <p class="footer">Cartoon venting only. “Someone” is none other than ${e}.</p>
  </main>
`;var R={hits:A.querySelector(`[data-hits]`),toast:A.querySelector(`[data-toast]`),photo:A.querySelector(`[data-photo]`),photoWrap:A.querySelector(`[data-photo-wrap]`),splat:A.querySelector(`[data-splat]`),projectiles:A.querySelector(`[data-projectiles]`),overlay:A.querySelector(`[data-overlay]`),hint:A.querySelector(`[data-hint]`),actions:A.querySelector(`[data-actions]`)};R.photo.addEventListener(`error`,()=>{R.photo.src.includes(`aadu.svg`)||(R.photo.src=n)});function z(){return j.screen===`reason`?`
      <div class="overlay setup">
        <div>
          <h2>Why the anger?</h2>
          <p>Say it first. Then pick how you want to vent.</p>
          <p class="hint-inline">Hint: someone is none other than <strong>${e}</strong>.</p>
          <textarea data-reason rows="4" maxlength="500" placeholder="The reason…"></textarea>
          <button class="start" type="button" data-action="to-intensity">Next: type of anger</button>
        </div>
      </div>
    `:j.screen===`intensity`?`
      <div class="overlay setup">
        <div>
          <h2>Type of anger</h2>
          <p>Aimed at ${e}.</p>
          <div class="stack">${a.map(e=>`
        <button class="choice" type="button" data-action="intensity" data-id="${e.id}">
          <strong>${e.label}</strong>
          <span>${e.blurb}</span>
        </button>
      `).join(``)}</div>
        </div>
      </div>
    `:j.screen===`instrument`&&j.intensity?`
      <div class="overlay setup">
        <div>
          <h2>Pick an instrument</h2>
          <p>Cartoon hits on ${e}’s photo.</p>
          <div class="stack">${o[j.intensity].map(e=>`
          <button class="choice" type="button" data-action="instrument" data-id="${e.id}">
            <strong>${e.glyph} ${e.label}</strong>
          </button>
        `).join(``)}</div>
        </div>
      </div>
    `:j.screen===`hits`?`
      <div class="overlay setup">
        <div>
          <h2>How many hits end the anger?</h2>
          <p>1 is a tap. 10 is a whole tantrum. Then it stops.</p>
          <div class="pips">${Array.from({length:10},(e,t)=>{let n=t+1;return`<button class="pip ${n===j.hitGoal?`on`:``}" type="button" data-action="hits" data-n="${n}">${n}</button>`}).join(``)}</div>
          <button class="start" type="button" data-action="execute">Throw at ${e}</button>
        </div>
      </div>
    `:j.screen===`over`?`
      <div class="overlay setup">
        <div>
          <h2>How do you feel now?</h2>
          <p>If you’re still angry, you can play again.</p>
          <button class="retry" type="button" data-action="reset">Still angry — play again</button>
          ${F===`sending`?`<p class="after-gap">Sending your reason to ${r}…</p>`:F===`sent`?`<p class="after-gap">Your reason was emailed to ${r} from the site (${i}).</p>`:F===`error`?`<p class="after-gap">Couldn’t send from the site. Use the button to open mail to ${r}.</p>
          <button class="start mail" type="button" data-action="mail">Send reason by email</button>`:`<p class="after-gap">Your reason will be emailed to ${r}.</p>`}
        </div>
      </div>
    `:``}function B(){let e=R.overlay.querySelector(`[data-reason]`);e?.addEventListener(`input`,()=>l(j,e.value))}function V(){let e=z();e!==M&&(M=e,R.overlay.innerHTML=e,B())}function H(){R.hits.textContent=`${j.hitsDone} / ${j.hitGoal}`,R.toast.innerHTML=j.toast?`<div class="toast">${j.toast}</div>`:``,R.hint.textContent=j.screen===`play`?`Tap the photo or Hit. ${_(j)} left.`:`Someone is none other than ${e}.`,j.screen===`play`?R.actions.querySelector(`[data-action="hit"]`)||(R.actions.innerHTML=`<button class="poke" type="button" data-action="hit">Hit ${e}</button>`):R.actions.innerHTML&&(R.actions.innerHTML=``);let t=j.shake>.4?(Math.random()-.5)*j.shake:0,n=j.shake>.4?(Math.random()-.5)*j.shake:0;R.photoWrap.style.transform=`translate(${t}px, ${n}px)`,R.splat.hidden=j.splat<=.05,R.splat.style.opacity=String(j.splat),(j.projectiles.length||N!==j.hitsDone)&&(N=j.hitsDone,R.projectiles.innerHTML=j.projectiles.map(e=>{let t=L(e);return`<span class="proj" style="left:${t.x}%;top:${t.y}%">${e.glyph}</span>`}).join(``)),j.splat!==P&&(P=j.splat),V()}function U(){if(j.screen!==`play`||!j.instrument)return;k();let e=j.projectiles.length;h(j),j.projectiles.length>e&&D(j.instrument)}A.addEventListener(`click`,e=>{let t=e.target.closest(`[data-action]`);if(!t)return;k();let n=t.dataset.action;if(n===`to-intensity`){let e=R.overlay.querySelector(`[data-reason]`);if(e&&l(j,e.value),!j.reason.trim()){j.toast=`Write the reason first.`,j.toastTimer=2;return}j.screen=`intensity`,M=`dirty`,E();return}if(n===`intensity`){u(j,t.dataset.id),M=`dirty`;return}if(n===`instrument`){d(j,t.dataset.id),M=`dirty`;return}if(n===`hits`){f(j,Number(t.dataset.n)),M=`dirty`;return}if(n===`execute`){p(j),M=`dirty`,E();return}if(n===`hit`){U();return}if(n===`reset`){v(j),F=`idle`,I=!1,M=`dirty`;return}if(n===`mail`){q();return}}),R.photoWrap.addEventListener(`click`,()=>{j.screen===`play`&&U()});function W(){return j.reason.trim()||`(no reason written)`}function G(){return a.find(e=>e.id===j.intensity)?.label??`(none selected)`}function K(){return{reason:W(),anger_type:G()}}function q(){let{reason:e,anger_type:t}=K(),n=encodeURIComponent(`From: ${i} (mood-pal on GitHub Pages)\nTo: ${r}\n\nType of anger: ${t}\n\nReason:\n${e}\n`);window.location.href=`mailto:${r}?subject=Anger%20vent&body=${n}`}async function J(){if(I)return;I=!0,F=`sending`,M=`dirty`;let{reason:e,anger_type:t}=K();try{F=(await fetch(`https://formsubmit.co/ajax/atreus0103@gmail.com`,{method:`POST`,headers:{"Content-Type":`application/json`,Accept:`application/json`},body:JSON.stringify({_subject:`Anger vent — reason`,_template:`table`,_captcha:!1,name:`Mood Pal`,email:`patiladarsh65@gmail.com`,_replyto:`patiladarsh65@gmail.com`,site:`https://adarshpatil0103.github.io/mood-pal/`,anger_type:t,message:`Type of anger: ${t}\n\nReason:\n${e}`})})).ok?`sent`:`error`}catch{F=`error`}M=`dirty`}function Y(e){let t=j.screen;g(j,e).forEach((e,t)=>O(e,t*.04)),t===`play`&&j.screen===`over`&&(M=`dirty`,J()),H(),requestAnimationFrame(Y)}H(),requestAnimationFrame(Y);