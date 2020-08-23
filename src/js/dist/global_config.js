"use strict";
exports.__esModule = true;
exports.actuallyResetConfig = exports.saveConfig = exports.restoreConfig = exports.globalConfig = exports.Config = void 0;
var candidates_1 = require("./candidates");
var moment_1 = require("moment");
var __png_1 = require("../assets/*.png");
var Config = /** @class */ (function () {
    function Config() {
        this.timeLimitTotal = moment_1["default"].duration(90, 's');
        this.timeGranularity = 100;
        this.timeDelta = moment_1["default"].duration(1, 's');
        this.eventInfo = {
            logoUrl: //
            //  images['just_homes_logo'],
            __png_1["default"]['lwv-logo'],
            orgTitle: // 
            // "Mountain View Mobile Home Alliance",
            "League of Women Voters",
            eventTitle: //
            "2020\n            <span>Mountain View</span>\n            <span>City Council</span>\n            <span>Candidate Forum</span>",
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
            ]
        };
    }
    Object.defineProperty(Config.prototype, "candidates", {
        get: function () {
            return this.eventInfo.candidatesList.map(function (name) { return new candidates_1.Candidate(name); });
        },
        set: function (newCandidates) {
            this.eventInfo.candidatesList = newCandidates.map(function (candidate) { return candidate.name; });
        },
        enumerable: false,
        configurable: true
    });
    return Config;
}());
exports.Config = Config;
exports.globalConfig = new Config();
var CONFIG_KEY = 'saved_candidate_config';
function restoreConfig() {
    console.log("restoring");
    var savedConfig = localStorage.getItem(CONFIG_KEY);
    if (!savedConfig) {
        exports.globalConfig.eventInfo = new Config().eventInfo;
        return;
    }
    var parsedConfig = JSON.parse(savedConfig);
    console.log(parsedConfig);
    Object.assign(exports.globalConfig.eventInfo, parsedConfig);
    console.log(exports.globalConfig.eventInfo);
}
exports.restoreConfig = restoreConfig;
function saveConfig() {
    console.log("saving");
    localStorage.setItem(CONFIG_KEY, JSON.stringify(exports.globalConfig.eventInfo));
    console.log(exports.globalConfig.eventInfo);
}
exports.saveConfig = saveConfig;
function actuallyResetConfig() {
    localStorage.removeItem(CONFIG_KEY);
    restoreConfig();
}
exports.actuallyResetConfig = actuallyResetConfig;
