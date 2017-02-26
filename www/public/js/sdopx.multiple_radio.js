
(function ($) {


    function MultipleRadio(element) {
        var qem = $(element).hide();
        var layer = $('<div class="sdopx-multiple-layer"></div>').insertBefore(qem);
        var quick = $('<div class="sdopx-multiple-quick"></div>').appendTo(layer); //快选区
        var menu = $('<div class="sdopx-multiple-menu"></div>').appendTo(layer); //菜单
        var alphabet = $('<div class="sdopx-multiple-alphabet"></div>').appendTo(menu);//字母区
        var search = $('<div class="sdopx-multiple-search"><input type="text"><a href="javascript:;" class="sdopx-btn">GO</a></div>').appendTo(menu);//搜索区
        var opts = $('<div class="sdopx-multiple-options"></div>').appendTo(menu);
        var pagebar = $('<div class="sdopx-multiple-pagebar"></div>').appendTo(menu); //分页区

        $('<a href="javascript:;">全部</a>').data('code', 'all').appendTo(alphabet);
        for (var i = 0; i < 26; i++) {
            var code = String.fromCharCode(65 + i);
            $('<a href="javascript:;"></a>').data('code', code).text(code).appendTo(alphabet);
        }
        $('<a href="javascript:;" class="other">无分类</a>').appendTo(alphabet);



        layer.on('mousedown', function () {
            qem.triggerHandler('mousedown');
        });

        search.find('a').on('click', function () {
            var word = search.find('input').val();
            loadopts(word);
        });

        search.find('input').on('keypress', function (ev) {
            if (ev.which == 13) {
                setTimeout(function () {
                    search.find('a').trigger('click');
                }, 1);
                return false;
            }
        });

        alphabet.find('a:not(.other)').on('click', function () {
            var code = $(this).data('code');
            loadopts('', code);
        });

        alphabet.find('a.other').on('click', function () {
            var oldval = qem.val();
            qem.val(0);
            quick.text('无分类');
            if (oldval != 0) {
                qem.triggerHandler('change');
            }
        });

        var setDefault = function (rval) {
            qem.val(rval.id);
            quick.text(rval.name);
        };
        //添加到快捷区
        var tempzm = null;
        var additem = function (xopts, row) {
            var item = $('<a href="javascript:;" class="sdopx-multiple-option"></a>').data('item', row);
            if (row.initials != tempzm) {
                item.css('clear', 'both');
            }
            tempzm = row.initials;
            $('<em></em>').text(row.initials).prependTo(item);
            $('<span></span>').text(row.name).appendTo(item);
            item.click(function (ev) {
                var it = $(this);
                var item = it.data('item');
                setDefault(item);
                return false;
            });
            xopts.append(item);
        };

        var createPagebar = function (info) {
            pagebar.empty();
            var page = parseInt(info.page);
            var maxpage = parseInt(info.page_count);
            var start = (maxpage < 10 || page <= 5) ? 1 : (page + 5 > maxpage ? maxpage - 9 : page - 4);
            var temp = start + 9;
            var end = (page + 5 > maxpage) ? maxpage : (temp > maxpage ? maxpage : temp);
            info.other_query = info.other_query.replace(/&+$/, '');
            var pagelink = (info.other_query == '' ? info.keyname + '=##page##' : info.other_query + '&' + info.keyname + '=##page##');
            var prve = page - 1 <= 0 ? 1 : page - 1;
            var next = page + 1 >= maxpage ? maxpage : page + 1;
            $('<a href="javascript:;" class="first">首页</a>').data('url', pagelink.replace('##page##', 1)).appendTo(pagebar);
            $('<a href="javascript:;" class="first">上一页</a>').data('url', pagelink.replace('##page##', prve)).appendTo(pagebar);
            for (var i = start; i <= end; i++) {
                var p_page = i;
                if (p_page == page) {
                    $('<b></b>').text(p_page).appendTo(pagebar);
                } else {
                    $('<a href="javascript:;"></a>').data('url', pagelink.replace('##page##', p_page)).text(p_page).appendTo(pagebar);
                }
            }
            $('<a href="javascript:;" class="first">下一页</a>').data('url', pagelink.replace('##page##', next)).appendTo(pagebar);
            $('<a href="javascript:;" class="first">尾页</a>').data('url', pagelink.replace('##page##', maxpage)).appendTo(pagebar);
            pagebar.find('a').on('click', function () {
                var sourse = qem.data('sourse') || null;
                var ourl = $(this).data('url');
                if (sourse) {
                    $.get(sourse, ourl, function (data) {
                        if (!data.status) {
                            layer.alert(data.fail || '获取数据失败！');
                            return;
                        }
                        var rows = data.success.list;
                        var info = data.success.pageinfo;
                        createPagebar(info);
                        opts.empty();
                        $(rows).each(function (index, rs) {
                            additem(opts, rs);
                        });
                    }, 'json');
                }
            });
        };

        var loadopts = function (word, initials) {
            var sourse = qem.data('sourse') || null;
            var obj = {};
            obj.word = word || '';
            obj.initials = initials || '';
            obj.opt = 'list';
            if (sourse) {
                $.get(sourse, obj, function (data) {
                    if (!data.status) {
                        layer.alert(data.fail || '获取数据失败！');
                        return;
                    }
                    var rows = data.success.list;
                    var info = data.success.pageinfo;
                    createPagebar(info);
                    opts.empty();
                    $(rows).each(function (index, rs) {
                        additem(opts, rs);
                    });
                }, 'json');
            }
        };

        var init = function () {
            var strval = qem.val() || '';
            if (strval == '') {
                loadopts();
                return;
            }
            if (strval == 0) {
                qem.val(0);
                quick.text('无分类');
                return;
            }
            var sourse = qem.data('sourse') || null;
            var obj = {};
            obj.id = strval;
            obj.opt = 'default';
            if (sourse) {
                $.post(sourse, obj, function (data) {
                    if (!data.status) {
                        return;
                    }
                    var row = data.success;
                    setDefault(row);
                    loadopts();
                }, 'json');
            }
        };
        init();

    }
    $.sdopx_widget('multiple_radio', MultipleRadio, ':input.form-control.multiple-radio:not(.notinit)');
})(jQuery);

