$(function () {
    var checkall = $('#checkall');
    if (checkall.length > 0) {
        checkall.on('click', function () {
            if ($(this).is(':checked')) {
                $('.checkitem').prop('checked', true);
            } else {
                $('.checkitem').prop('checked', false);
            }
        });
        function getIds() {
            var ids = [];
            $('.checkitem').each(function (index, element) {
                var $element = $(element);
                if ($element.is(':checked')) {
                    ids.push($element.val());
                }
            });
            return ids.join(',');
        }

        function getname(name, sids) {
            var vals = [];
            var ids = sids.split(',');
            for (var i in ids) {
                var val = $('#' + name + ids[i]).val();
                vals.push(val);
            }
            return vals.join(',');
        }
        $("#allopts a.optbtn").on('click', function () {
            var ids = getIds();
            if (ids == '') {
                alert('未选中任何信息!');
                return false;
            }
            var that = $(this);
            var tip = that.data('tips');
            if (tip) {
                if (!confirm(tip)) {
                    return false;
                }
            }
            var url = that.attr('href').replace('%40ids', ids);
            url = url.replace(/%40([a-z]+)/g, function ($0, name) {
                return getname(name, ids);
            });
            that.attr('href', url);
            return true;
        });
    }

    $(document.body).on('click', 'a[data-tips]', function () {
        var tips = $(this).data('tips');
        if (!confirm(tips)) {
            return false;
        }
        return true;
    });

    //菜单
    var timer = null;
    var clearTimeer = function () {
        if (timer) {
            window.clearTimeout(timer);
        }
        timer = null;
    };
    var setTimer = function (func, time) {
        clearTimeer(timer);
        timer = window.setTimeout(func, time);
    };

    $(document.body).on('mouseenter', '.sdopx-minimenu', function () {
        $('.sdopx-menu.hover,.sdopx-minimenu.hover').not(this).removeClass('hover');
        clearTimeer();
        var menu = $(this).addClass('hover');
        var menubody = menu.find('.sdopx-menu-body');
        var left = menu.outerWidth(true) - menubody.outerWidth(true);
        menubody.css('left', left + 'px');
    });
    $(document.body).on('mouseleave', '.sdopx-minimenu', function () {
        var that = $(this);
        setTimer(function () {
            that.removeClass('hover');
        }, 100);
    });
    $(document.body).on('mouseenter', '.sdopx-menu', function () {
        $('.sdopx-menu.hover,.sdopx-minimenu.hover').not(this).removeClass('hover');
        clearTimeer();
        var menu = $(this).addClass('hover');
        var menubody = menu.find('.sdopx-menu-body');
        var mr = menu.offset().left + menubody.outerWidth();
        var wr = $(document.body).width() - 10;
        if (mr > wr) {
            menubody.css('left', (wr - mr) + 'px');
        } else {
            menubody.css('left', 0);
        }
    });
    $(document.body).on('mouseleave', '.sdopx-menu', function () {
        var that = $(this);
        setTimer(function () {
            that.removeClass('hover');
        }, 100);
    });

});
