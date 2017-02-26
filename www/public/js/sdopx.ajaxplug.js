
(function ($) {
    function AjaxPlug(element) {
        var qem = $(element);

        var showbox = $('<div></div>').insertAfter(qem);
        var update = function () {
            var url = qem.data('url');
            var method = (qem.data('method') || 'get').toLocaleLowerCase() === 'get' ? 'get' : 'post';
            var args = qem.data('args') || null;
            if (url != '') {
                $[method](url, args, function (data) {
                    showbox.empty();
                    if (data) {
                        showbox.html(data);
                        setTimeout(function () {
                            var boxs = showbox.find(':input.form-control');
                            boxs.trigger('sdopx_update');
                            if (typeof (boxs.initElem) == 'function') {
                                boxs.initElem();
                            }
                        }, 10);
                    }
                }, 'json');
            }
        };
        qem.on('update', function () {
            update();
        });
        update();
    }
    $.sdopx_widget('ajaxplug', AjaxPlug, 'input.form-control.ajax:not(.notinit)');
})(jQuery);
