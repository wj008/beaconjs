"use strict";
var path = require('path');
var fs = require("fs");
var Route = (function () {
    function Route() {
    }
    //读取配置项
    Route.loadRoute = function (app) {
        var filepath = path.join(Route.ROUTE_PATH, app.toLocaleLowerCase() + '.route.js');
        if (fs.existsSync(filepath)) {
            var idata = require(filepath);
            idata.name = app;
            idata.uri = idata.uri || '';
            idata.match = new RegExp('^' + String(idata.uri).replace(/[|\\{}()[\]^$+*?.]/g, '\\$&') + '(/.*)$', 'i');
            Route.RouteData[app] = idata;
        }
        return Route;
    };
    //解析URL
    Route.parseUrl = function (url) {
        //获取APPname
        var _a = (function () {
            for (var name_1 in Route.RouteData) {
                var idata_1 = Route.RouteData[name_1];
                var m = String(url).match(idata_1.match);
                if (m) {
                    return { name: name_1, baseurl: m[1] };
                }
            }
            return null;
        })(), _b = _a.name, name = _b === void 0 ? '' : _b, _c = _a.baseurl, baseurl = _c === void 0 ? '' : _c;
        if (name.length == 0) {
            return null;
        }
        var idata = Route.RouteData[name] || null;
        if (idata == null) {
            return null;
        }
        var arg = { app: '', ctl: '', act: '' };
        if (idata.default && Beacon.isObject(idata.default)) {
            arg = Object.assign(arg, idata.default);
        }
        var rules = idata.rules || [];
        var _loop_1 = function(item) {
            var m = baseurl.match(item.reg);
            if (m) {
                for (var key in item.arg) {
                    var val = item.arg[key];
                    val = String(val).replace(/\$(\d+)/g, function ($0, $1) {
                        return m[parseInt($1)];
                    });
                    arg[key] = val;
                }
                return "break";
            }
        };
        for (var _i = 0, rules_1 = rules; _i < rules_1.length; _i++) {
            var item = rules_1[_i];
            var state_1 = _loop_1(item);
            if (state_1 === "break") break;
        }
        arg.app = name;
        return arg;
    };
    Route.getAppPath = function (app) {
        if (Route.AppPath[app] !== void 0) {
            return Route.AppPath[app];
        }
        var idata = Route.RouteData[app] || null;
        if (idata == null) {
            Route.AppPath[app] = null;
            return null;
        }
        var appPath = path.join(Beacon.BEACON_PATH, idata.path);
        if (fs.existsSync(appPath)) {
            var stat = fs.statSync(appPath);
            if (stat.isDirectory()) {
                Route.AppPath[app] = appPath;
                return appPath;
            }
        }
        Route.AppPath[app] = null;
        return null;
    };
    Route._getInstallAppRoute = function (app) {
        var apppath = Route.getAppPath(app || 'home');
        if (apppath == null) {
            Route.AppCtls[app] = null;
            return;
        }
        var temps = {};
        var allpath = path.join(apppath, 'controllers');
        var files = Beacon.getFiles(allpath, '', function (item) {
            //console.log(item,/^\w+\.ctl\.js$/.test(item));
            return /^\w+\.ctl\.js$/.test(item);
        });
        for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
            var file = files_1[_i];
            var fname = file.replace(/\.ctl\.js$/, '');
            if (fname == '') {
                continue;
            }
            temps[fname] = path.join(allpath, file);
        }
        Route.AppCtls[app] = { files: temps, interfaces: {} };
    };
    Route.getController = function (app, ctl) {
        //扫码装载控制器
        if (Route.AppCtls[app] === void 0) {
            Route._getInstallAppRoute(app);
        }
        if (Route.AppCtls[app] === null) {
            return null;
        }
        var name = Beacon.toUnder(ctl);
        var interfaces = Route.AppCtls[app].interfaces;
        if (interfaces[name] !== void 0) {
            return interfaces[name];
        }
        var files = Route.AppCtls[app].files;
        if (files[name] === void 0) {
            return null;
        }
        var file = files[name];
        try {
            var pick = require(file);
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
    };
    Route.RouteData = {};
    Route.AppPath = {};
    Route.AppCtls = {};
    Route.ROUTE_PATH = Beacon.ROUTE_PATH;
    return Route;
}());
exports.Route = Route;
//# sourceMappingURL=route.js.map