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
exports.PLUGIN = void 0;
var config_1 = __importDefault(require("./config"));
var needle_1 = __importDefault(require("needle"));
var url = [
    'https://imlolicon.tk/api/seimg/v2/',
    'https://imlolicon.tk/api/huimg/'
];
function arr(val) {
    var temp = '';
    val.forEach(function (value) {
        temp += value;
    });
    return temp;
}
var log = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return console.log.apply(console, __spreadArray(['[SexImg]'], args, false));
};
var PLUGIN = function (Event, Api) {
    var params = {
        r18: config_1.default.r18 ? '1' : '0'
    };
    var method = function (data) {
        function send(msg) {
            data.message_type === 'group' ? Api.send_group_msg(msg, data.group_id) : Api.send_private_msg(msg, data.user_id);
        }
        if (data.message === '.sex' || data.message === '.sexh') {
            send('涩图来咯...Σ(￣ロ￣lll)');
            var type_1 = data.message == '.sex' ? 0 : 1;
            (0, needle_1.default)('get', url[type_1], params).then(function (d) {
                d = d.body;
                if (d.code !== 500) {
                    send('涩图获取失败(╥_╥)\nCode:' + d.code);
                    log(d);
                    return;
                }
                var dd = d.data, msg;
                if (type_1 === 0) {
                    dd = dd[0];
                    msg = "PID:".concat(dd.pid, "\n\u6807\u9898:").concat(dd.title, "\n\u4F5C\u8005:").concat(dd.author, "\n\u6807\u7B7E:").concat(arr(dd.tags), "\n[CQ:image,file=").concat(dd.url, "]");
                }
                else {
                    msg = "\u6807\u7B7E:".concat(arr(dd.tag), "\n[CQ:image,file=").concat(dd.url, "]");
                }
                log(msg);
                send(msg);
            }).catch(function (err) {
                send('发送失败,未知的错误(ノДＴ)');
                log(err);
            });
        }
        else if (data.message === '.sexc') {
            send("\u3010SEX IMG | \u914D\u7F6E\u9879\u3011\n\u56FE\u7247\u6E90:\n.sex [Pixiv]\n.sexh [\u7CCA\u72F8IMG]\n\u975E\u5168\u5E74\u9F84 [".concat(config_1.default.r18 ? '开' : '关', "]\nBy Hotaru"));
        }
    };
    Event.listen('on_private_msg', method);
    Event.listen('on_group_msg', method);
};
exports.PLUGIN = PLUGIN;
//# sourceMappingURL=index.js.map