"use strict";
const crypto = require("crypto");
class Cookie {
    static parse(str) {
        let data = {};
        if (!str) {
            return data;
        }
        str.split(/; */).forEach(item => {
            let pos = item.indexOf('=');
            if (pos === -1) {
                return;
            }
            let key = item.substr(0, pos).trim();
            let val = item.substr(pos + 1).trim();
            if ('"' === val[0]) {
                val = val.slice(1, -1);
            }
            if (data[key] === void 0) {
                try {
                    data[key] = decodeURIComponent(val);
                }
                catch (e) {
                    data[key] = val;
                }
            }
        });
        return data;
    }
    static stringify(name, value, options) {
        options = options || {};
        let item = [name + '=' + encodeURIComponent(value)];
        if (options.maxage) {
            item.push('Max-Age=' + options.maxage);
        }
        if (options.domain) {
            item.push('Domain=' + options.domain);
        }
        if (options.path) {
            item.push('Path=' + options.path);
        }
        let expires = options.expires;
        if (expires) {
            if (expires instanceof Date == false) {
                expires = new Date(expires);
            }
            item.push('Expires=' + expires.toUTCString());
        }
        if (options.httponly) {
            item.push('HttpOnly');
        }
        if (options.secure) {
            item.push('Secure');
        }
        return item.join('; ');
    }
    static sign(val, secret = '') {
        secret = crypto.createHmac('sha256', secret).update(val).digest('base64');
        secret = secret.replace(/\=+$/, '');
        return val + '.' + secret;
    }
    static unsign(val, secret) {
        let str = val.slice(0, val.lastIndexOf('.'));
        return Cookie.sign(str, secret) === val ? str : '';
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Cookie;
//# sourceMappingURL=cookie.js.map