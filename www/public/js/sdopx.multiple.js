
(function ($) {

    function array_search(arr, val) {
        for (var i = 0; i < arr.length; i++) {
            if (arr[i] == val)
                return i;
        }
        return -1;
    }

    function array_remove(arr, val) {
        var index = array_search(arr, val);
        if (index > -1) {
            arr.splice(index, 1);
        }
    }

    function Multiple(element) {
        var qem = $(element).hide();
        var vals = [];
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

        alphabet.find('a').on('click', function () {
            var code = $(this).data('code');
            loadopts('', code);
        });
        var updateValue = function () {
            var data = vals.length == 0 ? '' : $.toJSON(vals);
            qem.val(data);
        };
        //添加到快捷区
        var addquick = function (item) {
            if (array_search(vals, item.id) >= 0) {
                return;
            }
            var label = $('<label></label>').text(item.name).appendTo(quick);
            var box = $('<input type="checkbox">').val(item.id).prependTo(label);
            box.attr('checked', 'checked');
            vals.push(item.id);
            updateValue();
            box.on('click', function (ev) {
                var it = $(this);
                var val = it.val();
                if (it.is(':checked')) {
                    return;
                } else {
                    array_remove(vals, val);
                    updateValue();
                    var box = null;
                    opts.find(':input[type=checkbox]').each(function (idx) {
                        var that = $(this);
                        if (that.val() == val) {
                            box = that;
                            return false;
                        }
                    });
                    if (box) {
                        box.removeAttr('checked');
                    }
                    it.parent('label').remove();
                }
            });
        };
        var removequick = function (item) {
            var box = quick.find(':input[type=checkbox]').filter(function (idx) {
                if ($(this).val() == item.id) {
                    return true;
                }
                return false;
            });
            if (box.length >= 0) {
                box.parent('label').remove();
            }
            array_remove(vals, item.id);
            updateValue();
        };

        var tempzm = null;
        var additem = function (xopts, row) {
            var item = $('<div class="sdopx-multiple-option"></div>');
            if (row.initials != tempzm) {
                item.css('clear', 'both');
            }
            tempzm = row.initials;
            $('<em></em>').text(row.initials).prependTo(item);
            var label = $('<label></label>').text(row.name).appendTo(item);
            var box = $('<input type="checkbox">').data('item', row).val(row.id).prependTo(label);
            if (array_search(vals, row.id) >= 0) {
                box.attr('checked', 'checked');
            }
            box.click(function (ev) {
                var it = $(this);
                var item = it.data('item');
                if (it.is(':checked')) {
                    addquick(item, it);
                    return;
                } else {
                    removequick(item);
                    return;
                }
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
            var sourse = qem.data('sourse') || null;
            var obj = {};
            obj.ids = strval;
            obj.opt = 'default';
            if (sourse) {
                $.post(sourse, obj, function (data) {
                    if (!data.status) {
                        return;
                    }
                    var rows = data.success;
                    $(rows).each(function (index, rs) {
                        addquick(rs);
                    });
                    loadopts();
                }, 'json');
            }
        };
        init();

    }
    $.sdopx_widget('multiple', Multiple, ':input.form-control.multiple:not(.notinit)');
})(jQuery);

