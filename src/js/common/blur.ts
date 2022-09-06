export function blurElement(event: Event) {
  if (!(event.target instanceof HTMLElement)) {
    return;
  }
  event.target.blur();
}
