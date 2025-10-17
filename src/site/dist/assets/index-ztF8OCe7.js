(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))a(n);new MutationObserver(n=>{for(const c of n)if(c.type==="childList")for(const r of c.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&a(r)}).observe(document,{childList:!0,subtree:!0});function o(n){const c={};return n.integrity&&(c.integrity=n.integrity),n.referrerPolicy&&(c.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?c.credentials="include":n.crossOrigin==="anonymous"?c.credentials="omit":c.credentials="same-origin",c}function a(n){if(n.ep)return;n.ep=!0;const c=o(n);fetch(n.href,c)}})();const b=24*60*60*1e3,y=7*b,v={portfolio:"./api/data.json",experiments:"./api/data.json"};function s(e){const t=document.getElementById(e);if(!t)throw new Error(`Missing element #${e}`);return t}function w(){let e=i.querySelector("#vo-circle-group");e||(e=document.createElement("div"),e.id="vo-circle-group",e.className="vo-circle-group");const t=["vo-circle-small","vo-circle-medium","vo-circle-large","vo-circle-xlarge","vo-circle-xxlarge"],o=[];for(const a of t){let n=e.querySelector(`.${a}`);n||(n=document.createElement("div"),n.className=`vo-bg-circle ${a}`),o.push(n)}return e.replaceChildren(...o),e}function u(){m.classList.add("hidden"),i.classList.remove("hidden"),f.classList.remove("drawer-open"),h.setAttribute("aria-hidden","true"),O.src="";const e=w();i.replaceChildren(e,W),g()}function E(e){const{url:t}=e;window.location.href=t}function L(e){if(e.image)return e.image;const t=e.link||e.url||"";if(!t)return"";try{return`https://www.google.com/s2/favicons?sz=256&domain=${new URL(t).hostname}`}catch{return""}}function p(){const e=f.classList.toggle("drawer-open");h.setAttribute("aria-hidden",String(!e))}function C(e){return`vo.cache.${e}`}function S(e,t){return!e||Date.now()-e>t}async function N(e,t,o){const a=typeof t=="string"&&(t.startsWith("/data/")||t.startsWith("data/")||t.startsWith("/api/")||t.startsWith("api/")),n=a?`${t.startsWith("/")?t:"/"+t}?v=${Date.now()}`:t;if(console.log(`Fetching from: ${n}`),a){const l=await fetch(n,{cache:"no-store"});if(console.log("API response status:",l.status),!l.ok)throw new Error(`API request failed: ${l.status} ${l.statusText}`);return await l.json()}const c=C(e);try{const l=JSON.parse(localStorage.getItem(c)||"null");if(l&&!S(l.ts,o))return l.data}catch{}const d=await(await fetch(n,{cache:"no-store"})).json();return localStorage.setItem(c,JSON.stringify({ts:Date.now(),data:d})),d}function x(e){const t=document.createElement("div");t.className="vo-gallery-grid";for(const o of e){const a=document.createElement("button");a.className="vo-card";const n=L(o)||o.thumbnail||"";a.innerHTML=`
        <div class="vo-card-thumb" style="background-image:url('${n}')">
          <div class="vo-card-overlay">
            <button class="vo-cta" data-action="launch">${o.type==="Client Work"?"View Work":"Launch Experiment"}</button>
            <button class="vo-cta secondary" data-action="overview">${o.type==="Client Work"?"Case Study":"Overview"}</button>
          </div>
        </div>
        <div class="vo-card-meta">
          <div class="vo-card-title">${o.title||"Untitled"}</div>
          <div class="vo-card-sub">${o.type==="Client Work"?o.industry||"":o.author||""}</div>
          <div class="vo-card-desc">${o.description||""}</div>
        </div>`,a.addEventListener("click",c=>{const r=c.target.closest("[data-action]");(r?r.getAttribute("data-action"):"launch")==="overview"?alert(o.details||"No details available"):E({url:o.link||o.url,title:o.title,details:o.details})}),t.appendChild(a)}return t}async function k(e){console.log(`Loading ${e} from:`,v[e]);const t=await N(e,v[e],y);console.log("Loaded data:",t);let o=t.items||[];console.log("Items before filter:",o.length),o.length&&o[0].type&&(o=o.filter(c=>e==="portfolio"?c.type==="Client Work":c.type==="Experiment")),console.log("Items after filter:",o.length),i.replaceChildren();const a=document.createElement("button");a.className="vo-back",a.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg><span>Home</span>',a.addEventListener("click",u),i.appendChild(a);const n=document.createElement("div");n.className="vo-collection-header",n.textContent=e==="portfolio"?"Portfolio":"Experiments",i.appendChild(n),i.appendChild(x(o))}function g(){console.log("Adding left buttons...");const e=document.createElement("div");e.className="vo-left-buttons",e.innerHTML=`
      <button class="vo-circle" data-collection="portfolio"><span>Portfolio</span></button>
      <button class="vo-circle alt" data-collection="experiments"><span>Experiments</span></button>
    `,i.appendChild(e),console.log("Left buttons added:",e),i.addEventListener("click",t=>{console.log("Launcher clicked:",t.target),console.log("Event target tagName:",t.target.tagName),console.log("Event target className:",t.target.className);const o=t.target.closest("[data-collection]");if(console.log("Found button:",o,"Collection:",o==null?void 0:o.getAttribute("data-collection")),!o){console.log("No button found, checking all data-collection elements:");const a=i.querySelectorAll("[data-collection]");console.log("All buttons found:",a.length,a);return}k(o.getAttribute("data-collection"))})}const q=document.getElementById("app");q.innerHTML=`
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
`;const i=s("launcher"),m=s("app-viewport"),A=s("btn-exit-app"),$=s("btn-toggle-drawer"),f=document.querySelector(".vo-content"),h=s("drawer"),O=s("portfolio-frame");s("drawer-content");const W=s("cc-logo");A.addEventListener("click",u);$.addEventListener("click",p);window.addEventListener("keydown",e=>{e.key==="Escape"||e.key.toLowerCase()==="h"&&!e.metaKey?u():e.key.toLowerCase()==="d"&&(m.classList.contains("hidden")||p())});u();g();function P(){const e=document.createElement("div");e.className="vo-controls",e.innerHTML=`
    <h4>Background Waves</h4>
    <div class="row"><label>Brightness</label><input id="ctl-bright" type="range" min="0" max="2" step="0.01" value="1"><output id="out-bright">1.00</output></div>
    <div class="row"><label>Base</label><input id="ctl-base" type="range" min="0" max="2" step="0.01" value="1"><output id="out-base">1.00</output></div>
    <div class="row"><label>Opacity</label><input id="ctl-opacity" type="range" min="0" max="1" step="0.01" value="1"><output id="out-opacity">1.00</output></div>
    <div class="row"><label>Noise</label><input id="ctl-noise" type="range" min="0" max="0.2" step="0.005" value="0.03"><output id="out-noise">0.03</output></div>
  `,document.body.appendChild(e);const t=[{input:e.querySelector("#ctl-bright"),out:e.querySelector("#out-bright"),varName:"--vo-brightness"},{input:e.querySelector("#ctl-base"),out:e.querySelector("#out-base"),varName:"--vo-base-scale"},{input:e.querySelector("#ctl-opacity"),out:e.querySelector("#out-opacity"),varName:"--vo-circle-opacity"},{input:e.querySelector("#ctl-noise"),out:e.querySelector("#out-noise"),varName:"--vo-noise"}],o=document.documentElement.style;for(const{input:a,out:n,varName:c}of t){const r=()=>{const d=Number(a.value);o.setProperty(c,String(d)),n.value=d.toFixed(2)};a.addEventListener("input",r),r()}}P();console.log("Background circles:",document.querySelectorAll(".vo-bg-circle").length);console.log("Controls panel:",document.querySelector(".vo-controls"));console.log("Circle group:",document.querySelector("#vo-circle-group"));
