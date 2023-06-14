"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadAll = exports.load = void 0;
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var function_1 = require("./function");
var load = function (pluginName) {
    return Promise.resolve("".concat("".concat(function_1._const._PLUGIN_PATH, "\\").concat(pluginName))).then(function (s) { return __importStar(require(s)); });
};
exports.load = load;
var loadAll = function () {
    var fileList = fs_1.default.readdirSync(function_1._const._PLUGIN_PATH);
    var entityList = new Set();
    fileList.forEach(function (fileName) {
        var filedir = path_1.default.join(function_1._const._PLUGIN_PATH + '\\', fileName);
        var fileStat = fs_1.default.statSync(filedir);
        if (fileStat.isFile() && fileName !== 'index.ts' && fileName !== 'index.js') {
            var tempArr = fileName.split('.');
            var fileType = tempArr[tempArr.length - 1];
            if (fileType === 'ts' || fileType === 'js') {
                var entity = (0, exports.load)(fileName);
                entity && entityList.add([entity, fileName, "".concat(function_1._const._ROOT_PATH, "\\plugins\\").concat(fileName)]);
            }
        }
        else if (fileStat.isDirectory()) {
            var Path_1 = "".concat(function_1._const._PLUGIN_PATH, "\\").concat(fileName, "\\");
            var info = void 0;
            if (fs_1.default.existsSync("".concat(Path_1, "manifest.json"))) {
                info = (0, function_1.loadConfig)("".concat(Path_1, "manifest.json"));
            }
            if (fs_1.default.existsSync("".concat(Path_1, "index.ts"))) {
                var entity = (0, exports.load)("".concat(fileName, "\\index.ts"));
                entity && entityList.add([entity, fileName, "".concat(Path_1, "index.ts"), info]);
            }
            else if (fs_1.default.existsSync("".concat(Path_1, "index.js"))) {
                var entity = (0, exports.load)("".concat(fileName, "\\index.js"));
                entity && entityList.add([entity, fileName, "".concat(Path_1, "index.js"), info]);
            }
        }
    });
    return entityList;
};
exports.loadAll = loadAll;
exports.default = {
    load: exports.load,
    loadAll: exports.loadAll
};
//# sourceMappingURL=plugin.js.map