(function ($) {

    function GoodsSpecPlug(element) {
        var that = $(element).hide();
        var row = that.parents('div.form-group:first');
        var showbox = $('<div class="goodspecplug"></div>').insertAfter(row);
        var btnadd = $('<a href="javascript:;" class="sdopx-btn">+ 添加规格选项</a>').insertAfter(that);
        var TestaddItem = function (vals, repitem) {
            var alldat = [];
            var items = showbox.find('div.item-data');
            items.each(function (index, element) {
                var itemvals = $(element).data('itemdata');
                if (repitem && repitem.length > 0 && element == repitem[0]) {
                    alldat.push(vals);
                } else {
                    alldat.push(itemvals);
                }
            });
            if (typeof (repitem) == 'undefined' || repitem == null) {
                alldat.push(vals);
            }
            var code = '';
            if (alldat.length > 0) {
                code = $.toJSON(alldat);
            }
            var thisid = $(':input[name=thisid]').val() || 0;
            var gid = $(':input[name=gid]').val() || 0;
            $.post('/Admin/Goods/checkSpecTable', {id: thisid, gid: gid, tabel: code}, function (dat) {
                if (dat && dat.state) {
                    addItem(vals, repitem);
                } else {
                    layer.confirm('本次修改将会造成 <span class="red">' + dat.len + '</span> 个商品规格无效并自动下架<br>您可以重新为它们选择新的规格信息.', {icon: 3, title: '确定修改吗', btn: ['仍然继续', '取消编辑']}, function (index) {
                        addItem(vals, repitem);
                        layer.close(index);
                    });
                }
            }, 'json');
        };
        var TestdelItem = function (pitem) {
            var alldat = [];
            var items = showbox.find('div.item-data');
            items.each(function (index, element) {
                var item = $(element);
                var itemvals = item.data('itemdata');
                if (item[0] != pitem[0]) {
                    alldat.push(itemvals);
                }
            });
            var code = '';
            if (alldat.length > 0) {
                code = $.toJSON(alldat);
            }
            var thisid = $(':input[name=thisid]').val() || 0;
            var gid = $(':input[name=gid]').val() || 0;
            $.post('/Admin/Goods/checkSpecTable', {id: thisid, gid: gid, tabel: code}, function (dat) {
                if (dat && dat.state) {
                    layer.confirm('您确定要删除该选项了吗', {icon: 3, title: '删除选项', btn: ['确定', '再想想']}, function (index) {
                        pitem.remove();
                        update();
                        layer.close(index);
                    });
                } else {
                    layer.confirm('您确定要删除该选项了吗?<br>本次修改将会造成 <span class="red">' + dat.len + '</span> 个商品规格无效并自动下架<br>您可以重新为它们选择新的规格信息.', {icon: 3, title: '确定修改吗', btn: ['仍然继续', '不删除了']}, function (index) {
                        pitem.remove();
                        update();
                        layer.close(index);
                    });
                }
            }, 'json');
        };

        var addItem = function (vals, repitem) {
            var item = null;
            if (repitem) {
                repitem.empty();
                repitem.data('itemdata', vals);
                item = repitem;
            } else {
                item = $('<div class="form-group item-data"></div>').data('itemdata', vals).appendTo(showbox);
            }
            $('<label class="form-label" style="width:150px;"></label>').text(vals.name + '：').appendTo(item);
            var formbox = $('<div class="form-box"></div>').appendTo(item);
            var input = $('<input name="spec_' + $.md5(vals.name) + '" id="spec_' + $.md5(vals.name) + '" class="form-control labelcheckgroup" type="text">').data('options', vals.options).appendTo(formbox);
            input.data('val', {required: true});
            input.data('val-msg', {required: '请选择一项！'});
            input.sdopx_labelradiogroup();
            var editbtn = $('<a href="javascript:;" class="sdopx-btn">编辑</a>').appendTo(formbox);
            editbtn.on('click', function () {
                var pitem = $(this).parents('div.item-data:first');
                var itval = pitem.data('itemdata');
                var okfun = function () {
                    var dlg = $(this);
                    var namebox = dlg.find(':input.name');
                    var optsbox = dlg.find(':input.options');
                    var valid = optsbox.triggerHandler('valid');
                    var validfunc = function (name) {
                        var valid = true;
                        showbox.find('div.item-data').not(pitem).each(function (index, element) {
                            var item = $(element);
                            var oval = item.data('itemdata');
                            if (name == oval.name)
                            {
                                valid = false;
                                namebox.setError('选项名已经存在了');
                                namebox.one('mousedown', function () {
                                    $(this).setDefault();
                                });
                                namebox.focus();
                                return false;
                            }
                        });
                        return valid;
                    };
                    var name = namebox.val();
                    if (name == '') {
                        namebox.setError('选项名不能为空');
                        namebox.one('mousedown', function () {
                            $(this).setDefault();
                        });
                        namebox.focus();
                        valid = false;
                    }
                    if (!validfunc(name) || !valid) {
                        return false;
                    }
                    var options = optsbox.val() == '' ? [] : $.parseJSON(optsbox.val());
                    var reval = {name: name, options: options};
                    TestaddItem(reval, pitem);
                    $(this).dialog("close");
                };
                var gid = $(':input[name=gid]').val() || 0;

                var items = showbox.find('div.item-data:first');
                var first = pitem.is(items[0]);

                var lay = $('<div title="编辑规格选项">\
                <div class="specdailog">\
                ' + (gid == 0 ? '' : '<div class="red" style="line-height:30px;">注意：已有数据情况下修改商品规格表可能会造成其他同属产品规格失效。</div>') + '\
                <div>选项名：<input style="width:160px;" placeholder="规格名称如颜色，尺寸等"  class="form-control text name"> <span class="hui">如：选择颜色</span></div>\
                ' + (first ? '<div style="line-height:30px;">主选项：本选项可以设置图片,上传图片有利于推广</div>' : '') + '\
                <div><textarea class="form-control spec-options options ' + (first ? 'imgopt' : '') + '"></textarea></div>\
                </div>\
                </div>').dialog({
                    modal: true,
                    width: 500,
                    minHeight: 300,
                    buttons: {"Ok": okfun}
                });
                lay.find(':input.name').initElem();
                var namebox = lay.find(':input.name');
                var optionsbox = lay.find('.spec-options');
                namebox.val(itval.name);
                optionsbox.val($.toJSON(itval.options));
                optionsbox.sdopx_spec_options();
            });
            var delbtn = $('<a href="javascript:;" class="sdopx-btn">删除</a>').appendTo(formbox);
            delbtn.on('click', function () {
                var pitem = $(this).parents('div.item-data:first');
                TestdelItem(pitem);

            });
            update();
        };

        btnadd.on('click', function () {
            var okfun = function () {
                var dlg = $(this);
                var namebox = dlg.find(':input.name');
                var optsbox = dlg.find(':input.options');
                var valid = optsbox.triggerHandler('valid');
                var validfunc = function (name) {
                    var valid = true;
                    showbox.find('div.item-data').each(function (index, element) {
                        var item = $(element);
                        var oval = item.data('itemdata');
                        if (name == oval.name)
                        {
                            valid = false;
                            namebox.setError('选项名已经存在了');
                            namebox.one('mousedown', function () {
                                $(this).setDefault();
                            });
                            namebox.focus();
                            return false;
                        }
                    });
                    return valid;
                };
                var name = namebox.val();
                if (name == '') {
                    namebox.setError('选项名不能为空');
                    namebox.one('mousedown', function () {
                        $(this).setDefault();
                    });
                    namebox.focus();
                    valid = false;
                }
                if (!validfunc(name) || !valid) {
                    return false;
                }
                var options = optsbox.val() == '' ? [] : $.parseJSON(optsbox.val());
                var reval = {name: name, options: options};
                TestaddItem(reval);
                $(this).dialog("close");
            };
            var gid = $(':input[name=gid]').val() || 0;

            var items = showbox.find('div.item-data');
            var first = items.length == 0;

            var lay = $('<div title="添加规格选项">\
            <div class="specdailog">\
             ' + (gid == 0 ? '' : '<div class="red" style="line-height:30px;">注意：已有数据情况下修改商品规格表可能会造成其他同属产品规格失效。</div>') + '\
            <div>选项名：<input style="width:160px;" placeholder="规格名称如颜色，尺寸等"  class="form-control text name"> <span class="hui">如：选择颜色</span></div>\
            ' + (first ? '<div style="line-height:30px;">主选项：本选项可以设置图片,上传图片有利于推广</div>' : '') + '\
            <div><textarea class="form-control spec-options options ' + (first ? 'imgopt' : '') + '"></textarea></div>\
            </div>\
            </div>').dialog({
                modal: true,
                width: 500,
                minHeight: 300,
                buttons: {"Ok": okfun}
            });

            lay.find(':input.name').initElem();
            var input = lay.find('.spec-options');
            input.sdopx_spec_options();
        });

        var update = function () {
            var alldat = [];
            var items = showbox.find('div.item-data');
            items.each(function (index, element) {
                var itemvals = $(element).data('itemdata');
                alldat.push(itemvals);
            });
            if (alldat.length === 0) {
                that.val('');
            } else {
                that.val($.toJSON(alldat));
            }
        };

        var init = function () {
            showbox.find('div.item-data').remove();
            try {
                var boxval = that.val();
                if (boxval != '' && boxval != '[]') {
                    var boxdata = $.evalJSON(boxval);
                    if ($.isArray(boxdata)) {
                        for (var key in boxdata) {
                            addItem(boxdata[key]);
                        }
                    }
                }
            } catch (ex) {
                layer.alert('数据加载有误，请重新打开页面！');
            }
        };
        init();
    }

    $.fn.sdopx_goods_spec_plug = function () {
        this.each(function () {
            if (!this.sdopx_goods_spec_plug) {
                this.sdopx_goods_spec_plug = new GoodsSpecPlug(this);
            }
        });
    };

})(jQuery);
