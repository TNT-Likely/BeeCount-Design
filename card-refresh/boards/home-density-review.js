(() => {
  'use strict';
  const $ = selector => document.querySelector(selector);
  const params = new URLSearchParams(location.search);
  const state = {viewport:'398x844', scenario:'budget', appearance:'light', scale:'1', selected:'b'};
  const frames = new Map();
  let generation = 0;
  const esc = value => String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const icon = name => ({arrow:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg>',close:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M6 18 18 6"/></svg>'}[name]);
  const fixture = () => state.scenario === 'large'
    ? {currency:'美元 · USD',symbol:'US$',expense:'12,876,543.21',income:'21,000,000.00',balance:'8,123,456.79',budget:'50,000,000.00',remaining:'37,123,456.79',rate:26}
    : state.scenario === 'exceeded'
      ? {currency:'人民币 · CNY',symbol:'¥',expense:'5,328.50',income:'12,000.00',balance:'6,671.50',budget:'5,000.00',remaining:'−328.50',rate:107}
      : {currency:'人民币 · CNY',symbol:'¥',expense:'3,286.50',income:'12,000.00',balance:'8,713.50',budget:'5,000.00',remaining:'1,713.50',rate:66};
  const frameCss = `
    html,body{width:100%!important;height:100%!important;overflow:hidden!important;background:transparent!important}
    #bee-immersive-suite{margin:0!important;padding:0!important}
    #bee-immersive-suite .bc-stage{padding:0!important;min-height:0!important;background:none!important}
    #bee-immersive-suite #bee-immersive-phone{box-shadow:none!important;margin:0!important;transform:none!important;border-radius:34px!important}
    #bee-immersive-suite .bc-phone[data-density-compact=true] .bc-main{display:flex!important;flex-direction:column!important;overflow:hidden!important}
    #bee-immersive-suite .bc-phone[data-density-compact=true] .bc-summary{flex:none!important;padding:16px 18px!important;margin-top:5px!important;margin-bottom:11px!important}
    #bee-immersive-suite .bc-phone[data-density-compact=true] .bc-stream{flex:1!important;min-height:0!important;height:auto!important}
    #bee-immersive-suite .bc-phone[data-density-compact=true] .h-journal-list{min-height:0!important;flex:1!important}
    #bee-immersive-suite .hd-context{display:flex;align-items:center;justify-content:space-between;gap:8px;min-height:28px}
    #bee-immersive-suite .hd-context .bc-month-button{font-size:calc(13px * var(--q-scale,1))!important;min-height:28px!important}
    #bee-immersive-suite .hd-context>span{color:var(--bc-muted);font-size:calc(11px * var(--q-scale,1));white-space:nowrap}
    #bee-immersive-suite .hd-expense-caption{display:flex;align-items:center;gap:5px;margin-top:6px;color:var(--bc-muted);font-size:calc(12px * var(--q-scale,1));line-height:1.5}
    #bee-immersive-suite .hd-expense-caption .bc-eye{width:30px;min-height:22px;height:22px;padding:0;display:grid;place-items:center}
    #bee-immersive-suite .hd-expense-caption svg{width:14px;height:14px}
    #bee-immersive-suite .hd-money{font-size:calc(34px * var(--q-scale,1));font-weight:650;letter-spacing:-.9px;line-height:1.2;margin:0 0 10px;white-space:nowrap;font-variant-numeric:tabular-nums;min-width:0}
    #bee-immersive-suite .hd-money>span{font-size:.56em;font-weight:400;letter-spacing:0;margin-right:4px}
    #bee-immersive-suite .hd-metrics{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:18px}
    #bee-immersive-suite .hd-metric{display:flex;flex-direction:column;align-items:flex-start;gap:2px;min-width:0;line-height:1.5}
    #bee-immersive-suite .hd-metric:last-child{align-items:flex-end;text-align:right}
    #bee-immersive-suite .hd-metric label{color:var(--bc-muted);font-size:calc(11px * var(--q-scale,1));white-space:nowrap}
    #bee-immersive-suite .hd-metric strong{font-size:calc(15px * var(--q-scale,1));font-weight:550;white-space:nowrap;max-width:100%;font-variant-numeric:tabular-nums}
    #bee-immersive-suite .hd-budget{border-top:1px solid var(--bc-line);padding-top:8px;margin-top:10px;cursor:pointer;min-height:36px}
    #bee-immersive-suite .hd-budget-line{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);align-items:center;gap:8px;min-width:0;line-height:1.5;font-size:calc(11px * var(--q-scale,1));color:var(--bc-muted)}
    #bee-immersive-suite .hd-budget-line>span{min-width:0;display:flex;align-items:baseline;gap:4px;white-space:nowrap}
    #bee-immersive-suite .hd-budget-remaining{display:flex;align-items:center;justify-content:flex-end;gap:2px;text-align:right;color:var(--bc-ink);font-weight:500;min-width:0}
    #bee-immersive-suite .hd-budget-remaining>span{min-width:0;white-space:nowrap}
    #bee-immersive-suite .hd-budget-line.stacked{grid-template-columns:1fr;gap:3px}
    #bee-immersive-suite .hd-budget-line.stacked>span{justify-content:space-between}
    #bee-immersive-suite .hd-budget-line.stacked .hd-budget-remaining .hd-budget-number{margin-left:auto}
    #bee-immersive-suite .hd-budget-number{display:inline-block;white-space:nowrap;max-width:100%;font-variant-numeric:tabular-nums;vertical-align:bottom}
    #bee-immersive-suite .hd-budget-remaining svg{width:12px;height:12px;flex:none;fill:none;stroke:currentColor;stroke-width:1.7}
    #bee-immersive-suite .hd-budget.exceeded .hd-budget-remaining{color:var(--bc-red)}
    #bee-immersive-suite .hd-budget-track{height:3px;margin-top:6px;border-radius:5px;background:var(--bc-soft);overflow:hidden}
    #bee-immersive-suite .hd-budget-track>span{height:100%;display:block;border-radius:5px;background:var(--bc-accent)}
    #bee-immersive-suite .hd-budget.exceeded .hd-budget-track>span{background:var(--bc-red)}
    #bee-immersive-suite .hd-setup{display:flex;align-items:center;gap:9px;border-top:1px solid var(--bc-line);margin-top:10px;padding-top:8px;min-height:36px;color:var(--bc-muted);font-size:calc(11px * var(--q-scale,1))}
    #bee-immersive-suite .hd-setup>span{flex:1}
    #bee-immersive-suite .hd-setup button{background:none;border:0;color:var(--bc-accent);font-size:calc(11px * var(--q-scale,1));min-height:28px;padding:3px}
    #bee-immersive-suite .hd-setup .hd-dismiss{color:var(--bc-muted);width:28px;min-width:28px}
    #bee-immersive-suite .hd-dismiss svg{width:12px;height:12px;fill:none;stroke:currentColor;stroke-width:1.7}
    #bee-immersive-suite .hd-original-setup{flex:none;margin:0 17px 9px;padding:15px 16px;background:var(--bc-paper);border-radius:22px;display:flex;align-items:center;gap:8px;min-height:65px;font-size:calc(12px * var(--q-scale,1));color:var(--bc-muted)}
    #bee-immersive-suite .hd-original-setup>span{flex:1}
    #bee-immersive-suite .hd-original-setup button{border:0;background:none;color:var(--bc-accent);padding:4px;min-height:32px;font-size:calc(11px * var(--q-scale,1))}
    #bee-immersive-suite .hd-original-setup .hd-dismiss{color:var(--bc-muted)}
    #bee-immersive-suite .bc-phone[data-density-compact=true][data-density-short=true] .bc-summary{padding:12px 16px!important;margin-bottom:9px!important}
    #bee-immersive-suite .bc-phone[data-density-short=true] .hd-context,
    #bee-immersive-suite .bc-phone[data-density-short=true] .hd-context .bc-month-button{min-height:24px!important}
    #bee-immersive-suite .bc-phone[data-density-short=true] .hd-expense-caption{margin-top:3px}
    #bee-immersive-suite .bc-phone[data-density-short=true] .hd-money{font-size:calc(30px * var(--q-scale,1));margin-bottom:8px}
    #bee-immersive-suite .bc-phone[data-density-short=true] .hd-metric strong{font-size:calc(14px * var(--q-scale,1))}
    #bee-immersive-suite .bc-phone[data-density-short=true] .hd-metric{gap:1px}
    #bee-immersive-suite .bc-phone[data-density-short=true] .hd-budget{margin-top:8px;padding-top:7px}
    #bee-immersive-suite .bc-phone[data-density-scroll=page] .bc-main{display:block!important;overflow-y:auto!important}
    #bee-immersive-suite .bc-phone[data-density-scroll=page] .bc-stream{height:300px!important;min-height:300px!important}
    #bee-immersive-suite .hd-review-layer{position:absolute;inset:0;z-index:100;background:rgb(0 0 0 / .28);display:flex;align-items:flex-end;padding:14px}
    #bee-immersive-suite .hd-review-panel{border-radius:22px;background:var(--bc-paper);padding:19px;width:100%;max-height:85%;overflow:auto;color:var(--bc-ink);box-shadow:0 12px 35px #00000016}
    #bee-immersive-suite .hd-review-panel header{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:13px}
    #bee-immersive-suite .hd-review-panel h3{margin:0;font-size:16px;font-weight:600}
    #bee-immersive-suite .hd-review-panel header button{border:0;background:var(--bc-soft);color:var(--bc-muted);border-radius:50%;width:32px;height:32px;padding:8px}
    #bee-immersive-suite .hd-review-panel header svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:1.6}
    #bee-immersive-suite .hd-review-panel dl{margin:0;display:grid;gap:12px;font-size:13px}
    #bee-immersive-suite .hd-review-panel dl>div{display:flex;justify-content:space-between;gap:15px;flex-wrap:wrap}
    #bee-immersive-suite .hd-review-panel dt{color:var(--bc-muted)}
    #bee-immersive-suite .hd-review-panel dd{margin:0;font-variant-numeric:tabular-nums}
    #bee-immersive-suite .hd-review-panel p{font-size:11px;color:var(--bc-muted);line-height:1.8;margin-top:16px}
    #bee-immersive-suite .hd-review-panel .hd-confirm{border:0;width:100%;min-height:44px;background:var(--bc-accent);color:#292a22;border-radius:13px;margin-top:16px;font-size:13px}
  `;

  function resize() {
    const [width,height] = state.viewport.split('x').map(Number);
    document.documentElement.style.setProperty('--phone-w',width);
    document.documentElement.style.setProperty('--phone-h',height);
    for (const element of document.querySelectorAll('.comparison')) {
      const host = element.querySelector('.phone-host');
      const available = element.clientWidth - 24;
      const zoom = Math.min(1,available / width);
      host.querySelector('.phone-stage').style.setProperty('--zoom',zoom);
    }
  }
  function money(value,entry) { return entry.api.state.hide ? '••••' : value; }
  function fitMoney(element) {
    if (!element) return;
    const available=element.clientWidth;
    if (available>0 && element.scrollWidth>available+.5) {
      const size=parseFloat(getComputedStyle(element).fontSize);
      element.style.fontSize=(size*available/element.scrollWidth)+'px';
    }
  }
  function dialog(entry,setup=false) {
    const d=fixture(),doc=entry.doc;
    const layer=doc.createElement('div');layer.className='hd-review-layer';
    layer.innerHTML=`<section class="hd-review-panel" role="dialog" aria-modal="true" aria-label="${setup?'设置预算':'本月预算'}"><header><h3>${setup?'设置预算':'本月预算'}</h3><button aria-label="关闭">${icon('close')}</button></header>${setup?'<p>在预算管理中设置总预算或分类预算，首页会显示剩余和进度。</p>':`<dl><div><dt>月预算</dt><dd>${money(d.symbol+d.budget,entry)}</dd></div><div><dt>预算支出</dt><dd>${money(d.symbol+d.expense,entry)}</dd></div><div><dt>剩余预算</dt><dd>${money(d.symbol+d.remaining,entry)}</dd></div><div><dt>预算使用</dt><dd>${entry.api.state.hide?'••••':d.rate+'%'}</dd></div></dl>`}<p>此弹层用于检查紧凑入口的可发现性。正式预算管理和预算计算保持原有流程。</p><button class="hd-confirm">知道了</button></section>`;
    entry.phone.querySelector('.hd-review-layer')?.remove();entry.phone.append(layer);
    const close=()=>layer.remove();layer.querySelector('header button').onclick=close;layer.querySelector('.hd-confirm').onclick=close;layer.onclick=e=>{if(e.target===layer)close();};
    layer.querySelector('header button').focus({preventScroll:true});
  }
  function apply(entry) {
    if(entry.generation!==generation)return;
    const {phone,doc,api}=entry;
    const card=phone.querySelector('.bc-summary');
    if (!card || card.dataset.densityReady==='true' || api.state.page!=='home') return;
    card.dataset.densityReady='true';
    const [width,height]=state.viewport.split('x').map(Number);
    const compact=entry.variant==='b'||(entry.variant==='a'&&(height<=740||Number(state.scale)>1));
    const short=height<=740;
    entry.compact=compact;
    phone.dataset.densityCompact=String(compact);phone.dataset.densityShort=String(short);
    const d=fixture(),hidden=api.state.hide;
    const month=card.querySelector('.bc-month-button')?.outerHTML||'';
    const eye=card.querySelector('.bc-eye')?.outerHTML||'';
    const ledger=phone.querySelector('.bc-mini-ledger>span');
    if(state.scenario==='long-ledger'&&ledger)ledger.textContent='日常生活与家人共同记录的账本';
    phone.querySelectorAll('[data-density-notice]').forEach(e=>e.remove());
    if (compact) {
      card.innerHTML=`<div class="hd-context">${month}<span>${esc(d.currency)}</span></div><div class="hd-expense-caption">本月支出${eye}</div><div class="hd-money"><span>${esc(d.symbol)}</span>${money(d.expense,entry)}</div><div class="hd-metrics"><div class="hd-metric"><label>本月收入</label><strong>${money(d.income,entry)}</strong></div><div class="hd-metric"><label>本月结余</label><strong>${money(d.balance,entry)}</strong></div></div>${state.scenario==='unset'?(entry.dismissed?'':`<div class="hd-setup"><span>为这个月设个预算</span><button data-density-setup>去设置</button><button class="hd-dismiss" data-density-dismiss aria-label="关闭预算提示">${icon('close')}</button></div>`):`<div class="hd-budget ${state.scenario==='exceeded'?'exceeded':''}" data-density-budget role="button" tabindex="0" aria-label="查看本月预算"><div class="hd-budget-line"><span><span>月预算${state.scenario==='exceeded'?' · 已超支':''}</span><span class="hd-budget-number">${money(d.symbol+d.budget,entry)}</span></span><span class="hd-budget-remaining"><span>剩余</span><span class="hd-budget-number">${money(d.symbol+d.remaining,entry)}</span>${icon('arrow')}</span></div><div class="hd-budget-track" role="progressbar" aria-label="预算使用" aria-valuenow="${Math.min(100,d.rate)}" aria-valuemin="0" aria-valuemax="100"><span style="width:${Math.min(100,d.rate)}%"></span></div></div>`}`;
      fitMoney(card.querySelector('.hd-money'));
      for(const value of card.querySelectorAll('.hd-metric strong'))fitMoney(value);
      const budgetLine=card.querySelector('.hd-budget-line');
      if(budgetLine&&[...budgetLine.children].some(e=>e.scrollWidth>e.clientWidth+.5))budgetLine.classList.add('stacked');
    } else {
      const hero=card.querySelector('.bc-hero-value');
      if(hero)hero.innerHTML=`<span style="font-size:.6em;font-weight:400">${esc(d.symbol)} </span>${money(d.expense,entry)}`;
      if(hero){hero.style.whiteSpace='nowrap';fitMoney(hero);}
      const currency=card.querySelector('.bc-between>.bc-small');if(currency)currency.textContent=d.currency;
      const metrics=card.querySelectorAll('.bc-dual strong');if(metrics[0])metrics[0].textContent=money(d.income,entry);if(metrics[1])metrics[1].textContent=money(d.balance,entry);
      const budget=card.querySelector('.bc-budget');
      if(state.scenario==='unset'){
        budget?.remove();
        if(!entry.dismissed){const notice=doc.createElement('div');notice.className='hd-original-setup';notice.dataset.densityNotice='true';notice.innerHTML=`<span>设置预算，轻松掌控每月开支</span><button data-density-setup>去设置</button><button class="hd-dismiss" data-density-dismiss aria-label="关闭预算提示">${icon('close')}</button>`;card.after(notice);}
      } else if (budget) {
        budget.dataset.densityBudget='true';budget.setAttribute('tabindex','0');
        const label=budget.querySelector('.bc-between>span');if(label)label.textContent='月预算 '+money(d.symbol+d.budget,entry)+(state.scenario==='exceeded'?' · 已超支':'');
        const remaining=budget.querySelector('button');if(remaining){remaining.innerHTML='剩余 '+money(d.symbol+d.remaining,entry)+icon('arrow');remaining.setAttribute('aria-label','查看本月预算');remaining.removeAttribute('data-action');remaining.style.color=state.scenario==='exceeded'?'var(--bc-red)':'';}
        const progress=budget.querySelector('.bc-budget-track>span');if(progress){progress.style.width=Math.min(100,d.rate)+'%';progress.style.background=state.scenario==='exceeded'?'var(--bc-red)':'';}
      }
    }
    if(compact){
      const main=phone.querySelector('.bc-main'),brand=phone.querySelector('.bc-topbar');
      const available=main.clientHeight-(brand?.getBoundingClientRect().height||0)-card.getBoundingClientRect().height-21;
      phone.dataset.densityScroll=available<155?'page':'journal';
    }
    entry.ready=true;requestAnimationFrame(()=>{measure(entry);updateSummary();});
  }
  function measure(entry) {
    if(entry.generation!==generation)return;
    const p=entry.phone,card=p.querySelector('.bc-summary'),journal=p.querySelector('.h-journal-list');
    if(!card||!journal||entry.api.state.page!=='home')return;
    const cardRect=card.getBoundingClientRect(),main=p.querySelector('.bc-main').getBoundingClientRect();
    const notice=p.querySelector('[data-density-notice]');
    const height=cardRect.height+(notice?notice.getBoundingClientRect().height+9:0);
    const listRect=journal.getBoundingClientRect(),nav=p.querySelector('.bc-nav').getBoundingClientRect();
    const top=Math.max(listRect.top,main.top),bottom=Math.min(listRect.bottom,main.bottom,nav.top-6);
    const rows=[...journal.querySelectorAll('.tx3')].map(e=>e.getBoundingClientRect());
    const full=rows.filter(r=>r.top>=top-.5&&r.bottom<=bottom+.5).length;
    entry.metrics={topHeight:Math.round(height),ratio:Math.round(height/p.clientHeight*100),listHeight:Math.max(0,Math.round(bottom-top)),fullRows:full,compact:entry.compact,scroll:p.dataset.densityScroll||'current'};
    const base=frames.get('original')?.metrics;
    const saving=base?Math.max(0,base.topHeight-entry.metrics.topHeight):0;
    $(`[data-metrics="${entry.variant}"]`).innerHTML=`<div class="metric-line"><span>汇总＋预算</span><b>${entry.metrics.topHeight}px · 屏高的 ${entry.metrics.ratio}%</b></div><div class="metric-line"><span>列表可见区域</span><b>${entry.metrics.listHeight}px · ${full} 笔完整明细</b></div><span class="gain">${entry.variant==='original'?'原版同尺寸对照':entry.compact?`比原版少 ${saving}px${base?' · 多 '+Math.max(0,full-base.fullRows)+' 笔完整明细':''}`:'此尺寸保持原版，切换小屏或大字查看'}</span>`;
  }
  function updateSummary() {
    if(frames.size!==3||[...frames.values()].some(e=>!e.ready||!e.metrics))return;
    for(const e of frames.values())measure(e);
    const base=frames.get('original').metrics,b=frames.get('b').metrics;
    $('#comparison-status').textContent=`当前 B：顶部少 ${Math.max(0,base.topHeight-b.topHeight)}px，列表多 ${Math.max(0,b.listHeight-base.listHeight)}px`;
    $('#a-state').textContent=frames.get('a').compact?'此尺寸使用紧凑版':'此尺寸保持原版';
  }
  function load() {
    const version=++generation;
    frames.clear();$('#comparison-status').textContent='正在切换屏幕与场景…';
    resize();
    for(const iframe of document.querySelectorAll('iframe[data-frame]')){
      const variant=iframe.dataset.frame;
      iframe.onload=()=>{
        if(version!==generation)return;
        const doc=iframe.contentDocument,win=iframe.contentWindow;
        const boot=()=>{
          if(version!==generation)return;
          const api=win.beeImmersiveDemo,phone=doc.querySelector('#bee-immersive-phone');
          if(!api||!phone){setTimeout(boot,40);return;}
          const style=doc.createElement('style');style.textContent=frameCss;doc.head.append(style);
          const theme=doc.querySelector('#bee-skin-mode');theme.value=state.appearance;theme.dispatchEvent(new win.Event('change',{bubbles:true}));
          api.state.hide=state.scenario==='privacy';api.render();
          const entry={variant,iframe,doc,win,api,phone,ready:false,dismissed:false,generation:version};frames.set(variant,entry);
          let queued=false;
          const observer=new win.MutationObserver(()=>{if(queued)return;queued=true;win.requestAnimationFrame(()=>{queued=false;apply(entry);measure(entry);updateSummary();});});
          observer.observe(phone,{subtree:true,childList:true});
          phone.addEventListener('scroll',()=>measure(entry),true);
          doc.addEventListener('click',event=>{
            const target=event.target.closest('[data-density-budget],[data-density-setup],[data-density-dismiss]');
            if(!target)return;event.preventDefault();event.stopImmediatePropagation();
            if(target.hasAttribute('data-density-dismiss')){entry.dismissed=true;api.render();return;}
            dialog(entry,target.hasAttribute('data-density-setup'));
          },true);
          doc.addEventListener('keydown',event=>{
            if(event.key==='Escape'){phone.querySelector('.hd-review-layer')?.remove();}
            if(['Enter',' '].includes(event.key)&&event.target.matches('[data-density-budget]')){event.preventDefault();dialog(entry);}
          },true);
          apply(entry);
          doc.fonts.ready.then(()=>{if(version===generation){measure(entry);updateSummary();}});
        };boot();
      };
      const url=new URL('../prototype/demo.html',location.href);url.search=new URLSearchParams({page:'home',embed:'1',viewport:state.viewport,scale:state.scale}).toString();
      iframe.src=url.href;
    }
    const url=new URL(location.href);for(const k of ['viewport','scenario','appearance','scale','selected'])url.searchParams.set(k,state[k]);history.replaceState(null,'',url);
  }
  for(const key of ['viewport','scenario','appearance','scale']){
    const select=$('#'+key),value=params.get(key);
    if(value&&[...select.options].some(o=>o.value===value)){state[key]=value;select.value=value;}
    select.addEventListener('change',()=>{state[key]=select.value;load();});
  }
  function selectVariant(value){state.selected=value;$('#comparisons').dataset.selected=value;document.querySelectorAll('[data-show]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.show===value)));requestAnimationFrame(resize);}
  document.querySelectorAll('[data-show]').forEach(b=>b.onclick=()=>selectVariant(b.dataset.show));
  if(['original','a','b'].includes(params.get('selected')))selectVariant(params.get('selected'));else selectVariant('b');
  $('#reset').onclick=()=>{Object.assign(state,{viewport:'398x844',scenario:'budget',appearance:'light',scale:'1'});for(const k of ['viewport','scenario','appearance','scale'])$('#'+k).value=state[k];load();};
  new ResizeObserver(resize).observe($('#comparisons'));
  window.homeDensityReview={state,getResults:()=>Object.fromEntries([...frames].map(([k,v])=>[k,v.metrics])),frames};
  load();
})();
