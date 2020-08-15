import moment from "moment";

export default class Config {
    static timeLimitTotal = moment.duration(90, 's');
    static timeGranularity = 100;
    static timeDelta = moment.duration(1, 's');
}