import {globalConfig} from "./global_config";
import Timer from "./timer";

export class Candidate {
    public readonly timer: Timer = new Timer();
    public isMinimized = false;

    constructor(public readonly name: string) {
        this.name = name;
    }
    toggleMinimized() {
        this.isMinimized = !this.isMinimized;
    }
}

export function shuffle<T>(initialArray: T[]) {
    const tempCandidates = initialArray.slice();
    let currentIndex = tempCandidates.length;
    let temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      temporaryValue = tempCandidates[currentIndex];
      tempCandidates[currentIndex] = tempCandidates[randomIndex];
      tempCandidates[randomIndex] = temporaryValue;
    }
    return tempCandidates
}
