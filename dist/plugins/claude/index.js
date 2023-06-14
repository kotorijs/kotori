"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PLUGIN = void 0;
var function_1 = require("../../src/function");
var config_1 = __importDefault(require("./config"));
var getClaude = function (question, conversationId) {
    var url = 'https://ol7t35.laf.dev/claude-api';
    url += "?toekn=".concat(config_1.default.api.token);
    url += "&bot=".concat(config_1.default.api.bot);
    url += "&chatId=".concat(config_1.default.api.chatId);
    url += "&question=".concat(question);
    conversationId && (url += "&conversationId=".concat(conversationId));
    return fetch(url, {
        method: 'GET',
    }).then(function (resolve) { return resolve.json(); });
};
var PLUGIN = function (Event, Api, Const) {
    var conversationIdFile = "".concat(Const._DATA_PLUGIN_PATH, "\\conversationId.json");
    var conversationIdList = (0, function_1.loadConfig)(conversationIdFile);
    Event.listen("on_group_msg", method_group);
    Event.listen("on_private_msg", method_private);
    function method_group(data) {
        if (!(0, function_1.stringProcess)(data.group_id, config_1.default.list.groups))
            return;
        if (!(0, function_1.stringProcess)(data.message, config_1.default.groupd_prefix))
            return;
        var message = (0, function_1.stringSplit)(data.message, config_1.default.groupd_prefix);
        getClaude(message, conversationIdList.groups[data.group_id]).then(function (d) {
            console.log(d, conversationIdList, message);
            if (d.code === 0) {
                Api.send_group_msg(d.msg, data.group_id);
                if (!conversationIdList.groups[data.group_id] && conversationIdList.groups[data.group_id] !== d.conversationId) {
                    conversationIdList.groups[data.group_id] = d.conversationId;
                    (0, function_1.saveConfig)(conversationIdFile, conversationIdList);
                }
            }
        });
    }
    function method_private(data) {
        if (!(0, function_1.stringProcess)(data.user_id, config_1.default.list.users))
            return;
        getClaude(data.message, conversationIdList.users[data.user_id]).then(function (d) {
            console.log(d, conversationIdList, data.message);
            if (d.code === 0) {
                Api.send_private_msg(d.msg, data.user_id);
                if (!conversationIdList.groups[data.user_id] && conversationIdList.groups[data.user_id] !== d.conversationId) {
                    conversationIdList.groups[data.user_id] = d.conversationId;
                    (0, function_1.saveConfig)(conversationIdFile, conversationIdList);
                }
            }
        });
    }
};
exports.PLUGIN = PLUGIN;
//# sourceMappingURL=index.js.map