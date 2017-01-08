(function ($) {
    //发送手机验证码
    function SendSms(element) {
        var qem = $(element);
        var intext = qem.data('intext') || '{time}秒后可再发送';
        var outtext = qem.data('outtext') || qem.text();
        var timeout = qem.data('timeout') || 100;
        var boxmbname = qem.data('mobile-name') || null;//要绑定发送的输入框
        var submiturl = qem.data('submit-url') || ''; //提交地址
        var method = (qem.data('method') || 'get').toLocaleLowerCase() === 'get' ? 'get' : 'post'; //提交方式
        var boxmb = $.type(boxmbname) == 'string' ? $(':input[name="' + boxmbname + '"]') : null;
        var time = 0;
        var timer = null;

        var cleantimer = function () {
            if (timer != null) {
                window.clearInterval(timer);
                timer = null;
            }
        };

        var start = function () {
            time = timeout;
            cleantimer();
            qem.prop("disabled", true);
            qem.addClass('disabled');
            timer = window.setInterval(function () {
                time--;
                if (time <= 0) {
                    if (qem.is('input')) {
                        qem.val(outtext);
                    } else {
                        qem.text(outtext);
                    }
                    stop();
                } else {
                    var str = intext.replace(/{time}/ig, time);
                    if (qem.is('input')) {
                        qem.val(str);
                    } else {
                        qem.text(str);
                    }
                }
            }, 1000);
        };

        var stop = function () {
            time = 0;
            qem.removeProp('disabled');
            qem.removeClass('disabled');
            cleantimer();
        };

        qem.on('click', function () {
            if (qem.is(':disabled') || qem.is('.disabled')) {
                return;
            }
            var mobile = '';
            if (boxmb) {
                if (boxmb.val() == '') {
                    boxmb.focus();
                    return;
                }
                mobile = boxmb.val();
            }
            $[method](submiturl, {'mobile': mobile}, function (data) {
                if (data && data.success) {
                    start();

                } else if (data && data.error) {

                }
            }, 'json');
        });
    }

    $.sdopx_widget('send_sms', SendSms, '.form-control.sendsms:not(.notinit)');

})(jQuery);