import url = require('url');
import mime = require('mime');
import os = require('os');
import multiparty = require('multiparty');
import cookie from '../util/cookie';
import querystring =require('querystring');
declare var Beacon: any;

export class HttpContext {

    public req;
    public res;
    public startTime;
    public url;
    public version;
    public method;
    public headers;
    public host;
    public hostname = '';
    public pathname = '';
    public payload = null;
    public query = {};
    private _file = {};
    private _post = {};
    private _get = {};
    private _cookie = {};
    private _route = {};
    private _sendCookie = null;

    private _isEnd = false;
    private _timeoutTimer = null;
    private _contentTypeIsSend = false;

    public constructor(req, res) {
        this.req = req;
        this.res = res;
        this.startTime = Date.now();
        this.parseRequest();
        let timeout = 0;
        if (timeout) {
            this._timeoutTimer = res.setTimeout(timeout * 1000, function () {
                let err = new Error('request timeout');
                this.error = err;
                return;
            });
        }
    }

    private parseRequest() {
        this.url = this.req.url;
        this.version = this.req.httpVersion;
        this.method = this.req.method;
        this.headers = this.req.headers;
        this.host = this.headers.host || '';
        if (this.url === '/') {
            this.pathname = '/';
            let pos = this.host.indexOf(':');
            this.hostname = pos === -1 ? this.host : this.host.slice(0, pos);
        } else {
            let urlInfo = url.parse('//' + this.host + this.req.url, true, true);
            this.pathname = this.normalizePathname(urlInfo.pathname);
            this.hostname = urlInfo.hostname;
            let query = urlInfo.query;
            if (query) {
                this.query = query;
                this._get = Object.assign({}, query);
            }
        }
    }

    public parseRouteGet(args = {}) {
        this._route = Object.assign({}, args);
        for (let key in args) {
            if (['app', 'ctl', 'act'].indexOf(key) > -1) {
                continue;
            }
            if (this._get[key] === void 0) {
                this._get[key] = args[key];
            }
        }
    }

    private normalizePathname(pathname) {
        var paths = pathname.split(/\/|\\/);
        let i = 0, result = [];
        while (i < paths.length) {
            if (paths[i].length > 0 && decodeURIComponent(paths[i])[0] !== '.') {
                result.push(paths[i]);
            }
            i++;
        }
        return result.join('/');
    }

    public  hasPayload() {
        if ('transfer-encoding' in this.req.headers) {
            return true;
        }
        return (this.req.headers['content-length'] | 0) > 0;
    }

    public async getPayload(encoding?) {
        if (this.payload) {
            return this.payload;
        }
        if (!this.req.readable) {
            return new Buffer(0);
        }
        let that = this;
        let _getPayload = function () {
            let buffers = [];
            let deferred = Beacon.defer();
            that.req.on('data', chunk => {
                buffers.push(chunk);
            });
            that.req.on('end', () => {
                that.payload = Buffer.concat(buffers);
                deferred.resolve(that.payload);
            });
            that.req.on('error', () => {
                that.res.statusCode = 400;
                that.end();
                deferred.reject(new Error('client error'));
            });
            return deferred.promise;
        };
        let buffer = await _getPayload();
        if (encoding === true) {
            return buffer;
        }
        encoding = encoding === void 0 ? 'utf-8' : encoding;
        return buffer.toString(encoding);
    }

    public async parsePayload(encoding?) {
        if (!this.req.readable) {
            return;
        }
        if (['POST', 'PUT', 'PATCH'].indexOf(this.req.method) > -1) {
            if (this.hasPayload()) {
                await this.parseQuerystring(encoding);
            }
            await this.parseForm();
        }
    }

    public async parseQuerystring(encoding?) {
        let contentType = this.getContentType();
        if (contentType && contentType.indexOf('application/x-www-form-urlencoded') === -1) {
            return;
        }
        let buffer = await this.getPayload(encoding);
        this._post = Object.assign(this._post, querystring.parse(buffer));
    }

    public async parseForm(encoding?) {
        let re = /^multipart\/(form-data|related);\s*boundary=(?:"([^"]+)"|([^;]+))$/i;
        let contentType = this.getHeader('content-type');
        if (!contentType || !re.test(contentType)) {
            return;
        }
        let uploadDir = Beacon.getConfig('post:file_upload_path') || null;
        if (!uploadDir) {
            uploadDir = os.tmpdir() + Beacon.sep + 'Beacon' + Beacon.sep + 'upload';
        }
        Beacon.mkdir(uploadDir);
        await this.getFormData(uploadDir);
    }

    private getFormData(uploadDir) {
        let deferred = Beacon.defer();
        let postconfig = Beacon.getConfig("post:*");
        let form = new multiparty.Form({
            maxFieldsSize: postconfig.max_file_size || 1073741824,
            maxFields: postconfig.max_fields || 100,
            maxFilesSize: postconfig.max_fields_size || 2097152,
            uploadDir: uploadDir
        });
        let files = this._file;
        let that = this;

        form.on('file', (name, value) => {
            if (name in files) {
                if (!Beacon.isArray(files[name])) {
                    files[name] = [files[name]];
                }
                files[name].push(value);
            } else {
                files[name] = value;
            }
        });

        form.on('field', (name, value) => {
            that._post[name] = value;
        });

        form.on('close', () => {
            deferred.resolve(null);
        });

        form.on('error', err => {
            that.req.resume();
            that.res.statusCode = 400;
            that.end();
            deferred.reject(err);
        });

        form.parse(this.req);
        return deferred.promise;
    }

    public isGet() {
        return this.method === 'GET';
    }

    public isPost() {
        return this.method === 'POST';
    }

    public isAjax() {
        return this.headers['x-requested-with'] === 'XMLHttpRequest';
    }

    public route(name?: string, def?) {
        if (name === void 0) {
            return this._route;
        }
        return this._route[name] === void 0 ? def : this._route[name];
    }

    public get(name?: string, def?) {
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
        let type = m[2];
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
    }

    public post(name?: string, def?) {
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
        let type = m[2];
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
    }

    public param(name?: string, def?) {
        if (name === void 0) {
            return Object.assign({}, this._get, this._post);
        }
        if (this._post[name] !== void 0) {
            return this.post(name, def);
        }
        return this.get(name, def);
    }

    public sGet(name: string, def: string = '') {
        return (this._get[name] === void 0 ? def : String(this._get[name]));
    }

    public iGet(name: string, def: number = 0) {
        let value = (this._get[name] === void 0 ? '' : this._get[name]).trim();
        if (/^[+-]?\d+(\.\d+)?$/.test(value)) {
            let ivalue = parseInt(value);
            return ivalue === NaN ? def : ivalue;
        }
        return def;
    }

    public nGet(name: string, def: number = 0) {
        let value = (this._get[name] === void 0 ? '' : this._get[name]).trim();
        if (/^[+-]?\d+(\.\d+)?$/.test(value)) {
            let ivalue = Number(value);
            return ivalue === NaN ? def : ivalue;
        }
        return def;
    }

    public bGet(name: string, def: boolean = false) {
        let value = (this._get[name] === void 0 ? '' : this._get[name]).trim();
        if (value === '') {
            return def;
        }
        if (value == '1' || value == 'true' || value == 'yes') {
            return true;
        }
        return false;
    }

    public dGet(name: string, def: Date = new Date()) {
        let value = (this._get[name] === void 0 ? '' : this._get[name]).trim();
        let date = new Date(value);
        if (date == null || date.toString() == 'Invalid Date' || isNaN(date.getTime())) {
            return def;
        }
        return date;
    }

    public aGet(name: string, def = []) {
        let value = (this._get[name] === void 0 ? def : this._get[name]);
        if (value instanceof Array) {
            return value;
        }
        return def;
    }

    public sPost(name: string, def: string = '') {
        return (this._post[name] === void 0 ? def : String(this._post[name]));
    }

    public iPost(name: string, def: number = 0) {
        let value = (this._post[name] === void 0 ? '' : this._post[name]).trim();
        if (/^[+-]\d+(\.\d+)?$/.test(value)) {
            let ivalue = parseInt(value);
            return ivalue === NaN ? def : ivalue;
        }
        return def;
    }

    public nPost(name: string, def: number = 0) {
        let value = (this._post[name] === void 0 ? '' : this._post[name]).trim();
        if (/^[+-]\d+(\.\d+)?$/.test(value)) {
            let ivalue = Number(value);
            return ivalue === NaN ? def : ivalue;
        }
        return def;
    }

    public bPost(name: string, def: boolean = false) {
        let value = (this._post[name] === void 0 ? '' : this._post[name]).trim();
        if (value === '') {
            return def;
        }
        if (value == '1' || value == 'true' || value == 'yes') {
            return true;
        }
        return false;
    }

    public dPost(name: string, def: Date = new Date()) {
        let value = (this._post[name] === void 0 ? '' : this._post[name]).trim();
        let date = new Date(value);
        if (date == null || date.toString() == 'Invalid Date' || isNaN(date.getTime())) {
            return def;
        }
        return date;
    }

    public aPost(name: string, def = []) {
        let value = (this._post[name] === void 0 ? def : this._post[name]);
        if (value instanceof Array) {
            return value;
        }
        return def;
    }

    public file(name?: string) {
        if (name === void 0) {
            return Object.assign({}, this._file);
        }
        return this._file[name] || null;
    }

    public getContentType() {
        return (this.headers['content-type'] || '').split(';')[0].trim();
    }

    public setContentType(type: string, encoding = 'utf-8') {
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
    }

    public getHeader(name?: string) {
        if (name === void 0) {
            return this.headers;
        }
        return this.headers[name.toLowerCase()] || '';
    }

    public setHeader(name: string, value) {
        if (name.toLowerCase() === 'content-type') {
            this._contentTypeIsSend = true;
        }
        if (!this.res.headersSent) {
            this.res.setHeader(name, value);
        }
        return this;
    }

    public getUserAgent() {
        return this.headers['user-agent'] || '';
    }

    public getReferrer(host?: string) {
        let referer = this.headers.referer || this.headers.referrer || '';
        if (!referer || !host) {
            return referer;
        }
        let info = url.parse(referer);
        return info.hostname;
    }

    public setStatus(status: number = 200) {
        let res = this.res;
        if (!res.headersSent) {
            res.statusCode = status;
        }
        return this;
    }

    public getIP(proxy_on: boolean = false, forward: boolean = false) {
        let proxy = proxy_on || this.host === this.hostname;
        let userIP;
        let localIP = '127.0.0.1';
        if (proxy) {
            if (forward) {
                return (this.headers['x-forwarded-for'] || '').split(',').filter(item => {
                    item = item.trim();
                    if (Beacon.isIP(item)) {
                        return item;
                    }
                });
            }
            userIP = this.headers['x-real-ip'];
        } else {
            let connection = this.req.connection;
            let socket = this.req.socket;
            if (connection && connection.remoteAddress !== localIP) {
                userIP = connection.remoteAddress;
            } else if (socket && socket.remoteAddress !== localIP) {
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
    }

    public getCookie(name?: string) {
        if (Object.keys(this._cookie).length == 0 && this.headers.cookie) {
            this._cookie = cookie.parse(this.headers.cookie);
        }
        if (name === void 0) {
            return this._cookie;
        }
        return this.headers[name.toLowerCase()] || '';
    }

    public setCookie(name: string, value: string, options?) {
        if (options === void 0) {
            options = {timeout: 0};
        }
        if (typeof options === 'number') {
            options = {timeout: options};
        }
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
    }

    public sendCookie() {
        if (this._sendCookie == null || Object.keys(this._sendCookie).length == 0) {
            return;
        }
        let cookies = Object.values(this._sendCookie).map((item) => {
            return cookie.stringify(item.name, item.value, item);
        });
        this.setHeader('Set-Cookie', cookies);
        this._sendCookie = null;
    }

    public sendTime(name?: string) {
        let time = Date.now() - this.startTime;
        this.setHeader('X-' + (name || 'EXEC-TIME'), time + 'ms');
    }

    public redirect(url, code?: number) {
        this.res.statusCode = code || 302;
        this.setHeader('Location', url || '/');
        this.end();
    }

    public setExpires(time: number) {
        time = time * 1000;
        let date = new Date(Date.now() + time);
        this.setHeader('Cache-Control', `max-age=${time}`);
        this.setHeader('Expires', date.toUTCString());
    }

    public write(obj = null, encoding: string = null) {
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
        } else if (!Beacon.isBuffer(obj)) {
            obj += '';
        }
        return this.res.write(obj, encoding);

    }

    private _end() {
        this.sendCookie();
        this.res.end();
    }

    public end(obj = null, encoding = null) {
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
    }

}