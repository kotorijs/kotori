"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPackageInfo = exports.request = exports._console = exports.formatTime = exports.stringSplit = exports.arrayProcess = exports.stringProcess = exports.saveConfig = exports.loadConfig = exports._const = void 0;
var fs_1 = __importDefault(require("fs"));
var http_1 = __importDefault(require("http"));
var yaml_1 = __importDefault(require("yaml"));
exports._const = (function () {
    var _ROOT_PATH = __dirname + '\\..';
    if (!fs_1.default.existsSync("".concat(_ROOT_PATH, "\\config.yml"))) {
        _ROOT_PATH += '\\..';
    }
    return {
        _ROOT_PATH: _ROOT_PATH,
        _PLUGIN_PATH: "".concat(_ROOT_PATH, "\\plugins"),
        _CONFIG_PATH: "".concat(_ROOT_PATH, "\\config"),
        _DATA_PATH: "".concat(_ROOT_PATH, "\\data"),
        _LOGS_PATH: "".concat(_ROOT_PATH, "\\logs"),
    };
})();
function loadConfig(filename, type) {
    if (type === void 0) { type = 'json'; }
    var data = fs_1.default.readFileSync(filename).toString();
    try {
        if (type === 'yaml')
            return yaml_1.default.parse(data);
        return JSON.parse(data);
    }
    catch (err) {
        console.error(err);
    }
}
exports.loadConfig = loadConfig;
function saveConfig(filename, data, type) {
    if (type === void 0) { type = 'json'; }
    var content = '';
    try {
        if (type === 'json')
            content = JSON.stringify(data);
        if (type === 'yaml')
            content = yaml_1.default.stringify(data);
        return fs_1.default.writeFileSync(filename, content);
    }
    catch (err) {
        console.error(err);
    }
}
exports.saveConfig = saveConfig;
function stringProcess(str, key, mode) {
    if (mode === void 0) { mode = 0; }
    if (typeof str === 'number')
        str = str.toString();
    if (typeof key === 'string' || typeof key === 'number') {
        key = key.toString();
        if (mode === 2) {
            return str === key;
        }
        else if (mode === 1) {
            return str.includes(key);
        }
        else {
            return str.startsWith(key);
        }
    }
    else if (Array.isArray(key)) {
        for (var i = 0; i < key.length; i++) {
            var element = key[i];
            if (typeof element === 'string' || typeof element === 'number') {
                element = element.toString();
            }
            if (mode === 2) {
                if (str === element) {
                    return true;
                }
            }
            else if (mode === 1 && str.includes(element)) {
                return true;
            }
            else if (mode === 0 && str.startsWith(element)) {
                return true;
            }
        }
    }
    return false;
}
exports.stringProcess = stringProcess;
;
function arrayProcess(arr, key, mode) {
    if (mode === void 0) { mode = 0; }
    for (var a = 0; a < arr.length; a++) {
        if (stringProcess(arr[a], key, mode))
            return true;
    }
    return false;
}
exports.arrayProcess = arrayProcess;
;
function stringSplit(str, key) {
    var index = str.indexOf(key);
    if (index !== -1) {
        return str.slice(index + key.length);
    }
    else {
        return str;
    }
}
exports.stringSplit = stringSplit;
;
function formatTime(time, format) {
    if (format === void 0) { format = 0; }
    if (!time)
        time = new Date();
    var result = '';
    if (format === 0) {
        result += "".concat(time.getFullYear().toString().substring(2), "/");
        result += "".concat(time.getMonth() + 1, "/").concat(time.getDate(), " ");
        result += "".concat(time.getHours(), ":").concat(time.getMinutes(), ":").concat(time.getMinutes());
    }
    else if (format === 1) {
        result += "".concat(time.getFullYear(), "-").concat(time.getMonth() + 1, "-").concat(time.getDate());
    }
    return result;
}
exports.formatTime = formatTime;
var _console = exports._console = /** @class */ (function () {
    function _console() {
    }
    var _a;
    _a = _console;
    _console.colorList = {
        'default': '\x1B[0m',
        'bright': '\x1B[1m',
        'grey': '\x1B[2m',
        'italic': '\x1B[3m',
        'underline': '\x1B[4m',
        'reverse': '\x1B[7m',
        'hidden': '\x1B[8m',
        'black': '\x1B[30m',
        'red': '\x1B[31m',
        'green': '\x1B[32m',
        'yellow': '\x1B[33m',
        'blue': '\x1B[34m',
        'magenta': '\x1B[35m',
        'cyan': '\x1B[36m',
        'white': '\x1B[37m',
        'blackBG': '\x1B[40m',
        'redBG': '\x1B[41m',
        'greenBG': '\x1B[42m',
        'yellowBG': '\x1B[43m',
        'blueBG': '\x1B[44m',
        'magentaBG': '\x1B[45m',
        'cyanBG': '\x1B[46m',
        'whiteBG': '\x1B[47m' // 背景色为白色
    };
    _console.prefixColor = 'blue';
    _console.logsFilePath = exports._const._LOGS_PATH;
    _console.originalLog = function (__console, type, typeColor, textColor) {
        var args = [];
        for (var _i = 4; _i < arguments.length; _i++) {
            args[_i - 4] = arguments[_i];
        }
        var message = '';
        args[0].forEach(function (Element) {
            if (typeof Element === 'object')
                Element = JSON.stringify(Element);
            message += Element + ' ';
            // }
            message.slice(0, -1);
        });
        // __console(args)
        var time = formatTime();
        var result = "".concat(_a.colorList[_a.prefixColor]).concat(time).concat(_a.colorList.default, " ");
        result += "[".concat(_a.colorList[typeColor]).concat(type).concat(_a.colorList.default, "] ");
        result += "".concat(_a.colorList[textColor] || '').concat(message).concat(_a.colorList.default);
        __console(result);
        // 写入日志
        var logFile = "".concat(_a.logsFilePath, "\\").concat(formatTime(null, 1), ".log");
        if (!fs_1.default.existsSync(logFile)) {
            fs_1.default.writeFileSync(logFile, '');
        }
        var content = "".concat(time, " ").concat(type, " ").concat(message);
        fs_1.default.appendFileSync(logFile, content + '\n');
    };
    _console.log = function (__console) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        _a.originalLog(__console, 'LOG', 'cyan', '', args);
    };
    _console.info = function (__console) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        _a.originalLog(__console, 'INFO', 'green', '', args);
    };
    /* public static info = (__console: Function, ...args: any) => {
        _console.log(__console, ...args)
    }; */
    _console.warn = function (__console) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        _a.originalLog(__console, 'WARM', 'yellow', 'yellow', args);
    };
    _console.error = function (__console) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        _a.originalLog(__console, 'ERROR', 'red', 'red', args);
    };
    return _console;
}());
var request = exports.request = /** @class */ (function () {
    function request() {
    }
    request.send = function (type, url, params) {
        var paramsStr = '?';
        for (var key in params) {
            paramsStr += "".concat(key, "=").concat(params[key], "&");
        }
        paramsStr.substring(0, -1);
        var options = {
            method: { get: 'GET', post: "POST" }[type],
            url: url,
            params: params
        };
        return new Promise(function (resolve, reject) {
            var req = http_1.default.request(options, function (res) {
                var data = '';
                res.on('data', function (chunk) {
                    data += chunk;
                });
                res.on('end', function () {
                    resolve(data);
                });
            });
            req.on('error', function (err) {
                reject(err);
            });
            req.end();
        });
    };
    request.get = function (url, params) { return request.send('get', url, params); };
    request.post = function (url, params) { return request.send('post', url, params); };
    return request;
}());
function getPackageInfo() {
    return loadConfig("".concat(exports._const._ROOT_PATH, "\\package.json"));
}
exports.getPackageInfo = getPackageInfo;
(function () {
    console.info('Kotori Bot is loading...');
    console.info("\n\u2588\u2588\u2557  \u2588\u2588\u2557 \u2588\u2588\u2588\u2588\u2588\u2588\u2557 \u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557 \u2588\u2588\u2588\u2588\u2588\u2588\u2557 \u2588\u2588\u2588\u2588\u2588\u2588\u2557 \u2588\u2588\u2557\n\u2588\u2588\u2551 \u2588\u2588\u2554\u255D\u2588\u2588\u2554\u2550\u2550\u2550\u2588\u2588\u2557\u255A\u2550\u2550\u2588\u2588\u2554\u2550\u2550\u255D\u2588\u2588\u2554\u2550\u2550\u2550\u2588\u2588\u2557\u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2557\u2588\u2588\u2551\n\u2588\u2588\u2588\u2588\u2588\u2554\u255D \u2588\u2588\u2551   \u2588\u2588\u2551   \u2588\u2588\u2551   \u2588\u2588\u2551   \u2588\u2588\u2551\u2588\u2588\u2588\u2588\u2588\u2588\u2554\u255D\u2588\u2588\u2551\n\u2588\u2588\u2554\u2550\u2588\u2588\u2557 \u2588\u2588\u2551   \u2588\u2588\u2551   \u2588\u2588\u2551   \u2588\u2588\u2551   \u2588\u2588\u2551\u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2557\u2588\u2588\u2551\n\u2588\u2588\u2551  \u2588\u2588\u2557\u255A\u2588\u2588\u2588\u2588\u2588\u2588\u2554\u255D   \u2588\u2588\u2551   \u255A\u2588\u2588\u2588\u2588\u2588\u2588\u2554\u255D\u2588\u2588\u2551  \u2588\u2588\u2551\u2588\u2588\u2551\n\u255A\u2550\u255D  \u255A\u2550\u255D \u255A\u2550\u2550\u2550\u2550\u2550\u255D    \u255A\u2550\u255D    \u255A\u2550\u2550\u2550\u2550\u2550\u255D \u255A\u2550\u255D  \u255A\u2550\u255D\u255A\u2550\u255D\n");
    var info = getPackageInfo();
    _console.info(console.info, "Kotori Bot Version: ".concat(info.version, " License: ").concat(info.license));
    _console.info(console.info, "Kotori Bot By Hotaru");
    _console.info(console.info, "Copyright \u00A9 2023 Hotaru All rights reserved.");
})();
exports.default = {
    _const: exports._const,
    loadConfig: loadConfig,
    stringProcess: stringProcess,
    arrayProcess: arrayProcess,
    stringSplit: stringSplit,
    _console: _console,
    request: request
};
//# sourceMappingURL=function.js.map