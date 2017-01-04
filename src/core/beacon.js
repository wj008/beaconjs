"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
var path = require('path');
var beacon_kit_1 = require("./beacon_kit");
var http_context_1 = require("./http_context");
var controller_1 = require("../controllers/controller");
var sdopx_1 = require("sdopx");
var fs = require("fs");
/**
 * 核心框架类
 */
var Beacon = (function (_super) {
    __extends(Beacon, _super);
    function Beacon() {
        _super.apply(this, arguments);
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
        return __awaiter(this, void 0, void 0, function* () {
            var context = new http_context_1.HttpContext(req, res);
            var Route = Beacon.Route;
            var args = Route.parseUrl(context.pathname);
            if (args == null || args.ctl == '') {
                Beacon.displayError(context, 404, 'then page url:"' + context.url + '" is not foult!');
                return;
            }
            var ctlClass = Route.getController(args.app, args.ctl);
            if (ctlClass == null) {
                Beacon.displayError(context, 404, 'then page url:"' + context.url + '" is not foult!');
                return;
            }
            try {
                yield context.parsePayload(Beacon.getConfig('default_encoding', 'utf-8'));
                var ctlobj = yield new ctlClass(context);
                var act = Beacon.lowerFirst(Beacon.toCamel(args.act || 'index')) + 'Action';
                if (ctlobj[act] && Beacon.isFunction(ctlobj[act])) {
                    yield ctlobj[act]();
                    context.end();
                }
                else {
                    Beacon.displayError(context, 404, 'then page url:"' + context.url + '" is not foult!');
                }
            }
            catch (e) {
                Beacon.displayError(context, 500, e);
                return;
            }
        });
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
        console.error(error);
    };
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
    //框架版本号
    Beacon.version = (function () {
        var packageFile = Beacon.BEACON_PATH + "/package.json";
        var version = JSON.parse(fs.readFileSync(packageFile, 'utf-8')).version;
        return version;
    })();
    return Beacon;
}(beacon_kit_1.Beaconkit));
exports.Beacon = Beacon;
global['Beacon'] = Object.create(Beacon);
//# sourceMappingURL=beacon.js.map