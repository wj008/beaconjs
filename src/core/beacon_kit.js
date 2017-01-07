"use strict";
const net = require("net");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
class Beaconkit {
    static isFunction(arg) {
        return typeof arg === 'function';
    }
    static isArguments(arg) {
        return Beaconkit.toString.call(arg) === '[object Arguments]';
    }
    ;
    static isBoolean(arg) {
        return typeof arg === 'boolean';
    }
    ;
    static isNumber(arg) {
        return typeof arg === 'number';
    }
    ;
    static isObject(arg) {
        if (Beaconkit.isBuffer(arg)) {
            return false;
        }
        return typeof arg === 'object' && arg !== null;
    }
    ;
    static isString(arg) {
        return typeof arg === 'string';
    }
    ;
    static isSymbol(arg) {
        return typeof arg === 'symbol';
    }
    static isRegExp(re) {
        return Beaconkit.isObject(re) && Beaconkit.toString.call(re) === '[object RegExp]';
    }
    static isFile(p) {
        try {
            return fs.statSync(p).isFile();
        }
        catch (e) {
        }
        return false;
    }
    ;
    static isDir(p) {
        try {
            return fs.statSync(p).isDirectory();
        }
        catch (e) {
        }
        return false;
    }
    ;
    static isNumeric(obj) {
        if (!obj) {
            return false;
        }
        let re = /^((\-?\d*\.?\d*(?:e[+-]?\d*(?:\d?\.?|\.?\d?)\d*)?)|(0[0-7]+)|(0x[0-9a-f]+))$/i;
        return re.test(obj);
    }
    ;
    static isPromise(obj) {
        if (typeof Promise == 'function') {
            if (obj instanceof Promise) {
                return true;
            }
            return false;
        }
        else {
            return !!(obj && typeof obj.then === 'function' && typeof obj['catch'] === 'function');
        }
    }
    ;
    static isNull(obj) {
        if (obj === void 0 || obj === null) {
            return true;
        }
        if (Beaconkit.isNumber(obj) && isNaN(obj)) {
            return true;
        }
        return false;
    }
    static isEmpty(obj) {
        if (Beaconkit.isNull(obj)) {
            return true;
        }
        if (Beaconkit.isObject(obj)) {
            return Object.keys(obj).length === 0;
        }
        else if (Beaconkit.isArray(obj)) {
            return obj.length === 0;
        }
        else if (Beaconkit.isString(obj)) {
            return obj.length === 0;
        }
        else if (Beaconkit.isNumber(obj)) {
            return obj === 0;
        }
        else if (Beaconkit.isBoolean(obj)) {
            return !obj;
        }
        return false;
    }
    ;
    static md5(str) {
        var instance = crypto.createHash('md5');
        instance.update(str + '', 'utf8');
        return instance.digest('hex');
    }
    ;
    static isDate(arg) {
        return arg instanceof Date;
    }
    static isError(e) {
        return (Beaconkit.toString.call(e) === '[object Error]' || e instanceof Error);
    }
    static isValidDate(obj) {
        let date = null;
        if (obj instanceof Date) {
            date = obj;
        }
        else if (typeof obj == 'number') {
            date = new Date(obj);
        }
        else if (typeof (obj) == 'string') {
            date = new Date(obj);
            if (isNaN(date.getTime()) && /^[+-]?\d+$/.test(obj)) {
                obj = parseInt(obj, 10);
                date = new Date(obj);
            }
        }
        if (date == null || date.toString() == 'Invalid Date' || isNaN(date.getTime())) {
            return false;
        }
        return true;
    }
    static datetime(obj, format = 'yyyy-MM-dd') {
        let date = null;
        if (obj instanceof Date) {
            date = obj;
        }
        else if (typeof obj == 'number') {
            date = new Date(obj);
        }
        else if (typeof (obj) == 'string') {
            date = new Date(obj);
            if (isNaN(date.getTime()) && /^[+-]?\d+$/.test(obj)) {
                obj = parseInt(obj, 10);
                date = new Date(obj);
            }
        }
        if (date == null || date.toString() == 'Invalid Date' || isNaN(date.getTime())) {
            return obj;
        }
        let zeroize = function (value, length = 2) {
            let zeros = '';
            value = String(value);
            for (let i = 0; i < (length - value.length); i++) {
                zeros += '0';
            }
            return zeros + value;
        };
        let mask = format.replace(/"[^"]*"|'[^']*'|\b(?:d{1,4}|M{1,4}|(?:yyyy|yy)|([hHmstT])\1?|[lLZ])\b/g, function ($0) {
            switch ($0) {
                case 'd':
                    return date.getDate();
                case 'dd':
                    return zeroize(date.getDate());
                case 'ddd':
                    return ['Sun', 'Mon', 'Tue', 'Wed', 'Thr', 'Fri', 'Sat'][date.getDay()];
                case 'dddd':
                    return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][date.getDay()];
                case 'M':
                    return date.getMonth() + 1;
                case 'MM':
                    return zeroize(date.getMonth() + 1);
                case 'MMM':
                    return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][date.getMonth()];
                case 'MMMM':
                    return ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][date.getMonth()];
                case 'yy':
                    return String(date.getFullYear()).substr(2);
                case 'yyyy':
                    return date.getFullYear();
                case 'h':
                    return date.getHours() % 12 || 12;
                case 'hh':
                    return zeroize(date.getHours() % 12 || 12);
                case 'H':
                    return date.getHours();
                case 'HH':
                    return zeroize(date.getHours());
                case 'm':
                    return date.getMinutes();
                case 'mm':
                    return zeroize(date.getMinutes());
                case 's':
                    return date.getSeconds();
                case 'ss':
                    return zeroize(date.getSeconds());
                case 'l':
                    return zeroize(date.getMilliseconds(), 3);
                case 'L':
                    var m = date.getMilliseconds();
                    if (m > 99)
                        m = Math.round(m / 10);
                    return zeroize(m);
                case 'tt':
                    return date.getHours() < 12 ? 'am' : 'pm';
                case 'TT':
                    return date.getHours() < 12 ? 'AM' : 'PM';
                case 'Z':
                    return date.toUTCString().match(/[A-Z]+$/);
                default:
                    return $0.substr(1, $0.length - 2);
            }
        });
        return mask;
    }
    static getNow(format = 'yyyy-MM-dd HH:mm:ss') {
        return Beaconkit.datetime(new Date(), format);
    }
    static getDate(format = 'yyyy-MM-dd') {
        return Beaconkit.datetime(new Date(), format);
    }
    static defer() {
        let deferred = { promise: null, resolve: null, reject: null };
        deferred.promise = new Promise(function (resolve, reject) {
            deferred.resolve = resolve;
            deferred.reject = reject;
        });
        return deferred;
    }
    ;
    static getFiles(dir, prefix, filter) {
        dir = path.normalize(dir);
        if (!fs.existsSync(dir)) {
            return [];
        }
        if (!Beaconkit.isString(prefix)) {
            filter = prefix;
            prefix = '';
        }
        if (filter === true) {
            filter = function (item) {
                return item[0] !== '.';
            };
        }
        prefix = prefix || '';
        var files = fs.readdirSync(dir);
        var result = [];
        files.forEach(function (item) {
            var stat = fs.statSync(dir + path.sep + item);
            if (stat.isFile()) {
                if (!filter || filter(item)) {
                    result.push(prefix + item);
                }
            }
            else if (stat.isDirectory()) {
                if (!filter || filter(item, true)) {
                    var cFiles = Beaconkit.getFiles(dir + path.sep + item, prefix + item + path.sep, filter);
                    result = result.concat(cFiles);
                }
            }
        });
        return result;
    }
    ;
    static chmod(p, mode = 777) {
        if (!fs.existsSync(p)) {
            return true;
        }
        return fs.chmodSync(p, mode);
    }
    ;
    static mkdir(p, mode = 777) {
        if (fs.existsSync(p)) {
            Beaconkit.chmod(p, mode);
            return true;
        }
        var pp = path.dirname(p);
        if (fs.existsSync(pp)) {
            fs.mkdirSync(p, mode);
        }
        else {
            Beaconkit.mkdir(pp, mode);
            Beaconkit.mkdir(p, mode);
        }
        return true;
    }
    ;
    static toUnder(str) {
        str = String(str).replace(/[A-Z]/g, function ($0) {
            return '_' + String($0).toLocaleLowerCase();
        }).replace(/^_+/, '');
        return str;
    }
    static toCamel(str) {
        str = String(str).replace(/_+/g, '_').replace(/_[a-z]/g, function ($0) {
            return String($0).toLocaleUpperCase().substr(1);
        }).replace(/^[a-z]/, function ($0) {
            return String($0).toLocaleUpperCase();
        });
        return str;
    }
    static lowerFirst(str) {
        return String(str).replace(/^[A-Z]/, function ($0) {
            return String($0).toLocaleLowerCase();
        });
    }
    static upperFirst(str) {
        return String(str).replace(/^[a-z]/, function ($0) {
            return String($0).toLocaleUpperCase();
        });
    }
    static uuid(length = 32) {
        let str = crypto.randomBytes(Math.ceil(length * 0.75)).toString('base64').slice(0, length);
        return str.replace(/[\+\/]/g, '_');
    }
    ;
    static clone(obj) {
        try {
            return JSON.parse(JSON.stringify(obj));
        }
        catch (e) {
            return null;
        }
    }
}
Beaconkit.toString = Object.prototype.toString;
Beaconkit.isArray = Array.isArray;
Beaconkit.isBuffer = Buffer.isBuffer;
Beaconkit.sep = path.sep;
Beaconkit.isIP = net.isIP;
Beaconkit.isIPv4 = net.isIPv4;
Beaconkit.isIPv6 = net.isIPv6;
exports.Beaconkit = Beaconkit;
//# sourceMappingURL=beacon_kit.js.map