import { Candidate } from './candidates';
import moment from "moment";
import images from "../assets/*.png";

export class Config {
    timeLimitTotal = moment.duration(90, 's');
    timeGranularity = 100;
    timeDelta = moment.duration(1, 's');
    eventInfo = {
        logoUrl: //
             images['just_homes_logo'],
            // images['lwv-logo'],
        orgTitle: // 
            "Mountain View Mobile Home Alliance",
            // "the League of Women Voters",
        eventTitle: //
            `2022
            <span>Mountain View</span>
            <span>City Council</span>
            <span>Candidate Forum</span>`,
        candidatesList: [
            "Lucas Ramirez",
            "Alison Hicks",
            "Ellen Kamei",
            "Li Zhang",
            "Justin Cohen",
        ],
    }
    get candidates() {
        return this.eventInfo.candidatesList.map(name => new Candidate(name));
    }
    set candidates(newCandidates: Candidate[]) {
        this.eventInfo.candidatesList = newCandidates.map(candidate => candidate.name);
    }
}
export const globalConfig = new Config();

const CONFIG_KEY = 'saved_candidate_config';

export function restoreConfig() {
    console.log("restoring");
    const savedConfig = localStorage.getItem(CONFIG_KEY);
    if (!savedConfig) {
        globalConfig.eventInfo = new Config().eventInfo;
        return;
    }
    const parsedConfig = JSON.parse(savedConfig);
    console.log(parsedConfig);
    Object.assign(globalConfig.eventInfo, parsedConfig);
    console.log(globalConfig.eventInfo);
}
export function saveConfig() {
    console.log("saving");
    localStorage.setItem(CONFIG_KEY, JSON.stringify(globalConfig.eventInfo));
    console.log(globalConfig.eventInfo)
}
export function actuallyResetConfig() {
    localStorage.removeItem(CONFIG_KEY);
    restoreConfig();
}