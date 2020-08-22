"use strict";
exports.__esModule = true;
var global_config_1 = require("./global_config");
var moment_1 = require("moment");
var Timer = /** @class */ (function () {
    function Timer() {
        this.timeLeft = global_config_1.globalConfig.timeLimitTotal.clone();
        this.timeLimit = global_config_1.globalConfig.timeLimitTotal.clone();
        this.countingDown = null;
    }
    Timer.prototype.toggleTimer = function (force) {
        var _this = this;
        if (force === void 0) { force = true; }
        if (this.countingDown) {
            clearInterval(this.countingDown);
            this.countingDown = null;
            return;
        }
        if (force === true) {
            this.countingDown = setInterval(function () {
                _this.timeLeft.subtract(global_config_1.globalConfig.timeGranularity, 'ms');
            }, global_config_1.globalConfig.timeGranularity);
        }
    };
    Timer.prototype.addTime = function () {
        this.timeLeft.add(global_config_1.globalConfig.timeDelta);
    };
    Timer.prototype.removeTime = function () {
        this.timeLeft.subtract(global_config_1.globalConfig.timeDelta);
    };
    Timer.prototype.setTime = function (num, unit) {
        this.timeLimit = moment_1["default"].duration(num, unit);
        this.timeLeft = this.timeLimit.clone();
    };
    Timer.prototype.isRunning = function () { return !!this.countingDown; };
    Timer.prototype.getTimeLeft = function () {
        var timeToUse = this.isTimeUp ? moment_1["default"].duration().subtract(this.timeLeft) : this.timeLeft;
        return timeToUse.minutes().toString().padStart(2, '0') + ":" +
            (timeToUse.seconds().toString().padStart(2, '0') + ".") +
            ("" + timeToUse.milliseconds().toString().substr(0, 1));
    };
    Object.defineProperty(Timer.prototype, "millisLeft", {
        get: function () {
            return this.timeLeft.asMilliseconds();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Timer.prototype, "progressPercent", {
        get: function () {
            return 100 * (this.millisLeft / this.timeLimit.asMilliseconds());
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Timer.prototype, "isTimeUp", {
        get: function () {
            return this.millisLeft <= 0;
        },
        enumerable: false,
        configurable: true
    });
    return Timer;
}());
exports["default"] = Timer;
