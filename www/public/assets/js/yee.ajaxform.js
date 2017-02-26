(function ($, Yee, layer) {
    var fromTimeout = true;

    Yee.extend('form', 'ajaxform', function (elem) {
        var qem = $(elem);
        var timer = null;
        //延迟100毫秒 让提交是最后的监听
        setTimeout(function () {
            qem.on('submit', function (ev) {
                var that = $(this);
                //防止误触
                if (!fromTimeout) {
                    return false;
                }
                fromTimeout = false;
                setTimeout(function () {
                    fromTimeout = true;
                }, 1000);
                if (ev.result === false) {
                    return false;
                }
                if (that.data('confirm_prevent')) {
                    return false;
                }
                var rt = that.triggerHandler('before');
                if (rt === false) {
                    return;
                }
                var action = that.attr('action') || window.location.href;
                var back = that.data('back') || '';
                if (back == '' && that.find(":input[name='__BACK__']").length > 0) {
                    back = that.find(":input[name='__BACK__']").val() || '';
                }
                var alert = that.data('alert') || false;
                var loading = that.data('loading') || false;
                var method = (that.attr('method') || 'POST').toUpperCase();
                var timeout = that.data('timeout') || 3000;//提交超时时间
                var sendData = that.serialize();
                var layerIndex = null;
                if (loading) {
                    layerIndex = layer.load(1, {
                        shade: [0.1, '#FFF'] //0.1透明度的白色背景
                    });
                    if (timer) {
                        window.clearTimeout(timer);
                    }
                    timer = window.setTimeout(function () {
                        if (layerIndex !== null) {
                            layer.close(layerIndex);
                        }
                        layerIndex = null;
                    }, timeout);
                }
                $.ajax({
                    type: method,
                    url: action,
                    data: sendData,
                    dataType: 'json',
                    success: function (ret) {
                        if (loading) {
                            if (timer) {
                                window.clearTimeout(timer);
                            }
                            if (layerIndex !== null) {
                                layer.close(layerIndex);
                            }
                            layerIndex = null;
                        }
                        if (!ret) {
                            return;
                        }
                        var rt = that.triggerHandler('back', [ret]);
                        if (rt === false) {
                            return;
                        }
                        //如果存在错误
                        if (ret.status === false) {
                            if (ret.error && typeof (ret.error) === 'object' && that.data('yee-validate-init')) {
                                that.showError(ret.error);
                            }
                            if (ret.message && typeof (ret.message) === 'string') {
                                if (alert) {
                                    layer.alert(ret.message, {icon: 7}, function (idx) {
                                        layer.close(idx);
                                    });
                                } else {
                                    layer.msg(ret.message, {icon: 0, time: 2000});
                                }
                            }
                        }
                        //提交成功
                        if (ret.status === true) {
                            if (ret.message && typeof (ret.message) === 'string') {
                                layer.msg(ret.message, {icon: 1, time: 1000});
                            }
                            if (typeof (ret.jump) === 'undefined' && back != '') {
                                ret.jump = back;
                            }
                        }
                        //页面跳转
                        if (typeof (ret.jump) !== 'undefined' && ret.jump !== null) {
                            window.setTimeout(function () {
                                if (ret.jump === 0) {
                                    window.location.reload();
                                } else if (typeof (ret.jump) === 'number') {
                                    window.history.go(ret.jump);
                                } else {
                                    window.location.href = ret.jump;
                                }
                            }, 1000);
                        }
                    },
                    error: function (xhr) {
                        if (loading) {
                            if (timer) {
                                window.clearTimeout(timer);
                            }
                            if (layerIndex !== null) {
                                layer.close(layerIndex);
                            }
                            layerIndex = null;
                        }
                    }
                });
                return false;
            });
        }, 50);
    });
})(jQuery, Yee, layer);