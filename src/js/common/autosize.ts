export async function autosizeText(el: HTMLElement, direction: number) {
  const computed = getComputedStyle(el);
  const currentFontValue = computed.getPropertyValue('--question-size-test');
  let startingSize = parseInt(currentFontValue, 10);

  if (isNaN(startingSize)) {
    console.log('el has no font size?', el, startingSize);
    return;
  }

  function resizeText() {
    startingSize += direction;
    const newFont = `${startingSize}px`;
    el.style.setProperty('--question-size-test', newFont);
  }

  el.classList.add('auto-sizing');
  let iterations = 0;
  await new Promise<void>((resolve) => {
    requestAnimationFrame(async function doTheThing() {
      if (
        el.scrollHeight <= el.offsetHeight === direction < 0 ||
        ++iterations > 500 ||
        startingSize <= 12 ||
        startingSize >= 300
      ) {
        el.classList.remove('auto-sizing');
        console.log(`Ended up at ${el.style.getPropertyValue('--question-size-test')}`);
        resolve();
        return;
      }
      resizeText();
      await new Promise<void>((resolve) => setTimeout(resolve, 0));
      doTheThing();
    });
  });
}
