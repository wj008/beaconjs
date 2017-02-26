import path =require( 'path');
import url =require( 'url');
import {HttpContext} from "../core/http_context";
import {Mysql} from "../adapter/db/mysql";
import {Sdopx} from "sdopx";
declare var Beacon: any;
require('../adapter/sdopx/sdopx_ext');

export class ControllerError extends Error {
    public code = '';

    public constructor(msg: string, code: string) {
        super(msg);
        this.code = code;
    }
}
export class Controller {
    public static auth: Array<string> = null;
    public context: HttpContext = null;
    public sdopx: Sdopx = null;
    public template_dirs = null;
    public db: Mysql = null;
    private _info: any = {};
    private _asset: any = null;

    public constructor(context: HttpContext) {
        this.context = context;
    }

    public async init() {

    }

    public async finish() {

    }

    private initSdopx() {
        if (this.sdopx === null) {
            this.sdopx = new Sdopx(this);
            // this.sdopx.compile_check = false;
            let dirs = this.template_dirs || Beacon.VIEW_PATH;
            this.sdopx.setTemplateDir(dirs);
        }
    }

    public async initDB(type = 'mysql', options?: any) {
        if (this.db == null) {
            if (type == 'mysql') {
                let Mysql = require("../adapter/db/mysql").Mysql;
                this.db = new Mysql(options);
            }
        }
    }

    public assign(key, value = null) {
        if (typeof key == 'string') {
            this._info[key] = value;
            return;
        }
        if (Beacon.isObject(key)) {
            this._info = Object.assign(this._info, key);
        }
    }


    public assignConfig(key, value = null) {
        this.initSdopx();
        this.sdopx.assignConfig(key, value);
    }

    public display(tplname: string) {
        this.initSdopx();
        this.sdopx._book = Object.assign(this.sdopx._book, this._info);
        this.sdopx.display(tplname);
    }

    public fetch(tplname: string) {
        this.initSdopx();
        return this.sdopx.fetch(tplname);
    }

    public indexAction() {
        this.end('hello beaconjs.');
    }

    public getIP() {
        return this.context.getIP();
    }

    public getMethod() {
        return this.context.method.toLowerCase();
    }

    public isMethod(method) {
        return this.context.method === method.toUpperCase();
    }

    public isGet() {
        return this.context.isGet();
    }

    public isPost() {
        return this.context.isPost();
    }

    public isAjax() {
        return this.context.isAjax();
    }


    public get(name?: string, def?) {
        return this.context.get(name, def);
    }

    public post(name?: string, def?) {
        return this.context.post(name, def);
    }

    public param(name?: string, def?) {
        return this.context.param(name, def);
    }

    public file(name?: string) {
        return this.context.file(name);
    }

    public getHeader(name?: string) {
        return this.context.getHeader(name);
    }

    public setHeader(name: string, value) {
        return this.context.setHeader(name, value);
    }


    public getUserAgent() {
        return this.context.getUserAgent();
    }

    public getReferrer(host?: string) {
        return this.context.getReferrer(host);
    }

    public setStatus(status: number = 200) {
        return this.context.setStatus(status);
    }

    //获取配置项
    public  getConfig(key, def?) {
        return Beacon.getConfig(key, def);
    }

    //获取配置项
    public  route(name, def?) {
        return this.context.route(name, def);
    }

    //获取配置项
    public  setConfig(key, def?) {
        return Beacon.getConfig(key, def);
    }

    public getCookie(name?: string) {
        return this.context.getCookie(name);
    }

    public setCookie(name: string, value: string, options?) {
        return this.context.setCookie(name, value, options);
    }

    public async initSesion(type?: string) {
        return await this.context.initSesion(type);
    }

    public getSession(name?: string) {
        return this.context.getSession(name);
    }

    public setSession(name: string, value: any) {
        return this.context.setSession(name, value);
    }

    public delSession(name?: string) {
        return this.context.delSession(name);
    }

    public redirect(uri, query?: any, app?: any, code?: number) {
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
        uri = this.url(uri, query, app);
        this.context.redirect(uri, code);
    }

    public setExpires(time) {
        this.context.setExpires(time);
        return this;
    }

    public write(obj = null, encoding: string = null) {
        return this.context.write(obj, encoding);
    }

    public execUrl(pathname: string = '', query?: any, app?: string) {
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

    public url(uri, query?: any, app?: any) {
        if (typeof query == 'string' && app === void 0) {
            app = query;
            query = null;
        }
        if (!app) {
            app = this.route('app');
        }
        if (uri.length == 0) {
            return;
        }
        if (uri[0] == '~') {
            let touri = uri.substring(1);
            let info = url.parse(touri, true, true);
            if (query != null && Beacon.isObject(query)) {
                query = Object.assign(info.query, query);
            }
            touri = this.execUrl(info.pathname, query, app);
            return touri;
        }
        let appuri = this.route('uri', '');
        uri = uri.replace(/__APPROOT__/g, appuri);
        return uri;
    }

    public end(obj = null, encoding = null) {
        if (this.db) {
            this.db.release();
            this.db = null;
        }
        this.context.end(obj, encoding);
    }

    public exit() {
        throw new ControllerError('exit', 'CONTROLLER_EXIT');
    }

    public getContentType() {
        return this.context.getContentType();
    }

    public setContentType(ext, encoding?) {
        return this.context.setContentType(ext, encoding);
    }

    public sendTime(name) {
        return this.context.sendTime(name);
    }

    public async parsePayload(encoding?) {
        return await this.context.parsePayload(encoding);
    }

    public addAsset(name: any, depend?: any) {
        if (typeof name != 'string') {
            if (Beacon.isArray(name)) {
                for (var i = 0; i < name.length; i++) {
                    if (i == 0) {
                        this.addAsset(name[i], depend);
                    } else {
                        this.addAsset(name[i]);
                    }
                }
            }
            return;
        }
        this._asset = this._asset || {};
        if (this._asset[name]) {
            return;
        }
        let that = this;
        let config = Beacon.getConfig('asset:*');
        let depends = config.depends || {};
        let paths = config.paths || {};
        let url_join = function (item) {
            if (item[1] == '/') {
                return item;
            }
            let items = item.split('/');
            let bases = config.baseUrl.split('/');
            let temps = [];
            for (let xitem of items) {
                if (xitem == '..') {
                    bases.pop();
                    continue;
                }
                temps.push(xitem);
            }
            bases = bases.concat(temps);
            return bases.join('/');
        }

        let add_asset = function (name) {
            if (that._asset[name]) {
                return;
            }
            let data: any = {};
            let xdepend = depends[name] || [];

            if (depend) {
                let temp = xdepend.slice(0);
                if (depend instanceof Array && depend.length > 0) {
                    temp = temp.concat(depend);
                }
                if (typeof depend == 'string' && depend.length > 0) {
                    temp.push(depend);
                }
                xdepend = temp;
                depend = null;
            }

            if (xdepend.length > 0) {
                xdepend.forEach(function (item) {
                    if (item.length == 0) {
                        return;
                    }
                    if (paths[item]) {
                        add_asset(item);
                        return;
                    }
                    if (/\.js$/i.test(item)) {
                        data.js = data.js || [];
                        if (item[1] == '/') {
                            data.js.push(item);
                            return;
                        }
                        data.js.push(url_join(item));
                        return;
                    }
                    if (/\.css$/i.test(item)) {
                        data.css = data.css || [];
                        if (item[1] == '/') {
                            data.css.push(item);
                            return;
                        }
                        data.css.push(url_join(item));
                        return;
                    }
                });
            }
            data.js = data.js || [];
            if (/\.js$/i.test(name)) {
                data.js.push(name);
                that._asset[name] = data;
                return;
            }
            if (/\.css$/i.test(name)) {
                data.css = data.css || [];
                data.css.push(name);
                that._asset[name] = data;
                return;
            }
            if (!paths[name] || paths[name].length == 0) {
                return;
            }
            let item = paths[name] + '.js';
            if (item[1] == '/') {
                data.js.push(item);
            } else {
                data.js.push(url_join(item));
            }
            that._asset[name] = data;
        }
        add_asset(name);
    }

    public getAsset(name?: string) {
        let data = {js: [], css: []};
        let version = Beacon.getConfig('asset:version', '');
        if (name === void 0) {
            for (let name in this._asset) {
                let item = this._asset[name];
                if (version != '') {
                    item.js && item.js.forEach(function (oitem) {
                        data.js.push(oitem + '?v=' + version);
                    });
                    item.css && item.css.forEach(function (oitem) {
                        data.css.push(oitem + '?v=' + version);
                    });
                    continue;
                }
                data.js.concat(item.js);
                data.css.concat(item.css);
            }
            return data;
        }
        let item = this._asset[name] || null;
        if (item) {
            if (version != '') {
                item.js && item.js.forEach(function (oitem) {
                    data.js.push(oitem + '?v=' + version);
                });
                item.css && item.css.forEach(function (oitem) {
                    data.css.push(oitem + '?v=' + version);
                });
                return data;
            }
            data.js.concat(item.js);
            data.css.concat(item.css);
            return data;
        }
        return data;
    }

    public fail(message: any, error?: any, jump?: any, code?: any, timeout: number = 3) {
        if (!Beacon.isObject(error)) {
            timeout = code;
            code = jump;
            jump = error;
            error = null;
        }
        if (this.isAjax()) {
            let ret: any = {};
            ret.message = message;
            ret.status = false;
            if (error) {
                ret.error = error;
            }
            if (code !== void 0) {
                ret.code = code;
            }
            this.returnJson(ret);
        }
        if (jump === void 0) {
            jump = this.getReferrer();
        }
        else if (jump == false) {
            jump = 'javascript:history.go(-1);';
        }
        this.assign('message', message);
        this.assign('jump', jump);
        this.assign('timeout', timeout);
        this.assign('code', code);
        this.display(this.getConfig('fail_tplname', 'fail'));
        this.exit();
    }

    public success(message: any, jump?: any, code?: any, timeout: number = 1) {
        if (jump === void 0) {
            jump = this.param('__BACK__', this.getReferrer()) || null;
        }
        if (this.isAjax()) {
            let ret: any = {};
            ret.message = message;
            ret.status = true;
            if (code !== void 0) {
                ret.code = code;
            }
            this.returnJson(ret);
        }
        if (jump == false) {
            jump = 'javascript:history.go(-1);';
        }
        this.assign('message', message);
        this.assign('jump', jump);
        this.assign('timeout', timeout);
        this.assign('code', code);
        this.display(this.getConfig('success_tplname', 'success'));
        this.exit();
    }

    public returnJson(data) {
        this.setContentType('json');
        this.end(JSON.stringify(data));
        this.exit();
    }
}
