"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PLUGIN = exports.PLUGIN_INFO = void 0;
exports.PLUGIN_INFO = {
    name: 'demo示例插件'
};
var PLUGIN = function (Event, Api) {
    /* 处理函数 */
    function handel(data) {
        /* 处理消息 */
        var message = data.message.split('echo ')[1];
        /* 发送 */
        message && Api.send_group_msg(message, data.group_id);
    }
    /* 事件监听注册 */
    Event.listen("on_group_msg", handel);
    Event.listen("on_private_msg", function (data) {
        var message = data.message.split('print ')[1];
        message && Api.send_private_msg(message, data.user_id);
    });
};
exports.PLUGIN = PLUGIN;
//# sourceMappingURL=demo.js.map