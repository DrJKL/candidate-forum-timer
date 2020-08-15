import Config from './global_config';
import moment from 'moment';
import {DurationInputArg1, DurationInputArg2} from 'moment';

export class Candidate {
    public readonly timer: Timer;

    constructor(public readonly name: string) {
        this.name = name;
        this.timer = new Timer();
    }

}

export class Timer {
    public timeLeft: moment.Duration;
    public countingDown: number|null;

    constructor() {
        this.timeLeft = Config.timeLimitTotal.clone();
        this.countingDown = null;
    }

    toggleTimer() {
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

    setTime(num: DurationInputArg1, unit: DurationInputArg2) {
        this.timeLeft = moment.duration(num, unit);
    }

    isRunning() { return !!this.countingDown; }

    getTimeLeft() {
        const timeToUse = this.isTimeUp ? moment.duration().subtract(this.timeLeft) : this.timeLeft;
        return `${timeToUse.minutes().toString().padStart(2, '0')}:` +
            `${timeToUse.seconds().toString().padStart(2, '0')}:` +
            `${timeToUse.milliseconds().toString().padStart(3,'0')}`;
    }

    get millisLeft() {
        return this.timeLeft.asMilliseconds();
    }

    get progressPercent() {
        return 100*(this.millisLeft / Config.timeLimitTotal.asMilliseconds());
    }

    get isTimeUp() {
        return this.millisLeft <= 0;
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
    return allCandidates.map(candidate => candidate.timer.timeLeft);
}