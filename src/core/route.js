"use strict";
const path = require("path");
const fs = require("fs");
class Route {
    //读取配置项
    static loadRoute(app) {
        let filepath = path.join(Route.ROUTE_PATH, app.toLocaleLowerCase() + '.route.js');
        if (fs.existsSync(filepath)) {
            let idata = require(filepath);
            idata.name = app;
            idata.uri = idata.uri || '';
            idata.match = new RegExp('^' + String(idata.uri).replace(/[|\\{}()[\]^$+*?.]/g, '\\$&') + '(/.*)$', 'i');
            Route.RouteData[app] = idata;
        }
        return Route;
    }
    //解析URL
    static parseUrl(url) {
        //获取APPname
        let { name = '', baseurl = '' } = (() => {
            for (let name in Route.RouteData) {
                let idata = Route.RouteData[name];
                let m = String(url).match(idata.match);
                if (m) {
                    return { name: name, baseurl: m[1] };
                }
            }
            return null;
        })();
        if (name.length == 0) {
            return null;
        }
        let idata = Route.RouteData[name] || null;
        if (idata == null) {
            return null;
        }
        let arg = { app: '', ctl: '', act: '' };
        if (idata.default && Beacon.isObject(idata.default)) {
            arg = Object.assign(arg, idata.default);
        }
        let rules = idata.rules || [];
        for (let item of rules) {
            let m = baseurl.match(item.reg);
            if (m) {
                for (let key in item.arg) {
                    let val = item.arg[key];
                    val = String(val).replace(/\$(\d+)/g, function ($0, $1) {
                        return m[parseInt($1)];
                    });
                    arg[key] = val;
                }
                break;
            }
        }
        arg.app = name;
        return arg;
    }
    static getAppPath(app) {
        if (Route.AppPath[app] !== void 0) {
            return Route.AppPath[app];
        }
        let idata = Route.RouteData[app] || null;
        if (idata == null) {
            Route.AppPath[app] = null;
            return null;
        }
        let appPath = path.join(Beacon.BEACON_PATH, idata.path);
        if (fs.existsSync(appPath)) {
            var stat = fs.statSync(appPath);
            if (stat.isDirectory()) {
                Route.AppPath[app] = appPath;
                return appPath;
            }
        }
        Route.AppPath[app] = null;
        return null;
    }
    static _getInstallAppRoute(app) {
        let apppath = Route.getAppPath(app || 'home');
        if (apppath == null) {
            Route.AppCtls[app] = null;
            return;
        }
        let temps = {};
        let allpath = path.join(apppath, 'controllers');
        let files = Beacon.getFiles(allpath, '', function (item) {
            //console.log(item,/^\w+\.ctl\.js$/.test(item));
            return /^\w+\.ctl\.js$/.test(item);
        });
        for (let file of files) {
            let fname = file.replace(/\.ctl\.js$/, '');
            if (fname == '') {
                continue;
            }
            temps[fname] = path.join(allpath, file);
        }
        Route.AppCtls[app] = { files: temps, interfaces: {} };
    }
    static getController(app, ctl) {
        //扫码装载控制器
        if (Route.AppCtls[app] === void 0) {
            Route._getInstallAppRoute(app);
        }
        if (Route.AppCtls[app] === null) {
            return null;
        }
        let name = Beacon.toUnder(ctl);
        let interfaces = Route.AppCtls[app].interfaces;
        if (interfaces[name] !== void 0) {
            return interfaces[name];
        }
        let files = Route.AppCtls[app].files;
        if (files[name] === void 0) {
            return null;
        }
        let file = files[name];
        try {
            let pick = require(file);
            if (pick[Beacon.toCamel(name)]) {
                interfaces[name] = pick[Beacon.toCamel(name)];
                return interfaces[name];
            }
            else if (pick.default) {
                interfaces[name] = pick.default;
                return interfaces[name];
            }
        }
        catch (e) {
            return null;
        }
        return null;
    }
}
Route.RouteData = {};
Route.AppPath = {};
Route.AppCtls = {};
Route.ROUTE_PATH = Beacon.ROUTE_PATH;
exports.Route = Route;
//# sourceMappingURL=route.js.map