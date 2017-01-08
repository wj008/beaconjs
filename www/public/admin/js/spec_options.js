(function ($) {
    function SpecOptions(element) {
        var that = $(element).hide();
        var showbox = $('<div></div>').insertAfter(that);
        var optdiv = $('<div class="optdiv"></div>').appendTo(showbox);
        var addbtn = $('<a style="margin-left:0px;" class="sdopx-btn" href="#">+ 添加选项值</a>').appendTo(optdiv);
        var additem = function (vals) {
            var item = $('<div class="item-data" style="line-height:32px"></div>').insertBefore(optdiv);
            if (that.is('.imgopt')) {
item.css({'line-height':'46px'});
                var imgspan = $('<span style="vertical-align: middle;line-height:32px width:32;display: inline-block; padding: 2px; height:32px;margin-left:2px;margin-right:3px;border: 1px solid #E7E7E7;background:#fff">').appendTo(item);
                var img = $('<img width="32" height="32" style="vertical-align: top;background:#fff"  src="/public/resources/images/upimg_group.png" />').appendTo(imgspan);
                $('<a style="margin-right:10px;" title="清空图片" class="sdopx-btn" href="javascript:;">X</a>').on('click', function () {
                    img.data('value', '');
                    img.attr('src', '/public/resources/images/upimg_group.png');
                    update();
                    return false;
                }).appendTo(item);
            }
            $('<span style="margin-left:0px;">选项值：</span>').appendTo(item);
            var xoptbox = $('<input placeholder="选项值"  style="width:160px;"  data-val="{&quot;required&quot;:true}" data-val-msg="{&quot;required&quot;:&quot;选项值必须填写&quot;}" type="text" class="form-control sstext opt"/>').appendTo(item);
            $('<a style="margin-left:10px;" class="sdopx-btn optdelete" href="#">- 删除</a>').one('click', function () {
                $(this).parent().remove();
                update();
                return false;
            }).appendTo(item);

            if (that.is('.imgopt')) {
                img.sdopx_upfile();
                img.on('afterUpfile', function (ev, data) {
                    if (data.err && data.err !== '') {
                        layer.alert(data.err);
                        return;
                    }
                    $(this).data('value', data.msg.url).attr('src', data.msg.url);
                    update();
                    return false;
                });
            }

            xoptbox.on('keypress', function (ev) {
                if (ev.which == 13) {
                    addbtn.trigger('click');
                }
            });

            if (vals !== null && typeof (vals) === 'object') {
                xoptbox.val(vals.value || '');
                if (that.is('.imgopt')) {
                    img.data('value', vals.icon || '');
                    img.attr('src', vals.icon || '/public/resources/images/upimg_group.png');
                }
            }
            xoptbox.initElem();
            xoptbox.on('blur change keyup keypree', function () {
                update();
            });
            xoptbox.focus();
            update();
        };
        var update = function () {
            var alldat = [];
            var items = showbox.find('div.item-data');
            if (items.length <= 1) {
                showbox.find('a.optdelete').hide();
            } else {
                showbox.find('a.optdelete').show();
            }
            items.each(function (index, element) {
                var optbox = $(element).find(':input.opt');
                var img = $(element).find('img');
                var itdat = {};
                itdat.value = optbox.val();
                itdat.icon = img.data('value');
                if (itdat.opt !== '') {
                    alldat.push(itdat);
                }
            });

            if (alldat.length === 0) {
                that.val('');
            } else {
                that.val($.toJSON(alldat));
            }

        };
        that.on('valid', function () {
            var valid = true;
            var optboxs = showbox.find(':input.opt');
            var allvals = [];
            optboxs.each(function (index, element) {
                var itbox = $(element);
                var oval = itbox.val();
                if (oval == '') {
                    valid = false;
                    itbox.setError('选项值不能为空');
                    itbox.one('mousedown', function () {
                        $(this).setDefault();
                    });
                    itbox.focus();
                    return false;
                }
                if ($.inArray(oval, allvals) >= 0)
                {
                    valid = false;
                    itbox.setError('选项值重复了');
                    itbox.one('mousedown', function () {
                        $(this).setDefault();
                    });
                    itbox.focus();
                    return false;
                }
                allvals.push(oval);
            });
            return valid;
        });
        addbtn.on('click', function () {
            if (false === that.triggerHandler('valid')) {
                return false;
            }
            additem();
            return false;
        });
        var init = function () {
            showbox.find('div.item-data').remove();
            try {
                var boxval = that.val();
                if (boxval != '' && boxval != '[]') {
                    var boxdata = $.evalJSON(boxval);
                    if ($.isArray(boxdata)) {
                        for (var key in boxdata) {
                            additem(boxdata[key]);
                        }
                    }
                } else {
                    additem(null);
                }
            } catch (ex) {

            }
        };
        init();
    }
    $.fn.sdopx_spec_options = function () {
        this.each(function () {
            if (!this.sdopx_spec_options) {
                this.sdopx_spec_options = new SpecOptions(this);
            }
        });
    };
})(jQuery);
