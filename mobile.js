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
document.querySelector('#mobileSave').addEventListener('click',()=>{
  if(originalSave.getAttribute('aria-disabled')==='true' || !originalSave.hasAttribute('href')){
    mobileStatus.textContent='PNG를 준비 중이에요. 잠시 후 다시 눌러 주세요.';
    return;
  }
  originalSave.click();
  mobileStatus.textContent='다운로드를 요청했어요. 브라우저 다운로드 목록을 확인하세요.';
});
function updateKeyboard(){
  const viewport=window.visualViewport;
  const editing=/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName||'');
  mobileTools.classList.toggle('keyboard-open',Boolean(viewport && editing && innerHeight-viewport.height>120));
}
window.visualViewport?.addEventListener('resize',updateKeyboard);
document.addEventListener('focusin',updateKeyboard);
document.addEventListener('focusout',()=>setTimeout(updateKeyboard,0));
