"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
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
exports.Main = void 0;
/*
 * @Author: Biyuehu biyuehuya@gmail.com
 * @Blog: http://imlolicon.tk
 * @Date: 2023-05-28 10:46:41
 */
var domain_1 = __importDefault(require("domain"));
var process_1 = __importDefault(require("process"));
var process_2 = require("./src/process");
var Lib = __importStar(require("./src/function"));
var server_1 = __importDefault(require("./src/server"));
var api_1 = __importDefault(require("./src/method/api"));
var event_1 = __importDefault(require("./src/method/event"));
var plugin_1 = __importDefault(require("./src/plugin"));
var Main = /** @class */ (function () {
    function Main() {
        var _this = this;
        /* 设置全局常量 */
        this._const = Lib._const;
        this._config = Lib.loadConfig("".concat(this._const._ROOT_PATH, "\\config.yml"), 'yaml');
        /* public constructor() {
            // 构造你mb的函数
        } */
        this.run = function () {
            // this.runGocqhttp;
            _this.rewriteConsole();
            _this.connect();
        };
        /* 启动go-cqhttp */
        this.runGocqhttp = function () {
            (0, process_2.exec)("./go-cqhttp/go-cqhttp.exe", 'Go-cqhttp started sucessfully');
            (0, process_2.execute)("./go-cqhttp/go-cqhttp.bat");
        };
        /* 更改Console */
        this._console = {
            log: console.log,
            info: console.info,
            warn: console.warn,
            error: console.error,
        };
        this.rewriteConsole = function () {
            Object.keys(_this._console).forEach(function (Key) {
                console[Key] = function () {
                    var _a;
                    var args = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        args[_i] = arguments[_i];
                    }
                    return (_a = Lib._console)[Key].apply(_a, __spreadArray([_this._console[Key]], args, false));
                };
            });
            process_1.default.on('unhandledRejection', function (err) {
                console.error("[System] ".concat(err));
            });
        };
        /* Connect */
        this.modeList = {
            'http': 'Http',
            'ws': 'Ws',
            'ws-reverse': 'WsReverse'
        };
        this.connectPrototype = server_1.default[this.modeList[this._config.connect.mode]];
        this.connectConfig = {
            Http: [
                this._config.connect['http'].url, this._config.connect['http'].port, this._config.connect['http']['retry-time'], this._config.connect['http']['reverse-port']
            ],
            Ws: [
                this._config.connect['ws'].url, this._config.connect['ws'].port, this._config.connect['ws']['retry-time']
            ],
            WsReverse: [this._config.connect['ws-reverse'].port]
        };
        this.EventPrototype = new event_1.default;
        this._Api = new Object;
        this._Event = new Object;
        this.connect = function () {
            var _a;
            var connectMode = _this.modeList[_this._config.connect.mode];
            new ((_a = _this.connectPrototype).bind.apply(_a, __spreadArray(__spreadArray([void 0], _this.connectConfig[connectMode], false), [function (connectDemo) {
                    /* 接口实例化 */
                    _this._Api = new api_1.default(connectDemo.send);
                    /* 事件注册实例化 */
                    _this._Event = {
                        listen: function (eventName, callback) { return _this.EventPrototype.registerEvent(_this._pluginEventList, eventName, callback); }
                    };
                    /* 错误捕获模式下运行插件 */
                    _this.catchError();
                    _this.domainDemo.run(function () { return _this.runAllPlugin(); });
                    /* 监听主进程 */
                    connectDemo.listen(function (data) {
                        // if (data.post_type !== 'meta_event') console.info(data.post_type);
                        if (!('message' in data))
                            return;
                        // 内置操作
                        if (data.post_type === 'message' && data.user_id === _this._config.superadmin && data.message_type === 'private') {
                            switch (true) {
                                case Lib.stringProcess(data.message, _this._config.commandlist.reload):
                                    _this._pluginEntityList.forEach(function (element) {
                                        // delete require.cache[require.resolve(`./plugins/test.ts`)];
                                    });
                                    // this.runAllPlugin(EventDemo, Api);
                                    // this.Api.send_private_msg('Successfully hot reloaded all plugins', data.user_id)
                                    break;
                            }
                        }
                        /* 每次心跳时运行事件监听 */
                        _this.runAllEvent(data);
                    });
                }], false)))();
            console.info("Current connection mode: ".concat(connectMode));
        };
        /* 捕获错误 */
        this.domainDemo = domain_1.default.create();
        this.catchError = function () { return _this.domainDemo.on('error', function (err) {
            console.error("[Plugin] ".concat(err));
        }); };
        /* 插件Plugin */
        this._pluginEventList = new Array;
        this.runAllEvent = function (data) { return _this.EventPrototype.handleEvent(_this._pluginEventList, data); };
        this._pluginEntityList = new Set();
        this.runAllPlugin = function () {
            _this._pluginEntityList = plugin_1.default.loadAll();
            var num = 0;
            _this._pluginEntityList.forEach(function (element) { return __awaiter(_this, void 0, void 0, function () {
                var demo, PLUGIN_INFO, content;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, element[0]];
                        case 1:
                            demo = _b.sent();
                            if (demo.PLUGIN) {
                                demo.PLUGIN(this._Event, this._Api, {
                                    _CONFIG_PLUGIN_PATH: "".concat(Lib._const._CONFIG_PATH, "\\plugins\\").concat(element[1]),
                                    _DATA_PLUGIN_PATH: "".concat(Lib._const._DATA_PATH, "\\plugins\\").concat(element[1])
                                });
                                PLUGIN_INFO = (_a = element[3]) !== null && _a !== void 0 ? _a : demo.PLUGIN_INFO;
                                if (PLUGIN_INFO) {
                                    content = '';
                                    if (PLUGIN_INFO.name)
                                        content += "".concat(PLUGIN_INFO.name, " Plugin loaded successfully ");
                                    if (PLUGIN_INFO.version)
                                        content += "Version: ".concat(PLUGIN_INFO.version, " ");
                                    if (PLUGIN_INFO.license)
                                        content += "License: ".concat(PLUGIN_INFO.license, " ");
                                    if (PLUGIN_INFO.author)
                                        content += "By ".concat(PLUGIN_INFO.author);
                                    console.info(content);
                                }
                                num++;
                            }
                            return [2 /*return*/];
                    }
                });
            }); });
            console.info("Successfully loaded ".concat(num, " plugins"));
        };
    }
    return Main;
}());
exports.Main = Main;
(new Main()).run();
exports.default = Main;
//# sourceMappingURL=main.js.map