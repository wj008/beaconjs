(function ($) {
    $(function () {
        String.prototype.toIdStr = function () {
            return this.replace(/(:|\.)/g, '\\$1');
        };
        $(':input[data-dynamic]').each(function (idx, elem) {
            var qelem = $(elem);
            var dynamicfun = function (item) {
                //显示
                // console.log(item);

                if (typeof (item.show) !== 'undefined') {
                    $(item.show).each(function (i, mid) {
                        var showid = ('#row_' + mid).toIdStr();
                        if (qelem.parents(showid).length > 0) {
                            $('#' + mid.toIdStr()).show();
                            $('#' + mid.toIdStr()).data('val-off', false);
                        } else {
                            $(showid).show();
                            $(showid + ' :input').data('val-off', false);
                        }
                    });
                }

                //隐藏
                if (typeof (item.hide) !== 'undefined') {
                    $(item.hide).each(function (i, mid) {
                        var hideid = ('#row_' + mid).toIdStr();
                        if (qelem.parents(hideid).length > 0) {
                            $('#' + mid.toIdStr()).hide();
                            $('#' + mid.toIdStr()).data('val-off', true);
                        } else {
                            $(hideid).hide();
                            $(hideid + ' :input').data('val-off', true);
                        }
                    });
                }

                //关闭验证
                if (typeof (item.off) !== 'undefined') {
                    var ids = '#' + item.off.join(',#');
                    $(ids.toIdStr()).data('val-off', true);
                }
                //开启验证
                if (typeof (item.on) !== 'undefined') {
                    var ids = '#' + item.on.join(',#');
                    $(ids.toIdStr()).data('val-off', false);
                }

            };

            if ($(elem).is(':input[type=hidden].form-control.checkgroup')) {
                var id = qelem.attr('id');
                var ul = qelem.parent();
                var items = ul.find(':input[name="' + id + '[]"]');
                var initclick = function () {
                    var data = qelem.data('dynamic');
                    var checkeds = ul.find(':input[name="' + id + '[]"]:checked');
                    if ($.isArray(data)) {
                        for (var k in data) {
                            var item = data[k];
                            if (typeof (item.eq) !== 'undefined') {
                                $(checkeds).each(function (idx, elm) {
                                    var bval = $(elm).val();
                                    if (item.eq == bval) {
                                        dynamicfun(item);
                                        return false;
                                    }
                                });
                            }
                            if (typeof (item.neq) !== 'undefined') {
                                var nohas = true;
                                $(checkeds).each(function (idx, elm) {
                                    var bval = $(elm).val();
                                    if (item.neq == bval) {
                                        nohas = false;
                                        return false;
                                    }
                                });
                                if (nohas) {
                                    dynamicfun(item);
                                }
                            }
                        }
                    }
                };
                items.on('click', initclick);
                initclick();
            } else {
                $(elem).on('blur click change', function () {
                    var qthis = $(this);
                    var val = qthis.val();
                    if (qthis.is(':radio,:checkbox')) {
                        val = qthis.is(':checked') ? val : '';
                    }
                    if (qthis.is(':checkbox.bool')) {
                        val = qthis.is(':checked') ? 1 : 0;
                    }
                    var data = qthis.data('dynamic');
                    if ($.isArray(data)) {
                        for (var k in data) {
                            var item = data[k];
                            if (typeof (item.eq) !== 'undefined') {
                                if (item.eq == val) {
                                    dynamicfun(item);
                                }
                            }
                            if (typeof (item.neq) !== 'undefined') {
                                if (item.neq != val) {
                                    dynamicfun(item);
                                }
                            }
                        }
                    }
                });
                $(elem).triggerHandler('change');
            }

        });
    });
})(jQuery);