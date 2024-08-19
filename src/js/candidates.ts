import Timer from './timer';
import { TokenManager } from './token_manager';

export class Candidate {
  public readonly timer: Timer = new Timer();
  public isMinimized = false;
  readonly tokens = new TokenManager({ 'rebuttal': 2 });

  constructor(public readonly name: string) { }
  toggleMinimized() {
    this.isMinimized = !this.isMinimized;
  }
  toString() {
    return `Candidate: ${this.name}`;
  }
  rebuttalsLeft() {
    return this.tokens.remainingTokens('rebuttal');
  }
  useRebuttal(): boolean {
    return this.tokens.use('rebuttal');
  }
  restoreRebuttal() {
    this.tokens.restore('rebuttal');
  }

}
