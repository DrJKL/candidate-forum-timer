import moment from "moment";

export default class Config {
    static timeLimitTotal = moment.duration(10, 's');
    static timeGranularity = 50;
    static timeDelta = moment.duration(1, 's');
}