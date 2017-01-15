"use strict";
const url = require("url");
const sdopx_1 = require("sdopx");
sdopx_1.Sdopx.registerFilter('pre', function (content, sdopx) {
    if (sdopx.context) {
        let uri = sdopx.context.route('uri', '');
        content = content.replace(/__APPROOT__/g, uri);
    }
    return content;
});
class ControllerError extends Error {
    constructor(msg, code) {
        super(msg);
        this.code = '';
        this.code = code;
    }
}
exports.ControllerError = ControllerError;
class Controller {
    constructor(context) {
        this.context = null;
        this.sdopx = null;
        this.template_dirs = null;
        this.db = null;
        this._info = {};
        this.context = context;
    }
    async init() {
    }
    async finish() {
    }
    initSdopx() {
        if (this.sdopx === null) {
            this.sdopx = new sdopx_1.Sdopx(this);
            // this.sdopx.compile_check = false;
            let dirs = this.template_dirs || Beacon.VIEW_PATH;
            this.sdopx.setTemplateDir(dirs);
        }
    }
    async initDB(type = 'mysql', options) {
        if (this.db == null) {
            if (type == 'mysql') {
                let Mysql = require("../adapter/db/mysql").Mysql;
                this.db = new Mysql(options);
            }
        }
    }
    assign(key, value = null) {
        if (typeof key == 'string') {
            this._info[key] = value;
            return;
        }
        if (Beacon.isObject(key)) {
            this._info = Object.assign(this._info, key);
        }
    }
    assignConfig(key, value = null) {
        this.initSdopx();
        this.sdopx.assignConfig(key, value);
    }
    display(tplname) {
        this.initSdopx();
        this.sdopx._book = Object.assign(this.sdopx._book, this._info);
        this.sdopx.display(tplname);
    }
    fetch(tplname) {
        this.initSdopx();
        return this.sdopx.fetch(tplname);
    }
    indexAction() {
        this.end('hello beaconjs.');
    }
    getIP() {
        return this.context.getIP();
    }
    getMethod() {
        return this.context.method.toLowerCase();
    }
    isMethod(method) {
        return this.context.method === method.toUpperCase();
    }
    isGet() {
        return this.context.isGet();
    }
    isPost() {
        return this.context.isPost();
    }
    isAjax() {
        return this.context.isAjax();
    }
    get(name, def) {
        return this.context.get(name, def);
    }
    post(name, def) {
        return this.context.post(name, def);
    }
    param(name, def) {
        return this.context.param(name, def);
    }
    file(name) {
        return this.context.file(name);
    }
    getHeader(name) {
        return this.context.getHeader(name);
    }
    setHeader(name, value) {
        return this.context.setHeader(name, value);
    }
    getUserAgent() {
        return this.context.getUserAgent();
    }
    getReferrer(host) {
        return this.context.getReferrer(host);
    }
    setStatus(status = 200) {
        return this.context.setStatus(status);
    }
    //获取配置项
    getConfig(key, def) {
        return Beacon.getConfig(key, def);
    }
    //获取配置项
    route(name, def) {
        return this.context.route(name, def);
    }
    //获取配置项
    setConfig(key, def) {
        return Beacon.getConfig(key, def);
    }
    getCookie(name) {
        return this.context.getCookie(name);
    }
    setCookie(name, value, options) {
        return this.context.setCookie(name, value, options);
    }
    async initSesion(type) {
        return await this.context.initSesion(type);
    }
    getSession(name) {
        return this.context.getSession(name);
    }
    setSession(name, value) {
        return this.context.setSession(name, value);
    }
    delSession(name) {
        return this.context.delSession(name);
    }
    redirect(uri, query, app, code) {
        if (typeof query == 'number' && app === void 0 && code === void 0) {
            code = query;
            query = null;
            app = this.route('app');
        }
        else if (typeof query == 'string' && app === void 0 && code === void 0) {
            app = query;
            query = null;
        }
        else if (typeof query == 'string' && typeof app === 'number' && code === void 0) {
            code = app;
            app = query;
            query = null;
        }
        else if (typeof app == 'number' && code === void 0) {
            code = app;
            app = this.route('app');
        }
        if (uri.length < 0) {
            return;
        }
        if (uri[0] == '~') {
            let touri = uri.substring(1);
            let info = url.parse(touri, true, true);
            if (query != null && Beacon.isObject(query)) {
                query = Object.assign(info.query, query);
            }
            touri = this.url(info.pathname, query, app);
            this.context.redirect(touri, code);
            return;
        }
        let appuri = this.route('uri', '');
        uri = uri.replace(/__APPROOT__/g, appuri);
        this.context.redirect(uri, code);
    }
    setExpires(time) {
        this.context.setExpires(time);
        return this;
    }
    write(obj = null, encoding = null) {
        return this.context.write(obj, encoding);
    }
    url(pathname = '', query, app) {
        if (typeof query == 'string' && app === void 0) {
            app = query;
            query = null;
        }
        query = query || {};
        app = app || this.route('app');
        if (pathname.length > 0 && pathname[0] != '/') {
            pathname = '/' + this.route('ctl') + '/' + pathname;
        }
        return Beacon.Route.resolve(app, pathname, query);
    }
    end(obj = null, encoding = null) {
        if (this.db) {
            this.db.release();
            this.db = null;
        }
        this.context.end(obj, encoding);
    }
    exit() {
        throw new ControllerError('exit', 'CONTROLLER_EXIT');
    }
    getContentType() {
        return this.context.getContentType();
    }
    setContentType(ext, encoding) {
        return this.context.setContentType(ext, encoding);
    }
    sendTime(name) {
        return this.context.sendTime(name);
    }
}
exports.Controller = Controller;
//# sourceMappingURL=controller.js.map