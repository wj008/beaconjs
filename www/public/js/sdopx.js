(function ($) {
    $.sdopx_widget = function (name, plugin, selector) {
        $.fn['sdopx_' + name] = function (operate, options) {
            this.each(function () {
                //如果不存在对象创建
                if (typeof (options) === 'undefined' && typeof (operate) === 'object') {
                    options = operate;
                    operate = 'create';
                }
                if (!this['sdopx_' + name]) {
                    this['sdopx_' + name] = new plugin(this, options);
                }
                if (this['sdopx_' + name]) {
                    if (operate !== 'destroy' && typeof (operate) === 'string') {
                        if (typeof (this['sdopx_' + name][operate]) === 'function') {
                            this['sdopx_' + name][operate](options);
                        }
                    }
                    if (operate === 'destroy') {
                        if (typeof (this['sdopx_' + name].destroy) === 'function') {
                            this['sdopx_' + name].destroy(options);
                        }
                        this['sdopx_' + name] = null;
                    }
                }
            });
        };
        if (typeof (selector) === 'string') {
            $(function () {
                $(document.body).delegate(selector, 'sdopx_update', function () {
                    $(this)['sdopx_' + name]();
                });
                $(selector)['sdopx_' + name]();
            });
        }
    };

    /**ajaxform***/
    $.sdopx_widget('ajaxform', function (elem) {

        var qelem = $(elem);
        //延迟100毫秒 让提交是最后的监听
        setTimeout(function () {
            qelem.on('submit', function (ev) {
                if (!ev.result) {
                    return false;
                }
                var url = qelem.attr('action') || window.location.href;
                var method = (qelem.attr('method') || 'POST').toUpperCase();
                var senddata = qelem.serialize();
                if (window.layer) {
                    var LayerIndex = window.layer.load(1, {
                        shade: [0.1, '#FFF'] //0.1透明度的白色背景
                    });
                }
                $.ajax({
                    type: method,
                    url: url,
                    data: senddata,
                    dataType: 'json',
                    success: function (data) {
                        if (window.layer && LayerIndex !== null) {
                            window.layer.close(LayerIndex);
                        }
                        //服务器返回
                        if (!data) {
                            return;
                        }
                        var rt = qelem.triggerHandler('back', [data]);
                        if (rt === false) {
                            return;
                        }
                        //如果存在错误
                        if (data.status == false) {
                            if (data.error) {
                                if (typeof (data.error) == 'object') {
                                    if ($.SdopxValidator) {
                                        qelem.showError(data.error);
                                    }
                                } else {
                                    if (window.layer) {
                                        window.layer.msg(data.error, {icon: 0, time: 2000});
                                    } else {
                                        alert(data.error);
                                    }
                                }
                            }
                        }
                        if (data.status == true) {
                            if (data.success) {
                                if (window.layer) {
                                    window.layer.msg(data.success, {icon: 1, time: 1000});
                                } else {
                                    alert(data.success);
                                }
                            }
                            if (data.script) {
                                window.setTimeout(function () {
                                    try {
                                        eval(data.script);
                                    } catch (e) {
                                    }
                                }, 1000);
                                return;
                            }
                        }
                        if (typeof (data.jump) != 'undefined' && data.jump !== null) {
                            window.setTimeout(function () {
                                if (data.jump == 0) {
                                    window.location.reload();
                                } else if (typeof (data.jump) == 'number') {
                                    window.history.go(data.jump);
                                } else {
                                    window.location.href = data.jump;
                                }
                            }, 1000);
                        }
                    }

                });
                return false;
            });
        }, 100);
        $(document).on('keydown', function (ev) {
            if ((ev.ctrlKey) && (ev.keyCode == 115 || ev.keyCode == 83)) {
                qelem.find('input[type=submit]').trigger('click');
                ev.returnValue = false;
                return false;
            }
        });
    }, 'form.ajaxform');

    /**checkgroup***/
    $.fn.old_sdopx_checkgroup_val = $.fn.val;
    $.fn.val = function (val) {
        var that = $(this);
        if (typeof (val) != 'undefined') {
            return that.old_sdopx_checkgroup_val(val);
        } else {
            if (that.is('input.checkgroup')) {
                var name = that.data('bindName');
                var boxs = that.parent().find('input[name="' + name + '[]"]');
                var arr = [];
                boxs.filter(':checked').each(function () {
                    arr.push($(this).val());
                });
                if (arr.length == 0) {
                    return '';
                } else {
                    return $.toJSON(arr);
                }
            } else {
                return that.old_sdopx_checkgroup_val();
            }
        }
    };
    $.sdopx_widget('checkgroup', function (em) {
        var that = $(em);
        var name = that.data('bindName');
        var boxs = that.parent().find('input[name="' + name + '[]"]');
        if (that.is(':disabled')) {
            boxs.attr('disabled', true);
        }
    }, 'input.form-control.checkgroup:not(.notinit)');
    /**xheditor***/
    $.sdopx_widget('xheditor', function (em) {
        var qem = $(em);
        var options = qem.data();
        return qem.xheditor(options);
    }, 'textarea.form-control.xh-editor:not(.notinit)');
    /**integer***/
    $.sdopx_widget('integer', function (elem) {
        var that = $(elem);
        that.on('keydown', function (event) {
            if (this.value == '' || this.value == '-' || /^(-?[1-9]\d*|0)$/.test(this.value)) {
                $(this).data('last-value', this.value);
            }
        });
        that.on('keypress keyup', function (event) {
            if (this.value == '' || this.value == '-' || /^(-?[1-9]\d*|0)$/.test(this.value)) {
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
            this.value = /^(-?[1-9]\d*|0)$/.test(this.value) ? this.value : '';
        });
    }, 'input.form-control.integer:not(.notinit)');
    /**number***/
    $.sdopx_widget('number', function (elem) {
        var that = $(elem);
        that.on('keydown', function (event) {
            if (this.value == '' || this.value == '-' || /^(-?[1-9]\d*|0)$/.test(this.value) || /^(-?[1-9]\d*|0)\.$/.test(this.value) || /^(-?[1-9]\d*|0)\.\d+$/.test(this.value)) {
                $(this).data('last-value', this.value);
            }
        });
        that.on('keypress keyup', function (event) {
            if (this.value == '' || this.value == '-' || /^(-?[1-9]\d*|0)$/.test(this.value) || /^(-?[1-9]\d*|0)\.$/.test(this.value) || /^(-?[1-9]\d*|0)\.\d+$/.test(this.value)) {
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
            this.value = /^(-?[1-9]\d*|0)(\.\d+)?$/.test(this.value) ? this.value : '';
        });
    }, 'input.form-control.number:not(.notinit)');
    /**radiogroup***/
    $.sdopx_widget('radiogroup', function (em) {
        var that = $(em);
        var boxs = that.parent().find('input[name="' + that.data('bindName') + '"]');
        if (that.is(':disabled')) {
            boxs.attr('disabled', true);
        }
        boxs.on('click', function () {
            var val = boxs.filter(':checked').val() || null;
            that.val(val);
            that.triggerHandler('mousedown');
            that.triggerHandler('change');
        });
        var val = boxs.filter(':checked').val() || null;
        that.val(val);
    }, 'input.form-control.radiogroup:not(.notinit)');
    /**date***/
    $.sdopx_widget('date', function (element) {
        $.datepicker.regional['zh-CN'] = {
            closeText: '关闭',
            prevText: '&#x3C;上月',
            nextText: '下月&#x3E;',
            currentText: '今天',
            monthNames: ['一月', '二月', '三月', '四月', '五月', '六月',
                '七月', '八月', '九月', '十月', '十一月', '十二月'],
            monthNamesShort: ['一月', '二月', '三月', '四月', '五月', '六月',
                '七月', '八月', '九月', '十月', '十一月', '十二月'],
            dayNames: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
            dayNamesShort: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
            dayNamesMin: ['日', '一', '二', '三', '四', '五', '六'],
            weekHeader: '周',
            dateFormat: 'yy-mm-dd',
            firstDay: 1,
            isRTL: false,
            showMonthAfterYear: true,
            yearSuffix: '年'};
        $.datepicker.setDefaults($.datepicker.regional['zh-CN']);
        var qem = $(element);
        var options = {
            dateFormat: 'yy-mm-dd',
            changeMonth: true,
            changeYear: true,
            yearRange: '1900:2050'};
        for (var key in options) {
            var lkey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
            var dval = qem.data(lkey);
            if (typeof (dval) !== 'undefined' && dval !== null) {
                options[key] = dval;
            }
        }
        qem.datepicker(options);
        this.destroy = function () {
            qem.datepicker('destroy');
        };
    }, 'input.form-control.date:not(.notinit)');
    /**datetime***/
    $.sdopx_widget('datetime', function (element) {
        $.datepicker.regional['zh-CN'] = {
            closeText: '关闭',
            prevText: '&#x3C;上月',
            nextText: '下月&#x3E;',
            currentText: '今天',
            monthNames: ['一月', '二月', '三月', '四月', '五月', '六月',
                '七月', '八月', '九月', '十月', '十一月', '十二月'],
            monthNamesShort: ['一月', '二月', '三月', '四月', '五月', '六月',
                '七月', '八月', '九月', '十月', '十一月', '十二月'],
            dayNames: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
            dayNamesShort: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
            dayNamesMin: ['日', '一', '二', '三', '四', '五', '六'],
            weekHeader: '周',
            dateFormat: 'yy-mm-dd',
            firstDay: 1,
            isRTL: false,
            showMonthAfterYear: true,
            yearSuffix: '年'};
        $.datepicker.setDefaults($.datepicker.regional['zh-CN']);
        var qem = $(element);
        var options = {
            dateFormat: 'yy-mm-dd',
            changeMonth: true,
            changeYear: true,
            yearRange: '1900:2050'};
        for (var key in options) {
            var lkey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
            var dval = qem.data(lkey);
            if (typeof (dval) !== 'undefined' && dval !== null) {
                options[key] = dval;
            }
        }
        qem.datetimepicker(options);
        this.destroy = function () {
            qem.datetimepicker('destroy');
        };
    }, 'input.form-control.datetime:not(.notinit)');

})(jQuery);