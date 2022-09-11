import Timer from './timer';

export class Candidate {
  public readonly timer: Timer = new Timer();
  public isMinimized = false;

  constructor(public readonly name: string) {
    this.name = name;
  }
  toggleMinimized() {
    this.isMinimized = !this.isMinimized;
  }
  toString() {
    return `Candidate: ${this.name}`;
  }
}
