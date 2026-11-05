// Layout adapter only. All moving artwork comes from the pinned 3.9 Flutter renderer.
// Shared by the main demo and the isolated application review.
(function(global){
'use strict';
const originals=new Set(['anniversary','anniv_cake']);
function layout({width:w,height:h,page,scheme,placement='adapt',summaryRect,headerTop=43,navRect}){
 const scrollOffset=headerTop-43;
 let headerSlot,headerArtRect=null,headerRadius=0;
 if(scheme==='folio'&&page==='home'){headerSlot=summaryRect;headerRadius=22;}
 else if(scheme==='folio'&&page==='mine'){
  headerSlot=[18,headerTop,w-36,Math.max(90,summaryRect[1]-headerTop)];headerRadius=22;
 }else{
  const available=Math.max(70,summaryRect[1]-scrollOffset),height=Math.min(208,available),width=height*398/208;
  const left=page==='home'?Math.max(0,(w-320)*.43):Math.max(0,(w-width)/2);
  headerSlot=[left,scrollOffset,Math.min(width,w-left),height];
 }
 if(scheme==='folio'&&placement==='adapt'){
  const artWidth=Math.min(240,headerSlot[2]-96),artHeight=artWidth*208/398;
  headerArtRect=[headerSlot[2]-artWidth-12,page==='home'?48:Math.max(0,(headerSlot[3]-artHeight)/2),artWidth,artHeight];
 }
 const draw=headerArtRect||[0,0,headerSlot[2],headerSlot[3]],drawHeight=Math.min(draw[2]/398,draw[3]/208)*208,drawTop=headerSlot[1]+draw[1];
 return{headerSlot,headerArtRect,headerRadius,tabSlot:navRect||[17,h-89,w-34,57],tabRadius:29,headerOnScreen:drawTop+drawHeight>36&&drawTop<h-70};
}
function pageBackground(skin,dark){return dark?'linear-gradient(#000 0px,#000 180px,#201b13 390px,var(--bc-bg) 100%)':skin==='anniv_cake'?'linear-gradient(#fff8ee,var(--bc-bg) 540px)':'linear-gradient(#fff9df,var(--bc-bg) 540px)';}
function rect(node,phone){const b=node.getBoundingClientRect(),p=phone.getBoundingClientRect();return[b.left-p.left,b.top-p.top,b.width,b.height];}
function colorNumber(text){const c=text.match(/[\d.]+/g)?.map(Number)||[0,0,0];return(0xff000000+c[0]*65536+c[1]*256+c[2])>>>0;}
const materials={anniversary:{light:['#ffe5a0','#fff3cf','#faf8f0'],dark:['#382c1b','#27231c','#1b1d1d']},anniv_cake:{light:['#ffe2ce','#fff0e4','#faf7f2'],dark:['#3c2921','#2a221e','#1d1d1d']},mountains:{light:['#e4eddd','#f0f3e8','#f7f7ee'],dark:['#293426','#232a22','#1d221d']}};
function materialLayout(phone,page){const w=phone.offsetWidth,hero=phone.querySelector('.bc-summary,.u-ledger-summary,.g-asset-summary,.a79-summary')||phone.querySelector('.bc-surface'),box=hero?rect(hero,phone):[17,112,w-34,210],mine=page==='mine';box[1]+=(phone.querySelector('.bc-main')?.scrollTop||0);return{anchor:[w*.80,box[1]+119],constellationHeight:mine?Math.min(118,w*.36):Math.min(156,w*.42),inscription:[w*.46,37],fadeEnd:Math.max(160,Math.min(phone.offsetHeight-100,box[1]+box[3]+190)),clearRects:[]};}
function legacyPalette(accent,dark){const color=/^#[0-9a-f]{6}$/i.test(accent)?accent:'#f8c91c',rgb=[1,3,5].map(i=>parseInt(color.slice(i,i+2),16));const mix=(target,t)=>'#'+rgb.map(v=>Math.round(v*(1-t)+target*t).toString(16).padStart(2,'0')).join('');return dark?[mix(18,.80),mix(23,.9),'#1b1d1d']:[mix(255,.82),mix(255,.92),'#faf8f0'];}
function install(demo){
 const phone=demo.phone,doc=phone.ownerDocument,win=doc.defaultView,media=win.matchMedia('(prefers-reduced-motion: reduce)');
 if(new URLSearchParams(win.location.search).get('skinMaterialOwner')==='external')return{update(){},externalOwner:true,get frame(){return null},get status(){return null}};
 const modern=new Set(['anniversary','anniv_cake','mountains']);let art=null,tab=null,artReady=false,tabReady=false,lastArt='',lastTab='',artStatus=null,tabStatus=null,ownsLayer=false,visible=true,mainNode=null;
 phone.parentElement.style.position='relative';
 function send(frame,text,ready,key){if(!frame||!ready)return;if(key==='art'){if(lastArt===text)return;lastArt=text;}else{if(lastTab===text)return;lastTab=text;}frame.contentWindow.postMessage(text,win.location.origin);}
 function makeFrame(kind){const frame=doc.createElement('iframe');frame.className=kind==='art'?'material-art-stage':'material-tab-stage';frame.title=kind==='art'?'原版免费皮肤整页画层':'原版周年底栏装饰';frame.setAttribute('aria-hidden','true');frame.tabIndex=-1;phone.parentElement.append(frame);const url=new URL(kind==='art'?'../renderers/build/skin-content-integration/index.html':'../renderers/build/original-skins-390/index.html',win.location.href);url.search=new URLSearchParams(kind==='art'?{id:'prototype-material',skin:demo.settings.skin,motion:'off'}:{instance:'prototype-material-tab',kind:'tab',skin:demo.settings.skin,motion:'off'});frame.src=url.href;return frame;}
 function update(){
  const skin=demo.settings.skin,page=demo.state.page,dark=demo.settings.appearance==='dark'||(demo.settings.appearance==='auto'&&win.matchMedia('(prefers-color-scheme: dark)').matches),active=skin!=='none'&&!page.startsWith('welcome')&&page!=='splash';
  if(!active){if(!ownsLayer)return;ownsLayer=false;for(const key of ['materialSkin','materialDark','materialPlain','materialArt','materialOwner'])delete phone.dataset[key];for(const key of ['alpha','top','middle','bottom'])phone.style.removeProperty('--material-'+key);if(art){art.style.display='none';send(art,JSON.stringify({type:'beecount-skin-integration',skin:modern.has(skin)?skin:'anniversary',motion:'paused',layout:{clearRects:[]}}),artReady,'art');}if(tab){tab.style.display='none';send(tab,JSON.stringify({type:'beecount-original-skin',command:'configure',kind:'tab',skin:originals.has(skin)?skin:'anniversary',motion:'paused'}),tabReady,'tab');}return;}
  ownsLayer=true;phone.dataset.materialOwner='demo';phone.dataset.materialSkin=skin;phone.dataset.materialDark=String(dark);phone.dataset.materialPlain='false';phone.dataset.materialArt=modern.has(skin)?'original':'legacy';phone.style.setProperty('--material-alpha','.4');const colors=materials[skin]?.[dark?'dark':'light']||legacyPalette(demo.settings.accent,dark);['top','middle','bottom'].forEach((name,i)=>phone.style.setProperty('--material-'+name,colors[i]));
  const modal=Boolean(demo.state.rModal)||phone.dataset.modal==='true'||Boolean(phone.querySelector('.c3-context-layer')),motion=modal||!visible||doc.hidden||media.matches?'paused':demo.settings.animation?'play':'off';
  if(modern.has(skin)){if(!art)art=makeFrame('art');Object.assign(art.style,{display:'block',left:phone.offsetLeft+'px',top:phone.offsetTop+'px',width:phone.offsetWidth+'px',height:phone.offsetHeight+'px'});const pose=materialLayout(phone,page);if(skin==='anniv_cake')pose.anchor[1]+=5;send(art,JSON.stringify({type:'beecount-skin-integration',skin,dark,composition:'canopy',page:page==='mine'?'mine':'home',motion,layout:pose}),artReady,'art');}else if(art){art.style.display='none';send(art,JSON.stringify({type:'beecount-skin-integration',skin:'anniversary',motion:'paused',layout:{clearRects:[]}}),artReady,'art');}
  const nav=phone.querySelector('.bc-nav');if(originals.has(skin)&&nav){if(!tab)tab=makeFrame('tab');const nr=rect(nav,phone);Object.assign(tab.style,{display:'block',left:phone.offsetLeft+nr[0]+'px',top:phone.offsetTop+nr[1]+'px',width:nr[2]+'px',height:nr[3]+'px'});send(tab,JSON.stringify({type:'beecount-original-skin',command:'configure',kind:'tab',skin,dark,motion,systemReduced:media.matches}),tabReady,'tab');}else if(tab){tab.style.display='none';send(tab,JSON.stringify({type:'beecount-original-skin',command:'configure',kind:'tab',skin:originals.has(skin)?skin:'anniversary',motion:'paused'}),tabReady,'tab');}
  const main=phone.querySelector('.bc-main');if(main&&mainNode!==main){mainNode=main;main.addEventListener('scroll',()=>{update()},{passive:true});}
 }
 win.addEventListener('message',event=>{if(event.origin!==win.location.origin||typeof event.data!=='string')return;let data;try{data=JSON.parse(event.data)}catch{return;}if(art&&event.source===art.contentWindow&&data.type==='beecount-skin-integration-status'){artReady=true;artStatus=data;update();}if(tab&&event.source===tab.contentWindow&&data.type==='beecount-original-skin-status'){tabReady=true;tabStatus=data;update();}});
 try{const observer=new win.MutationObserver(update);observer.observe(phone,{childList:true});}catch{}doc.addEventListener('click',()=>win.requestAnimationFrame(update));new win.ResizeObserver(update).observe(phone);new win.IntersectionObserver(entries=>{visible=entries[0].isIntersecting;update();},{rootMargin:'100px'}).observe(phone);doc.addEventListener('visibilitychange',update);doc.addEventListener('change',()=>queueMicrotask(update));media.addEventListener('change',update);
 update();return{update,get status(){return artStatus},get tabStatus(){return tabStatus},get frame(){return art},get tabFrame(){return tab}};
}
global.BeeOriginalSkinLayout={layout,pageBackground,install,materialLayout};
})(window);
