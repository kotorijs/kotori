"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var ws_1 = __importDefault(require("ws"));
var WsReverse = /** @class */ (function () {
    function WsReverse(port, callback) {
        var _this = this;
        this.set = function () {
            _this.wss.on('connection', function (ws) {
                console.info('WebSocket client successfully connected');
                _this.listen = function (callback) { return ws.on('message', function (data) {
                    try {
                        callback(JSON.parse(data));
                    }
                    catch (e) {
                        console.log(e);
                    }
                }); };
                _this.send = function (action, params) {
                    ws.send(JSON.stringify({ action: action, params: params }));
                };
                _this.callback({ send: _this.send, listen: _this.listen });
            });
            console.info("WebScoket server successfully established on ws://127.0.0.1:".concat(_this.port));
        };
        this.send = Function;
        this.listen = Function;
        this.port = port;
        this.wss = new ws_1.default.Server({ port: this.port });
        this.callback = callback;
        this.set();
    }
    return WsReverse;
}());
exports.default = WsReverse;
//# sourceMappingURL=ws-reverse.js.map