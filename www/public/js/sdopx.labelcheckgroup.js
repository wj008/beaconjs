/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
(function ($) {
    function LabelCheckGroup(element) {
        var box = $(element).hide();
        var options = box.data('options') || [];
        var fadrdg = $('<div class="sdopx-labelgroup"></div>').insertAfter(box);
        var strval = box.val();
        var arrval = strval == '' ? [] : $.parseJSON(strval);
        $(options).each(function (idx, em) {
            var item = {};
            item.value = typeof (em) == 'object' ? (em.value || em[0]) : em;
            item.text = typeof (em) == 'object' ? (em.text || em[1] || item.value) : item.value;
            item.info = typeof (em) == 'object' ? (em.info || em[2] || '') : '';
            item.icon = typeof (em) == 'object' ? (em.icon || '') : '';
            var aitem = $('<a href="javascript:;"></a>').text(item.text).data('text', item.text).data('value', item.value).appendTo(fadrdg);
            if (item.icon != '') {
                $('<img/>').attr('src', item.icon).prependTo(aitem);
            }
            $(arrval).each(function () {
                if (this == item.value) {
                    aitem.addClass('selected');
                    return false;
                }
            });
            if (aitem.width() < 40) {
                aitem.css('width', 40 + 'px');
            }
        });
        fadrdg.on('click', 'a', function () {
            var that = $(this);
            if (that.is('.disabled')) {
                return;
            }
            if (that.is('.selected')) {
                that.removeClass("selected");
            } else {
                that.addClass("selected");
            }
            var vals = [];
            fadrdg.find("a.selected").each(function (idx, elem) {
                var val = $(elem).data("value");
                vals.push(val);
            });
            var valstr = $.toJSON(vals);
            box.val(valstr);
            box.triggerHandler('mousedown');
            box.triggerHandler('click');
            return false;
        });
    }
    $.sdopx_widget('labelcheckgroup', LabelCheckGroup, 'input.form-control.labelcheckgroup:not(.notinit)');
})(jQuery);