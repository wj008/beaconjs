(function () {
    var backUrl = window.location.href;

    var initLoad = function (doc) {
        //分页设置
        $('#pagebar', doc).find('a').attr('yee-module', 'ajaxlink').on('back', function (ev, ret) {
            if (ret.status) {
                updateList(ret.data);
                return false;
            }
        });
        //删除刷新
        $('a.yee-btn.del', doc).on('back', function (ev, ret) {
            if (ret.status) {
                goto();
            }
        });
    };

    //刷新数据
    var goto = function (url, func) {
        if (typeof url == 'function' && func == void 0) {
            func = url;
            url = Yee.toUrl(Yee.parseURL(baseUrl));
        }
        if (url === void 0 || url === null || url === '') {
            url = Yee.toUrl(Yee.parseURL(baseUrl));
        }
        $.get(url, function (ret) {
            if (ret.status) {
                updateList(ret.data);
                if (typeof func == 'function') {
                    func();
                }
            }
        }, 'json');
    };
    //点击刷新
    $('#refresh-btn').attr('href', 'javascript:;').on('click', function () {
        var icon = $(this).find('i');
        var deg = icon.data('deg') || 0;
        deg = deg + 360;
        icon.css("transform", "rotate(" + deg + "deg)");
        icon.css("-o-transform", "rotate(" + deg + "deg)");
        icon.css("-webkit-transform", "rotate(" + deg + "deg)");
        icon.data('deg', deg);
        goto(function () {
            layer.msg('刷新成功', {icon: 1, time: 1000});
        });
    });

    //设置放回的页面
    var reBack = function (item) {
        var url = Yee.toUrl(Yee.parseURL(baseUrl));
        var btn = $(item);
        var href = Yee.parseURL(btn.attr('href'));
        href.prams['__BACK__'] = url;
        btn.attr('href', Yee.toUrl(href));
    }

    //更新列表
    var updateList = function (data) {
        var pinfo = data.pdata;
        baseUrl = window.location.pathname + '?' + pinfo.query;
        $('#records_count').html(pinfo.records_count);
        var list = $('#list').html(data.html);
        //给按钮加入回访页面路径
        list.find('.opt-btns a').each(function () {
            reBack(this);
        });
        reBack('#add-btn');
        initLoad(list);
        Yee.update(list);
    }
    //搜索框
    $('#search').on('back', function (ev, ret) {
        if (ret.status) {
            updateList(ret.data);
        }
    });

    //审核按钮设置
    $('#list').on('click', '.allow', function () {
        var that = $(this);
        var val = that.is(':checked') ? 1 : 0;
        var href = that.data('href');
        var args = Yee.parseURL(href);
        $.post(args.path, args.prams, function (ret) {
            //拉取数据成功
            if (ret.status === true) {
                if (ret.info.allow) {
                    that.prop('checked', true);
                } else {
                    that.prop('checked', false);
                }
            }
            //拉取数据错误
            if (ret.status === false) {
                if (ret.error && typeof ret.error === 'string') {
                    layer.msg(ret.error, {icon: 0, time: 2000});
                }
                return;
            }
        }, 'json');
        return false;
    });

    initLoad();
})();