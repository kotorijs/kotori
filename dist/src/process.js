"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exec = exports.execute = void 0;
var child_process_1 = __importDefault(require("child_process"));
var execute = function (cmd, args) { return child_process_1.default.spawn(cmd, {
    detached: true,
    windowsHide: true,
    stdio: 'ignore'
}); };
exports.execute = execute;
var exec = function (file, info) { return child_process_1.default.exec(file, function (error) {
    if (error) {
        console.error(error);
    }
    else if (info) {
        console.log(info);
    }
}); };
exports.exec = exec;
exports.default = {
    execute: exports.execute,
    exec: exports.exec
};
//# sourceMappingURL=process.js.map