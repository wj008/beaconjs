/* 
 * 本程序由海口尚来网络科技有限公司独立开发，未经允许不可用于其他商业用途
 * 作者：wj008 邮箱:26069680@qq.com  官方网站：www.web0898.com   * 
 */
(function ($) {
    function SelectTree(element) {
        var qem = $(element).hide();
        var box = $('<input type="text" class="sdopx-select-tree-box">').attr('readonly', 'readonly').insertAfter(qem);
        var boxWidth = box.data('box-width') || 0;
        if (boxWidth > 0) {
            box.css('width', boxWidth + 'px');
        }
        var btn = $('<a class="sdopx-select-tree-btn"></a>').insertAfter(box);
        var layer = $('<div class="sdopx-select-tree-layer"></div>').insertBefore(box);
        var opts = $('<div class="sdopx-select-tree-options"></div>').hide().appendTo(layer);
        var optsWidth = box.data('opt-width') || 0;
        if (optsWidth > 0) {
            opts.css('width', optsWidth + 'px');
        }
        var maxheight = qem.data('opt-height') || 0;
        
        qem.on('displayError', function () {
            box.removeClass('input-val-valid input-val-default').addClass('input-val-error');
        });

        qem.on('displayDefault', function () {
            box.removeClass('input-val-error input-val-valid').addClass('input-val-default');
        });

        qem.on('displayValid', function () {
            box.removeClass('input-val-default input-val-error').addClass('input-val-valid');
        });
        
        qem.on('focus', function () {
            box.focus();
        });
        box.on('mousedown', function () {
            qem.triggerHandler('mousedown');
        });
        var optdata = null;
        var header = qem.data('header') || null;

        var options = qem.data('options') || [];

        var cache = '';
        var thval = qem.val();
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
        });
        opts.mousedown(function (ev) {
            ev.preventDefault();
            return false;
        });
        qem.on('update', function () {
            update();
        });
        var selected = false;
        var additem = function (xopts, itemdata, level, ptext) {
            ptext = (ptext == null || ptext == '') ? '' : ptext + ' - ';
            level = level || 0;
            var item = $('<a href="javascript:;" class="sdopx-select-tree-option level' + level + '"></a>')
                    .text(itemdata.text)
                    .data('value', itemdata.value)
                    .data('text', ptext + itemdata.text);
            if (itemdata.value === null) {
                item.addClass('disabled');
            } else {
                if (itemdata.value == thval) {
                    box.val(ptext + itemdata.text);
                    selected = true;
                }
            }
            item.click(function (ev) {
                var it = $(this);
                var oldval = qem.val();
                var val = it.data('value');
                var text = it.data('text');
                if (val === null) {
                    return false;
                }
                qem.val(val);
                box.val(text);
                opts.hide();
                if (oldval != val) {
                    qem.triggerHandler('change');
                }
                opts.hide();
                return false;
            });
            xopts.append(item);
            if (itemdata.items && itemdata.items.length > 0) {
                var copts = $('<div class="sdopx-select-tree-line level' + level + '"></div>').appendTo(xopts);
                $(itemdata.items).each(function () {
                    var xitemdata = {};
                    xitemdata.value = this[0];
                    xitemdata.text = this.length > 1 ? this[1] : this[0];
                    if (this.length > 2) {
                        xitemdata.items = this[2];
                    }
                    additem(copts, xitemdata, level + 1, ptext + itemdata.text);
                });
            }
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
                additem(opts, head);
            }

            selected = false;
            $(options).each(function () {
                var itemdata = {};
                itemdata.value = this[0];
                itemdata.text = this.length > 1 ? this[1] : this[0];
                if (this.length > 2) {
                    itemdata.items = this[2];
                }
                additem(opts, itemdata);
            });
            if (!selected) {
                if (header != null && (typeof (header) == 'string' || $.isArray(header))) {
                    qem.val(head.value);
                    box.val(head.text);
                } else {
                    opts.find('a.sdopx-select-tree-option').each(function (idx, elem) {
                        var it = $(elem);
                        var val = it.data('value');
                        if (val !== null) {
                            qem.val(it.data('value'));
                            box.val(it.data('text'));
                            return false;
                        }
                    });
                }
            }
        };
        var update = this.update = function () {
            header = qem.data('header') || null;
            options = qem.data('options') || [];
            reset();
        };
        update();
    }
    $.sdopx_widget('select_tree', SelectTree, 'input.form-control.select_tree:not(.notinit)');
})(jQuery);