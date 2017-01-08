(function ($) {

    function SdopxOptions(element) {
        var that = $(element).hide();
        var showbox = $('<div></div>').insertAfter(that);
        var inpbox = $('<div></div>').insertAfter(showbox);

        var argsspan = $('<span></span>').appendTo(inpbox);
        var addbtn = $('<a style="margin-left:10px;" class="sdopx-btn" href="#">添加</a>').appendTo(inpbox);
        $('<a style="margin-left:10px;" class="sdopx-btn" href="#">显示</a>').appendTo(inpbox).click(function () {
            if ($(this).text() === '显示') {
                that.show();
                showbox.hide();
                $(this).text('隐藏');
                return false;
            } else {
                that.hide();
                showbox.show();
                $(this).text('显示');
                return false;
            }
        });

        $('<span style="margin-left:0px;">值：</span>').appendTo(argsspan);
        var mt1 = $('<input  type="text" class="form-control sstext"/>').appendTo(argsspan);
        $('<span style="margin-left:10px;">文本：</span>').appendTo(argsspan);
        var mt2 = $('<input  type="text" class="form-control sstext"/>').appendTo(argsspan);

        var additem = function (vals) {
            if (vals == '') {
                return;
            }

            var itemd = $('<div style="line-height:20px;" class="valid_item"></div>').appendTo(showbox);
            $('<span class="valid_item_text"></span>').text(vals).appendTo(itemd);
            $('<a style="margin-left:10px;" href="#">编辑</a>').on('click', function () {
                var oitemd = $(this).parent();
                var ovals = oitemd.data('itdat');
                var opvals = ovals.split('|');
                mt1.val(opvals[0]);
                mt2.val(opvals[1] || '');
                addbtn.text('编辑').data('item', oitemd);
                return false;
            }).appendTo(itemd);
            $('<a style="margin-left:10px;" href="#">删除</a>').one('click', function () {
                $(this).parent().remove();
                update();
                return false;
            }).appendTo(itemd);
            itemd.data('itdat', vals);
            update();
        };

        var update = function () {
            var alldat = [];
            var items = showbox.find('div.valid_item');
            if (items.length === 0) {
                that.val('');
            } else {
                items.each(function (index, element) {
                    var itdat = $(element).data('itdat');
                    alldat.push(itdat);
                });
                that.val(alldat.join("\n"));
            }
        };

        addbtn.bind('click', function () {
            var val1 = mt1.val();
            var val2 = mt2.val();
            if (val1 == '') {
                return;
            }
            mt1.val('');
            mt2.val('');
            if ($(this).text() == '编辑') {
                var oitemd = $(this).data('item');
                var vals = val1;
                if (val2 != '') {
                    vals = val1 + '|' + val2;
                }
                oitemd.data('itdat', vals);
                $(this).text('添加');
                oitemd.find('span.valid_item_text').text(vals);
                update();
                return false;
            }
            additem(val1);
            return false;
        });


        var updatediv = function () {
            showbox.find('div.valid_item').remove();
            try {
                var boxval = that.val();
                var boxdata = boxval.split('\n');
                if ($.isArray(boxdata)) {
                    for (var key in boxdata) {
                        additem(boxdata[key]);
                    }
                }
            } catch (ex) {

            }
        };
        updatediv();
        that.blur(updatediv);
        //!!有待调整
    }

    $.sdopx_widget('options', SdopxOptions, ':input.form-control.options:not(.notinit)');

})(jQuery);