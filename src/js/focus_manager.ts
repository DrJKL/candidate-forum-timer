export default class FocusManager {
  focusedCandidate = 0;

  checkFocus(limit: number) {
    this.checkFocusNaN();
    this.focusedCandidate = Math.max(Math.min(this.focusedCandidate, limit), 0);
  }
  checkFocusNaN() {
    if (isNaN(this.focusedCandidate)) {
      this.focusedCandidate = 0;
    }
  }
  changeFocus(num: -1 | 1, limit: number) {
    this.focusedCandidate += num;
    this.checkFocus(limit);
  }
  changeFocusAbsolute(num: number, limit: number) {
    this.focusedCandidate = num;
    this.checkFocus(limit);
  }
  isFocused(index: number) {
    return this.focusedCandidate === index;
  }
  isNext(index: number) {
    return this.focusedCandidate === index - 1;
  }
  isPrev(index: number) {
    return this.focusedCandidate === index + 1;
  }
}
