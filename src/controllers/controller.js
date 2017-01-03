"use strict";
const sdopx_1 = require("sdopx");
class Controller {
    constructor(context) {
        this.context = null;
        this.sdopx = new sdopx_1.Sdopx();
        this.template_dirs = null;
        this.context = context;
    }
    initSdopx() {
        if (this.sdopx === null) {
            this.sdopx = new sdopx_1.Sdopx();
            this.sdopx.setTemplateDir(this.template_dirs || Beacon.VIEW_PATH);
        }
    }
    assign(key, value = null) {
        this.initSdopx();
        this.sdopx.assign(key, value);
    }
    assignConfig(key, value = null) {
        this.initSdopx();
        this.sdopx.assignConfig(key, value);
    }
    display(tplname) {
        this.initSdopx();
        let content = this.sdopx.display(tplname);
        this.end(content);
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
    redirect(url, code) {
        this.context.redirect(url, code);
    }
    setExpires(time) {
        this.context.setExpires(time);
        return this;
    }
    write(obj = null, encoding = null) {
        return this.context.write(obj, encoding);
    }
    /**
     * end output
     * @param  {Object} obj      []
     * @param  {String} encoding [content encoding]
     * @return {}          []
     */
    end(obj = null, encoding = null) {
        this.context.end(obj, encoding);
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