import moment from "moment";
import images from "../assets/*.png";

export class Config {
    timeLimitTotal = moment.duration(90, 's');
    timeGranularity = 100;
    timeDelta = moment.duration(1, 's');
    eventInfo = {
        logoUrl: //
            //  images['just_homes_logo'],
            images['lwv-logo'],
        orgTitle: // 
            // "Mountain View Mobile Home Alliance",
            "League of Women Voters",
        eventTitle: //
            `2020
            <span>Mountain View</span>
            <span>City Council</span>
            <span>Candidate Forum</span>`,
        candidatesList: [
            "Margaret Abe-Koga",
            "Jose Gutierrez",
            "John Lashlee",
            "Sally Lieber",
            "Lisa Matichak",
            "Alex Nunez",
            "Paul Roales",
            "Pat Showalter",
            "Lenny Siegel",
        ],
    }
}
export const globalConfig = new Config();