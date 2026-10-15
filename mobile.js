// Keep the existing editor DOM and its state; switch only the mobile view.
const mobileMedia = matchMedia('(max-width:780px)');
const mobileTools = document.createElement('footer');
mobileTools.className = 'mobile-tools';
mobileTools.innerHTML = `<nav aria-label="모바일 카드 작업"><button type="button" data-view="edit" aria-pressed="true">편집</button><button type="button" data-view="preview" aria-pressed="false">미리보기</button><button type="button" id="mobileSave" class="primary">PNG 저장</button></nav><p id="mobileSaveStatus" role="status" aria-live="polite"></p>`;
document.body.append(mobileTools);
document.body.dataset.mobileView = 'edit';
function showMobileView(view){
  document.activeElement?.blur();
  document.body.dataset.mobileView = view;
  mobileTools.querySelectorAll('[data-view]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.view === view)));
  if(mobileMedia.matches) window.scrollTo({top:0,behavior:'instant'});
}
mobileTools.querySelectorAll('[data-view]').forEach(button => button.addEventListener('click', () => showMobileView(button.dataset.view)));
const mobileStatus = document.querySelector('#mobileSaveStatus');
const originalSave = document.querySelector('#savePng');
const originalFeedback = document.querySelector('#downloadFeedback');
function syncSaveStatus(){mobileStatus.textContent = originalFeedback.textContent;}
new MutationObserver(syncSaveStatus).observe(originalFeedback,{childList:true,subtree:true,characterData:true});
syncSaveStatus();
// PNG save/share. Prepare a File ahead of the tap so navigator.share() runs inside the user gesture.
const originalSaveLabel = originalSave.textContent;
let shareFile = null, shareFileHref = '', sharing = false;
function prepareShareFile(){
  const href = originalSave.getAttribute('href');
  if(originalSave.getAttribute('aria-disabled')==='true' || !href || href==='#'){shareFile = null; shareFileHref = ''; return;}
  if(href === shareFileHref) return;
  shareFile = null; shareFileHref = href;
  if(!(navigator.share && navigator.canShare)) return;
  fetch(href).then(r => r.blob()).then(blob => {
    if(originalSave.getAttribute('href') !== href) return; // a newer PNG replaced this one
    const file = new File([blob], originalSave.getAttribute('download') || 'meme-card.png', {type:'image/png'});
    if(navigator.canShare({files:[file]})) shareFile = file;
  }).catch(() => {});
}
new MutationObserver(prepareShareFile).observe(originalSave,{attributes:true,attributeFilter:['href','aria-disabled','download']});
prepareShareFile();
function requestDownload(){
  originalSave.click();
  mobileStatus.textContent='다운로드를 요청했어요. 브라우저 다운로드 목록을 확인하세요.';
}
document.querySelector('#mobileSave').addEventListener('click', async () => {
  if(sharing) return;
  if(originalSave.getAttribute('aria-disabled')==='true' || !originalSave.hasAttribute('href')){
    mobileStatus.textContent='PNG를 준비 중이에요. 잠시 후 다시 눌러 주세요.';
    return;
  }
  prepareShareFile();
  const file = shareFile;
  if(!file){requestDownload(); return;} // no file sharing support or file not ready: download instead
  sharing = true;
  mobileStatus.textContent='공유 창을 여는 중이에요.';
  try{
    await navigator.share({files:[file]});
    mobileStatus.textContent='공유 창에서 앱을 선택했어요. 저장 위치는 선택한 앱에 따라 달라요.';
  }catch(error){
    if(error && error.name==='AbortError'){
      mobileStatus.textContent='공유를 취소했어요. 아직 저장하지 않았어요. 다시 누르면 공유하거나 다운로드할 수 있어요.';
    }else{
      requestDownload(); // share failed for another reason: fall back to a normal download
    }
  }finally{sharing = false;}
});
function updateKeyboard(){
  const viewport=window.visualViewport;
  const editing=/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName||'');
  mobileTools.classList.toggle('keyboard-open',Boolean(viewport && editing && innerHeight-viewport.height>120));
}
window.visualViewport?.addEventListener('resize',updateKeyboard);
document.addEventListener('focusin',updateKeyboard);
document.addEventListener('focusout',()=>setTimeout(updateKeyboard,0));

// Size the preview card from the real space above the fixed bar (header, padding and wrapped status text vary).
function fitPreview(){
  const canvas = document.querySelector('#canvas');
  if(!mobileMedia.matches || document.body.dataset.mobileView !== 'preview'){document.documentElement.style.removeProperty('--card-max-h'); return;}
  const top = canvas.getBoundingClientRect().top + window.scrollY;
  const toolsHeight = mobileTools.classList.contains('keyboard-open') ? 0 : mobileTools.offsetHeight;
  const available = (window.visualViewport?.height || innerHeight) - toolsHeight - top - 12;
  document.documentElement.style.setProperty('--card-max-h', Math.max(120, Math.floor(available)) + 'px');
}
new ResizeObserver(fitPreview).observe(mobileTools);
window.addEventListener('resize', fitPreview);
window.visualViewport?.addEventListener('resize', fitPreview);
mobileMedia.addEventListener('change', fitPreview);
new MutationObserver(fitPreview).observe(document.body,{attributes:true,attributeFilter:['data-mobile-view']});
