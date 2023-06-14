"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PLUGIN = void 0;
var config_1 = __importDefault(require("./config"));
var needle_1 = __importDefault(require("needle"));
var fs_1 = __importDefault(require("fs"));
var wss_1 = require("./wss");
var function_1 = require("../../src/function");
var log = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return console.log.apply(console, __spreadArray(['[MCServer]'], args, false));
};
var _get_own_ip_url = 'https://myip4.ipip.net';
var mcsm_api = function (action, options) {
    var params = __assign({ apikey: config_1.default.mcsm.apikey, uuid: config_1.default.mcsm.uuid, remote_uuid: config_1.default.mcsm.remote_uuid }, options);
    var paramsStr = '';
    for (var key in params) {
        paramsStr += "".concat(key, "=").concat(params[key], "&");
    }
    paramsStr.substring(0, -1);
    return (0, needle_1.default)('get', "".concat(config_1.default.mcsm.address, "/api/").concat(action, "?").concat(paramsStr));
};
var PLUGIN = function (Event, Api, Const) {
    // 基础
    var ip;
    (0, needle_1.default)('get', _get_own_ip_url).then(function (data) {
        ip = data.body.split('：')[1];
        ip = ip.split(' ')[0];
    });
    // BOT
    var send = function (message, turn) {
        if (turn === void 0) { turn = false; }
        turn && (message = "\u3010 ".concat(config_1.default.info.name, " \u3011\n").concat(message, "\n--------ByHotaru--------"));
        Api.send_group_msg(message, config_1.default.group_id);
    };
    var method = function (data) {
        if (data.group_id !== config_1.default.group_id || !(0, function_1.stringProcess)(data.message, config_1.default.cmd_prefix))
            return;
        var command = (0, function_1.stringSplit)(data.message, config_1.default.cmd_prefix);
        switch (true) {
            case (0, function_1.stringProcess)(command, config_1.default.cmd.help):
                cmd_help();
                break;
            case (0, function_1.stringProcess)(command, config_1.default.cmd.status):
                cmd_status();
                break;
            case (0, function_1.stringProcess)(command, config_1.default.cmd.state):
                cmd_state();
                break;
            case (0, function_1.stringProcess)(command, config_1.default.cmd.start):
                (0, function_1.stringProcess)(data.user_id, config_1.default.mangers) ? cmd_start() : send(config_1.default.message.not_manger);
                break;
            case (0, function_1.stringProcess)(command, config_1.default.cmd.stop):
                (0, function_1.stringProcess)(data.user_id, config_1.default.mangers) ? cmd_stop() : send(config_1.default.message.not_manger);
                break;
            case (0, function_1.stringProcess)(command, config_1.default.cmd.rest):
                (0, function_1.stringProcess)(data.user_id, config_1.default.mangers) ? cmd_rest() : send(config_1.default.message.not_manger);
                break;
            case (0, function_1.stringProcess)(command, config_1.default.cmd.stopex):
                (0, function_1.stringProcess)(data.user_id, config_1.default.mangers) ? cmd_stopex() : send(config_1.default.message.not_manger);
                break;
            case (0, function_1.stringProcess)(command, config_1.default.cmd.run):
                // stringProcess(data.user_id, config.mangers) ? cmd_run(command[1]) : send(msg1)
                break;
            default:
                send("\u672A\u77E5\u7684\u547D\u4EE4,\u8BF7\u8F93\u5165".concat(config_1.default.cmd_prefix).concat(config_1.default.cmd.help, "\u4EE5\u83B7\u53D6\u5E2E\u52A9"));
        }
    };
    var cmd_help = function () {
        var message = "\u67E5\u770B\u5E2E\u52A9:".concat(config_1.default.cmd_prefix).concat(config_1.default.cmd.help, "\n");
        message += "\u67E5\u8BE2\u670D\u52A1\u5668\u72B6\u6001:".concat(config_1.default.cmd_prefix).concat(config_1.default.cmd.status, "\n");
        // message += `查询主机状态:${config.cmd_prefix}${config.cmd.state}\n`;
        message += "\u4EC5\u7BA1\u7406\u5458\u53EF\u7528:\n";
        message += "\u542F\u52A8\u670D\u52A1\u5668:".concat(config_1.default.cmd_prefix).concat(config_1.default.cmd.start, "\n");
        message += "\u5173\u95ED\u670D\u52A1\u5668:".concat(config_1.default.cmd_prefix).concat(config_1.default.cmd.stop, "\n");
        message += "\u91CD\u542F\u670D\u52A1\u5668:".concat(config_1.default.cmd_prefix).concat(config_1.default.cmd.rest, "\n");
        message += "\u7EC8\u6B62\u670D\u52A1\u5668:".concat(config_1.default.cmd_prefix).concat(config_1.default.cmd.stopex, "\n");
        message += "\u8FD0\u884C\u6E38\u620F\u6307\u4EE4:".concat(config_1.default.cmd_prefix).concat(config_1.default.cmd.run, " [Command]\n");
        message += "\u53D1\u9001\u804A\u5929:".concat(config_1.default.chat_prefix, "[Message]");
        send(message, true);
    };
    var cmd_status = function () { return __awaiter(void 0, void 0, void 0, function () {
        var d, message;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, needle_1.default)('get', "https://api.imlolicon.tk/api/motdpe?ip=".concat(ip, "&port=").concat(config_1.default.info.port))];
                case 1:
                    d = (_a.sent()).body;
                    message = (d.code === 500 ? "\u670D\u52A1\u5668\u5730\u5740:".concat(d.data.ip, "\n\u670D\u52A1\u5668\u7AEF\u53E3:").concat(d.data.port, "\n\u670D\u52A1\u5668\u63D0\u793A:").concat(d.data.motd, "\n\u534F\u8BAE\u7248\u672C:").concat(d.data.argeement, "\n\u6E38\u620F\u7248\u672C:").concat(d.data.version, "\n\u6E38\u620F\u6A21\u5F0F:").concat(d.data.gamemode, "\n\u5728\u7EBF\u4EBA\u6570:").concat(d.data.online, "/").concat(d.data.max, "\nDelay:").concat(d.data.delay) : '服务器不在线');
                    send(message);
                    return [2 /*return*/];
            }
        });
    }); };
    var cmd_state = function () { return __awaiter(void 0, void 0, void 0, function () {
        var data, message;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, mcsm_api('overview')];
                case 1:
                    data = (_a.sent()).body;
                    message = '';
                    if (data.status === 200) {
                        message += "\u7CFB\u7EDF\u5185\u6838:".concat(data.data.system.type, "\n");
                        message += "\u7CFB\u7EDF\u7248\u672C:".concat(data.data.system.version, "\n");
                        message += "NODE\u7248\u672C:".concat(data.data.system.node, "\n");
                        message += "\u4E3B\u673A\u540D\u5B57:".concat(data.data.system.hostname, "\n");
                        message += "CPU:".concat(data.data.process.cpu, "\n");
                        message += "\u5185\u5B58:".concat(data.data.process.memory);
                    }
                    else {
                        message = '主机状态信息获取失败';
                    }
                    send(message);
                    return [2 /*return*/];
            }
        });
    }); };
    var cmd_start = function () { return __awaiter(void 0, void 0, void 0, function () {
        var data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    send('服务器启动中...');
                    return [4 /*yield*/, mcsm_api('protected_instance/open')];
                case 1:
                    data = (_a.sent()).body;
                    send(data.status === 200 ? '服务器启动成功' : '服务器启动失败' + (typeof (data.data) === 'string' ? data.data : null));
                    return [2 /*return*/];
            }
        });
    }); };
    var cmd_stop = function () { return __awaiter(void 0, void 0, void 0, function () {
        var data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    send('服务器关闭中...');
                    return [4 /*yield*/, mcsm_api('protected_instance/stop')];
                case 1:
                    data = (_a.sent()).body;
                    send(data.status === 200 ? '服务器关闭成功' : '服务器关闭失败');
                    return [2 /*return*/];
            }
        });
    }); };
    var cmd_rest = function () { return __awaiter(void 0, void 0, void 0, function () {
        var data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    send('服务器重启中...');
                    return [4 /*yield*/, mcsm_api('protected_instance/restart')];
                case 1:
                    data = (_a.sent()).body;
                    send(data.status === 200 ? '服务器重启成功' : '服务器启重启失败');
                    return [2 /*return*/];
            }
        });
    }); };
    var cmd_stopex = function () { return __awaiter(void 0, void 0, void 0, function () {
        var data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, mcsm_api('protected_instance/kill')];
                case 1:
                    data = (_a.sent()).body;
                    send(data.status === 200 ? '服务器终止成功' : '服务器终止失败');
                    return [2 /*return*/];
            }
        });
    }); };
    // Timer
    setInterval(function () {
        fs_1.default.readFile("".concat(Const._DATA_PLUGIN_PATH, "/ip.ini"), 'utf-8', function (err, data) {
            if (err) {
                console.error(err);
                return;
            }
            (0, needle_1.default)('get', _get_own_ip_url).then(function (res) {
                var temp = res.body.split('：')[1];
                temp = temp.split(' ')[0];
                if (data !== temp) {
                    log("IP\u53D1\u751F\u4E86\u6539\u53D8 [".concat(data, "] -> [").concat(temp, "]"));
                    send("\u68C0\u6D4B\u63D0\u9192:\u670D\u52A1\u5668IP\u5DF2\u53D1\u751F\u6539\u53D8!\n[".concat(data, "] -> [").concat(temp, "]\n\u8BF7\u53CA\u65F6\u66F4\u6539\u6E38\u620F\u5185IP"));
                    ip = temp;
                    fs_1.default.writeFile("".concat(Const._DATA_PLUGIN_PATH, "/ip.ini"), temp, function () { });
                }
            });
        });
    }, 1000 * config_1.default.other.check_ip_time);
    // Wss
    (0, wss_1.wss)(Event, send);
    Event.listen("on_group_msg", method);
};
exports.PLUGIN = PLUGIN;
// log('MCServer 加载成功');
//# sourceMappingURL=index.js.map