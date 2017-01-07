"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
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
var url = require("url");
var mime = require("mime");
var os = require("os");
var path = require("path");
var multiparty = require("multiparty");
var cookie_1 = require("../util/cookie");
var querystring = require("querystring");
var HttpContext = (function () {
    function HttpContext(req, res) {
        this.hostname = '';
        this.pathname = '';
        this.payload = null;
        this.query = {};
        this._file = {};
        this._post = {};
        this._get = {};
        this._cookie = {};
        this._session = null;
        this._route = {};
        this._sendCookie = null;
        this._isEnd = false;
        this._timeoutTimer = null;
        this._contentTypeIsSend = false;
        this.req = req;
        this.res = res;
        this.startTime = Date.now();
        this.parseRequest();
        var timeout = 0;
        if (timeout) {
            this._timeoutTimer = res.setTimeout(timeout * 1000, function () {
                var err = new Error('request timeout');
                this.error = err;
                return;
            });
        }
    }
    HttpContext.prototype.parseRequest = function () {
        this.url = this.req.url;
        this.version = this.req.httpVersion;
        this.method = this.req.method;
        this.headers = this.req.headers;
        this.host = this.headers.host || '';
        if (this.url === '/') {
            this.pathname = '/';
            var pos = this.host.indexOf(':');
            this.hostname = pos === -1 ? this.host : this.host.slice(0, pos);
        }
        else {
            var urlInfo = url.parse('//' + this.host + this.req.url, true, true);
            this.pathname = this.normalizePathname(urlInfo.pathname);
            this.hostname = urlInfo.hostname;
            var query = urlInfo.query;
            if (query) {
                this.query = query;
                this._get = Object.assign({}, query);
            }
        }
    };
    HttpContext.prototype.parseRouteGet = function (args) {
        if (args === void 0) { args = {}; }
        this._route = Object.assign({}, args);
        for (var key in args) {
            if (['app', 'ctl', 'act'].indexOf(key) > -1) {
                continue;
            }
            if (this._get[key] === void 0) {
                this._get[key] = args[key];
            }
        }
    };
    HttpContext.prototype.normalizePathname = function (pathname) {
        var paths = pathname.split(/\/|\\/);
        var i = 0, result = [];
        while (i < paths.length) {
            if (paths[i].length > 0 && decodeURIComponent(paths[i])[0] !== '.') {
                result.push(paths[i]);
            }
            i++;
        }
        return '/' + result.join('/');
    };
    HttpContext.prototype.hasPayload = function () {
        if ('transfer-encoding' in this.req.headers) {
            return true;
        }
        return (this.req.headers['content-length'] | 0) > 0;
    };
    HttpContext.prototype.getPayload = function (encoding) {
        return __awaiter(this, void 0, void 0, function () {
            var that, _getPayload, buffer;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.payload) {
                            return [2 /*return*/, this.payload];
                        }
                        if (!this.req.readable) {
                            return [2 /*return*/, new Buffer(0)];
                        }
                        that = this;
                        _getPayload = function () {
                            var buffers = [];
                            var deferred = Beacon.defer();
                            that.req.on('data', function (chunk) {
                                buffers.push(chunk);
                            });
                            that.req.on('end', function () {
                                that.payload = Buffer.concat(buffers);
                                deferred.resolve(that.payload);
                            });
                            that.req.on('error', function () {
                                that.res.statusCode = 400;
                                that.end();
                                deferred.reject(new Error('client error'));
                            });
                            return deferred.promise;
                        };
                        return [4 /*yield*/, _getPayload()];
                    case 1:
                        buffer = _a.sent();
                        if (encoding === true) {
                            return [2 /*return*/, buffer];
                        }
                        encoding = encoding === void 0 ? 'utf-8' : encoding;
                        return [2 /*return*/, buffer.toString(encoding)];
                }
            });
        });
    };
    HttpContext.prototype.parsePayload = function (encoding) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.req.readable) {
                            return [2 /*return*/];
                        }
                        if (!(['POST', 'PUT', 'PATCH'].indexOf(this.req.method) > -1)) return [3 /*break*/, 4];
                        if (!this.hasPayload()) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.parseQuerystring(encoding)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [4 /*yield*/, this.parseForm()];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    HttpContext.prototype.parseQuerystring = function (encoding) {
        return __awaiter(this, void 0, void 0, function () {
            var contentType, buffer;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        contentType = this.getContentType();
                        if (contentType && contentType.indexOf('application/x-www-form-urlencoded') === -1) {
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.getPayload(encoding)];
                    case 1:
                        buffer = _a.sent();
                        this._post = Object.assign(this._post, querystring.parse(buffer));
                        return [2 /*return*/];
                }
            });
        });
    };
    HttpContext.prototype.parseForm = function (encoding) {
        return __awaiter(this, void 0, void 0, function () {
            var re, contentType, uploadDir;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        re = /^multipart\/(form-data|related);\s*boundary=(?:"([^"]+)"|([^;]+))$/i;
                        contentType = this.getHeader('content-type');
                        if (!contentType || !re.test(contentType)) {
                            return [2 /*return*/];
                        }
                        uploadDir = Beacon.getConfig('post:file_upload_path') || null;
                        if (!uploadDir) {
                            uploadDir = path.join(os.tmpdir(), 'beacon/upload');
                        }
                        Beacon.mkdir(uploadDir);
                        return [4 /*yield*/, this.getFormData(uploadDir)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    HttpContext.prototype.getFormData = function (uploadDir) {
        var deferred = Beacon.defer();
        var postconfig = Beacon.getConfig("post:*");
        var form = new multiparty.Form({
            maxFieldsSize: postconfig.max_file_size || 1073741824,
            maxFields: postconfig.max_fields || 100,
            maxFilesSize: postconfig.max_fields_size || 2097152,
            uploadDir: uploadDir
        });
        var files = this._file;
        var that = this;
        form.on('file', function (name, value) {
            if (name in files) {
                if (!Beacon.isArray(files[name])) {
                    files[name] = [files[name]];
                }
                files[name].push(value);
            }
            else {
                files[name] = value;
            }
        });
        form.on('field', function (name, value) {
            that._post[name] = value;
        });
        form.on('close', function () {
            deferred.resolve(null);
        });
        form.on('error', function (err) {
            that.req.resume();
            that.res.statusCode = 400;
            that.end();
            deferred.reject(err);
        });
        form.parse(this.req);
        return deferred.promise;
    };
    HttpContext.prototype.isGet = function () {
        return this.method === 'GET';
    };
    HttpContext.prototype.isPost = function () {
        return this.method === 'POST';
    };
    HttpContext.prototype.isAjax = function () {
        return this.headers['x-requested-with'] === 'XMLHttpRequest';
    };
    HttpContext.prototype.route = function (name, def) {
        if (name === void 0) {
            return this._route;
        }
        return this._route[name] === void 0 ? def : this._route[name];
    };
    HttpContext.prototype.get = function (name, def) {
        if (name === void 0) {
            return this._get;
        }
        var m = name.match(/^(.*):([sinbda])$/);
        if (!m) {
            if (def === void 0) {
                def = '';
            }
            return this._get[name] === void 0 ? def : this._get[name];
        }
        var type = m[2];
        name = m[1];
        switch (type) {
            case 's':
                return this.sGet(name, def);
            case 'i':
                return this.iGet(name, def);
            case 'n':
                return this.nGet(name, def);
            case 'b':
                return this.bGet(name, def);
            case 'd':
                return this.dGet(name, def);
            case 'a':
                return this.aGet(name, def);
            default:
                if (def === void 0) {
                    return '';
                }
                return def;
        }
    };
    HttpContext.prototype.post = function (name, def) {
        if (name === void 0) {
            return this._post;
        }
        var m = name.match(/^(.*):([sinbda])$/);
        if (!m) {
            if (def === void 0) {
                def = '';
            }
            return this._post[name] === void 0 ? def : this._post[name];
        }
        var type = m[2];
        name = m[1];
        switch (type) {
            case 's':
                return this.sPost(name, def);
            case 'i':
                return this.iPost(name, def);
            case 'n':
                return this.nPost(name, def);
            case 'b':
                return this.bPost(name, def);
            case 'd':
                return this.dPost(name, def);
            case 'a':
                return this.aPost(name, def);
            default:
                if (def === void 0) {
                    return '';
                }
                return def;
        }
    };
    HttpContext.prototype.param = function (name, def) {
        if (name === void 0) {
            return Object.assign({}, this._get, this._post);
        }
        if (this._post[name] !== void 0) {
            return this.post(name, def);
        }
        return this.get(name, def);
    };
    HttpContext.prototype.sGet = function (name, def) {
        if (def === void 0) { def = ''; }
        return (this._get[name] === void 0 ? def : String(this._get[name]));
    };
    HttpContext.prototype.iGet = function (name, def) {
        if (def === void 0) { def = 0; }
        var value = (this._get[name] === void 0 ? '' : this._get[name]).trim();
        if (/^[+-]?\d+(\.\d+)?$/.test(value)) {
            var ivalue = parseInt(value);
            return ivalue === NaN ? def : ivalue;
        }
        return def;
    };
    HttpContext.prototype.nGet = function (name, def) {
        if (def === void 0) { def = 0; }
        var value = (this._get[name] === void 0 ? '' : this._get[name]).trim();
        if (/^[+-]?\d+(\.\d+)?$/.test(value)) {
            var ivalue = Number(value);
            return ivalue === NaN ? def : ivalue;
        }
        return def;
    };
    HttpContext.prototype.bGet = function (name, def) {
        if (def === void 0) { def = false; }
        var value = (this._get[name] === void 0 ? '' : this._get[name]).trim();
        if (value === '') {
            return def;
        }
        if (value == '1' || value == 'true' || value == 'yes') {
            return true;
        }
        return false;
    };
    HttpContext.prototype.dGet = function (name, def) {
        if (def === void 0) { def = new Date(); }
        var value = (this._get[name] === void 0 ? '' : this._get[name]).trim();
        var date = new Date(value);
        if (date == null || date.toString() == 'Invalid Date' || isNaN(date.getTime())) {
            return def;
        }
        return date;
    };
    HttpContext.prototype.aGet = function (name, def) {
        if (def === void 0) { def = []; }
        var value = (this._get[name] === void 0 ? def : this._get[name]);
        if (value instanceof Array) {
            return value;
        }
        return def;
    };
    HttpContext.prototype.sPost = function (name, def) {
        if (def === void 0) { def = ''; }
        return (this._post[name] === void 0 ? def : String(this._post[name]));
    };
    HttpContext.prototype.iPost = function (name, def) {
        if (def === void 0) { def = 0; }
        var value = (this._post[name] === void 0 ? '' : this._post[name]).trim();
        if (/^[+-]\d+(\.\d+)?$/.test(value)) {
            var ivalue = parseInt(value);
            return ivalue === NaN ? def : ivalue;
        }
        return def;
    };
    HttpContext.prototype.nPost = function (name, def) {
        if (def === void 0) { def = 0; }
        var value = (this._post[name] === void 0 ? '' : this._post[name]).trim();
        if (/^[+-]\d+(\.\d+)?$/.test(value)) {
            var ivalue = Number(value);
            return ivalue === NaN ? def : ivalue;
        }
        return def;
    };
    HttpContext.prototype.bPost = function (name, def) {
        if (def === void 0) { def = false; }
        var value = (this._post[name] === void 0 ? '' : this._post[name]).trim();
        if (value === '') {
            return def;
        }
        if (value == '1' || value == 'true' || value == 'yes') {
            return true;
        }
        return false;
    };
    HttpContext.prototype.dPost = function (name, def) {
        if (def === void 0) { def = new Date(); }
        var value = (this._post[name] === void 0 ? '' : this._post[name]).trim();
        var date = new Date(value);
        if (date == null || date.toString() == 'Invalid Date' || isNaN(date.getTime())) {
            return def;
        }
        return date;
    };
    HttpContext.prototype.aPost = function (name, def) {
        if (def === void 0) { def = []; }
        var value = (this._post[name] === void 0 ? def : this._post[name]);
        if (value instanceof Array) {
            return value;
        }
        return def;
    };
    HttpContext.prototype.file = function (name) {
        if (name === void 0) {
            return Object.assign({}, this._file);
        }
        return this._file[name] || null;
    };
    HttpContext.prototype.getContentType = function () {
        return (this.headers['content-type'] || '').split(';')[0].trim();
    };
    HttpContext.prototype.setContentType = function (type, encoding) {
        if (encoding === void 0) { encoding = 'utf-8'; }
        if (this._contentTypeIsSend) {
            return;
        }
        if (type.indexOf('/') === -1) {
            type = mime.lookup(type);
        }
        if (encoding !== void 0 && type.toLowerCase().indexOf('charset=') === -1) {
            type += '; charset=' + encoding;
        }
        this.setHeader('Content-Type', type);
    };
    HttpContext.prototype.getHeader = function (name) {
        if (name === void 0) {
            return this.headers;
        }
        return this.headers[name.toLowerCase()] || '';
    };
    HttpContext.prototype.setHeader = function (name, value) {
        if (name.toLowerCase() === 'content-type') {
            this._contentTypeIsSend = true;
        }
        if (!this.res.headersSent) {
            this.res.setHeader(name, value);
        }
        return this;
    };
    HttpContext.prototype.getUserAgent = function () {
        return this.headers['user-agent'] || '';
    };
    HttpContext.prototype.getReferrer = function (host) {
        var referer = this.headers.referer || this.headers.referrer || '';
        if (!referer || !host) {
            return referer;
        }
        var info = url.parse(referer);
        return info.hostname;
    };
    HttpContext.prototype.setStatus = function (status) {
        if (status === void 0) { status = 200; }
        var res = this.res;
        if (!res.headersSent) {
            res.statusCode = status;
        }
        return this;
    };
    HttpContext.prototype.getIP = function (proxy_on, forward) {
        if (proxy_on === void 0) { proxy_on = false; }
        if (forward === void 0) { forward = false; }
        var proxy = proxy_on || this.host === this.hostname;
        var userIP;
        var localIP = '127.0.0.1';
        if (proxy) {
            if (forward) {
                return (this.headers['x-forwarded-for'] || '').split(',').filter(function (item) {
                    item = item.trim();
                    if (Beacon.isIP(item)) {
                        return item;
                    }
                });
            }
            userIP = this.headers['x-real-ip'];
        }
        else {
            var connection = this.req.connection;
            var socket = this.req.socket;
            if (connection && connection.remoteAddress !== localIP) {
                userIP = connection.remoteAddress;
            }
            else if (socket && socket.remoteAddress !== localIP) {
                userIP = socket.remoteAddress;
            }
        }
        if (!userIP) {
            return localIP;
        }
        if (userIP.indexOf(':') > -1) {
            userIP = userIP.split(':').slice(-1)[0];
        }
        if (!Beacon.isIP(userIP)) {
            return localIP;
        }
        return userIP;
    };
    HttpContext.prototype.getCookie = function (name) {
        if (Object.keys(this._cookie).length == 0 && this.headers.cookie) {
            this._cookie = cookie_1.default.parse(this.headers.cookie);
        }
        if (name === void 0) {
            return this._cookie;
        }
        return this._cookie[name] || '';
    };
    HttpContext.prototype.setCookie = function (name, value, options) {
        if (options === void 0) {
            options = { timeout: 0 };
        }
        if (typeof options === 'number') {
            options = { timeout: options };
        }
        options = Object.assign(Beacon.getConfig('cookie:*', {
            domain: '',
            path: '/',
            httponly: false,
            secure: false,
            timeout: 0
        }), options);
        if (value === null) {
            options.timeout = -1000;
        }
        if (options.timeout !== 0) {
            options.expires = new Date(Date.now() + options.timeout * 1000);
        }
        if (options.timeout > 0) {
            options.maxage = options.timeout;
        }
        options.name = name;
        options.value = value;
        if (this._sendCookie === null) {
            this._sendCookie = {};
        }
        this._sendCookie[name] = options;
    };
    HttpContext.prototype.sendCookie = function () {
        if (this._sendCookie == null || Object.keys(this._sendCookie).length == 0) {
            return;
        }
        var values = [];
        for (var key in this._sendCookie) {
            values.push(this._sendCookie[key]);
        }
        var cookies = values.map(function (item) {
            return cookie_1.default.stringify(item.name, item.value, item);
        });
        this.setHeader('Set-Cookie', cookies);
        this._sendCookie = null;
    };
    HttpContext.prototype.initSesion = function (type) {
        if (type === void 0) { type = Beacon.getConfig('session:type', 'file'); }
        return __awaiter(this, void 0, void 0, function () {
            var session_cookie_name, session_cookie_length, cookie_value;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        session_cookie_name = Beacon.getConfig('session:cookie_name', 'BEACONSSID');
                        session_cookie_length = Beacon.getConfig('session:cookie_length', 24);
                        cookie_value = this.getCookie(session_cookie_name);
                        if (!cookie_value) {
                            cookie_value = Beacon.uuid(session_cookie_length);
                            this.setCookie(session_cookie_name, cookie_value);
                        }
                        this._session = Beacon.getSessionInstance(type);
                        return [4 /*yield*/, this._session.init(cookie_value)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    HttpContext.prototype.getSession = function (name) {
        return this._session.get(name);
    };
    HttpContext.prototype.setSession = function (name, value) {
        this._session.set(name, value);
    };
    HttpContext.prototype.delSession = function (name) {
        this._session.delete(name);
    };
    HttpContext.prototype.sendTime = function (name) {
        var time = Date.now() - this.startTime;
        this.setHeader('X-' + (name || 'EXEC-TIME'), time + 'ms');
    };
    HttpContext.prototype.redirect = function (url, code) {
        this.res.statusCode = code || 302;
        this.setHeader('Location', url || '/');
        this.end();
    };
    HttpContext.prototype.setExpires = function (time) {
        time = time * 1000;
        var date = new Date(Date.now() + time);
        this.setHeader('Cache-Control', "max-age=" + time);
        this.setHeader('Expires', date.toUTCString());
    };
    HttpContext.prototype.write = function (obj, encoding) {
        if (obj === void 0) { obj = null; }
        if (encoding === void 0) { encoding = null; }
        if (!this.res.connection) {
            return;
        }
        if (!this._contentTypeIsSend) {
            this.setContentType(Beacon.getConfig('default_content_type', 'text/html'));
        }
        this.sendCookie();
        if (obj === null) {
            return;
        }
        if (Beacon.isArray(obj) || Beacon.isObject(obj)) {
            obj = JSON.stringify(obj);
        }
        else if (!Beacon.isBuffer(obj)) {
            obj += '';
        }
        return this.res.write(obj, encoding);
    };
    HttpContext.prototype._end = function () {
        this.sendCookie();
        this.res.end();
        if (this._session) {
            if (Beacon.isPromise(this._session.flush)) {
                this._session.flush().catch(function (e) {
                    throw e;
                });
            }
            else {
                this._session.flush();
            }
        }
    };
    HttpContext.prototype.end = function (obj, encoding) {
        if (obj === void 0) { obj = null; }
        if (encoding === void 0) { encoding = null; }
        if (this._isEnd) {
            return;
        }
        if (this._timeoutTimer) {
            clearTimeout(this._timeoutTimer);
            this._timeoutTimer = null;
        }
        this.write(obj, encoding);
        this._isEnd = true;
        return this._end();
    };
    return HttpContext;
}());
exports.HttpContext = HttpContext;
//# sourceMappingURL=http_context.js.map