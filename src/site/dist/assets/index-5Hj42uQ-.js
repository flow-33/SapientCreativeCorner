(function(){const o=document.createElement("link").relList;if(o&&o.supports&&o.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))a(n);new MutationObserver(n=>{for(const i of n)if(i.type==="childList")for(const r of i.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&a(r)}).observe(document,{childList:!0,subtree:!0});function t(n){const i={};return n.integrity&&(i.integrity=n.integrity),n.referrerPolicy&&(i.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?i.credentials="include":n.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function a(n){if(n.ep)return;n.ep=!0;const i=t(n);fetch(n.href,i)}})();const w=24*60*60*1e3,L=7*w,f={portfolio:"/api/data.json",experiments:"/api/data.json"};function s(e){const o=document.getElementById(e);if(!o)throw new Error(`Missing element #${e}`);return o}function E(){let e=l.querySelector("#vo-circle-group");e||(e=document.createElement("div"),e.id="vo-circle-group",e.className="vo-circle-group");const o=["vo-circle-small","vo-circle-medium","vo-circle-large","vo-circle-xlarge","vo-circle-xxlarge"],t=[];for(const a of o){let n=e.querySelector(`.${a}`);n||(n=document.createElement("div"),n.className=`vo-bg-circle ${a}`),t.push(n)}return e.replaceChildren(...t),e}function v(){u.classList.add("hidden"),l.classList.remove("hidden"),g.classList.remove("drawer-open"),m.setAttribute("aria-hidden","true"),p.src="";const e=E();l.replaceChildren(e,I),b()}function C(e){const{url:o,title:t,details:a}=e;s("app-name").textContent=t||"Portfolio",y.innerHTML=a||"",p.src=o,l.classList.add("hidden"),u.classList.remove("hidden");const n="vo-load-fail";let i=!1;const r=()=>{if(i)return;let c=document.getElementById(n);c||(c=document.createElement("div"),c.id=n,c.className="vo-fail",c.innerHTML=`<div style="display:grid;gap:8px;text-align:center">
          <div style="font-weight:600">This site may block embedding in an app</div>
          <a href="${o}" target="_blank" rel="noopener" class="vo-cta" style="justify-self:center">Open in browser</a>
        </div>`,u.appendChild(c))},d=window.setTimeout(r,3e3);p.addEventListener("load",()=>{i=!0,window.clearTimeout(d);const c=document.getElementById(n);c&&c.remove()},{once:!0})}function S(e){if(e.image)return e.image;const o=e.link||e.url||"";if(!o)return"";try{return`https://www.google.com/s2/favicons?sz=256&domain=${new URL(o).hostname}`}catch{return""}}function h(){const e=g.classList.toggle("drawer-open");m.setAttribute("aria-hidden",String(!e))}function x(e){return`vo.cache.${e}`}function N(e,o){return!e||Date.now()-e>o}async function k(e,o,t){const a=typeof o=="string"&&(o.startsWith("/data/")||o.startsWith("data/")||o.startsWith("/api/")||o.startsWith("api/")),n=a?`${o.startsWith("/")?o:"/"+o}?v=${Date.now()}`:o;if(console.log(`Fetching from: ${n}`),a){const c=await fetch(n,{cache:"no-store"});return console.log("API response status:",c.status),await c.json()}const i=x(e);try{const c=JSON.parse(localStorage.getItem(i)||"null");if(c&&!N(c.ts,t))return c.data}catch{}const d=await(await fetch(n,{cache:"no-store"})).json();return localStorage.setItem(i,JSON.stringify({ts:Date.now(),data:d})),d}function A(e){const o=document.createElement("div");o.className="vo-gallery-grid";for(const t of e){const a=document.createElement("button");a.className="vo-card";const n=S(t)||t.thumbnail||"";a.innerHTML=`
        <div class="vo-card-thumb" style="background-image:url('${n}')">
          <div class="vo-card-overlay">
            <button class="vo-cta" data-action="launch">${t.type==="Client Work"?"View Work":"Launch Experiment"}</button>
            <button class="vo-cta secondary" data-action="overview">${t.type==="Client Work"?"Case Study":"Overview"}</button>
          </div>
        </div>
        <div class="vo-card-meta">
          <div class="vo-card-title">${t.title||"Untitled"}</div>
          <div class="vo-card-sub">${t.type==="Client Work"?t.industry||"":t.author||""}</div>
          <div class="vo-card-desc">${t.description||""}</div>
        </div>`,a.addEventListener("click",i=>{const r=i.target.closest("[data-action]");(r?r.getAttribute("data-action"):"launch")==="overview"?(y.innerHTML=t.details||"",g.classList.add("drawer-open"),m.setAttribute("aria-hidden","false")):C({url:t.link||t.url,title:t.title,details:t.details})}),o.appendChild(a)}return o}async function q(e){console.log(`Loading ${e} from:`,f[e]);const o=await k(e,f[e],L);console.log("Loaded data:",o);let t=o.items||[];console.log("Items before filter:",t.length),t.length&&t[0].type&&(t=t.filter(i=>e==="portfolio"?i.type==="Client Work":i.type==="Experiment")),console.log("Items after filter:",t.length),l.replaceChildren();const a=document.createElement("button");a.className="vo-back",a.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg><span>Home</span>',a.addEventListener("click",v),l.appendChild(a);const n=document.createElement("div");n.className="vo-collection-header",n.textContent=e==="portfolio"?"Portfolio":"Experiments",l.appendChild(n),l.appendChild(A(t))}function b(){console.log("Adding left buttons...");const e=document.createElement("div");e.className="vo-left-buttons",e.innerHTML=`
      <button class="vo-circle" data-collection="portfolio"><span>Portfolio</span></button>
      <button class="vo-circle alt" data-collection="experiments"><span>Experiments</span></button>
    `,l.appendChild(e),console.log("Left buttons added:",e),l.addEventListener("click",o=>{console.log("Launcher clicked:",o.target),console.log("Event target tagName:",o.target.tagName),console.log("Event target className:",o.target.className);const t=o.target.closest("[data-collection]");if(console.log("Found button:",t,"Collection:",t==null?void 0:t.getAttribute("data-collection")),!t){console.log("No button found, checking all data-collection elements:");const a=l.querySelectorAll("[data-collection]");console.log("All buttons found:",a.length,a);return}q(t.getAttribute("data-collection"))})}const $=document.getElementById("app");$.innerHTML=`
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
`;const l=s("launcher"),u=s("app-viewport"),O=s("btn-exit-app"),T=s("btn-toggle-drawer"),g=document.querySelector(".vo-content"),m=s("drawer"),p=s("portfolio-frame"),y=s("drawer-content"),I=s("cc-logo");O.addEventListener("click",v);T.addEventListener("click",h);window.addEventListener("keydown",e=>{e.key==="Escape"||e.key.toLowerCase()==="h"&&!e.metaKey?v():e.key.toLowerCase()==="d"&&(u.classList.contains("hidden")||h())});v();b();function M(){const e=document.createElement("div");e.className="vo-controls",e.innerHTML=`
    <h4>Background Waves</h4>
    <div class="row"><label>Brightness</label><input id="ctl-bright" type="range" min="0" max="2" step="0.01" value="1"><output id="out-bright">1.00</output></div>
    <div class="row"><label>Base</label><input id="ctl-base" type="range" min="0" max="2" step="0.01" value="1"><output id="out-base">1.00</output></div>
    <div class="row"><label>Opacity</label><input id="ctl-opacity" type="range" min="0" max="1" step="0.01" value="1"><output id="out-opacity">1.00</output></div>
    <div class="row"><label>Noise</label><input id="ctl-noise" type="range" min="0" max="0.2" step="0.005" value="0.03"><output id="out-noise">0.03</output></div>
  `,document.body.appendChild(e);const o=[{input:e.querySelector("#ctl-bright"),out:e.querySelector("#out-bright"),varName:"--vo-brightness"},{input:e.querySelector("#ctl-base"),out:e.querySelector("#out-base"),varName:"--vo-base-scale"},{input:e.querySelector("#ctl-opacity"),out:e.querySelector("#out-opacity"),varName:"--vo-circle-opacity"},{input:e.querySelector("#ctl-noise"),out:e.querySelector("#out-noise"),varName:"--vo-noise"}],t=document.documentElement.style;for(const{input:a,out:n,varName:i}of o){const r=()=>{const d=Number(a.value);t.setProperty(i,String(d)),n.value=d.toFixed(2)};a.addEventListener("input",r),r()}}M();console.log("Background circles:",document.querySelectorAll(".vo-bg-circle").length);console.log("Controls panel:",document.querySelector(".vo-controls"));console.log("Circle group:",document.querySelector("#vo-circle-group"));
