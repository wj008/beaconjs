//Yee插件
(function ($) {


    var Yee = window.Yee = $.Yee = window.Yee || {};
    Yee._update_modules = {};
    Yee._eventList = {};
    // 更新
    Yee.update = function (base, names, callback) {
        if (typeof(base) == 'function' && names === void 0 && callback === void 0) {
            callback = base;
            base = null;
        }
        if (typeof(names) == 'function' && callback === void 0) {
            callback = names;
            names = null;
        }
        base = base || document.body;
        var updateItems = [];
        //如果为空则更新全部
        if (!names) {
            for (var kname in Yee._update_modules) {
                var slc = Yee._update_modules[kname];
                if (slc.selector.length > 0) {
                    updateItems.push(slc);
                }
            }
        }
        //如果不是字符串
        else if ('string' !== typeof (names) || names === '') {
            if (callback && typeof(callback) == 'function') {
                callback();
            }
            return;
        }
        else {
            var models = names.split(' ');
            $(models).each(function () {
                var kname = $.trim(this);
                if (!Yee._update_modules[kname]) {
                    return;
                }
                var slc = Yee._update_modules[kname];
                if (slc.selector.length > 0) {
                    updateItems.push(slc);
                }
            });
        }
        //没有更新的内容
        if (updateItems.length === 0) {
            if (callback && typeof(callback) == 'function') {
                callback();
            }
            return;
        }
        $(updateItems).each(function () {
            var items = $(this.selector, base);
            items[this.plugname]();
        });
        if (callback && typeof(callback) == 'function') {
            callback();
        }
    };
    Yee.extend = function (selector, name, module, abnormal) {
        if (typeof (selector) !== 'string' || typeof (name) !== 'string') {
            return;
        }
        var plugname = $.trim('yee_' + name);
        selector = $.trim(selector);
        if (!abnormal) {
            var all = selector.split(',');
            for (var i = 0; i < all.length; i++) {
                all[i] += "[yee-module~='" + name + "']";
            }
            selector = all.join(',');
        }
        //可以更新的模块
        Yee._update_modules[name] = {
            selector: selector,
            plugname: plugname
        };
        // 自动扩展JQ插件
        $.fn[plugname] = function (operate, options) {
            if (typeof (options) === 'undefined'
                && typeof (operate) === 'object') {
                options = operate;
                operate = 'create';
            }
            this.each(function () {
                // 加载并创建模块对象
                var option = $.extend(options || {}, $(this).data() || {});
                // 加载并创建模块对象
                if (!this[plugname]) {
                    var modobj = this[plugname] = new module(this, option);
                    if (typeof (modobj.create) === 'function'
                        && operate === 'create') {
                        modobj.create(option);
                    }
                }

                if (this[plugname]) {
                    var modobj = this[plugname];
                    if (typeof (operate) === 'string') {
                        if (operate === 'destroy') {
                            if (typeof (modobj.destroy) === 'function') {
                                modobj.destroy(option);
                            }
                            delete this[plugname];
                            return;
                        }
                    }
                }
            });
            return this;
        };
        // 自动加载插件
    };
    Yee.readyed = false;
    Yee.ready = function () {
        if (Yee.readyed) {
            return;
        }
        Yee.readyed = true;
        Yee.update();

    };

    //监听事件
    Yee.on = function (event, func, global) {
        var eventList = Yee._eventList;
        if (global === true) {
            eventList = window.top._yee_eventList = window.top._yee_eventList || {};
        }
        eventList[event] = eventList[event] || [];
        eventList[event].push({tice: 0, func: func});
    }
    //移除监听
    Yee.off = function (event, func, global) {
        var eventList = Yee._eventList;
        if (global === true) {
            eventList = window.top._yee_eventList = window.top._yee_eventList || {};
        }
        if (!eventList[event]) {
            return;
        }
        if (func === void 0) {
            delete eventList[event];
            return;
        }
        for (var i = 0; i < eventList[event].length; i++) {
            if (eventList[event][i].func === func) {
                eventList[event].splice(i, 1);
                break;
            }
        }
        if (eventList[event].length == 0) {
            delete eventList[event];
        }
    }

    Yee.once = function (event, func, global) {
        var eventList = Yee._eventList;
        if (global === true) {
            eventList = window.top._yee_eventList = window.top._yee_eventList || {};
        }
        eventList[event] = eventList[event] || [];
        eventList[event].push({tice: 1, func: func});
    }

    Yee.emit = function () {
        if (arguments.length == 0) {
            return;
        }
        var event = arguments[0] || null;
        if (typeof  event != 'string' || event == '') {
            return;
        }
        var args = [];
        for (var i = 1; i < arguments.length; i++) {
            args.push(arguments[i]);
        }
        //当前的
        var funcs = Yee._eventList[event] || null;
        if (funcs != null) {
            for (var i = 0; i < Yee._eventList[event].length; i++) {
                var func = Yee._eventList[event][i].func;
                func.apply(Yee, args);
                if (Yee._eventList[event][i].tice == 1) {
                    Yee.off(event, func);
                }
            }
        }
        //全局的
        var eventList = window.top._yee_eventList = window.top._yee_eventList || {};
        var gfuncs = eventList[event] || null;
        if (gfuncs != null) {
            for (var i = 0; i < eventList[event].length; i++) {
                var func = eventList[event][i].func;
                func.apply(Yee, args);
                if (eventList[event][i].tice == 1) {
                    Yee.off(event, func, true);
                }
            }
        }

    }

    var isIE = navigator.userAgent.match(/MSIE\s*(\d+)/i);
    isIE = isIE ? (isIE[1] < 9) : false;
    if (isIE) {
        var itv = setInterval(function () {
            try {
                document.documentElement.doScroll();
                clearInterval(itv);
                Yee.ready();
            } catch (e) {
            }
        }, 1);
    } else {
        window.addEventListener('DOMContentLoaded', function () {
            Yee.ready();
        }, false);
    }
    if (window.attachEvent) {
        window.attachEvent('onload', Yee.ready);
    } else {
        window.addEventListener('load', Yee.ready, false);
    }
})(jQuery);

//number 数值输入
(function ($, Yee) {
    Yee.extend(':input', 'number', function (elem) {
        var that = $(elem);
        that.on('keydown', function (event) {
            if (this.value == '' || this.value == '-' || /^-?([1-9]\d*|0)$/.test(this.value) || /^-?([1-9]\d*|0)\.$/.test(this.value) || /^-?([1-9]\d*|0)\.\d+$/.test(this.value)) {
                $(this).data('last-value', this.value);
            }
        });
        that.on('keypress keyup', function (event) {
            if (this.value == '' || this.value == '-' || /^-?([1-9]\d*|0)$/.test(this.value) || /^-?([1-9]\d*|0)\.$/.test(this.value) || /^-?([1-9]\d*|0)\.\d+$/.test(this.value)) {
                $(this).data('last-value', this.value);
                return true;
            }
            this.value = $(this).data('last-value') || '';
            return false;
        });
        that.on('dragenter', function () {
            return false;
        });
        that.on('blur', function () {
            this.value = /^-?([1-9]\d*|0)(\.\d+)?$/.test(this.value) ? this.value : '';
        });

    });
})(jQuery, Yee);

(function ($, Yee) {
    Yee.extend(':input', 'number-x', function (elem) {
        var that = $(elem);
        that.on('keydown', function (event) {
            if (this.value == '' || this.value == '-' || /^-?([1-9]\d*|0)$/.test(this.value) || /^-?([1-9]\d*|0)\.$/.test(this.value) || /^-?([1-9]\d*|0)\.\d+$/.test(this.value)) {
                $(this).data('last-value', this.value);
            }
        });
        that.on('keypress keyup', function (event) {
            if (this.value == '' || this.value == '-' || /^-?([1-9]\d*|0)$/.test(this.value) || /^-?([1-9]\d*|0)\.$/.test(this.value) || /^-?([1-9]\d*|0)\.\d+$/.test(this.value)) {
                $(this).data('last-value', this.value);
                return true;
            }
            this.value = $(this).data('last-value') || '';
            return false;
        });
        that.on('dragenter', function () {
            return false;
        });
        that.on('blur', function () {
            this.value = /^-?([1-9]\d*|0)(\.\d+)?$/.test(this.value) ? this.value : '';
        });

    });
})(jQuery, Yee);