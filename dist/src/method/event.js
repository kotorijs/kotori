"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Event = /** @class */ (function () {
    function Event() {
        var _this = this;
        this.on_private_msg = function (data, callback) {
            if (data.post_type === 'message' && data.message_type === 'private') {
                callback(data);
            }
        };
        this.on_group_msg = function (data, callback) {
            if (data.post_type === 'message' && data.message_type === 'group') {
                callback(data);
            }
        };
        this.handleEventList = {
            on_private_msg: this.on_private_msg,
            on_group_msg: this.on_group_msg
        };
        this.registerEvent = function (list, eventName, callback) {
            list.push([eventName, callback]);
        };
        this.handleEvent = function (list, data) {
            var eventData = {
                post_type: data.post_type,
                message_type: data.message_type,
                time: data.time,
                self_id: data.self_id,
                sub_type: data.sub_type,
                message: data.message,
                user_id: data.user_id,
                group_id: data.group_id,
                sender: data.sender
            };
            list.forEach(function (element) {
                _this.handleEventList[element[0]](eventData, element[1]);
            });
        };
    }
    return Event;
}());
exports.default = Event;
//# sourceMappingURL=event.js.map