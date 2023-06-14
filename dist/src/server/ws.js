"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var ws_1 = __importDefault(require("ws"));
var Ws = /** @class */ (function () {
    function Ws(url, port, retry_time, callback) {
        if (retry_time === void 0) { retry_time = 10; }
        var _this = this;
        this.connect = function () {
            _this.wsc.on('error', function (error) {
                console.error(error);
            });
            _this.wsc.on('open', function () {
                _this.callback({ send: _this.send, listen: _this.listen });
                console.info('WebSocket server successfully connected');
            });
            _this.wsc.on('close', function () {
                setTimeout(function () {
                    _this.wsc.close();
                    _this.wsc = new ws_1.default("".concat(_this.url, ":").concat(_this.port));
                    _this.connect();
                }, _this.retry_time * 1000);
                console.warn("Start reconnecting in ".concat(_this.retry_time, " seconds..."));
            });
        };
        this.send = function (action, params) {
            _this.wsc.send(JSON.stringify({ action: action, params: params }));
        };
        this.listen = function (callback) {
            _this.wsc.on('message', function (data) {
                try {
                    callback(JSON.parse(data));
                }
                catch (e) {
                    console.error(e, 111);
                }
            });
        };
        this.url = url;
        this.port = port;
        this.retry_time = retry_time;
        this.wsc = new ws_1.default("".concat(this.url, ":").concat(this.port));
        this.callback = callback;
        this.connect();
    }
    return Ws;
}());
exports.default = Ws;
//# sourceMappingURL=ws.js.map