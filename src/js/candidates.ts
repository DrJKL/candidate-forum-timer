import Config from './global_config';
import moment from 'moment';

export class Candidate {


    public timeLeft: moment.Duration;
    public countingDown: number|null;

    constructor(public readonly name: string) {
        this.name = name;
        this.timeLeft = Config.timeLimitTotal.clone();
        this.countingDown = null;
    }

    toggleTimer() {
        console.log("Toggling", this.name);
        if (this.countingDown) {
            clearInterval(this.countingDown);
            this.countingDown = null;
            return;
        }
        this.countingDown = setInterval(() => {
            this.timeLeft.subtract(Config.timeGranularity, 'ms');
        }, Config.timeGranularity);
    }

    addTime() {
        this.timeLeft.add(Config.timeDelta);
    }

    removeTime() {
        this.timeLeft.subtract(Config.timeDelta);
    }

    isRunning() { return !!this.countingDown; }

    getTimeLeft() {
        const timeToUse = this.isTimeUp() ? moment.duration().subtract(this.timeLeft) : this.timeLeft;
        return `${timeToUse.minutes().toString().padStart(2, 0)}:` +
            `${timeToUse.seconds().toString().padStart(2, 0)}:` +
            `${timeToUse.milliseconds().toString().padStart(3,0)}`;
    }

    getProgressPercent() {
        return `${100*(this.timeLeft.asMilliseconds() / Candidate.timeLimitTotal.asMilliseconds())}%`;
    }

    isTimeUp() {
        return this.timeLeft.asMilliseconds() <= 0;
    }

}

export const allCandidates = [
    'Margaret Abe-Koga',
    'Jose Gutierrez',
    'John Lashlee',
    'Sally Lieber',
    'Lisa Matichak',
    'Alex Nunez',
    'Paul Roales',
    'Pat Showalter',
    'Lenny Siegel',
].map(candidateName => new Candidate(candidateName));

export function totalTimeLeft() {
    return allCandidates.map(candidate => candidate.timeLeft);
}