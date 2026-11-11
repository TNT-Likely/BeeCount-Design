(() => {
  'use strict';
  const $ = s => document.querySelector(s), frames = new Map();
  const state = {viewport:'375x667',appearance:'light',budget:'set',scale:'1',selected:'a'};
  const params = new URLSearchParams(location.search); let generation = 0;
  const svg = (name) => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${{up:'m6 15 6-6 6 6',down:'m6 9 6 6 6-6',close:'m6 6 12 12M6 18 18 6',chevron:'m9 6 6 6-6 6'}[name]}"/></svg>`;
  const css = `
  html,body{width:100%!important;height:100%!important;overflow:hidden!important;background:transparent!important}
  #bee-immersive-suite{margin:0!important;padding:0!important}#bee-immersive-suite .bc-stage{padding:0!important;min-height:0!important;background:none!important}
  #bee-immersive-suite #bee-immersive-phone{box-shadow:none!important;margin:0!important;transform:none!important;border-radius:34px!important}
  #bee-immersive-suite .bc-main[data-hs]{display:flex!important;flex-direction:column!important;overflow:hidden!important}
  #bee-immersive-suite .bc-main[data-hs] .bc-topbar{flex:none}
  #bee-immersive-suite .bc-main[data-hs] .bc-stream{flex:1!important;min-height:0!important;height:auto!important}
  #bee-immersive-suite .bc-main[data-hs] .h-journal-list{flex:1!important;min-height:0!important}
  #bee-immersive-suite .hs-mini{flex:none;margin:5px 17px 10px;padding:13px 16px;border-radius:22px;background:var(--bc-paper);color:var(--bc-ink);min-width:0}
  #bee-immersive-suite .hs-context{display:flex;align-items:center;justify-content:space-between;gap:8px;color:var(--bc-muted);font-size:calc(11px * var(--q-scale,1))}
  #bee-immersive-suite .hs-context .bc-month-button{font-size:calc(12px * var(--q-scale,1))!important;min-height:28px!important}
  #bee-immersive-suite .hs-context .bc-eye{min-width:30px;min-height:28px;display:grid;place-items:center}
  #bee-immersive-suite .hs-context svg{width:15px;height:15px}
  #bee-immersive-suite .hs-mini button{border:0;background:none;color:inherit;cursor:pointer}
  #bee-immersive-suite .hs-open{display:flex;align-items:center;justify-content:space-between;gap:10px;width:100%;padding:4px 0 5px;text-align:left}
  #bee-immersive-suite .hs-open>span:first-child{display:grid;gap:1px;min-width:0}
  #bee-immersive-suite .hs-open small{color:var(--bc-muted);font-size:calc(11px * var(--q-scale,1))}
  #bee-immersive-suite .hs-open strong{font-size:calc(23px * var(--q-scale,1));font-weight:600;white-space:nowrap;line-height:1.4;letter-spacing:-.5px}
  #bee-immersive-suite .hs-open>span:last-child{display:flex;align-items:center;gap:3px;font-size:11px;white-space:nowrap;color:var(--bc-muted)}
  #bee-immersive-suite .hs-open svg{width:14px;height:14px}
  #bee-immersive-suite .hs-budget{display:flex;align-items:center;justify-content:space-between;gap:6px;width:100%;padding:7px 0 0!important;margin-top:4px;border-top:1px solid var(--bc-line)!important;color:var(--bc-muted)!important;font-size:calc(11px * var(--q-scale,1));text-align:left;min-height:32px}
  #bee-immersive-suite .hs-budget>span{display:flex;align-items:center;gap:4px}.hs-budget svg{width:13px;height:13px}
  #bee-immersive-suite .hs-budget .hs-over{color:var(--bc-red)}
  #bee-immersive-suite .hs-overlay{position:absolute;inset:0;z-index:100;background:rgb(0 0 0 / .3);display:flex;align-items:flex-end}
  #bee-immersive-suite .hs-panel{background:var(--bc-bg,#f4f5f6);color:var(--bc-ink);border-radius:26px 26px 0 0;padding:9px 0 20px;width:100%;max-height:85%;overflow:auto;box-shadow:0 -8px 35px #0001}
  #bee-immersive-suite .hs-handle{width:32px;height:4px;border-radius:9px;background:var(--bc-muted);opacity:.25;margin:0 auto 13px}
  #bee-immersive-suite .hs-panel>header{display:flex;align-items:center;justify-content:space-between;padding:0 21px 8px;font-size:15px;font-weight:600}
  #bee-immersive-suite .hs-panel>header button{width:36px;height:36px;border:0;background:none;color:var(--bc-muted);padding:9px}
  #bee-immersive-suite .hs-panel svg{fill:none;stroke:currentColor;stroke-width:1.6}
  #bee-immersive-suite .hs-panel .bc-summary{margin:0 17px!important}
  #bee-immersive-suite .hs-panel p{font-size:11px;color:var(--bc-muted);margin:12px 21px 0;line-height:1.8}
  #bee-immersive-suite .hs-views{flex:none;display:flex;gap:5px;background:var(--bc-soft);padding:4px;border-radius:12px;margin:4px 17px 6px}
  #bee-immersive-suite .hs-views button{flex:1;min-height:32px;font-size:12px;color:var(--bc-muted);border:0;border-radius:9px;background:none}
  #bee-immersive-suite .hs-views button[aria-pressed=true]{background:var(--bc-paper);color:var(--bc-ink);font-weight:550}
  #bee-immersive-suite .bc-main[data-hs=c][data-hs-view=details]>.bc-summary{display:none!important}
  #bee-immersive-suite .bc-main[data-hs=c][data-hs-view=overview]>.bc-stream,#bee-immersive-suite .bc-main[data-hs=c][data-hs-view=overview]>.hs-mini{display:none!important}
  #bee-immersive-suite .bc-main[data-hs=c][data-hs-view=overview]{overflow-y:auto!important}
  #bee-immersive-suite .hs-overview-note{display:none;font-size:11px;line-height:1.8;color:var(--bc-muted);margin:8px 22px}
  #bee-immersive-suite .bc-main[data-hs-view=overview] .hs-overview-note{display:block}
  #bee-immersive-suite .bc-main[data-hs=b]{display:block!important;overflow-y:auto!important;overscroll-behavior:contain}
  #bee-immersive-suite .bc-main[data-hs=b] .bc-stream{height:auto!important;min-height:100%;overflow:visible!important}
  #bee-immersive-suite .bc-main[data-hs=b] .h-journal-list{height:auto!important;max-height:none!important;overflow:visible!important}
  #bee-immersive-suite .hs-sticky{position:sticky;top:0;height:0;z-index:8;margin:0 17px;pointer-events:none}
  #bee-immersive-suite .hs-sticky button{display:flex;align-items:center;justify-content:space-between;gap:8px;width:100%;min-height:48px;padding:10px 13px;border:1px solid var(--bc-line);border-radius:13px;background:var(--bc-paper);color:var(--bc-ink);box-shadow:0 5px 15px #0000000a;opacity:0;pointer-events:none;font-size:12px}
  #bee-immersive-suite .hs-sticky.shown button{opacity:1;pointer-events:auto}
  #bee-immersive-suite .hs-sticky button>span{display:grid;gap:1px;text-align:left;min-width:0}
  #bee-immersive-suite .hs-sticky small{color:var(--bc-muted);font-size:10px}
  #bee-immersive-suite .hs-sticky svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:1.6;flex:none}
  #bee-immersive-suite [data-hs] button svg{fill:none;stroke:currentColor;stroke-width:1.6}
  `;
  function values(e){const over=state.budget==='exceeded',hide=e.api.state.hide;return {expense:hide?'••••':over?'¥5,328.50':'¥3,286.50',remaining:hide?'••••':over?'已超支 ¥328.50':'剩余 ¥1,713.50',budget:hide?'••••':'¥5,000.00'};}
  function mini(e,month,eye){const d=values(e);if(e.variant==='c')return `<div class="hs-mini"><div class="hs-context">${month}${eye}</div><button class="hs-budget" data-hs-budget><span>${state.budget==='unset'?'还没有设置预算':'本月预算'}</span><span class="${state.budget==='exceeded'?'hs-over':''}">${state.budget==='unset'?'去设置':d.remaining} ${svg('chevron')}</span></button></div>`;return `<div class="hs-mini"><div class="hs-context">${month}${eye}</div><button class="hs-open" data-hs-open="${e.variant==='c'?'overview':'sheet'}" aria-label="查看汇总与预算"><span><small>本月支出</small><strong>${d.expense}</strong></span><span>汇总与预算 ${svg('up')}</span></button><button class="hs-budget" data-hs-budget><span>${state.budget==='unset'?'还没有设置预算':'本月预算'}</span><span class="${state.budget==='exceeded'?'hs-over':''}">${state.budget==='unset'?'去设置':d.remaining} ${svg('chevron')}</span></button></div>`;}
  function overlay(e,kind){const layer=e.doc.createElement('div');layer.className='hs-overlay';const isBudget=kind==='budget',title=isBudget?(state.budget==='unset'?'设置预算':'本月预算'):'本月概览';layer.innerHTML=`<section class="hs-panel" role="dialog" aria-modal="true" aria-label="${title}"><div class="hs-handle"></div><header>${title}<button data-hs-close aria-label="关闭${title}">${svg('close')}</button></header>${e.original}<p>${isBudget?'沿用原有预算管理流程；此稿用于检查入口，不改预算计算。':'收入、结余、预算总额与进度完整展示；关闭后继续看刚才的明细。'}</p></section>`;e.phone.querySelector('.hs-overlay')?.remove();e.phone.append(layer);layer.onclick=event=>{if(event.target===layer||event.target.closest('[data-hs-close]')){layer.remove();e.phone.querySelector('[data-hs-open]')?.focus({preventScroll:true});}};layer.querySelector('[data-hs-close]').focus({preventScroll:true});}
  function view(e,value){e.view=value;e.main.dataset.hsView=value;for(const b of e.main.querySelectorAll('[data-hs-view-button]'))b.setAttribute('aria-pressed',String(b.dataset.hsViewButton===value));}
  function apply(e){if(e.generation!==generation||e.api.state.page!=='home')return;const card=e.phone.querySelector('.bc-main>.bc-summary');if(!card||card.dataset.hsReady)return;card.dataset.hsReady='true';const d=values(e),main=e.phone.querySelector('.bc-main');e.main=main;main.dataset.hs=e.variant;const hero=card.querySelector('.bc-hero-value');if(hero)hero.textContent=d.expense;const metrics=card.querySelectorAll('.bc-dual strong');for(let i=0;i<metrics.length;i++)metrics[i].textContent=e.api.state.hide?'••••':['12,000.00',state.budget==='exceeded'?'6,671.50':'8,713.50'][i];const budget=card.querySelector('.bc-budget');if(budget){budget.dataset.hsBudget='';if(state.budget==='unset'){budget.innerHTML='<button class="hs-budget" data-hs-budget><span>设置预算，轻松掌控每月开支</span><span>去设置 '+svg('chevron')+'</span></button>';}else{const left=budget.querySelector('.bc-between>span'),right=budget.querySelector('button'),bar=budget.querySelector('.bc-budget-track>span');if(left)left.textContent='月预算 '+d.budget;if(right){right.textContent=d.remaining;right.removeAttribute('data-action');}if(bar){bar.style.width=state.budget==='exceeded'?'100%':'66%';if(state.budget==='exceeded')bar.style.background='var(--bc-red)';}}}e.original=card.outerHTML;const month=card.querySelector('.bc-month-button')?.outerHTML||'',eye=card.querySelector('.bc-eye')?.outerHTML||'';
    if(e.variant==='a'){card.outerHTML=mini(e,month,eye);}else if(e.variant==='c'){card.insertAdjacentHTML('beforebegin',`<nav class="hs-views" aria-label="首页视图"><button data-hs-view-button="details">明细</button><button data-hs-view-button="overview">本月概览</button></nav>${mini(e,month,eye)}`);card.insertAdjacentHTML('afterend','<p class="hs-overview-note">收支与预算放在这里完整查看。切回明细后保留原来的列表位置。</p>');view(e,e.view||'details');}else{card.insertAdjacentHTML('beforebegin',`<div class="hs-sticky"><button data-hs-top aria-label="返回完整汇总"><span><b>本月支出 ${d.expense}</b><small>${state.budget==='unset'?'未设置预算':d.remaining}</small></span>${svg('down')}</button></div>`);main.addEventListener('scroll',()=>{main.querySelector('.hs-sticky')?.classList.toggle('shown',main.scrollTop>card.offsetTop+card.offsetHeight-48);},{passive:true});}
    e.ready=true;
  }
  function resize(){const [w,h]=state.viewport.split('x').map(Number);document.documentElement.style.setProperty('--phone-w',w);document.documentElement.style.setProperty('--phone-h',h);for(const article of document.querySelectorAll('[data-variant]'))article.querySelector('.phone-stage').style.setProperty('--zoom',Math.min(1,(article.clientWidth-24)/w));}
  function load(){const version=++generation;frames.clear();resize();for(const iframe of document.querySelectorAll('[data-frame]')){const variant=iframe.dataset.frame;iframe.onload=()=>{const boot=()=>{if(version!==generation)return;const doc=iframe.contentDocument,win=iframe.contentWindow,api=win.beeImmersiveDemo,phone=doc.querySelector('#bee-immersive-phone');if(!api||!phone){setTimeout(boot,40);return;}const style=doc.createElement('style');style.textContent=css;doc.head.append(style);const theme=doc.querySelector('#bee-skin-mode');theme.value=state.appearance;theme.dispatchEvent(new win.Event('change',{bubbles:true}));api.state.hide=false;api.render();const e={variant,doc,win,api,phone,iframe,view:'details',generation:version,ready:false};frames.set(variant,e);let queued=false;new win.MutationObserver(()=>{if(queued)return;queued=true;win.requestAnimationFrame(()=>{queued=false;apply(e);});}).observe(phone,{childList:true,subtree:true});doc.addEventListener('click',event=>{const target=event.target.closest('[data-hs-open],[data-hs-budget],[data-hs-view-button],[data-hs-top]');if(!target)return;event.preventDefault();event.stopImmediatePropagation();if(target.hasAttribute('data-hs-view-button'))view(e,target.dataset.hsViewButton);else if(target.hasAttribute('data-hs-top'))e.main.scrollTo({top:0,behavior:'instant'});else if(target.dataset.hsOpen==='overview')view(e,'overview');else overlay(e,target.hasAttribute('data-hs-budget')?'budget':'summary');},true);doc.addEventListener('keydown',event=>{if(event.key==='Escape')phone.querySelector('.hs-overlay')?.remove();});apply(e);};boot();};iframe.src='../prototype/demo.html?'+new URLSearchParams({page:'home',embed:'1',homeSummary:'standard',viewport:state.viewport,scale:state.scale});}const url=new URL(location.href);for(const k of Object.keys(state))url.searchParams.set(k,state[k]);history.replaceState(null,'',url);}
  for(const key of ['viewport','appearance','budget','scale']){const select=$('#'+key);if([...select.options].some(o=>o.value===params.get(key))){state[key]=params.get(key);select.value=state[key];}select.onchange=()=>{state[key]=select.value;load();};}
  function select(value){state.selected=value;$('.proposals').dataset.selected=value;for(const b of document.querySelectorAll('[data-select]'))b.setAttribute('aria-pressed',String(b.dataset.select===value));resize();}
  for(const button of document.querySelectorAll('[data-select]'))button.onclick=()=>select(button.dataset.select);
  if(['a','b','c'].includes(params.get('selected')))select(params.get('selected'));
  $('#reset').onclick=()=>load();new ResizeObserver(resize).observe($('.proposals'));window.shortScreenReview={state,frames};load();
})();
