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
    private _assign: any = {};
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
            this._assign[key] = value;
            return;
        }
        if (Beacon.isObject(key)) {
            this._assign = Object.assign(this._assign, key);
        }
    }

    public getAssign() {
        return this._assign;
    }

    public assignConfig(key, value = null) {
        this.initSdopx();
        this.sdopx.assignConfig(key, value);
    }

    public display(tplname: string) {
        this.initSdopx();
        this.sdopx._book = Object.assign(this.sdopx._book, this._assign);
        this.sdopx.assign('this',this);
        this.sdopx.display(tplname);
    }

    public fetch(tplname: string) {
        this.initSdopx();
        this.sdopx._book = Object.assign(this.sdopx._book, this._assign);
        this.sdopx.assign('this',this);
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


    /**
     * 使用SESSION时必须先初始化
     * @param type
     */
    public async initSesion(type?: string) {
        return await this.context.initSesion(type);
    }

    /**
     * 获取session值
     * @param name
     */
    public getSession(name?: string) {
        return this.context.getSession(name);
    }

    /**
     * 设置session值
     * @param name
     * @param value
     */
    public setSession(name: string, value: any) {
        return this.context.setSession(name, value);
    }

    /**
     * 删除对于键名的session 名称为空时 全删
     * @param name
     */
    public delSession(name?: string) {
        return this.context.delSession(name);
    }

    /**
     * 跳转路径
     * @param uri  应用相对路径
     * @param query 参数
     * @param app 应用名称
     * @param code  跳转http 状态码
     */
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


    /**
     * 设置有效时间
     * @param time
     */
    public setExpires(time) {
        this.context.setExpires(time);
        return this;
    }

    /**
     * 输出内容
     * @param obj
     * @param encoding
     */
    public write(obj = null, encoding: string = null) {
        return this.context.write(obj, encoding);
    }

    /**
     * 根据 path 参数 构造路径URL
     * @param pathname
     * @param query
     * @param app
     */
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

    /**
     * url 转换路径
     * @param uri
     * @param query
     * @param app
     */
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

    /**
     * 结束输出
     * @param obj
     * @param encoding
     */
    public end(obj = null, encoding = null) {
        if (this.db) {
            this.db.release();
            this.db = null;
        }
        this.context.end(obj, encoding);
    }

    /**
     * 终止代码继续运行，并结束输出, finish() 仍然会继续执行。
     */
    public exit() {
        throw new ControllerError('exit', 'CONTROLLER_EXIT');
    }

    /**
     * 获取内容类型
     */
    public getContentType() {
        return this.context.getContentType();
    }

    /**
     * 文档类型 及默认编码
     * @param ext
     * @param encoding
     */
    public setContentType(ext, encoding?) {
        return this.context.setContentType(ext, encoding);
    }

    /**
     * 发送时间
     * @param name
     */
    public sendTime(name) {
        return this.context.sendTime(name);
    }


    /**
     * 解析Payload 数据 一般情况下会自动调用，可重载这个函数制定自己的解析方式
     * @param encoding
     */
    public async parsePayload(encoding?) {
        return await this.context.parsePayload(encoding);
    }

    /**
     * 添加资源信息
     * @param name
     * @param depend
     */
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

    /**
     * 获取脚本样式等资源信息
     * @param name
     */
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

    /**
     * 向浏览器输出错误提示信息，如AJAX访问将返回JSON数据
     * @param errors object|string 错误信息，字符或者键值对象
     * @param jump  跳转的路径
     * @param code 错误附带代码
     * @param timeout 跳转倒计时间
     */
    public fail(errors?: any, jump?: any, code?: any, timeout: number = 3) {
        let ret: any = {};
        ret.status = false;
        if (code !== void 0) {
            ret.code = code;
        }
        if (Beacon.isObject(errors)) {
            ret.errors = errors;
            let key = Object.keys(errors)[0] || null;
            if (key) {
                ret.error = errors[key];
            } else {
                ret.error = '错误';
            }
        } else {
            ret.error = errors;
        }
        if (this.isAjax()) {
            this.returnJson(ret);
        }
        if (ret.jump === void 0) {
            ret.jump = this.getReferrer();
        }
        else if (ret.jump == false) {
            ret.jump = 'javascript:history.go(-1);';
        }
        ret.timeout = timeout;
        this.assign('info', ret);
        this.display(this.getConfig('fail_tplname', 'fail'));
        this.exit();
    }

    /**
     * 向浏览器输出正确提示信息并跳转到相应的路径，如AJAX访问将返回JSON数据
     * @param message 要提示的消息内容
     * @param jump  跳转的路径 默认前一页
     * @param info 正确附带信息
     * @param timeout  超时时间
     */
    public success(message: any, info?: any, jump?: any, timeout: number = 1) {
        let ret: any = {};
        ret.message = message;
        ret.status = true;
        if (jump === void 0 && (typeof info == 'boolean' || typeof info == 'string')) {
            jump = info;
            info = null;
        }
        if (!(info === void 0 || info === null)) {
            ret.data = info;
        }
        if (this.isAjax()) {
            this.returnJson(ret);
        }
        if (jump === void 0 || jump === null) {
            jump = this.param('__BACK__', this.getReferrer()) || null;
        }
        if (jump === false) {
            jump = 'javascript:history.go(-1);';
        }
        ret.jump = jump;
        ret.timeout = timeout;
        this.assign('info', ret);
        this.display(this.getConfig('success_tplname', 'success'));
        this.exit();
    }

    /**
     * 输出JSON格式
     * @param data
     */
    public returnJson(data) {
        this.setContentType('json');
        this.end(JSON.stringify(data));
        this.exit();
    }
}
