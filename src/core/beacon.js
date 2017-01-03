"use strict";
const path = require("path");
const beacon_kit_1 = require("./beacon_kit");
const http_context_1 = require("./http_context");
const controller_1 = require("../controllers/controller");
const sdopx_1 = require("sdopx");
const fs = require("fs");
/**
 * 核心框架类
 */
class Beacon extends beacon_kit_1.Beaconkit {
    //获取配置项
    static getConfig(key, def) {
        return Beacon.Config.get(key, def);
    }
    //设置配置项
    static setConfig(key, def) {
        Beacon.Config.set(key, def);
    }
    static init(runpath) {
        Beacon.RUNTIME_PATH = runpath || Beacon.BEACON_PATH;
        Beacon.ROUTE_PATH = path.join(Beacon.RUNTIME_PATH, 'route');
        Beacon.CONFIG_PATH = path.join(Beacon.RUNTIME_PATH, 'config');
        Beacon.VIEW_PATH = path.join(Beacon.RUNTIME_PATH, 'views');
        let { Config } = require('./config');
        Beacon.Config = new Config(Beacon.CONFIG_PATH);
        Beacon.Config.gload('Beacon');
        let { Route } = require('./route');
        Beacon.Route = Route;
        return this;
    }
    //获取http对象
    static async run(req, res) {
        let context = new http_context_1.HttpContext(req, res);
        let Route = Beacon.Route;
        let args = Route.parseUrl(context.pathname);
        if (args == null || args.ctl == '') {
            Beacon.displayError(context, 404, 'then page url:"' + context.url + '" is not foult!');
            return;
        }
        let ctlClass = Route.getController(args.app, args.ctl);
        if (ctlClass == null) {
            Beacon.displayError(context, 404, 'then page url:"' + context.url + '" is not foult!');
            return;
        }
        try {
            await context.parsePayload(Beacon.getConfig('default_encoding', 'utf-8'));
            let ctlobj = await new ctlClass(context);
            let act = Beacon.lowerFirst(Beacon.toCamel(args.act || 'index')) + 'Action';
            if (ctlobj[act] && Beacon.isFunction(ctlobj[act])) {
                await ctlobj[act]();
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
    }
    //显示错误
    static displayError(context, status = 500, error) {
        if (typeof error == 'string') {
            error = new Error(error);
        }
        let sdopx = new sdopx_1.Sdopx();
        sdopx.setTemplateDir(Beacon.VIEW_PATH);
        let title = '';
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
        let content = sdopx.display('error');
        context.setStatus(status);
        context.end(content);
        console.error(error);
    }
}
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
    let packageFile = `${Beacon.BEACON_PATH}/package.json`;
    let { version } = JSON.parse(fs.readFileSync(packageFile, 'utf-8'));
    return version;
})();
exports.Beacon = Beacon;
global['Beacon'] = Object.create(Beacon);
//# sourceMappingURL=beacon.js.map