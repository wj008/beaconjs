import path =require('path');
import {Beaconkit} from "./beacon_kit";
import {HttpContext} from "./http_context";
import {Controller} from "../controllers/controller";
import {MemorySession} from "../adapter/session/memory";
import {Sdopx} from "sdopx";
import fs = require("fs");
/**
 * 核心框架类
 */
export class Beacon extends Beaconkit {

    //库目录
    public static BEACON_LIB_PATH = path.dirname(__dirname);

    //项目目录
    public static BEACON_PATH = path.dirname(Beacon.BEACON_LIB_PATH);
    //运行时目录
    public static RUNTIME_PATH = Beacon.BEACON_PATH;

    public static ROUTE_PATH = path.join(Beacon.RUNTIME_PATH, 'route');

    public static CONFIG_PATH = path.join(Beacon.RUNTIME_PATH, 'config');
    //模板目录
    public static VIEW_PATH = path.join(Beacon.RUNTIME_PATH, 'views');

    //配置器
    public static Config = null;
    //路由器
    public static Route = null;

    public static Controller = Controller;

    private static _sessionType = {};
    private static _sessionUsed = {};
    private static _gc_timer = null;

    //框架版本号
    public static version = (function () {
        let packageFile = `${Beacon.BEACON_PATH}/package.json`;
        let {version} = JSON.parse(fs.readFileSync(packageFile, 'utf-8'));
        return version;
    })();

    //获取配置项
    public static getConfig(key, def?) {
        return Beacon.Config.get(key, def);
    }

    //设置配置项
    public static setConfig(key, def?) {
        Beacon.Config.set(key, def);
    }

    public static init(runpath?) {
        Beacon.RUNTIME_PATH = runpath || Beacon.BEACON_PATH;
        Beacon.ROUTE_PATH = path.join(Beacon.RUNTIME_PATH, 'route');
        Beacon.CONFIG_PATH = path.join(Beacon.RUNTIME_PATH, 'config');
        Beacon.VIEW_PATH = path.join(Beacon.RUNTIME_PATH, 'views');
        let {Config} = require('./config');
        Beacon.Config = new Config(Beacon.CONFIG_PATH);
        Beacon.Config.gload('Beacon');
        let {Route} = require('./route');
        Beacon.Route = Route;
        return this;
    }


    //获取http对象
    public static async run(req, res) {
        let context = new HttpContext(req, res);
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
            } else {
                Beacon.displayError(context, 404, 'then page url:"' + context.url + '" is not foult!');
            }
        } catch (e) {
            Beacon.displayError(context, 500, e);
            return;
        }
    }

    public static regSessionType(type, typeClass) {
        Beacon._sessionType[type] = typeClass;
    }

    public static getSessionInstance(type = 'memory') {
        let typeClass = Beacon._sessionType[type] || MemorySession;
        if (!Beacon._sessionUsed[type]) {
            Beacon._sessionUsed[type] = MemorySession;
        }
        return new typeClass();
    }

    //显示错误
    public static displayError(context, status = 500, error) {
        if (typeof error == 'string') {
            error = new Error(error);
        }
        let sdopx = new Sdopx();
        sdopx.setTemplateDir(Beacon.VIEW_PATH);
        let title = '';
        if (status == 404) {
            title = 'NotFound.';
        } else if (status == 500) {
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

    public static gc() {
        if (Beacon._gc_timer) {
            clearInterval(Beacon._gc_timer);
            Beacon._gc_timer = null;
        }
        Beacon._gc_timer = setInterval(function () {
            //回收session
            for (let key in Beacon._sessionUsed) {
                Beacon._sessionUsed[key].gc();
            }
            // console.log('beacon gc...');
        }, 10000);
    }

}
Beacon.regSessionType('memory', MemorySession);
global['Beacon'] = Object.create(Beacon);