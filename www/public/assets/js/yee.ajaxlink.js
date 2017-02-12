(function ($, Yee, layer) {

    var fromTimeout = true;

    function parseURL(url) {
        var query = url.replace(/&+$/, '');
        var path = query;
        var prams = {};
        var idx = query.search(/\?/);
        if (idx >= 0) {
            path = query.substring(0, idx);
            var pstr = query.substring(idx);
            var m = pstr.match(/(\w+)(=([^&]*))?/g);
            if (m) {
                $(m).each(function () {
                    var ma = this.match(/^(\w+)(?:=([^&]*))?$/);
                    if (ma) {
                        prams[ma[1]] = ma[2] || '';
                    }
                });
            }
        }
        return {path: path, prams: prams};
    }

    //AJAX提交连接
    Yee.extend('a', 'ajaxlink', function (elem) {

        var qem = $(elem);
        var send = function (url) {
            //防止误触双击
            if (!fromTimeout) {
                return false;
            }
            fromTimeout = false;
            setTimeout(function () {
                fromTimeout = true;
            }, 1000);

            var args = parseURL(url);
            var rt = qem.triggerHandler('before', [url]);
            if (rt === false) {
                return;
            }
            var option = $.extend({
                method: 'get',
            }, qem.data() || {});
            $.ajax({
                type: option.method,
                url: args.path,
                data: args.prams,
                cache: false,
                dataType: 'json',
                success: function (ret) {
                    var rt = qem.triggerHandler('back', [ret]);
                    if (rt === false) {
                        return;
                    }
                    //拉取数据成功
                    if (ret.status === true) {
                        if (ret.message && typeof (ret.message) === 'string') {
                            layer.msg(ret.message, {icon: 1, time: 1000});
                        }
                    }
                    //拉取数据错误
                    if (ret.status === false) {
                        if (ret.message && typeof (ret.message) === 'string') {
                            layer.msg(ret.message, {icon: 0, time: 2000});
                        }
                        return;
                    }
                }
            });
        };

        qem.on('send', function (ev, url) {
            send(url);
        });

        qem.on('click', function (ev) {
            var that = $(this);
            if (ev.result === false) {
                return false;
            }
            //如果被确认框阻止
            if (that.data('confirm_prevent')) {
                return false;
            }
            var url = $(this).data('href') || $(this).attr('href');
            send(url);
            return false;
        });

    });

})(jQuery, Yee, layer);