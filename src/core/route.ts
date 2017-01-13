import path =require('path');
import fs = require("fs");
import url = require('url');
declare var Beacon: any;


export class Route {
    public static RouteData = {};
    public static AppPath = {};
    public static AppCtls = {};
    public static ROUTE_PATH = Beacon.ROUTE_PATH;
    private static cache_uris = {};//缓存路径
    //读取配置项
    public static loadRoute(app: string) {
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
    public static parseUrl(url: string) {
        //获取APPname
        let {name = '', baseurl = ''}  = (() => {
            for (let name in Route.RouteData) {
                let idata = Route.RouteData[name];
                let m = String(url).match(idata.match);
                if (m) {
                    return {name: name, baseurl: m[1]};
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
        let arg = {uri: idata.uri, app: '', ctl: '', act: ''};
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
        arg.uri = idata.uri;
        return arg;
    }

    public static getAppPath(app: string) {
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

    private static _getInstallAppRoute(app) {
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
        Route.AppCtls[app] = {files: temps, interfaces: {}};
    }

    public static getController(app, ctl) {
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
            } else if (pick.default) {
                interfaces[name] = pick.default;
                return interfaces[name];
            }
        }
        catch (e) {
            return null;
        }
        return null;
    }

    //解析成路径
    public static resolve(app: string, pathname: '', query: any = {}): string {
        if (app == null || app.length == 0) {
            return '';
        }
        let temp = [];
        for (let name in query) {
            temp.push(name + '={' + name + '}');
        }
        let urlpath = app + ':' + pathname + '?' + temp.join('&');
        let index = urlpath.length > 50 ? Beacon.md5(urlpath) : urlpath;
        if (Route.cache_uris[index]) {
            let tplurl = Route.cache_uris[index];
            return tplurl.replace(/\{(\w+)\}/g, function ($0, key) {
                if (query[key] !== void 0 && query[key] !== null && query[key] !== '') {
                    return encodeURIComponent(query[key]);
                }
                return '';
            });
        }
        let ctl = '';
        let act = '';
        if (pathname.length > 0) {
            let mth = pathname.match(/^\/(\w+)(?:\/(\w+))?$/);
            if (mth) {
                ctl = mth[1];
            }
            if (mth[2]) {
                act = mth[2];
            }
        }
        let oquery = {};
        for (let name in query) {
            oquery[name] = '{' + name + '}';
        }
        let args: any = {};
        if (ctl) {
            args.__ctl__ = ctl;
        }
        if (act) {
            args.__act__ = act;
        }
        args = Object.assign(args, oquery);
        let route = Route.RouteData[app] || null;
        if (!route) {
            return '';
        }
        let uri = route.uri || '';
        let resolve = route.resolve || null;
        if (resolve == null) {
            return '';
        }
        let out_url = '';
        for (let i = 0; i < resolve.length; i++) {
            let in_url = resolve[i];
            let delkeys = [];
            let isHas = true;
            let _url = in_url.replace(/\{(\w+)\}/g, function ($0, key) {
                if (['ctl', 'act'].indexOf(key) >= 0) {
                    key = '__' + key + '__';
                }
                delkeys.push(key);
                if (args[key] === void 0 || args[key] === null || args[key] === '') {
                    isHas = false;
                    return '';
                }
                return args[key];
            });
            if (isHas) {
                out_url = _url;
                for (let n = 0; n < delkeys.length; n++) {
                    let del = delkeys[n];
                    delete args[del];
                }
                break;
            }
        }
        let queryStr = [];
        for (let name in args) {
            if (['__ctl__', '__act__'].indexOf(name) >= 0) {
                continue;
            }
            queryStr.push(name + '=' + args[name]);
        }
        let tplurl = uri + out_url;
        if (queryStr.length > 0) {
            tplurl += '?' + queryStr.join('&');
        }
        Route.cache_uris[index] = tplurl;
        return tplurl.replace(/\{(\w+)\}/g, function ($0, key) {
            if (query[key] !== void 0 && query[key] !== null && query[key] !== '') {
                return encodeURIComponent(query[key]);
            }
        });
    }
}
