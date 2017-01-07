"use strict";
var crypto = require("crypto");
var Cookie = (function () {
    function Cookie() {
    }
    Cookie.parse = function (str) {
        var data = {};
        if (!str) {
            return data;
        }
        str.split(/; */).forEach(function (item) {
            var pos = item.indexOf('=');
            if (pos === -1) {
                return;
            }
            var key = item.substr(0, pos).trim();
            var val = item.substr(pos + 1).trim();
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
    };
    Cookie.stringify = function (name, value, options) {
        options = options || {};
        var item = [name + '=' + encodeURIComponent(value)];
        if (options.maxage) {
            item.push('Max-Age=' + options.maxage);
        }
        if (options.domain) {
            item.push('Domain=' + options.domain);
        }
        if (options.path) {
            item.push('Path=' + options.path);
        }
        var expires = options.expires;
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
    };
    Cookie.sign = function (val, secret) {
        if (secret === void 0) { secret = ''; }
        secret = crypto.createHmac('sha256', secret).update(val).digest('base64');
        secret = secret.replace(/\=+$/, '');
        return val + '.' + secret;
    };
    Cookie.unsign = function (val, secret) {
        var str = val.slice(0, val.lastIndexOf('.'));
        return Cookie.sign(str, secret) === val ? str : '';
    };
    return Cookie;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Cookie;
//# sourceMappingURL=cookie.js.map