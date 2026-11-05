(() => {
  'use strict';
  const assets = 'about-products-refresh-assets/';
  const icons = name => `<i data-lucide="${name}" aria-hidden="true"></i>`;
  const esc = value => String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
  const storageKey = 'beecount-about-products-review-v1';
  const defaults = {theme:'light',viewport:'398x844',platform:'android',region:'zh',productLayout:'cards',updateCase:'available'};
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(storageKey)||'{}'); } catch { /* A malformed review preference does not block rendering. */ }
  const state = {...defaults,...saved,modal:[],mirror:0,shot:0};
  const phone = document.querySelector('#phone'), body = document.querySelector('#screen-scroll'), host = document.querySelector('#overlay-host');
  let returnFocus = null, toastTimer;
  const products = {
    assets:{id:'assets',name:'蜜蜂家当',english:'BeeAssets',subtitle:'可视化你的全部资产配置',description:"蜜蜂记账侧重日常流水,蜜蜂家当是它的姐妹产品,专注资产配置可视化:跨账户净资产趋势、房产 / 投资 / 加密资产分类、收益率与持仓时长、配置占比一目了然。",color:'#d4a017',logo:'beeassets_logo.png',website:'https://assets.beejz.com',appStore:'https://apps.apple.com/app/id6763686675',googlePlay:'https://play.google.com/store/apps/details?id=com.tntlikely.beeassets',screenshots:['beeassets_dashboard.png','beeassets_holdings.png'],features:['资产配置','净资产趋势','持仓与收益']},
    dns:{id:'dns',name:'蜜蜂域名',english:'BeeDNS',subtitle:'简洁高效的 DNS 管理工具',description:"如果你的域名分散在 Cloudflare 和阿里云,蜜蜂域名把它们聚合在一处管理:批量改记录、A/AAAA 切换、解析迁移、子域名批量管理 — 不用在两家控制台来回切。",color:'#f59e0b',logo:'beedns_logo.png',website:'https://dns.beejz.com',appStore:'https://apps.apple.com/app/id6757992815',googlePlay:null,screenshots:[],features:['域名聚合','批量解析','Cloudflare · 阿里云']}
  };
  const story = "从 2015 年实习起，我坚持记账至今已超过十年。因为担心记账软件的广告、付费、隐私泄露和停运跑路，我决定自己做一个——最初只是给自己和家人用的小工具。\n\n2025 年 9 月，蜜蜂记账发布了第一个版本。说实话，那时候心里没什么底，不知道会不会有人用。但慢慢地，开始收到用户的反馈——有人说终于找到了一款干净的记账软件，有人提了很好的建议，也有人默默给了五星好评。每一条反馈都让我觉得，这件事值得继续做下去。\n\n蜜蜂记账没有广告、没有会员、完全免费开源。你的每一笔数据都只存在你自己的手机里，不会被上传到任何第三方服务器。但上架和维护一款 App 并非零成本——开发者账号、服务器等开支目前靠社区捐赠勉强支撑，每一次适配新系统、修复 Bug、开发新功能，也都是工作之余一点点完成的。\n\n如果你觉得蜜蜂记账对你有帮助，一个好评、一次分享或一笔捐赠，都能让这个小项目走得更远。谢谢你的信任。";
  const destinations = {
    website:['官方网站','https://count.beejz.com'], github:['GitHub','https://github.com/TNT-Likely/BeeCount'], telegram:['Telegram','https://t.me/beecount'], xiaohongshu:['小红书','https://xhslink.com/m/8K1ekg7EFOq'], douyin:['抖音','https://v.douyin.com/YG7tUweYYyQ/'], support:['支持开发','https://github.com/TNT-Likely/BeeCount/blob/main/docs/donate/README_ZH.md'], feedback:['问题反馈','https://github.com/TNT-Likely/BeeCount/issues/580'], help:['使用帮助','https://count.beejz.com/docs/intro'], changelog:['更新日志','https://count.beejz.com/docs/changelog'], privacy:['隐私政策','https://count.beejz.com/privacy']
  };
  const mirrors = ['GitHub 直连','ghproxy.com','mirror.ghproxy.com','gh.ddlc.top','github.moeyy.xyz','gh-proxy.com'];
  function button(action,label,kind='button',extra='') { return `<button class="${kind}" data-action="${action}" ${extra}>${label}</button>`; }
  function glyphButton(action,glyph,label) { return `<button class="icon-button" data-action="${action}" aria-label="${esc(label)}">${icons(glyph)}</button>`; }
  function menu(action,glyph,title,subtitle='',tail='') { return button(action,`<span class="menu-icon">${icons(glyph)}</span><span class="menu-copy">${title}${subtitle?`<small>${subtitle}</small>`:''}</span>${tail?`<span class="menu-trailing">${tail}</span>`:''}${icons('chevron-right').replace('<i ','<i class="chevron" ')}`,'menu-row'); }
  function repaintIcons() { if (window.lucide) lucide.createIcons({attrs:{'stroke-width':1.7}}); }
  function persist() { try { localStorage.setItem(storageKey,JSON.stringify(Object.fromEntries(Object.keys(defaults).map(k=>[k,state[k]])))); } catch {} }
  function notice(text) { const toast = document.querySelector('#toast'); toast.textContent=text;toast.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.hidden=true,2600); }
  function renderProducts() {
    return `<div class="section-heading"><span>更多产品</span><span>同一份认真，不同的小工具</span></div><div class="product-list" data-layout="${state.productLayout}">${Object.values(products).map(p=>button('open-product',`<img class="product-logo" src="${assets+p.logo}" alt=""><div class="product-copy"><h4>${p.name}</h4><div class="english">${p.english}</div><p>${p.subtitle}</p><span class="product-detail-hint">了解产品${icons('arrow-up-right')}</span></div>${p.id==='assets'?'<span class="product-art" aria-hidden="true"><i style="height:16px"></i><i style="height:30px"></i><i style="height:23px"></i><i style="height:43px"></i><i style="height:35px"></i></span>':`<span class="product-art dns" aria-hidden="true">${icons('network')}</span>`}`,'product-card',`data-id="${p.id}" style="--product:${p.color}" aria-label="了解${p.name}"`)).join('')}</div>`;
  }
  function render() {
    if (!['light','dark'].includes(state.theme)) state.theme='light';
    if (!['398x844','320x568'].includes(state.viewport)) state.viewport='398x844';
    if (!['android','play','ios'].includes(state.platform)) state.platform='android';
    if (!['cards','compact'].includes(state.productLayout)) state.productLayout='cards';
    const scroll = body.scrollTop, [width,height] = state.viewport.split('x').map(Number);
    document.documentElement.style.setProperty('--w',width+'px');document.documentElement.style.setProperty('--h',height+'px');
    phone.dataset.theme=state.theme;phone.dataset.platform=state.platform;
    document.querySelector('#viewport-caption').textContent=`${width} × ${height} · ${state.theme==='light'?'浅色':'深色'}`;
    document.querySelectorAll('[data-theme]').forEach(e=>{if(e.tagName==='BUTTON')e.setAttribute('aria-pressed',String(e.dataset.theme===state.theme));});
    for (const [id,key] of [['viewport','viewport'],['platform','platform'],['region','region'],['product-layout','productLayout'],['update-case','updateCase']]) document.querySelector('#'+id).value=state[key];
    const socialIds=['website','github',...(state.region==='international'?['telegram']:[]),'xiaohongshu','douyin'];
    body.innerHTML=`<section class="brand" aria-label="应用介绍"><div class="brand-row"><button class="brand-logo" data-action="open-story" aria-label="开发者的话"><img src="${assets}bee.svg" alt=""></button><div class="brand-copy"><h3>蜜蜂记账</h3><div class="brand-version"><span>4.0.0-beta.5</span><span class="brand-pill">开源 · 免费</span></div></div></div><p class="brand-statement">记下生活，也把数据留给自己。</p><p class="brand-description">数据由你掌握，代码向你开放。<br>和社区一起，让记账保持简单。</p>${button('open-story','开发者的话'+icons('chevron-right'),'story-link')}<div class="brand-actions">${button('open-link',icons('code-2')+'了解开源','button surface','data-id="github"')}${button('open-share',icons('share-2')+'推荐给朋友','button primary')}</div></section><div class="socials" style="grid-template-columns:repeat(${socialIds.length},minmax(0,1fr))" aria-label="官方网站与社交平台">${socialIds.map(id=>button('open-link',`${id==='website'?icons('globe'):`<img src="${assets+id}.svg" alt="" class="${['github','douyin'].includes(id)?'mono':''}">`}<span>${destinations[id][0]}</span>`,'social',`data-id="${id}" aria-label="${destinations[id][0]}"`)).join('')}</div><div class="section-heading"><span>帮助与支持</span></div><section class="surface" aria-label="帮助与支持">${state.platform==='android'?menu('open-update','refresh-cw','检查更新','','当前 4.0.0'):''}${menu('open-link','message-circle','问题反馈','','',).replace('data-action="open-link"','data-action="open-link" data-id="feedback"')}${menu('open-route','book-open','使用帮助').replace('data-action="open-route"','data-action="open-route" data-id="help"')}${menu('open-route','file-text','日志中心').replace('data-action="open-route"','data-action="open-route" data-id="logs"')}</section>${button('open-link',`${icons('heart')}<span>支持这个小项目<small>请开发者喝杯咖啡</small></span>${icons('chevron-right').replace('<i ','<i class="chevron" ')}`,'support-banner','data-id="support"')}${renderProducts()}<footer class="page-footer"><div class="footer-links">${button('open-route','更新日志','','data-id="changelog"')}${button('open-route','隐私政策','','data-id="privacy"')}</div>${state.region==='zh'?'<span class="icp">浙ICP备2025214907号-2A</span>':''}</footer>`;
    body.scrollTop=scroll;renderOverlay(false);repaintIcons();resize();persist();
  }
  function resize() { const available=document.querySelector('.preview-column').clientWidth;document.documentElement.style.setProperty('--zoom',Math.min(1,available/Number(state.viewport.split('x')[0]))); }
  function open(type,options={},push=false) {
    if (!state.modal.length) returnFocus=document.activeElement;
    const entry={type,...options};if(push)state.modal.push(entry);else state.modal=[entry];
    renderOverlay();
  }
  function close() {
    state.modal.pop();renderOverlay();
    if(!state.modal.length&&returnFocus?.isConnected)returnFocus.focus({preventScroll:true});
  }
  function sheet(title,content,actions) { return `<div class="overlay-backdrop" data-backdrop><section class="sheet" role="dialog" aria-modal="true" aria-label="${esc(title)}"><div class="sheet-handle" aria-hidden="true"></div><header class="sheet-header"><h3>${title}</h3>${glyphButton('modal-back','x','关闭'+title)}</header><div class="sheet-scroll">${content}</div>${actions?`<div class="sheet-actions">${actions}</div>`:''}</section></div>`; }
  function linkContent(title,url,route) {
    return `<p class="link-preview">${esc(title)}的原有入口保留。可以在这里核对目标地址。</p><div class="destination">${esc(url)}</div>${route?`<div class="preview-route">${icons('arrow-up-right')}<a href="../prototype/demo.html?page=${route}" target="_blank" rel="noopener">打开现有交互 Demo</a></div>`:''}`;
  }
  function renderOverlay(focus=true) {
    const active=state.modal.at(-1);
    if(!active){host.innerHTML='';return;}
    let markup='';
    if(active.type==='product') {
      const p=products[active.id],ios=state.platform==='ios',store=ios?p.appStore:p.googlePlay;
      markup=sheet(p.name,`<div class="sheet-intro"><img src="${assets+p.logo}" alt=""><div><h4>${p.name}</h4><small>${p.english} · ${p.subtitle}</small></div></div><p>${p.description}</p><div class="product-tags">${p.features.map(s=>`<span>${s}</span>`).join('')}</div>${p.screenshots.length?`<div class="section-heading" style="margin-left:0"><span>产品一览</span><span>点击看大图</span></div><div class="product-shots">${p.screenshots.map((src,i)=>button('open-shot',`<img src="${assets+src}" alt="${p.name}${i===0?'资产总览':'资产持仓'}截图"><span>${i===0?'资产总览':'持仓明细'}</span>`,'',`data-id="${p.id}" data-index="${i}" aria-label="预览${p.name}截图${i+1}"`)).join('')}</div>`:''}${!store?`<div class="channel-note"><strong>Android 内测申请</strong>Google Play 内测需要邀请。请提供你的 Google 账号邮箱，也可以说明使用场景。我们通常在 1–3 天内回复。<div class="email-row"><span>sunxiaoyes@outlook.com</span>${button('copy-email',icons('copy'),'','aria-label="复制申请邮箱"')}</div></div>`:''}`,`${button('product-primary',`${icons(store?'arrow-up-right':'mail')}${store?'前往应用商店':'申请加入内测'}`,'button primary',`data-id="${p.id}"`)}${button('product-website',icons('globe')+'前往官网','button',`data-id="${p.id}"`)}`);
    } else if(active.type==='shot') {
      const p=products[active.id];markup=`<section class="full-preview" role="dialog" aria-modal="true" aria-label="${p.name}截图预览"><header>${glyphButton('modal-back','chevron-left','返回产品介绍')}<span>${state.shot+1} / ${p.screenshots.length}</span>${glyphButton('modal-back','x','关闭截图')}</header><div class="full-preview-image"><img src="${assets+p.screenshots[state.shot]}" alt="${p.name}产品截图${state.shot+1}"></div><nav>${button('shot-prev',icons('chevron-left'),'','aria-label="上一张截图" '+(state.shot===0?'disabled':''))}${button('shot-next',icons('chevron-right'),'','aria-label="下一张截图" '+(state.shot===p.screenshots.length-1?'disabled':''))}</nav></section>`;
    } else if(active.type==='story') {
      markup=sheet('开发者的话',`<div class="story-body">${story.split('\n\n').map(text=>`<p>${esc(text)}</p>`).join('')}<div class="story-signature">蜜蜂记账开发者</div></div>`,button('modal-back','继续一起把日子记下来','button primary'));
    } else if(active.type==='share') {
      markup=sheet('推荐给朋友',`<div class="share-poster" aria-label="应用分享卡片预览"><div class="poster-brand"><img src="${assets}bee.svg" alt="">蜜蜂记账 BeeCount</div><h4>一笔一蜜，<br>记下生活的样子。</h4><p>数据由你掌握，代码向你开放。<br>一个简单、干净的日常账本。</p><div class="poster-pills"><span>开源免费</span><span>无广告</span><span>数据自持</span></div><div class="poster-footer"><strong>count.beejz.com</strong><span>MADE FOR EVERYDAY</span></div></div>`,`<div class="share-buttons">${button('preview-save',icons('download')+'保存图片','button')}${button('preview-share',icons('share-2')+'分享','button primary')}</div>`);
    } else if(active.type==='update') {
      const kind=state.updateCase,current=kind==='current',error=kind==='error';
      markup=sheet('检查更新',`<div class="update-badge">${icons(error?'wifi-off':current?'check':'arrow-up')}</div><div class="update-title">${error?'暂时无法检查更新':current?'已经是最新版本':'发现新版本'}</div><p class="update-version">${error?'请稍后重试，或切换下载镜像':current?'蜜蜂记账 4.0.0-beta.5':'蜜蜂记账 4.0.0'}</p>${!current&&!error?'<ul class="update-list"><li>整理常用页面，让记录更轻松。</li><li>改进明细展示和多币种体验。</li><li>修复用户反馈的问题。</li></ul>':''}${!current?button('open-mirrors',`${icons('globe')}<span>下载镜像</span>${esc(mirrors[state.mirror])}${icons('chevron-right')}`,'mirror-control'):''}`,current?button('modal-back','知道了','button primary'):`${button(error?'retry-update':'preview-download',error?'重新检查':'下载并安装','button primary')}${button('modal-back','稍后再说','button')}`);
    } else if(active.type==='mirrors') {
      markup=sheet('下载镜像',mirrors.map((m,i)=>button('select-mirror',`<span>${m}</span>${i===state.mirror?icons('check'):''}`,'mirror-choice',`data-index="${i}"`)).join(''),button('modal-back','返回更新','button'));
    } else if(active.type==='link') {
      markup=sheet(active.title,linkContent(active.title,active.url),button('modal-back','返回','button primary'));
    } else if(active.type==='route') {
      const route=active.id==='logs'?['日志中心','flow-logs','lib/pages/settings/log_center_page.dart']:active.id==='help'?['使用帮助','flow-support-help',destinations.help[1]]:active.id==='changelog'?['更新日志','flow-support-changelog',destinations.changelog[1]]:['隐私政策','flow-privacy',destinations.privacy[1]];
      markup=sheet(route[0],linkContent(route[0],route[2],route[1]),button('modal-back','返回关于','button primary'));
    } else if(active.type==='mail') {
      const p=products[active.id];markup=sheet('申请内测',`<p>向下方邮箱发送申请，填写你的 Google 账号邮箱与使用场景。</p><div class="destination">sunxiaoyes@outlook.com</div><ul class="review-list"><li><b>邮件主题</b><br>申请加入 ${p.name} 内测</li><li><b>邮件内容</b><br>Google 账号邮箱：<br>使用场景（可选）：</li></ul>`,button('modal-back','返回产品介绍','button primary'));
    } else if(active.type==='back') {
      markup=sheet('返回设置',`<p>关于页会返回「我的」设置列表，保留原有导航路径。</p><div class="preview-route">${icons('arrow-up-right')}<a href="../prototype/demo.html?page=mine" target="_blank" rel="noopener">查看「我的」交互 Demo</a></div>`,button('modal-back','继续检查关于页','button primary'));
    }
    host.innerHTML=markup;repaintIcons();
    if(focus)host.querySelector('button:not(:disabled),a')?.focus({preventScroll:true});
  }
  document.addEventListener('click',event=>{
    if(event.target.matches('[data-backdrop]')){close();return;}
    const target=event.target.closest('[data-action]');if(!target)return;
    const action=target.dataset.action,id=target.dataset.id;
    if(action==='open-story')open('story');
    else if(action==='open-share')open('share');
    else if(action==='open-product')open('product',{id});
    else if(action==='open-shot'){state.shot=Number(target.dataset.index);open('shot',{id},true);}
    else if(action==='shot-prev'||action==='shot-next'){state.shot+=action==='shot-prev'?-1:1;renderOverlay();}
    else if(action==='open-update')open('update');
    else if(action==='open-mirrors')open('mirrors',{},true);
    else if(action==='select-mirror'){state.mirror=Number(target.dataset.index);close();}
    else if(action==='retry-update'){state.updateCase='available';document.querySelector('#update-case').value='available';renderOverlay();}
    else if(action==='modal-back')close();
    else if(action==='open-link'){const destination=destinations[id];open('link',{title:destination[0],url:destination[1]});}
    else if(action==='product-website'){const p=products[id];open('link',{title:p.name+'官方网站',url:p.website},true);}
    else if(action==='product-primary'){const p=products[id],url=state.platform==='ios'?p.appStore:p.googlePlay;url?open('link',{title:state.platform==='ios'?'App Store':'Google Play',url},true):open('mail',{id},true);}
    else if(action==='copy-email'){if(navigator.clipboard?.writeText){navigator.clipboard.writeText('sunxiaoyes@outlook.com').then(()=>notice('申请邮箱已复制')).catch(()=>notice('申请邮箱：sunxiaoyes@outlook.com'));}else notice('申请邮箱：sunxiaoyes@outlook.com');}
    else if(action==='preview-download')open('link',{title:'下载更新',url:'https://github.com/TNT-Likely/BeeCount/releases'},true);
    else if(action==='preview-save')notice('已展示图片保存入口。设计预览不会写入相册。');
    else if(action==='preview-share')notice('已展示系统分享入口。设计预览不会发送内容。');
    else if(action==='open-route')open('route',{id});
    else if(action==='preview-back')open('back');
  });
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape'&&state.modal.length){event.preventDefault();close();}
    if(event.key==='Tab'&&state.modal.length){const focusable=[...host.querySelectorAll('button:not(:disabled),a[href]')];if(!focusable.length)return;const first=focusable[0],last=focusable.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}}
  });
  document.querySelectorAll('button[data-theme]').forEach(el=>el.addEventListener('click',()=>{state.theme=el.dataset.theme;render();}));
  for(const [id,key]of [['viewport','viewport'],['platform','platform'],['region','region'],['product-layout','productLayout'],['update-case','updateCase']])document.querySelector('#'+id).addEventListener('change',event=>{state[key]=event.target.value;render();});
  document.querySelector('#reset').addEventListener('click',()=>{Object.assign(state,defaults,{modal:[],mirror:0,shot:0});body.scrollTop=0;render();});
  new ResizeObserver(resize).observe(document.querySelector('.preview-column'));
  window.aboutProductsReview={get state(){return {...state,modal:state.modal.map(x=>({...x}))};},products};
  render();
})();
