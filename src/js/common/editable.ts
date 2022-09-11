export function setEditableElement(
  el: HTMLElement,
  valueCallback: (value: string) => void
) {
  el.setAttribute('contenteditable', 'true');
  function onBlur(event: FocusEvent) {
    if (!(event.target instanceof HTMLElement)) {
      return;
    }
    const newValue = event.target.innerText;

    valueCallback(newValue);
    event.target.removeAttribute('contenteditable');
    event.target.removeEventListener('blur', onBlur);
  }
  el.addEventListener('blur', onBlur);

  el.focus();
  // selectElementContents(el);
}
export function selectElementContents(el: HTMLElement) {
  var range = document.createRange();
  range.selectNodeContents(el);
  var sel = window.getSelection();
  sel?.removeAllRanges();
  sel?.addRange(range);
}
