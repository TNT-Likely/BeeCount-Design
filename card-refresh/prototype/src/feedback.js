  let feedbackTimer;
  function feedbackToast(text,tone='neutral',sample=false){
    const symbol={success:'circle-check',error:'circle-alert',warning:'triangle-alert',neutral:'info'}[tone]||'info';
    const clean=['success','error','warning'].includes(tone)?text.replace(/^\s*(?:✅|✔️?|☑️?|❌|❎|✖️?|⚠️?)\s*/u,''):text;
    return `<div class="bc-notice${sample?' bc-notice-sample':''}" data-feedback-tone="${tone}" role="status">${icon(symbol)}<span>${esc(clean||text)}</span></div>`;
  }
  function feedbackStatus(){return `<div class="bc-feedback-status" data-feedback-tone="success">${icon('circle-check')}<div class="bc-feedback-copy">已保存</div></div><div class="bc-feedback-status" data-feedback-tone="warning">${icon('triangle-alert')}<div class="bc-feedback-copy">本地有更新<small>可以同步到云端</small></div></div><div class="bc-feedback-status" data-feedback-tone="error">${icon('circle-alert')}<div class="bc-feedback-copy">同步失败<small>网络暂时不可用，本地数据已保留</small></div>${btn('feedback-retry','重试','重试同步','bc-secondary')}</div>`;}
  function notice(text,tone='neutral'){
    clearTimeout(feedbackTimer);phone.querySelector('.bc-notice:not(.bc-notice-sample)')?.remove();
    phone.insertAdjacentHTML('beforeend',feedbackToast(text,tone));globalThis.lucide?.createIcons({attrs:{width:20,height:20}});
    const n=phone.querySelector('.bc-notice:not(.bc-notice-sample)');feedbackTimer=setTimeout(()=>n?.remove(),2000);
  }
  const feedbackCases={success:['保存成功','success'],error:['网络不可用，请重试','error'],warning:['请先选择分类','warning'],neutral:['再按一次退出应用','neutral'],retry:['已发起重试','neutral']};
  fDefine('feedback','成功、失败与持续状态','组件规范','packages/beecount_ui/lib/src/controls.dart',()=>`${surface(`<h3 style="font-size:14px;margin-bottom:16px">轻提示 · 按实际结果显示状态</h3>${Object.values(feedbackCases).slice(0,4).map(([text,tone])=>feedbackToast(text,tone,true)).join('')}<div class="bc-inline-actions">${btn('feedback-success','成功','显示成功提示','bc-primary')}${btn('feedback-error','错误','显示错误提示','bc-secondary')}${btn('feedback-warning','提醒','显示提醒','bc-secondary')}${btn('feedback-neutral','信息','显示普通信息','bc-secondary')}</div>`)}${surface(`<h3 style="font-size:14px">页面内状态 · 保留处理入口</h3>${feedbackStatus()}`)}<p class="f-caption">图标由组件统一显示，去除文案开头的旧状态 emoji；正文中的 emoji 保留。轻提示 2 秒后消失，不抢焦点；持续错误保留原因与操作。</p>`);
  root.addEventListener('click',e=>{const a=e.target.closest('[data-action]')?.dataset.action;if(!a?.startsWith('feedback-'))return;e.preventDefault();e.stopImmediatePropagation();const c=feedbackCases[a.slice(9)]||feedbackCases.retry;notice(...c);},true);
  if(new URLSearchParams(location.search).get('page')==='flow-feedback')state.page='flow-feedback';
  window.beeFeedbackSpec={show:notice,samples:()=>({feedbackToast:Object.values(feedbackCases).slice(0,4).map(([text,tone])=>feedbackToast(text,tone,true)).join(''),feedbackStatus:feedbackStatus()})};
