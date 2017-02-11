(function ($, Yee, layer) {
    Yee.extend(':input,form,a', 'confirm', function (element) {
        var qem = $(element);
        qem.data('confirm_result', false);
        if (qem.is('form')) {
            qem.on('submit', function (ev) {
                var that = $(this);
                if (ev.result === false) {
                    return false;
                }
                if (that.data('confirm_result')) {
                    return true;
                }
                var confirm = that.data('confirm') || '';
                if (confirm == '') {
                    return true;
                }
                layer.confirm(confirm, function (idx) {
                    that.data('confirm_result', true);
                    that.trigger('submit');
                    layer.close(idx);
                });
                return false;
            });
        } else {
            qem.on('click', function (ev) {
                var that = $(this);
                if (ev.result === false) {
                    return false;
                }
                if (that.data('confirm_result')) {
                    return true;
                }
                var confirm = that.data('confirm') || '';
                if (confirm == '') {
                    return true;
                }
                layer.confirm(confirm, function (idx) {
                    that.data('confirm_result', true);
                    if (that.is('a')) {
                        var p = $('<p style="display: none"></p>').appendTo(that);
                        p.trigger('click');
                        p.remove();
                    } else {
                        that.trigger('click');
                    }
                    layer.close(idx);
                });
                return false;
            });
        }
    });
})(jQuery, Yee, layer);