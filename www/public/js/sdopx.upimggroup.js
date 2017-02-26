(function ($) {

    var getImgObj = function (url, width, height) {
        var img = $('<img/>');
        img.height(height);
        img.width(width);
        var imgtemp = new Image();
        imgtemp.onload = function () {
            var imgwidth = imgtemp.width;
            var imgheight = imgtemp.height;
            var mwidth = width, mheight = height;

            if (imgwidth > imgheight && imgwidth > width) {
                mwidth = width;
                mheight = parseInt((width / imgwidth) * imgheight);
            } else if (imgheight > imgwidth && imgheight > height) {
                mheight = height;
                mwidth = parseInt((height / imgheight) * imgwidth);
            } else {
                if (imgwidth > width) {
                    mwidth = width;
                    mheight = height;
                } else {
                    mwidth = imgwidth;
                    mheight = imgheight;
                }
            }
            img.height(mheight);
            img.width(mwidth);
        };
        imgtemp.src = url;
        img.attr('src', url);
        return img;
    };

    function UpImgGroup(element, options) {
        var qem = $(element).hide();
        options = options || {};
        options.extensions = options.extensions || qem.data('extensions') || 'png,jpg,jpeg,bmp,gif';//扩展名
        options['show-width'] = options['show-width'] || qem.data('show-width') || 80;
        options['show-height'] = options['show-height'] || qem.data('show-height') || 80;
        options['size'] = options['size'] || qem.data('size') || 0;
        options['size'] = parseInt(options['size']);
        var upbtn = $('<a  class="upimg_group_upbtn" href="javascript:;"></a>').insertAfter(qem);
        upbtn.css({width: options['show-width'] + 'px', height: options['show-height'] + 'px'});
        upbtn.on('mouseover', function () {
            qem.triggerHandler('mousedown');
        });
        var shower = $('<div class="upimg_group_layer"></div>').insertAfter(qem);
        options.upbtn = upbtn.get(0);
        
        $(window).on('resize', function () {
            var itemw = 0;
            var itemh = options['show-height'];
            var items = shower.find('div.upimg_group_item');
            if (items.length > 0) {
                itemh = items.eq(0).outerHeight(true);
                itemw = items.eq(0).outerWidth(true);
            }
            var lefw = shower.parent().width() - options['show-width'] - 50;
            lefw = Math.floor(lefw / itemw) * itemw;
            var layw = itemw * items.length;
            var layh = itemh;
            if (layw > lefw) {
                var row = Math.ceil(layw / lefw);
                layh = layh * row;
                layw = lefw;
            }
            shower.css({width: layw + 'px', height: layh + 'px'});
        });

        var updatevals = function () {
            var imgs = [];
            shower.find('div.upimg_group_item').each(function () {
                var _this = $(this);
                var dat = _this.data('dat');
                imgs.push(_this.data('dat'));
            });
            $(window).triggerHandler('resize');
            if (imgs.length === 0) {
                qem.val('');
            } else {
                var valstr = $.toJSON(imgs);
                qem.val(valstr);
            }
            qem.trigger('change');
        };
        if (shower.sortable) {
            shower.sortable({revert: true, containment: "parent", update: function (event, ui) {
                    updatevals();
                }});
        }
        var addItem = function (url) {
            var xlen = shower.find('div.upimg_group_item').length;
            if (options['size'] !== 0 && xlen >= options['size']) {
                return;
            }
            var oitem = $('<div class="upimg_group_item">\
<table  border="0" cellspacing="0" cellpadding="0"><tr><td style="padding:0px; vertical-align:middle; text-align:center; line-height:0px;"></td></tr></table>\
</div>').data('dat', url).appendTo(shower);
            var td = oitem.find('td').empty().css({width: options['show-width'] + 'px', height: options['show-height'] + 'px'});
            getImgObj(url, options['show-width'], options['show-height']).appendTo(td);
            updatevals();
            var abtn = $('<a href="javascript:void(0);"></a>').addClass('upimg_group_delpic').appendTo(oitem);
            abtn.click(function () {
                $(this).parent('div.upimg_group_item').remove();
                if (options['size'] !== 0) {
                    var len = shower.find('div.upimg_group_item').length;
                    if (len < options['size']) {
                        upbtn[0].disabled = false;
                    }
                }
                updatevals();
            });
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

    $.sdopx_widget('upimg_group', UpImgGroup, 'input.form-control.upimg_group:not(.notinit)');



})(jQuery);

