"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t;
    return { next: verb(0), "throw": verb(1), "return": verb(2) };
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
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
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.context.initSesion(type)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
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