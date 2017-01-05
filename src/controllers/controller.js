"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
var sdopx_1 = require("sdopx");
var Controller = (function () {
    function Controller(context) {
        this.context = null;
        this.sdopx = new sdopx_1.Sdopx();
        this.template_dirs = null;
        this.context = context;
    }
    Controller.prototype.initSdopx = function () {
        if (this.sdopx === null) {
            this.sdopx = new sdopx_1.Sdopx();
            this.sdopx.setTemplateDir(this.template_dirs || Beacon.VIEW_PATH);
        }
    };
    Controller.prototype.assign = function (key, value) {
        if (value === void 0) { value = null; }
        this.initSdopx();
        this.sdopx.assign(key, value);
    };
    Controller.prototype.assignConfig = function (key, value) {
        if (value === void 0) { value = null; }
        this.initSdopx();
        this.sdopx.assignConfig(key, value);
    };
    Controller.prototype.display = function (tplname) {
        this.initSdopx();
        var content = this.sdopx.display(tplname);
        this.end(content);
    };
    Controller.prototype.fetch = function (tplname) {
        this.initSdopx();
        return this.sdopx.fetch(tplname);
    };
    Controller.prototype.indexAction = function () {
        this.end('hello beaconjs.');
    };
    Controller.prototype.getIP = function () {
        return this.context.getIP();
    };
    Controller.prototype.getMethod = function () {
        return this.context.method.toLowerCase();
    };
    Controller.prototype.isMethod = function (method) {
        return this.context.method === method.toUpperCase();
    };
    Controller.prototype.isGet = function () {
        return this.context.isGet();
    };
    Controller.prototype.isPost = function () {
        return this.context.isPost();
    };
    Controller.prototype.isAjax = function () {
        return this.context.isAjax();
    };
    Controller.prototype.get = function (name, def) {
        return this.context.get(name, def);
    };
    Controller.prototype.post = function (name, def) {
        return this.context.post(name, def);
    };
    Controller.prototype.param = function (name, def) {
        return this.context.param(name, def);
    };
    Controller.prototype.file = function (name) {
        return this.context.file(name);
    };
    Controller.prototype.getHeader = function (name) {
        return this.context.getHeader(name);
    };
    Controller.prototype.setHeader = function (name, value) {
        return this.context.setHeader(name, value);
    };
    Controller.prototype.getUserAgent = function () {
        return this.context.getUserAgent();
    };
    Controller.prototype.getReferrer = function (host) {
        return this.context.getReferrer(host);
    };
    Controller.prototype.setStatus = function (status) {
        if (status === void 0) { status = 200; }
        return this.context.setStatus(status);
    };
    //获取配置项
    Controller.prototype.getConfig = function (key, def) {
        return Beacon.getConfig(key, def);
    };
    //获取配置项
    Controller.prototype.route = function (name, def) {
        return this.context.route(name, def);
    };
    //获取配置项
    Controller.prototype.setConfig = function (key, def) {
        return Beacon.getConfig(key, def);
    };
    Controller.prototype.getCookie = function (name) {
        return this.context.getCookie(name);
    };
    Controller.prototype.setCookie = function (name, value, options) {
        return this.context.setCookie(name, value, options);
    };
    Controller.prototype.initSesion = function (type) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.context.initSesion(type);
        });
    };
    Controller.prototype.getSession = function (name) {
        return this.context.getSession(name);
    };
    Controller.prototype.setSession = function (name, value) {
        return this.context.setSession(name, value);
    };
    Controller.prototype.delSession = function (name) {
        return this.context.delSession(name);
    };
    Controller.prototype.redirect = function (url, code) {
        this.context.redirect(url, code);
    };
    Controller.prototype.setExpires = function (time) {
        this.context.setExpires(time);
        return this;
    };
    Controller.prototype.write = function (obj, encoding) {
        if (obj === void 0) { obj = null; }
        if (encoding === void 0) { encoding = null; }
        return this.context.write(obj, encoding);
    };
    /**
     * end output
     * @param  {Object} obj      []
     * @param  {String} encoding [content encoding]
     * @return {}          []
     */
    Controller.prototype.end = function (obj, encoding) {
        if (obj === void 0) { obj = null; }
        if (encoding === void 0) { encoding = null; }
        this.context.end(obj, encoding);
    };
    Controller.prototype.getContentType = function () {
        return this.context.getContentType();
    };
    Controller.prototype.setContentType = function (ext, encoding) {
        return this.context.setContentType(ext, encoding);
    };
    Controller.prototype.sendTime = function (name) {
        return this.context.sendTime(name);
    };
    return Controller;
}());
exports.Controller = Controller;
//# sourceMappingURL=controller.js.map