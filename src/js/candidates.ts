import Config from "./global_config";
import moment from "moment";
import { DurationInputArg1, DurationInputArg2 } from "moment";
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

export const allCandidates = Config.eventInfo.candidatesList.map((candidateName) => new Candidate(candidateName));

export function totalTimeLeft() {
    return allCandidates.map((candidate) => candidate.timer.timeLeft);
}
