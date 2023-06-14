"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
exports.Kotori = void 0;
var main_1 = require("../main");
var api_1 = __importDefault(require("./method/api"));
var Kotori = /** @class */ (function (_super) {
    __extends(Kotori, _super);
    function Kotori(connectConfig, callback) {
        var _this = _super.call(this) || this;
        _this.config = { connect: { mode: 'Http', port: 0 } };
        /* Connect */
        _this.connectConfig = new Object;
        _this.Api = new Object;
        _this.Event = {
            listen: function (eventName, callback) { return _this.EventPrototype.registerEvent(_this._pluginEventList, eventName, callback); }
        };
        _this.connect = function () {
            var _a;
            _this.connectConfig = {
                Http: [
                    _this.config.connect.url, _this.config.connect.port, _this.config.connect.retry_time, _this.config.connect.reverse_port
                ],
                Ws: [
                    _this.config.connect.url, _this.config.connect.port, _this.config.connect.retry_time
                ],
                WsReverse: [_this.config.connect.port]
            };
            new ((_a = _this.connectPrototype).bind.apply(_a, __spreadArray(__spreadArray([void 0], _this.connectConfig[_this.config.connect.mode], false), [function (connectDemo) {
                    /* 接口实例化 */
                    _this.Api = new api_1.default(connectDemo.send);
                    _this.callback(_this.Api, _this.Event);
                    /* 监听主进程 */
                    connectDemo.listen(function (data) {
                        if (!('message' in data))
                            return;
                        /* 每次心跳时运行事件监听 */
                        _this.runAllEvent(data);
                    });
                }], false)))();
            console.info("Current connection mode: ".concat(_this.config.connect.mode));
        };
        _this.create = function () { return _this.run(); };
        _this.config = {
            connect: connectConfig
        };
        _this.callback = callback;
        return _this;
    }
    return Kotori;
}(main_1.Main));
exports.Kotori = Kotori;
exports.default = Kotori;
//# sourceMappingURL=index.js.map