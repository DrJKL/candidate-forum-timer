import moment from "moment";
import images from "../assets/*.png";

export default class Config {
    static timeLimitTotal = moment.duration(90, 's');
    static timeGranularity = 100;
    static timeDelta = moment.duration(1, 's');
    static eventInfo = {
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
            <span>Candidate Forum</span>`
    }

}