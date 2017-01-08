(function ($) {

    function UpGroup(element, options) {
        var qem = $(element).hide();
        options = options || {};
        options.extensions = options.extensions || qem.data('extensions') || '';//扩展名
        options['size'] = options['size'] || qem.data('size') || 0;
        options['size'] = parseInt(options['size']);
        var upbtn = $('<button type="button" class="sdopx-btn sdopx-upgroup">选择文件</button>').insertAfter(qem);
        upbtn.on('mouseover', function () {
            qem.triggerHandler('mousedown');
        });
        options.upbtn = upbtn.get(0);
        var shower = $('<div class="sdopx-upgroup-show"></div>').appendTo(qem.parent());
        var updatevals = function () {
            var files = [];
            shower.find('div.up_group_item').each(function () {
                var _this = $(this);
                files.push(_this.data('dat'));
            });
            if (files.length === 0) {
                qem.val('');
            } else {
                var valstr = $.toJSON(files);
                qem.val(valstr);
            }
            qem.trigger('change');
        };
        var addItem = function (url) {
            var xlen = shower.find('div.up_group_item').length;
            if (options['size'] !== 0 && xlen >= options['size']) {
                return;
            }
            var oitem = $('<div class="up_group_item"></div>').data('dat', url).appendTo(shower);
            $('<span>').text(url).appendTo(oitem);
            var abtn = $('<a href="javascript:void(0);">移除</a>').appendTo(oitem);
            abtn.click(function () {
                $(this).parent('div.up_group_item').remove();
                if (options['size'] !== 0) {
                    var len = shower.find('div.up_group_item').length;
                    if (len < options['size']) {
                        upbtn[0].disabled = false;
                    }
                }
                updatevals();
            });
            updatevals();
        };
        qem.on('afterUpfile', function (ev, data) {
            if (data && (!data.err || data.err === '')) {
                if (data.list) {
                    $(data.list).each(function () {
                        addItem(this.url);
                    });
                } else {
                    addItem(data.msg.url);
                }
            }
            return false;
        });
        qem.sdopx_upfile(options);
        var initBoxs = function () {
            var strval = qem.val() || '';
            var values = [];
            try {
                values = $.parseJSON(strval) || [];
            } catch (e) {
                values = [];
            }
            if ($.isArray(values)) {
                for (var i in values) {
                    addItem(values[i]);
                }
            }
        };
        initBoxs();
        this.destroy = function () {
            qem.sdopx_upfile('destroy');
        };
    }

    $.sdopx_widget('up_group', UpGroup, 'input.form-control.up_group:not(.notinit)');

})(jQuery);

