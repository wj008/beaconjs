/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
(function ($) {

    function LabelRadioGroup(element) {
        var box = $(element).hide();
        var options = box.data('options') || [];
        var fadrdg = $('<div class="sdopx-labelgroup"></div>').insertAfter(box);
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
            if (item.value == box.val()) {
                aitem.addClass('selected');
            }
            if (aitem.width() < 40) {
                aitem.css('width', 40 + 'px');
            }
        });
        box.on('update', function () {
            var bval = box.val();
            fadrdg.find('a').each(function (idx, elem) {
                var aitem = $(elem);
                var itval = aitem.data('value');
                if (itval == bval) {
                    aitem.addClass('selected');
                } else {
                    aitem.removeClass('selected');
                }
            });
        });

        fadrdg.on('click', 'a', function () {
            var that = $(this);
            if (that.is('.disabled')) {
                return;
            }
            fadrdg.find('a').removeClass('selected');
            that.addClass('selected');
            var val = that.data('value');
            box.val(val);
            box.triggerHandler('mousedown');
            box.triggerHandler('click');
            return false;
        });
    }
    $.fn.old_sdopx_labelradiogroup_val = $.fn.val;
    $.fn.val = function (val) {
        var that = $(this);
        if (typeof (val) === 'undefined') {
            return that.old_sdopx_labelradiogroup_val();
        } else {
            if (that[0].sdopx_labelradiogroup) {
                var t = that.old_sdopx_labelradiogroup_val(val);
                that.triggerHandler('update');
                return t;
            } else {
                return that.old_sdopx_labelradiogroup_val(val);
            }
        }
    };
    $.sdopx_widget('labelradiogroup', LabelRadioGroup, 'input.form-control.labelradiogroup:not(.notinit)');

})(jQuery);