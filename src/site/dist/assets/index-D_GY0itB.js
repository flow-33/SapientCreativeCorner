(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))a(i);new MutationObserver(i=>{for(const n of i)if(n.type==="childList")for(const c of n.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&a(c)}).observe(document,{childList:!0,subtree:!0});function o(i){const n={};return i.integrity&&(n.integrity=i.integrity),i.referrerPolicy&&(n.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?n.credentials="include":i.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function a(i){if(i.ep)return;i.ep=!0;const n=o(i);fetch(i.href,n)}})();const w=24*60*60*1e3,L=7*w,f={portfolio:"/api/data.json",experiments:"/api/data.json"};function l(e){const t=document.getElementById(e);if(!t)throw new Error(`Missing element #${e}`);return t}function E(){let e=s.querySelector("#vo-circle-group");e||(e=document.createElement("div"),e.id="vo-circle-group",e.className="vo-circle-group");const t=["vo-circle-small","vo-circle-medium","vo-circle-large","vo-circle-xlarge","vo-circle-xxlarge"],o=[];for(const a of t){let i=e.querySelector(`.${a}`);i||(i=document.createElement("div"),i.className=`vo-bg-circle ${a}`),o.push(i)}return e.replaceChildren(...o),e}function v(){u.classList.add("hidden"),s.classList.remove("hidden"),m.classList.remove("drawer-open"),g.setAttribute("aria-hidden","true"),p.src="";const e=E();s.replaceChildren(e,I),b()}function C(e){const{url:t,title:o,details:a}=e;l("app-name").textContent=o||"Portfolio",y.innerHTML=a||"",p.src=t,s.classList.add("hidden"),u.classList.remove("hidden");const i="vo-load-fail";let n=!1;const c=()=>{if(n)return;let r=document.getElementById(i);r||(r=document.createElement("div"),r.id=i,r.className="vo-fail",r.innerHTML=`<div style="display:grid;gap:8px;text-align:center">
          <div style="font-weight:600">This site may block embedding in an app</div>
          <a href="${t}" target="_blank" rel="noopener" class="vo-cta" style="justify-self:center">Open in browser</a>
        </div>`,u.appendChild(r))},d=window.setTimeout(c,3e3);p.addEventListener("load",()=>{n=!0,window.clearTimeout(d);const r=document.getElementById(i);r&&r.remove()},{once:!0})}function x(e){if(e.image)return e.image;const t=e.link||e.url||"";if(!t)return"";try{return`https://www.google.com/s2/favicons?sz=256&domain=${new URL(t).hostname}`}catch{return""}}function h(){const e=m.classList.toggle("drawer-open");g.setAttribute("aria-hidden",String(!e))}function S(e){return`vo.cache.${e}`}function N(e,t){return!e||Date.now()-e>t}async function k(e,t,o){const a=typeof t=="string"&&(t.startsWith("/data/")||t.startsWith("data/")||t.startsWith("/api/")||t.startsWith("api/")),i=a?`${t.startsWith("/")?t:"/"+t}?v=${Date.now()}`:t;if(console.log(`Fetching from: ${i}`),a){const r=await fetch(i,{cache:"no-store"});return console.log("API response status:",r.status),await r.json()}const n=S(e);try{const r=JSON.parse(localStorage.getItem(n)||"null");if(r&&!N(r.ts,o))return r.data}catch{}const d=await(await fetch(i,{cache:"no-store"})).json();return localStorage.setItem(n,JSON.stringify({ts:Date.now(),data:d})),d}function $(e){const t=document.createElement("div");t.className="vo-gallery-grid";for(const o of e){const a=document.createElement("button");a.className="vo-card";const i=x(o)||o.thumbnail||"";a.innerHTML=`
        <div class="vo-card-thumb" style="background-image:url('${i}')">
          <div class="vo-card-overlay">
            <button class="vo-cta" data-action="launch">${o.type==="Client Work"?"View Work":"Launch Experiment"}</button>
            <button class="vo-cta secondary" data-action="overview">${o.type==="Client Work"?"Case Study":"Overview"}</button>
          </div>
        </div>
        <div class="vo-card-meta">
          <div class="vo-card-title">${o.title||"Untitled"}</div>
          <div class="vo-card-sub">${o.type==="Client Work"?o.industry||"":o.author||""}</div>
          <div class="vo-card-desc">${o.description||""}</div>
        </div>`,a.addEventListener("click",n=>{const c=n.target.closest("[data-action]");(c?c.getAttribute("data-action"):"launch")==="overview"?(y.innerHTML=o.details||"",m.classList.add("drawer-open"),g.setAttribute("aria-hidden","false")):C({url:o.link||o.url,title:o.title,details:o.details})}),t.appendChild(a)}return t}async function q(e){console.log(`Loading ${e} from:`,f[e]);const t=await k(e,f[e],L);console.log("Loaded data:",t);let o=t.items||[];console.log("Items before filter:",o.length),o.length&&o[0].type&&(o=o.filter(n=>e==="portfolio"?n.type==="Client Work":n.type==="Experiment")),console.log("Items after filter:",o.length),s.replaceChildren();const a=document.createElement("button");a.className="vo-back",a.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg><span>Home</span>',a.addEventListener("click",v),s.appendChild(a);const i=document.createElement("div");i.className="vo-collection-header",i.textContent=e==="portfolio"?"Portfolio":"Experiments",s.appendChild(i),s.appendChild($(o))}function b(){const e=document.createElement("div");e.className="vo-left-buttons",e.innerHTML=`
      <button class="vo-circle" data-collection="portfolio"><span>Portfolio</span></button>
      <button class="vo-circle alt" data-collection="experiments"><span>Experiments</span></button>
    `,s.appendChild(e),s.addEventListener("click",t=>{const o=t.target.closest("[data-collection]");o&&q(o.getAttribute("data-collection"))})}const O=document.getElementById("app");O.innerHTML=`
  <main class="vo-main">
    <section id="launcher" class="vo-launcher" role="list">
      <div id="vo-circle-group" class="vo-circle-group">
        <div class="vo-bg-circle vo-circle-small"></div>
        <div class="vo-bg-circle vo-circle-medium"></div>
        <div class="vo-bg-circle vo-circle-large"></div>
        <div class="vo-bg-circle vo-circle-xlarge"></div>
        <div class="vo-bg-circle vo-circle-xxlarge"></div>
        <div class="vo-noise"></div>
      </div>
      <img id="cc-logo" class="vo-logo" src="./assets/CCLogo.svg" alt="Creative Corner logo" />
    </section>
    <section id="app-viewport" class="vo-viewport hidden" aria-live="polite">
      <div class="vo-appbar">
        <div id="app-name" class="vo-appname">Portfolio</div>
        <div class="vo-appbar-actions">
          <button id="btn-toggle-drawer" class="vo-button">Details</button>
          <button id="btn-exit-app" class="vo-button">Exit</button>
        </div>
      </div>
      <div class="vo-content">
        <iframe id="portfolio-frame" title="Portfolio" class="vo-frame" sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox allow-forms allow-pointer-lock allow-downloads allow-top-navigation-by-user-activation"></iframe>
        <aside id="drawer" class="vo-drawer" aria-hidden="true">
          <div class="vo-drawer-header">About this project</div>
          <div id="drawer-content" class="vo-drawer-content"></div>
        </aside>
      </div>
    </section>
  </main>
  <div class="vo-version" aria-label="Version">v0.1.1</div>
`;const s=l("launcher"),u=l("app-viewport"),T=l("btn-exit-app"),A=l("btn-toggle-drawer"),m=document.querySelector(".vo-content"),g=l("drawer"),p=l("portfolio-frame"),y=l("drawer-content"),I=l("cc-logo");T.addEventListener("click",v);A.addEventListener("click",h);window.addEventListener("keydown",e=>{e.key==="Escape"||e.key.toLowerCase()==="h"&&!e.metaKey?v():e.key.toLowerCase()==="d"&&(u.classList.contains("hidden")||h())});v();b();function M(){const e=document.createElement("div");e.className="vo-controls",e.innerHTML=`
    <h4>Background Waves</h4>
    <div class="row"><label>Brightness</label><input id="ctl-bright" type="range" min="0" max="2" step="0.01" value="1"><output id="out-bright">1.00</output></div>
    <div class="row"><label>Base</label><input id="ctl-base" type="range" min="0" max="2" step="0.01" value="1"><output id="out-base">1.00</output></div>
    <div class="row"><label>Opacity</label><input id="ctl-opacity" type="range" min="0" max="1" step="0.01" value="1"><output id="out-opacity">1.00</output></div>
    <div class="row"><label>Noise</label><input id="ctl-noise" type="range" min="0" max="0.2" step="0.005" value="0.03"><output id="out-noise">0.03</output></div>
  `,document.body.appendChild(e);const t=[{input:e.querySelector("#ctl-bright"),out:e.querySelector("#out-bright"),varName:"--vo-brightness"},{input:e.querySelector("#ctl-base"),out:e.querySelector("#out-base"),varName:"--vo-base-scale"},{input:e.querySelector("#ctl-opacity"),out:e.querySelector("#out-opacity"),varName:"--vo-circle-opacity"},{input:e.querySelector("#ctl-noise"),out:e.querySelector("#out-noise"),varName:"--vo-noise"}],o=document.documentElement.style;for(const{input:a,out:i,varName:n}of t){const c=()=>{const d=Number(a.value);o.setProperty(n,String(d)),i.value=d.toFixed(2)};a.addEventListener("input",c),c()}}M();console.log("Background circles:",document.querySelectorAll(".vo-bg-circle").length);console.log("Controls panel:",document.querySelector(".vo-controls"));console.log("Circle group:",document.querySelector("#vo-circle-group"));
