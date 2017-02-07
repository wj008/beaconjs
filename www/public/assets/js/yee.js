(function ($) {
    var Yee = window.Yee = $.Yee = window.Yee || {};
    var update_modules = {};
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
            for (var kname in update_modules) {
                var slc = update_modules[kname];
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
                if (!update_modules[kname]) {
                    return;
                }
                var slc = update_modules[kname];
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
            var sle = this;
            var items = $(sle.selector, base);
            $(items).each(function (idx, eitem) {
                var item = $(eitem);
                var temp = String(item.attr('yee-module') || '');
                var modules = temp.replace(/\s+/g, ' ').replace(/^\s|\s$/g, '').split(' ');
                if (modules.indexOf(sle.name) < 0) {
                    console.error(temp, sle.name);
                    return;
                }
                item[sle.plugname]();
            });
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
        update_modules[name] = {
            selector: selector,
            plugname: plugname,
            name: name
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