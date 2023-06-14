"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// import wsReverse from "./ws-reverse";
var http_1 = __importDefault(require("./http"));
var ws_1 = __importDefault(require("./ws"));
var ws_reverse_1 = __importDefault(require("./ws-reverse"));
exports.default = {
    Http: http_1.default,
    Ws: ws_1.default,
    WsReverse: ws_reverse_1.default
};
//# sourceMappingURL=index.js.map