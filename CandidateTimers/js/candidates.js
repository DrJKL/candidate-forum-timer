class Candidate {
    static timeLimitTotal = moment.duration(10, 's');
    static timeGranularity = 50;
    static timeDelta = moment.duration(1, 's');
    constructor(name) {
        this.name = name;
        this.timeLeft = Candidate.timeLimitTotal.clone();
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
            this.timeLeft.subtract(Candidate.timeGranularity, 'ms');
        }, Candidate.timeGranularity);
    }

    addTime() {
        this.timeLeft.add(Candidate.timeDelta);
    }

    removeTime() {
        this.timeLeft.subtract(Candidate.timeDelta);
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

const allCandidates = [
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

function totalTimeLeft() {
    return allCandidates.map(candidate => candidate.timeLeft);
}