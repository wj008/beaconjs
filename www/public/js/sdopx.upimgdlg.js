//使用对话框上传图片
(function ($) {
    function UpImgDlg(element, options) {
        var qem = $(element);
        var extensions = options.extensions || '';//扩展名
        var bindbox = options.input ? $(options.input) : null; //绑定的输入框
        var bindimg = options.image ? $(options.image) : null; //绑定的图片
        var isinput = qem.is('input');
        var reval = isinput ? qem.val() : (bindbox ? bindbox.val() : '');
        var upurl = options.upurl || '/service/albums'; //上传路径
        if (bindimg) {
            bindimg.attr('src', reval);
        }
        qem.triggerHandler('initUpfile', [reval]);//触发上传初始化事件
        if (typeof (window.opDialog) !== 'function' && typeof (window.top.opDialog) !== 'function') {
            alert('错误，未引入 topdailog.js 文件');
            return;
        }
        if (typeof (window.opDialog) !== 'function') {
            window.opDialog = window.top.opDialog;
        }
        var upbtn = null;
        var btnText = options['btn-text'] || '选择文件';
        if (options.upbtn) {
            upbtn = $(options.upbtn);
        } else if (isinput) {
            qem.addClass('not-radius-left');
            upbtn = $('<button type="button" class="smbox-upfile-btn not-radius-right">' + btnText + '</button>').insertBefore(qem);
        } else {
            upbtn = qem;
        }
        var uploadCompleteData = function (data) {
            if (data && data.err) {
                qalert(data.err);
                return;
            }
            if (data && (data.err == '' || data.state == 'SUCCESS')) {
                if (bindimg) {
                    bindimg.attr('src', data.msg.url);
                }
                if (isinput) {
                    qem.val(data.msg.url);
                }
                if (bindbox) {
                    bindbox.val(data.msg.url);
                }
            }
            if (data) {
                qem.triggerHandler('afterUpfile', [data]);
            }
        };
        var upload = function () {
            window.opDialog(upurl, 'UpImgDlg', '上传图片', function (rtval) {
                uploadCompleteData(rtval);
            }, {width: 800, height: 600});
        };
        upbtn.on('click', function () {
            upload();
            return false;
        });

        this.remove = function () {
            upbtn.off('click');
        };

    }

    $.fn.sdopx_upimgdlg = function (options) {
        this.each(function () {
            if (!this.sdopx_upimgdlg) {
                var qem = $(this);
                if (typeof (options) !== 'string') {
                    var args = ['extensions', 'input', 'image', 'upurl'];
                    var temp = {};
                    if (typeof (options) == 'object') {
                        for (var key in options) {
                            temp[key] = options[key];
                        }
                        for (var i in args) {
                            temp[args[i]] = options[args[i]] || qem.data(args[i]);
                        }
                    } else {
                        for (var i in args) {
                            temp[args[i]] = qem.data(args[i]);
                        }
                    }
                    this.sdopx_upimgdlg = new UpImgDlg(this, temp);
                }
            } else {
                if (typeof (options) === 'string') {
                    if (options === 'close') {
                        this.sdopx_upimgdlg.remove();
                        this.sdopx_upimgdlg = null;
                    }
                }
            }
        });
    };

    $(function () {
        $(document.body).delegate('input.form-control.upimgdlg:not(.notinit)', 'sdopx_update', function () {
            $(this).sdopx_upimgdlg();
        });
        $('input.form-control.upimgdlg:not(.notinit)').sdopx_upimgdlg();
    });

})(jQuery);