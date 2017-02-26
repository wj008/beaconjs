
(function ($) {
    var tempdata = {};
    function SelectAdvanced(element) {
        var qelem = $(element);
        var triggerid = qelem.data('triggerid') || '';
        var source = qelem.data('source') || null;
        var header = qelem.data('header') || '';
        var toelem = null;
        if (triggerid) {
            toelem = $('#' + triggerid.replace(/(:|\.)/g, '\\$1'));
        }
        var onchange = function () {
            var selected = qelem.children(':selected');
            if (selected.length > 0) {
                qelem.data('value', selected[0].value);
            }
            var childs = (selected.length > 0 && selected[0].childsData) ? selected[0].childsData : null;
            //创建后面一个数据
            if (toelem && toelem.length > 0) {
                toelem.trigger('source', [childs]);
            }
        };
        var initBox = function (items) {
            if (items !== null) {
                var has = false;
                for (var i = 0; i < items.length; i++) {
                    var obj = {};
                    if (typeof (items[i]) === 'number' || typeof (items[i]) === 'string') {
                        obj.value = items[i];
                        obj.text = items[i];
                        obj.childs = [];
                    } else {
                        if (typeof (items[i].value) !== 'undefined') {
                            obj.value = items[i].value;
                        } else if (typeof (items[i][0]) !== 'undefined') {
                            obj.value = items[i][0];
                        } else {
                            continue;
                        }
                        if (typeof (items[i].text) !== 'undefined') {
                            obj.text = items[i].text;
                        } else if (typeof (items[i][1]) !== 'undefined') {
                            obj.text = items[i][1];
                        } else {
                            obj.text = obj.value;
                        }
                        if (typeof (items[i].childs) !== 'undefined') {
                            obj.childs = items[i].childs;
                        } else if (typeof (items[i][2]) !== 'undefined') {
                            obj.childs = items[i][2];
                        } else {
                            obj.childs = [];
                        }
                    }
                    if (element.length == 1 && (obj.value === null || obj.value === '')) {
                        element.length = 0;
                        obj.value = '';
                    }
                    var optitem = new Option(obj.text, obj.value);
                    element.add(optitem);
                    var boxval = qelem.data('value') || '';
                    if (boxval == obj.value) {
                        optitem.selected = true;
                        has = true;
                    }
                    optitem.childsData = obj.childs;
                }
                if (!has) {
                    qelem.data('value', '');
                }
            }
            if (toelem && toelem.length > 0) {
                setTimeout(onchange, 10);
            }
            setTimeout(function () {
                qelem.triggerHandler('update');
            }, 100);
        };
        var createBox = function (items) {
            element.length = 0;
            //添加头部
            if (header) {
                if ($.isArray(header) && header.length >= 2) {
                    element.add(new Option(header[1], header[0]));
                } else {
                    element.add(new Option(header, ''));
                }
            }
            if (!items) {
                setTimeout(function () {
                    qelem.triggerHandler('update');
                }, 100);
                return;
            }
            if ($.type(items) === 'string') {
                if (!items) {
                    setTimeout(function () {
                        qelem.triggerHandler('update');
                    }, 100);
                    return;
                }
                if (tempdata[items]) {
                    createBox(tempdata[items]);
                    return;
                }
                $.get(items, function (data) {
                    if (data) {
                        tempdata[items] = data;
                        createBox(data);
                    } else {
                        alert('无法加载远程数据！');
                    }
                }, 'json');
                return;
            }
            initBox(items);
        };
        qelem.on('source', function (ev, data) {
            source = data;
            createBox(source);
        });

        qelem.on('reload', function (ev) {
            tempdata = {};
            source = qelem.data('source') || null;
            createBox(source);
        });

        qelem.on('change', onchange);
        setTimeout(function () {
            createBox(source);
        }, 0);
    }
    $.fn.old_sdopx_select_advanced_val = $.fn.val;
    $.fn.val = function (val) {
        var that = $(this);
        if (typeof (val) === 'undefined') {
            if (that.is('select.select_advanced')) {

                return that.old_sdopx_select_advanced_val() || that.data('value') || '';
            } else {
                return that.old_sdopx_select_advanced_val();
            }
        } else {
            if (that.is('select.select_advanced')) {
                that.data('value', val);
                return that.old_sdopx_select_advanced_val(val);
            } else {
                return that.old_sdopx_select_advanced_val(val);
            }
        }
    };
    $.sdopx_widget('select_advanced', SelectAdvanced, 'select.form-control.select_advanced:not(.notinit)');
})(jQuery);
