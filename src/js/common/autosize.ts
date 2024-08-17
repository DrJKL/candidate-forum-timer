export async function autosizeText(el: HTMLElement, direction: number, which = 'question') {
  const computed = getComputedStyle(el);
  const currentFontValue = computed.getPropertyValue(`--${which}-size-test`);
  let startingSize = parseInt(currentFontValue, 10);

  if (isNaN(startingSize)) {
    console.log('el has no font size?', el, startingSize);
    return;
  }

  function resizeText() {
    startingSize += direction;
    const newFont = `${startingSize}px`;
    el.style.setProperty(`--${which}-size-test`, newFont);
  }

  el.classList.add('auto-sizing');
  let iterations = 0;
  await new Promise<void>((resolve) => {
    requestAnimationFrame(async function doTheThing() {
      if (
        el.scrollHeight <= el.offsetHeight === direction < 0 ||
        ++iterations > 500 ||
        (startingSize <= 12 && direction < 0) ||
        (startingSize >= 300 && direction > 0)
      ) {
        el.classList.remove('auto-sizing');
        resolve();
        return;
      }
      resizeText();
      await new Promise<void>((resolve) => setTimeout(resolve, 0));
      await doTheThing();
    });
  });
}
