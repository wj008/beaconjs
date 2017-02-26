/* 
 * 本程序由海口尚来网络科技有限公司独立开发，未经允许不可用于其他商业用途
 * 作者：wj008 邮箱:26069680@qq.com  官方网站：www.web0898.com   * 
 */
(function ($) {
    var tempdata = {};
    function MultipleTree(element) {
        var qem = $(element).hide();
        var box = $('<input type="text" class="sdopx-select-tree-box">').attr('readonly', 'readonly').insertAfter(qem);
        var boxWidth = qem.data('box-width') || 0;
        var size = qem.data('size') || 0;
        if (boxWidth > 0) {
            box.css('width', boxWidth + 'px');
        }
        var btn = $('<a class="sdopx-select-tree-btn"></a>').insertAfter(box);
        var layer = $('<div class="sdopx-select-tree-layer"></div>').insertBefore(box);
        var opts = $('<div class="sdopx-select-tree-options"></div>').hide().appendTo(layer);
        var method = (qem.data('method') || 'get').toLocaleLowerCase() === 'get' ? 'get' : 'post';
        var optsWidth = qem.data('opt-width') || 0;
        if (optsWidth > 0) {
            opts.css('width', optsWidth + 'px');
        }
        var maxheight = qem.data('opt-height') || 292;
        qem.on('displayError', function () {
            box.removeClass('input-val-valid input-val-default').addClass('input-val-fail');
        });
        qem.on('displayDefault', function () {
            box.removeClass('input-val-fail input-val-valid').addClass('input-val-default');
        });
        qem.on('displayValid', function () {
            box.removeClass('input-val-default input-val-fail').addClass('input-val-valid');
        });
        qem.on('focus', function () {
            box.focus();
        });
        box.on('mousedown', function () {
            qem.triggerHandler('mousedown');
        });
        var optdata = null;
        var header = qem.data('header') || null;
        var options = qem.data('sourse') || [];
        var cache = '';
        var thval = qem.val();
        var arrval = thval == '' ? [] : $.parseJSON(thval);
        btn.on('click', function () {
            qem.triggerHandler('mousedown');
            opts.show();
            box.focus();
            if (maxheight > 0) {
                var ht = opts.height();
                if (ht > maxheight) {
                    opts.css({height: maxheight + 'px'});
                }
            }
            $(document).one('mousedown', function () {
                opts.hide();
                return false;
            });
            $(window).one('blur', function (ev) {
                opts.hide();
            });
        });
        box.on('click', function () {
            qem.triggerHandler('mousedown');
            opts.show();
            box.focus();
            if (maxheight > 0) {
                var ht = opts.height();
                if (ht > maxheight) {
                    opts.css({height: maxheight + 'px'});
                }
            }
            $(document).one('mousedown', function (ev) {
                opts.hide();
            });
            $(window).one('blur', function (ev) {
                opts.hide();
            });
        });
        opts.mousedown(function (ev) {
            ev.preventDefault();
            return false;
        });
        qem.on('update', function () {
            update();
        });
        var calculate = function () {
            var oldval = qem.val();
            var boxs = opts.find('input.item-input[type=checkbox]:checked');
            var choicetext = [];
            var vals = [];
            $(boxs).each(function (i, elem) {
                var inp = $(elem);
                var val = inp.data('value');
                var text = inp.data('text');
                choicetext.push(text);
                vals.push(val);
            });
            box.val(choicetext.join(' , '));
            var newval = vals.length == 0 ? '' : $.toJSON(vals);
            if (newval != oldval) {
                qem.triggerHandler('change');
            }
            qem.val(newval);
        };
        var additem = function (xopts, itemdata, level) {
            level = level || 0;
            var item = $('<a href="javascript:;" class="sdopx-select-tree-option level' + level + '"></a>');
            var label = $('<label>').text(itemdata.text).appendTo(item);
            if (itemdata.value === null) {
                item.addClass('disabled');
            } else {
                var inp = $('<input class="item-input" type="checkbox">').data('text', itemdata.text).data('value', itemdata.value).val(itemdata.value).prependTo(label);
                $(arrval).each(function (i, e) {
                    if (e == itemdata.value) {
                        inp.prop("checked", true);
                        return false;
                    }
                });
                inp.click(function (ev) {
                    if (size > 0) {
                        var boxs = opts.find('input.item-input[type=checkbox]:checked');
                        if (boxs.length > size) {
                            alert('至多只能选择' + size + '项');
                            return false;
                        }
                    }
                    calculate();
                });
            }
            xopts.append(item);
            if (itemdata.childs) {
                var copts = $('<div class="sdopx-select-tree-line level' + level + '"></div>').appendTo(xopts);
                createBox(copts, itemdata.childs, level + 1);
            }
        };
        var createBox = function (opts, items, level) {
            level = level || 0;
            if ($.type(items) === 'string') {
                if (!items) {
                    return;
                }
                if (tempdata[items]) {
                    createBox(opts, tempdata[items], level);
                    return;
                }
                $[method](items, function (data) {
                    if (data) {
                        tempdata[items] = data;
                        createBox(opts, data, level);
                    } else {
                        alert('无法加载远程数据！');
                    }
                }, 'json');
                return;
            }
            $(items).each(function () {
                if ($.type(this) == 'array') {
                    var xitemdata = {};
                    xitemdata.value = this[0];
                    xitemdata.text = this.length > 1 ? this[1] : this[0];
                    if (this.length > 2) {
                        xitemdata.childs = this[2];
                    }
                    additem(opts, xitemdata, level);
                } else if ($.type(this) == 'object') {
                    additem(opts, this, level);
                }
            });
            calculate();
        };

        var reset = function () {
            opts.empty();
            opts.css({height: 'auto'});
            var head = {};
            if (header && ($.type(header) == 'string' || $.type(header) == 'array' || $.type(header) == 'object')) {
                if ($.type(header) == 'string') {
                    head.text = header;
                    head.value = '';
                } else if ($.type(header) == 'array') {
                    head.text = header[1] || header[0];
                    head.value = header[0];
                } else {
                    head = header;
                }
                box.attr('placeholder', head.text);
            }
            createBox(opts, options);
        };
        var update = this.update = function () {
            header = qem.data('header') || null;
            options = qem.data('sourse') || [];
            reset();
        };
        update();
    }
    $.sdopx_widget('multiple_tree', MultipleTree, 'input.form-control.multiple_tree:not(.notinit)');
})(jQuery);