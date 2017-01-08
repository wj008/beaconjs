/* 
 * 本程序由海口尚来网络科技有限公司独立开发，未经允许不可用于其他商业用途
 * 作者：wj008 邮箱:26069680@qq.com  官方网站：www.web0898.com   * 
 */
(function ($) {
    function SelectAnalog(element) {
        var qem = $(element).hide();
        var box = $('<input type="text" class="sdopx-select-box">').attr('readonly', 'readonly').insertAfter(qem);
        var boxWidth = qem.data('box-width') || 0;
        if (boxWidth > 0) {
            box.css('width', boxWidth + 'px');
        }
        var btn = $('<a class="sdopx-select-btn"></a>').insertAfter(box);
        var layer = $('<div class="sdopx-select-layer"></div>').insertBefore(box);
        var opts = $('<div class="sdopx-select-options"></div>').hide().appendTo(layer);
        var optsWidth = qem.data('options-width') || 0;
        if (optsWidth > 0) {
            opts.css('width', optsWidth + 'px');
        }
        var maxheight = qem.data('maxheight') || 0;

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
        var updateval = function () {
            var sel = qem.find('option:selected');
            if (sel.length > 0) {
                var val = sel.val(), text = sel.text();
                thval = val;
                box.val(text);
            }
        };
        qem.on('change', updateval);
        var reset = function () {
            opts.empty();
            opts.css({height: 'auto'});
            if (optdata != null && optdata.length == 1 && optdata[0].not) {
                var options = optdata[0].opts;
                $(options).each(function () {
                    var em = this;
                    var item = $('<a href="javascript:;" class="sdopx-select-option"></a>').text(em[1]).data('text', em[1]).data('value', em[0]);
                    item.click(function (ev) {
                        var it = $(this);
                        var oldval = qem.val();
                        var val = it.data('value');
                        qem.val(val);
                        opts.hide();
                        if (oldval != val) {
                            qem.triggerHandler('change');
                        }
                        opts.hide();
                        return false;
                    });
                    opts.append(item);
                });
            } else if (optdata != null && optdata.length >= 1 && optdata[0].not == false) {
                var header = $('<div class="sdopx-select-header"></div>').appendTo(opts);
                $(optdata).each(function (idx) {
                    var options = this.opts;
                    this.lb = this.lb || "";
                    if (this.lb == "") {
                        return;
                    }
                    var label = $('<b></b>').attr('idx', idx).text(this.lb).appendTo(header);
                    var group = $('<div class="sdopx-select-group"></div>').attr('idx', idx).appendTo(opts);
                    $(options).each(function () {
                        var em = this;
                        var item = $('<a href="javascript:;"></a>').text(em[1]).data('text', em[1]).data('value', em[0]);
                        item.click(function (ev) {
                            var it = $(this);
                            var oldval = qem.val();
                            var val = it.data('value');
                            qem.val(val);
                            opts.hide();
                            if (oldval != val) {
                                qem.triggerHandler('change');
                            }
                            opts.hide();
                            return false;
                        });
                        group.append(item);
                    });
                });
                var btns = header.find('b').on('mouseenter', function () {
                    btns.removeClass('on');
                    var btn = $(this).addClass('on');
                    var idx = btn.attr('idx');
                    opts.find('.sdopx-select-group').hide();
                    opts.find('.sdopx-select-group[idx="' + idx + '"]').show();
                });
                btns.eq(0).trigger('mouseenter');
            }
            updateval();
        };
        // 解析成格式
        var getCache = function () {
            var data = [];
            var optgs = qem.find('optgroup');//组
            if (optgs.length > 0) {
                optgs.each(function () {
                    var group = $(this);
                    var temp = {};
                    temp.not = false;
                    temp.lb = group.attr('label');
                    temp.opts = [];
                    var qopts = group.find('option');
                    qopts.each(function () {
                        var that = $(this);
                        var val = that.val(), text = that.text();
                        temp.opts.push([val, text]);
                    });
                    data.push(temp);
                });
            } else {
                var qopts = qem.find('option');
                var temp = {};
                temp.not = true;
                temp.lb = null;
                temp.opts = [];
                qopts.each(function () {
                    var that = $(this);
                    var val = that.val(), text = that.text();
                    temp.opts.push([val, text]);
                });
                data.push(temp);
            }
            return data;
        };
        var getCodeStr = function () {
            optdata = getCache();
            console.log(optdata);
            return $.toJSON(optdata);
        };
        var update = this.update = function () {
            alert(update);
            var code = getCodeStr();
            if (code != cache) {
                cache = code;
                reset();
                return;
            }
            if (thval != qem.val()) {
                updateval();
            }
        };
        update();
        qem.on('update', function () {
            update();
        });
    }
    $.sdopx_widget('select_analog', SelectAnalog, 'select.form-control.select_analog:not(.notinit)');
})(jQuery);