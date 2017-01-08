/* 
 * 本程序由海口尚来网络科技有限公司独立开发，未经允许不可用于其他商业用途
 * 作者：wj008 邮箱:26069680@qq.com  官方网站：www.web0898.com   * 
 */
(function ($) {
    var tempdata = {};
    function SimulateSelect(element) {
        var qem = $(element);
        var btn = $('<a class="sdopx-select-btn"></a>').insertAfter(qem);
        var layer = $('<div class="sdopx-select-layer"></div>').insertBefore(qem);
        var opts = $('<div class="sdopx-select-options"></div>').hide().appendTo(layer);

        var optsWidth = qem.data('opt-width') || qem.outerWidth() - 2;
        if (optsWidth > 0) {
            opts.css('width', optsWidth + 'px');
        }
        var maxheight = qem.data('opt-height') || 300;
        var method = (qem.data('method') || 'get').toLocaleLowerCase() === 'get' ? 'get' : 'post';
        var sourse = null;
        opts.mousedown(function (ev) {
            ev.preventDefault();
            return false;
        });
        var showopts = function () {
            if (qem.is(':disabled')) {
                return;
            }
            var allopt = opts.find('a.sdopx-select-option');
            $(allopt).show().each(function (idx, elem) {
                $(elem).text($(elem).data('text'));
            });
            opts.show();
            if (maxheight > 0) {
                opts.css({height: 'auto'});
                var ht = opts.height();
                if (ht > maxheight) {
                    opts.css({height: maxheight + 'px'});
                }
            }
            $(document).one('mousedown', function () {
                opts.hide();
                return;
            });
            $(window).one('blur', function () {
                opts.hide();
                return;
            });
        };
        btn.on('click', showopts);
        qem.on('click', showopts);
        var oldval = qem.val();
        qem.on('change', function () {
            var val = qem.val();
            var allopt = opts.find('a.sdopx-select-option');
            if (val == '') {
                $(allopt).show().each(function (idx, elem) {
                    $(elem).text($(elem).data('text'));
                });
                return;
            }
            $(allopt).each(function (idx, elem) {
                var aelem = $(elem);
                var text = aelem.data('text');
                if (text.toLowerCase().indexOf(val.toLowerCase()) >= 0) {
                    aelem.show();
                    var reg = new RegExp('(' + val + ')', "gi");
                    var code = text.replace(reg, '<span style="color:red">$1</span>');
                    aelem.html(code);
                } else {
                    aelem.hide();
                }
            });
            if (maxheight > 0) {
                opts.css({height: 'auto'});
                var ht = opts.height();
                if (ht > maxheight) {
                    opts.css({height: maxheight + 'px'});
                }
            }
        });

        qem.on('keyup keypress', function () {
            var val = qem.val();
            if (val != oldval) {
                oldval = val;
                qem.triggerHandler('change');
            }
        });

        var additem = function (xopts, itdata) {
            var text = $.type(itdata) == 'string' ? itdata : itdata[0];
            var item = $('<a href="javascript:;" class="sdopx-select-option"></a>')
                    .text(text)
                    .data('text', text);

            item.click(function (ev) {
                var it = $(this);
                var oldval = qem.val();
                var val = it.data('text');
                qem.val(val);
                opts.hide();
                if (oldval != val) {
                    qem.triggerHandler('change');
                }
                opts.hide();
                return false;
            });
            xopts.append(item);
        };
        var reset = function (items) {
            if ($.type(items) === 'string') {
                if (!items) {
                    return;
                }
                if (tempdata[items]) {
                    reset(tempdata[items]);
                    return;
                }
                $[method](items, function (data) {
                    if (data) {
                        tempdata[items] = data;
                        reset(tempdata[items]);
                    } else {
                        alert('无法加载远程数据！');
                    }
                }, 'json');
                return;
            }
            opts.empty();
            opts.css({height: 'auto'});
            $(items).each(function () {
                additem(opts, this);
            });
            if (maxheight > 0 && opts.height() > maxheight) {
                opts.css({height: maxheight + 'px'});
            }
            opts.css({top: (qem.outerHeight(true) + 2) + 'px'});
        };

        var update = this.update = function () {
            sourse = qem.data('sourse') || null;
            reset(sourse);
        };
        update();
    }
    $.sdopx_widget('simulate_select', SimulateSelect, 'input.form-control.simulate_select:not(.notinit)');
})(jQuery);