"use strict";
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
exports.wss = void 0;
var ws_1 = __importDefault(require("ws"));
var config_1 = __importDefault(require("./config"));
var function_1 = require("../../src/function");
var log = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return console.log.apply(console, __spreadArray(['[MCServer]'], args, false));
};
var wss = function (Event, send) {
    var WebSocketServer = new ws_1.default.Server(config_1.default.wss);
    WebSocketServer.on('connection', function (ws) {
        log('MCServer: Client connected successful');
        var send_wss = function (action, params) {
            var JSONStr = JSON.stringify({
                action: action,
                params: params
            });
            ws.send(JSONStr);
            log("MCServer WSS Send: ".concat(JSONStr));
        };
        var HandleWscMsg = function (d) {
            var message = '';
            switch (d.event) {
                case 'on_pre_join':
                    message = "\u73A9\u5BB6 [".concat(d.data.name, "] \u5F00\u59CB\u8FDE\u63A5\u670D\u52A1\u5668");
                    break;
                case 'on_join':
                    message = "\u73A9\u5BB6 [".concat(d.data.name, "] \u8FDB\u5165\u4E86\u670D\u52A1\u5668");
                    break;
                case 'on_left':
                    message = "\u73A9\u5BB6 [".concat(d.data.name, "] \u79BB\u5F00\u4E86\u670D\u52A1\u5668");
                    break;
                case 'on_player_die':
                    message = "\u73A9\u5BB6 [".concat(d.data.name, "] ").concat(d.data.source ? "\u6B7B\u4E8E [".concat(d.data.source, "] ") : '意外的死亡');
                    break;
                case 'on_chat':
                    message = "\u73A9\u5BB6 [".concat(d.data.name, "] \u8BF4: ").concat(d.data.msg);
                    break;
                case 'on_command':
                    message = "\u6307\u4EE4\u6267\u884C".concat(d.data.success ? '成功' : '失败', ": ").concat(d.data.output);
                    break;
            }
            message && send(message);
        };
        var method_wss = function (data) {
            if (data.group_id !== config_1.default.group_id)
                return;
            if ((0, function_1.stringProcess)(data.message, config_1.default.chat_prefix)) {
                send_wss('to_chat', {
                    groupname: config_1.default.info.group_name,
                    nickname: data.sender.nickname,
                    qq: data.user_id,
                    msg: data.message.split(config_1.default.chat_prefix)[1]
                });
                return;
            }
            if (!(0, function_1.stringProcess)(data.message, config_1.default.cmd_prefix))
                return;
            var command = (0, function_1.stringSplit)(data.message, config_1.default.cmd_prefix);
            switch (true) {
                case (0, function_1.stringProcess)(command, config_1.default.cmd.run):
                    (0, function_1.stringProcess)(data.user_id, config_1.default.mangers) ? cmd_run(command) : send(config_1.default.message.not_manger);
                    break;
                    ;
            }
        };
        var cmd_run = function (cmd) {
            var command = (0, function_1.stringSplit)(cmd, "".concat(config_1.default.cmd.run, " "));
            send_wss('to_command', { command: command });
            send("\u6307\u4EE4\u53D1\u9001\u6210\u529F ".concat(command));
        };
        ws.on('message', function (message) {
            var data = JSON.parse(message);
            log('MCServer WSS Receive: ' + message);
            HandleWscMsg(data);
        });
        Event.listen("on_group_msg", method_wss);
    });
};
exports.wss = wss;
//# sourceMappingURL=wss.js.map