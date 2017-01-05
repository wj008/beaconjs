"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t;
    return { next: verb(0), "throw": verb(1), "return": verb(2) };
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var path = require("path");
var beacon_kit_1 = require("./beacon_kit");
var http_context_1 = require("./http_context");
var controller_1 = require("../controllers/controller");
var memory_1 = require("../adapter/session/memory");
var file_1 = require("../adapter/session/file");
var sdopx_1 = require("sdopx");
var fs = require("fs");
/**
 * 核心框架类
 */
var Beacon = (function (_super) {
    __extends(Beacon, _super);
    function Beacon() {
        return _super.apply(this, arguments) || this;
    }
    //获取配置项
    Beacon.getConfig = function (key, def) {
        return Beacon.Config.get(key, def);
    };
    //设置配置项
    Beacon.setConfig = function (key, def) {
        Beacon.Config.set(key, def);
    };
    Beacon.init = function (runpath) {
        Beacon.RUNTIME_PATH = runpath || Beacon.BEACON_PATH;
        Beacon.ROUTE_PATH = path.join(Beacon.RUNTIME_PATH, 'route');
        Beacon.CONFIG_PATH = path.join(Beacon.RUNTIME_PATH, 'config');
        Beacon.VIEW_PATH = path.join(Beacon.RUNTIME_PATH, 'views');
        var Config = require('./config').Config;
        Beacon.Config = new Config(Beacon.CONFIG_PATH);
        Beacon.Config.gload('Beacon');
        var Route = require('./route').Route;
        Beacon.Route = Route;
        return this;
    };
    //获取http对象
    Beacon.run = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var context, Route, args, ctlClass, ctlobj, act, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        context = new http_context_1.HttpContext(req, res);
                        Route = Beacon.Route;
                        args = Route.parseUrl(context.pathname);
                        if (args == null || args.ctl == '') {
                            Beacon.displayError(context, 404, 'then page url:"' + context.url + '" is not foult!');
                            return [2 /*return*/];
                        }
                        ctlClass = Route.getController(args.app, args.ctl);
                        if (ctlClass == null) {
                            Beacon.displayError(context, 404, 'then page url:"' + context.url + '" is not foult!');
                            return [2 /*return*/];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 7, , 8]);
                        return [4 /*yield*/, context.parsePayload(Beacon.getConfig('default_encoding', 'utf-8'))];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, new ctlClass(context)];
                    case 3:
                        ctlobj = _a.sent();
                        act = Beacon.lowerFirst(Beacon.toCamel(args.act || 'index')) + 'Action';
                        if (!(ctlobj[act] && Beacon.isFunction(ctlobj[act])))
                            return [3 /*break*/, 5];
                        return [4 /*yield*/, ctlobj[act]()];
                    case 4:
                        _a.sent();
                        context.end();
                        return [3 /*break*/, 6];
                    case 5:
                        Beacon.displayError(context, 404, 'then page url:"' + context.url + '" is not foult!');
                        _a.label = 6;
                    case 6: return [3 /*break*/, 8];
                    case 7:
                        e_1 = _a.sent();
                        Beacon.displayError(context, 500, e_1);
                        return [2 /*return*/];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    Beacon.regSessionType = function (type, typeClass) {
        Beacon._sessionType[type] = typeClass;
    };
    Beacon.getSessionInstance = function (type) {
        if (type === void 0) { type = 'file'; }
        var typeClass = Beacon._sessionType[type] || memory_1.MemorySession;
        if (!Beacon._sessionUsed[type]) {
            Beacon._sessionUsed[type] = typeClass;
        }
        return new typeClass();
    };
    //显示错误
    Beacon.displayError = function (context, status, error) {
        if (status === void 0) { status = 500; }
        if (typeof error == 'string') {
            error = new Error(error);
        }
        var sdopx = new sdopx_1.Sdopx();
        sdopx.setTemplateDir(Beacon.VIEW_PATH);
        var title = '';
        if (status == 404) {
            title = 'NotFound.';
        }
        else if (status == 500) {
            title = 'Beacon Error.';
        }
        sdopx.assign('title', title);
        sdopx.assign('message', error.message);
        sdopx.assign('status', status);
        sdopx.assign('error', error);
        var content = sdopx.display('error');
        context.setStatus(status);
        context.end(content);
        if (status == 500) {
            console.error(error);
        }
    };
    Beacon.gc = function () {
        if (Beacon._gc_timer) {
            clearInterval(Beacon._gc_timer);
            Beacon._gc_timer = null;
        }
        Beacon._gc_timer = setInterval(function () {
            for (var key in Beacon._sessionUsed) {
                var typeClass = Beacon._sessionUsed[key] || null;
                if (typeClass != null && Beacon.isFunction(typeClass.gc)) {
                    typeClass.gc();
                }
            }
        }, 5000);
    };
    return Beacon;
}(beacon_kit_1.Beaconkit));
//库目录
Beacon.BEACON_LIB_PATH = path.dirname(__dirname);
//项目目录
Beacon.BEACON_PATH = path.dirname(Beacon.BEACON_LIB_PATH);
//运行时目录
Beacon.RUNTIME_PATH = Beacon.BEACON_PATH;
Beacon.ROUTE_PATH = path.join(Beacon.RUNTIME_PATH, 'route');
Beacon.CONFIG_PATH = path.join(Beacon.RUNTIME_PATH, 'config');
//模板目录
Beacon.VIEW_PATH = path.join(Beacon.RUNTIME_PATH, 'views');
//配置器
Beacon.Config = null;
//路由器
Beacon.Route = null;
Beacon.Controller = controller_1.Controller;
Beacon._sessionType = {};
Beacon._sessionUsed = {};
Beacon._gc_timer = null;
//框架版本号
Beacon.version = (function () {
    var packageFile = Beacon.BEACON_PATH + "/package.json";
    var version = JSON.parse(fs.readFileSync(packageFile, 'utf-8')).version;
    return version;
})();
exports.Beacon = Beacon;
Beacon.regSessionType('memory', memory_1.MemorySession);
Beacon.regSessionType('file', file_1.FileSession);
global['Beacon'] = Object.create(Beacon);
//# sourceMappingURL=beacon.js.map