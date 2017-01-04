"use strict";
var net = require('net');
var fs = require('fs');
var path = require('path');
var crypto = require('crypto');
var Beaconkit = (function () {
    function Beaconkit() {
    }
    Beaconkit.isFunction = function (arg) {
        return typeof arg === 'function';
    };
    Beaconkit.isArguments = function (arg) {
        return Beaconkit.toString.call(arg) === '[object Arguments]';
    };
    ;
    Beaconkit.isBoolean = function (arg) {
        return typeof arg === 'boolean';
    };
    ;
    Beaconkit.isNumber = function (arg) {
        return typeof arg === 'number';
    };
    ;
    Beaconkit.isObject = function (arg) {
        if (Beaconkit.isBuffer(arg)) {
            return false;
        }
        return typeof arg === 'object' && arg !== null;
    };
    ;
    Beaconkit.isString = function (arg) {
        return typeof arg === 'string';
    };
    ;
    Beaconkit.isSymbol = function (arg) {
        return typeof arg === 'symbol';
    };
    Beaconkit.isRegExp = function (re) {
        return Beaconkit.isObject(re) && Beaconkit.toString.call(re) === '[object RegExp]';
    };
    Beaconkit.isFile = function (p) {
        try {
            return fs.statSync(p).isFile();
        }
        catch (e) {
        }
        return false;
    };
    ;
    Beaconkit.isDir = function (p) {
        try {
            return fs.statSync(p).isDirectory();
        }
        catch (e) {
        }
        return false;
    };
    ;
    Beaconkit.isNumeric = function (obj) {
        if (!obj) {
            return false;
        }
        var re = /^((\-?\d*\.?\d*(?:e[+-]?\d*(?:\d?\.?|\.?\d?)\d*)?)|(0[0-7]+)|(0x[0-9a-f]+))$/i;
        return re.test(obj);
    };
    ;
    Beaconkit.isPromise = function (obj) {
        if (typeof Promise == 'function') {
            if (obj instanceof Promise) {
                return true;
            }
            return false;
        }
        else {
            return !!(obj && typeof obj.then === 'function' && typeof obj['catch'] === 'function');
        }
    };
    ;
    Beaconkit.isNull = function (obj) {
        if (obj === void 0 || obj === null) {
            return true;
        }
        if (Beaconkit.isNumber(obj) && isNaN(obj)) {
            return true;
        }
        return false;
    };
    Beaconkit.isEmpty = function (obj) {
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
    };
    ;
    Beaconkit.md5 = function (str) {
        var instance = crypto.createHash('md5');
        instance.update(str + '', 'utf8');
        return instance.digest('hex');
    };
    ;
    Beaconkit.isDate = function (arg) {
        return arg instanceof Date;
    };
    Beaconkit.isError = function (e) {
        return (Beaconkit.toString.call(e) === '[object Error]' || e instanceof Error);
    };
    Beaconkit.isValidDate = function (obj) {
        var date = null;
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
    };
    Beaconkit.datetime = function (obj, format) {
        if (format === void 0) { format = 'yyyy-MM-dd'; }
        var date = null;
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
        var zeroize = function (value, length) {
            if (length === void 0) { length = 2; }
            var zeros = '';
            value = String(value);
            for (var i = 0; i < (length - value.length); i++) {
                zeros += '0';
            }
            return zeros + value;
        };
        var mask = format.replace(/"[^"]*"|'[^']*'|\b(?:d{1,4}|M{1,4}|(?:yyyy|yy)|([hHmstT])\1?|[lLZ])\b/g, function ($0) {
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
    };
    Beaconkit.getNow = function (format) {
        if (format === void 0) { format = 'yyyy-MM-dd HH:mm:ss'; }
        return Beaconkit.datetime(new Date(), format);
    };
    Beaconkit.getDate = function (format) {
        if (format === void 0) { format = 'yyyy-MM-dd'; }
        return Beaconkit.datetime(new Date(), format);
    };
    Beaconkit.defer = function () {
        var deferred = { promise: null, resolve: null, reject: null };
        deferred.promise = new Promise(function (resolve, reject) {
            deferred.resolve = resolve;
            deferred.reject = reject;
        });
        return deferred;
    };
    ;
    Beaconkit.getFiles = function (dir, prefix, filter) {
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
    };
    ;
    Beaconkit.chmod = function (p, mode) {
        if (mode === void 0) { mode = 777; }
        if (!fs.existsSync(p)) {
            return true;
        }
        return fs.chmodSync(p, mode);
    };
    ;
    Beaconkit.mkdir = function (p, mode) {
        if (mode === void 0) { mode = 777; }
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
    };
    ;
    Beaconkit.toUnder = function (str) {
        str = String(str).replace(/[A-Z]/g, function ($0) {
            return '_' + String($0).toLocaleLowerCase();
        }).replace(/^_+/, '');
        return str;
    };
    Beaconkit.toCamel = function (str) {
        str = String(str).replace(/_+/g, '_').replace(/_[a-z]/g, function ($0) {
            return String($0).toLocaleUpperCase().substr(1);
        }).replace(/^[a-z]/, function ($0) {
            return String($0).toLocaleUpperCase();
        });
        return str;
    };
    Beaconkit.lowerFirst = function (str) {
        return String(str).replace(/^[A-Z]/, function ($0) {
            return String($0).toLocaleLowerCase();
        });
    };
    Beaconkit.upperFirst = function (str) {
        return String(str).replace(/^[a-z]/, function ($0) {
            return String($0).toLocaleUpperCase();
        });
    };
    Beaconkit.toString = Object.prototype.toString;
    Beaconkit.isArray = Array.isArray;
    Beaconkit.isBuffer = Buffer.isBuffer;
    Beaconkit.sep = path.sep;
    Beaconkit.isIP = net.isIP;
    Beaconkit.isIPv4 = net.isIPv4;
    Beaconkit.isIPv6 = net.isIPv6;
    return Beaconkit;
}());
exports.Beaconkit = Beaconkit;
//# sourceMappingURL=beacon_kit.js.map