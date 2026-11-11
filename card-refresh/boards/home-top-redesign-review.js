(() => {
  'use strict';
  const $=s=>document.querySelector(s),frames=new Map(),params=new URLSearchParams(location.search);
  const state={viewport:'375x667',appearance:'light',budget:'set',scale:'1',selected:'revised'};let generation=0;
  const icon=n=>({chevron:'<svg viewBox="0 0 24 24"><path d="m9 6 6 6-6 6"/></svg>',up:'<svg viewBox="0 0 24 24"><path d="m6 15 6-6 6 6"/></svg>',close:'<svg viewBox="0 0 24 24"><path d="m6 6 12 12M6 18 18 6"/></svg>',budget:'<svg viewBox="0 0 24 24"><path d="M21 12a9 9 0 1 1-9-9v9zM15 3.5V9h5.5A9 9 0 0 0 15 3.5Z"/></svg>'}[n]);
  const css=`
  html,body{width:100%!important;height:100%!important;overflow:hidden!important;background:transparent!important}
  #bee-immersive-suite{margin:0!important;padding:0!important}#bee-immersive-suite .bc-stage{padding:0!important;min-height:0!important;background:none!important}
  #bee-immersive-suite #bee-immersive-phone{box-shadow:none!important;margin:0!important;transform:none!important;border-radius:34px!important}
  #bee-immersive-suite .bc-phone .bc-main[data-hp]{display:block!important;overflow-y:auto!important;overscroll-behavior:contain;scrollbar-width:none}
  #bee-immersive-suite .bc-main[data-hp] .bc-stream{height:auto!important;min-height:100%;overflow:visible!important}
  #bee-immersive-suite .bc-main[data-hp] .h-journal-list{height:auto!important;max-height:none!important;overflow:visible!important}
  #bee-immersive-suite .hp-summary{margin:5px 0 13px;padding:17px 18px 18px;background:var(--bc-paper);border-radius:24px;color:var(--bc-ink);min-width:0}
  #bee-immersive-suite .hp-context{display:flex;align-items:center;justify-content:space-between;gap:6px;min-height:32px}
  #bee-immersive-suite .hp-summary button{color:inherit;border:0;cursor:pointer}
  #bee-immersive-suite .hp-context .bc-month-button{flex:none;font-size:calc(12px * var(--q-scale,1));min-height:32px;padding:0;gap:5px;color:var(--bc-muted)}
  #bee-immersive-suite .hp-context .bc-month-button svg{width:13px;height:13px}
  #bee-immersive-suite .hp-budget{display:flex;align-items:center;justify-content:flex-end;gap:5px;min-height:32px;min-width:0;padding:3px 0 3px 8px;background:none;font-size:calc(10px * var(--q-scale,1));color:var(--bc-muted)!important;text-align:right;white-space:nowrap}
  #bee-immersive-suite .hp-budget>svg{width:14px;height:14px;flex:none;stroke:currentColor;fill:none;stroke-width:1.5}
  #bee-immersive-suite .hp-budget>svg:first-child{color:var(--bc-strong)}
  #bee-immersive-suite .hp-budget strong{font-weight:500;color:var(--bc-ink)}
  #bee-immersive-suite .hp-budget>svg:last-child{width:11px}
  #bee-immersive-suite .hp-budget[data-over=true],#bee-immersive-suite .hp-budget[data-over=true] strong,#bee-immersive-suite .hp-budget[data-over=true]>svg:first-child{color:var(--bc-red)!important}
  #bee-immersive-suite .hp-expense-label{display:flex;align-items:center;gap:6px;margin-top:14px;color:var(--bc-muted);font-size:calc(11px * var(--q-scale,1));min-height:24px}
  #bee-immersive-suite .hp-expense-label .bc-eye{width:28px;height:28px;min-height:28px;display:grid;place-items:center;padding:0;background:none}
  #bee-immersive-suite .hp-expense-label svg{width:15px;height:15px}
  #bee-immersive-suite .hp-amount{font-size:calc(36px * var(--q-scale,1));font-weight:600;letter-spacing:-.8px;line-height:1.3;min-height:47px;display:flex;gap:4px;align-items:baseline;white-space:nowrap}
  #bee-immersive-suite .hp-amount>span:first-child{font-size:calc(19px * var(--q-scale,1));font-weight:400;letter-spacing:0}
  #bee-immersive-suite .hp-metrics{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-top:18px}
  #bee-immersive-suite .hp-metrics>div{display:grid;gap:6px;min-width:0}
  #bee-immersive-suite .hp-metrics>div:last-child{text-align:right}
  #bee-immersive-suite .hp-metrics label{font-size:calc(11px * var(--q-scale,1));line-height:1.4;color:var(--bc-muted)}
  #bee-immersive-suite .hp-metrics strong{font-size:calc(18px * var(--q-scale,1));line-height:1.35;font-weight:550;white-space:nowrap}
  #bee-immersive-suite .hp-sticky{position:sticky;top:0;z-index:8;height:0;margin:0;pointer-events:none}
  #bee-immersive-suite .hp-sticky-inner{display:flex;align-items:center;justify-content:space-between;gap:5px;min-height:52px;padding:7px 13px;border:1px solid var(--bc-line);border-radius:15px;background:var(--bc-paper);color:var(--bc-ink);box-shadow:0 5px 20px #0001;visibility:hidden;pointer-events:none}
  #bee-immersive-suite .hp-sticky.shown .hp-sticky-inner{visibility:visible;pointer-events:auto}
  #bee-immersive-suite .hp-back-top{display:grid;gap:2px;min-width:0;background:none;color:inherit;border:0;padding:0;text-align:left;font-size:calc(12px * var(--q-scale,1))}
  #bee-immersive-suite .hp-back-top small{color:var(--bc-muted);font-size:10px}
  #bee-immersive-suite .hp-sticky .hp-budget-caption{display:none}
  #bee-immersive-suite .hp-overlay{position:absolute;inset:0;z-index:100;background:#0005;display:flex;align-items:flex-end}
  #bee-immersive-suite .hp-panel{width:100%;max-height:84%;overflow:auto;padding:13px 20px 25px;border-radius:25px 25px 0 0;background:var(--bc-paper);color:var(--bc-ink)}
  #bee-immersive-suite .hp-handle{height:4px;width:32px;background:var(--bc-muted);opacity:.25;border-radius:9px;margin:0 auto 17px}
  #bee-immersive-suite .hp-panel header{display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:17px;font-weight:600}
  #bee-immersive-suite .hp-panel button{border:0;cursor:pointer;background:none;color:inherit}
  #bee-immersive-suite .hp-panel header button{width:36px;height:36px;padding:8px}
  #bee-immersive-suite .hp-panel svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:1.5}
  #bee-immersive-suite .hp-budget-detail{display:grid;gap:14px;margin:25px 0;font-size:12px;color:var(--bc-muted)}
  #bee-immersive-suite .hp-budget-detail>div{display:flex;justify-content:space-between;gap:12px;min-width:0}
  #bee-immersive-suite .hp-budget-detail strong{color:var(--bc-ink);font-weight:550}
  #bee-immersive-suite .hp-budget-detail .hp-detail-value{font-size:30px;font-weight:600}
  #bee-immersive-suite .hp-budget-track{width:100%;height:5px;background:var(--bc-soft);border-radius:6px;overflow:hidden}
  #bee-immersive-suite .hp-budget-track>span{display:block;height:100%;background:var(--bc-accent)}
  #bee-immersive-suite .hp-panel p{font-size:11px;line-height:1.8;color:var(--bc-muted)}
  #bee-immersive-suite .hp-panel .hp-manage{width:100%;min-height:44px;border-radius:13px;background:var(--bc-accent);color:var(--bc-on-accent);font-size:13px;margin-top:8px}
  #bee-immersive-suite .hp-panel .hp-close{width:100%;min-height:44px;font-size:13px;margin-top:6px}
  #bee-immersive-suite .hp-small .hp-budget-caption{display:none}
  `;
  function data(e,card){const hidden=e.api.state.hide,over=state.budget==='exceeded';return {hidden,over,expense:hidden?'••••':over?'5,328.50':card.querySelector('.bc-hero-value')?.textContent.replace(/^[¥\s]+/,'')||'3,286.50',income:hidden?'••••':card.querySelector('.bc-dual strong')?.textContent||'12,000.00',balance:hidden?'••••':over?'6,671.50':card.querySelectorAll('.bc-dual strong')[1]?.textContent||'8,713.50',remaining:hidden?'••••':over?'¥328.50':'¥1,713.50',total:hidden?'••••':'¥5,000.00'};}
  function budget(e){const d=e.values;return `<button class="hp-budget" data-hp-budget data-over="${d.over}" aria-label="${state.budget==='unset'?'设置预算':d.over?'查看预算，已超支 '+d.remaining:'查看预算，剩余 '+d.remaining}">${icon('budget')}${state.budget==='unset'?'<strong>设置预算</strong>':`<span class="hp-budget-caption">${d.over?'超支':'剩余'}</span><strong>${d.remaining}</strong>`}${icon('chevron')}</button>`;}
  function fit(e){for(const node of e.main.querySelectorAll('.hp-amount,.hp-metrics strong')){node.style.fontSize='';const available=node.clientWidth;if(node.scrollWidth>available+1)node.style.fontSize=(parseFloat(e.win.getComputedStyle(node).fontSize)*available/node.scrollWidth)+'px';}}
  function apply(e){if(e.generation!==generation||e.api.state.page!=='home')return;const card=e.phone.querySelector('.bc-main>.bc-summary');if(!card||card.dataset.hpReady)return;card.dataset.hpReady='true';const main=e.phone.querySelector('.bc-main');e.main=main;main.dataset.hp=e.variant;e.values=data(e,card);const month=card.querySelector('.bc-month-button')?.outerHTML||'',eye=card.querySelector('.bc-eye')?.outerHTML||'';
    card.querySelector('.bc-budget')?.remove();
    if(e.variant==='revised'){
      const d=e.values;card.outerHTML=`<section class="hp-summary ${state.viewport.startsWith('320')||state.scale==='1.4'?'hp-small':''}"><div class="hp-context">${month}${budget(e)}</div><div class="hp-expense-label"><span>本月支出 · CNY</span>${eye}</div><div class="hp-amount bc-num"><span>${d.hidden?'':'¥'}</span><span>${d.expense}</span></div><div class="hp-metrics"><div><label>本月收入</label><strong class="bc-num">${d.income}</strong></div><div><label>本月结余</label><strong class="bc-num">${d.balance}</strong></div></div></section>`;
      const summary=main.querySelector('.hp-summary');summary.insertAdjacentHTML('beforebegin',`<div class="hp-sticky"><div class="hp-sticky-inner"><button class="hp-back-top" data-hp-top aria-label="返回完整汇总"><small>${main.querySelector('.bc-month-button').textContent.trim()}</small><b>支出 ${d.hidden?'':'¥'}${d.expense}</b></button>${budget(e)}</div></div>`);
      main.addEventListener('scroll',()=>main.querySelector('.hp-sticky')?.classList.toggle('shown',main.scrollTop>summary.offsetTop+summary.offsetHeight-52),{passive:true});
      e.win.requestAnimationFrame(()=>fit(e));
    }
    e.ready=true;e.win.requestAnimationFrame(()=>{const node=main.querySelector('.hp-summary,.bc-summary'),height=node?.getBoundingClientRect().height;document.querySelector(`[data-height=${e.variant}]`).textContent=`汇总卡约 ${Math.round(height)} px · ${state.scale==='1'?'正常字号':'大字体'}`;});
  }
  function openBudget(e){const d=e.values,unset=state.budget==='unset',layer=e.doc.createElement('div'),title=unset?'设置预算':'本月预算';e.trigger=e.doc.activeElement;layer.className='hp-overlay';layer.innerHTML=`<section class="hp-panel" role="dialog" aria-modal="true" aria-label="${title}"><div class="hp-handle"></div><header>${title}<button data-hp-close aria-label="关闭${title}">${icon('close')}</button></header><div class="hp-budget-detail">${unset?'<div>设置本月额度，完整预算管理流程仍保留。</div>':`<div><span>${d.over?'本月已超支':'本月可用预算'}</span><strong>${d.over?'超支':'剩余'}</strong></div><strong class="hp-detail-value">${d.remaining}</strong><div class="hp-budget-track"><span style="width:${d.over?100:66}%;background:${d.over?'var(--bc-red)':'var(--bc-accent)'}"></span></div><div><span>月预算</span><strong>${d.total}</strong></div><div><span>本月支出</span><strong>${d.hidden?'••••':'¥'+d.expense}</strong></div>`}</div><button class="hp-manage" data-hp-manage>${unset?'去设置预算':'预算管理'}</button><button class="hp-close" data-hp-close>返回明细</button><p>交互稿只演示入口，预算管理继续使用原有功能。</p></section>`;e.phone.append(layer);layer.onclick=event=>{if(event.target===layer||event.target.closest('[data-hp-close]'))closeBudget(e);else if(event.target.closest('[data-hp-manage]')){layer.remove();e.doc.querySelector('[data-action="page:budget"]')?.click();if(e.api.state.page==='home'){e.api.state.page='budget';e.api.render();}}};layer.querySelector('[data-hp-close]').focus({preventScroll:true});}
  function closeBudget(e){e.phone.querySelector('.hp-overlay')?.remove();e.trigger?.focus({preventScroll:true});}
  function resize(){const [w,h]=state.viewport.split('x').map(Number);document.documentElement.style.setProperty('--phone-w',w);document.documentElement.style.setProperty('--phone-h',h);for(const article of document.querySelectorAll('[data-variant]'))article.querySelector('.phone-stage').style.setProperty('--zoom',Math.min(1,(article.clientWidth-24)/w));}
  function load(){const version=++generation;frames.clear();resize();for(const iframe of document.querySelectorAll('[data-frame]')){const variant=iframe.dataset.frame;iframe.onload=()=>{const boot=()=>{if(version!==generation)return;const doc=iframe.contentDocument,win=iframe.contentWindow,api=win.beeImmersiveDemo,phone=doc.querySelector('#bee-immersive-phone');if(!api||!phone){setTimeout(boot,40);return;}const style=doc.createElement('style');style.textContent=css;doc.head.append(style);const theme=doc.querySelector('#bee-skin-mode');theme.value=state.appearance;theme.dispatchEvent(new win.Event('change',{bubbles:true}));api.state.hide=false;api.render();const e={variant,doc,win,api,phone,generation:version,ready:false};frames.set(variant,e);let queued=false;new win.MutationObserver(()=>{if(queued)return;queued=true;win.requestAnimationFrame(()=>{queued=false;apply(e);});}).observe(phone,{childList:true,subtree:true});doc.addEventListener('click',event=>{const target=event.target.closest('[data-hp-budget],[data-hp-top]');if(!target)return;event.preventDefault();event.stopImmediatePropagation();if(target.hasAttribute('data-hp-budget'))openBudget(e);else e.main.scrollTo({top:0,behavior:'instant'});},true);doc.addEventListener('keydown',event=>{if(event.key==='Escape')closeBudget(e);});apply(e);};boot();};iframe.src='../prototype/demo.html?'+new URLSearchParams({page:'home',embed:'1',viewport:state.viewport,scale:state.scale});}const url=new URL(location.href);for(const k of Object.keys(state))url.searchParams.set(k,state[k]);history.replaceState(null,'',url);}
  for(const key of ['viewport','appearance','budget','scale']){const select=$('#'+key);if([...select.options].some(o=>o.value===params.get(key))){state[key]=params.get(key);select.value=state[key];}select.onchange=()=>{state[key]=select.value;load();};}
  function select(value){state.selected=value;$('.proposals').dataset.selected=value;for(const button of document.querySelectorAll('[data-select]'))button.setAttribute('aria-pressed',String(button.dataset.select===value));resize();}
  for(const button of document.querySelectorAll('[data-select]'))button.onclick=()=>select(button.dataset.select);
  if(['reference','revised'].includes(params.get('selected')))select(params.get('selected'));
  $('#reset').onclick=load;new ResizeObserver(resize).observe($('.proposals'));window.homeTopReview={state,frames};load();
})();