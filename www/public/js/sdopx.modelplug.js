(function ($) {
    var Index = 0;
    function Modelplug(element) {
        var qelem = $(element);

        //!!有待调整
        var boxname = qelem.attr('name') || qelem.attr('id');
        qelem.removeAttr('name');
        var min_count = qelem.data('min-count') || 0;
        min_count = Number(min_count);
        var max_count = qelem.data('max-count') || 0;
        max_count = Number(max_count);
        var type = qelem.data('plug-type') || 0;
        var delete_confirm = qelem.data('delete-confirm') || '';
        if (type == 0) {
            return;
        }
        var table = null;
        var codetag = null;
        if (type == 3) {
            table = qelem.prev('table[id*=":table"]');
            if (table.length == 0) {
                alert('控件源没有找到！');
                return;
            }
            codetag = table.prev('script[id*=":soures"]');
        } else {
            codetag = qelem.prev('script[id*=":soures"]');
        }
        if (codetag.length == 0) {
            alert('控件源没有找到！');
            return;
        }
        var soures = codetag.html();
        var form_modelplug = qelem.parents('.form-modelplug:first');
        var addbtn = form_modelplug.find('a.add');
        var checkItem = function () {
            if (min_count > 0) {
                var items = form_modelplug.find('.modelplug-item');
                if (items.length <= min_count) {
                    items.find('a.delete').hide();
                } else {
                    items.find('a.delete').show();
                }
            }
        };
        var createItem = function (row, item) {
            Index++;
            var idx = 'item' + Index;
            var itemcode = soures.replace(/@index@/g, idx);
            var itemview = $(itemcode);
            var val_off = qelem.data('val-off') || false;
            itemview.find(':input').data('val-off', val_off);
            //完成赋值
            var setVal = function (row) {
                if (row) {
                    for (var key in row) {
                        if ($.isArray(row[key])) {
                            var temp = [];
                            $(row[key]).each(function () {
                                temp.push(this + '');
                            });
                            var gbox = itemview.find(":input[type=checkbox][name='" + boxname + '[' + idx + '][' + key + "][]']");
                            if (gbox.length > 0) {
                                gbox.each(function () {
                                    var cbox = $(this);
                                    var cval = cbox.val();
                                    if ($.inArray(cval, temp) >= 0) {
                                        cbox.prop('checked', true);
                                    }
                                });
                                continue;
                            }
                        }
                        var box = itemview.find(":input[name='" + boxname + '[' + idx + '][' + key + "]']");
                        if (box.length > 0) {
                            if (typeof (row[key]) == 'string' || typeof (row[key]) == 'number') {
                                if (box.is(':input[type=checkbox]')) {
                                    if (row[key] == 1) {
                                        box.prop('checked', true);
                                    }
                                } else {
                                    box.val(row[key]);
                                }
                            } else {
                                box.val($.toJSON(row[key]));
                            }
                        }
                    }
                }
            };
            if (false !== qelem.triggerHandler('inititem', [itemview, idx, boxname, row])) {
                setVal(row);
            }
            itemview.find('a.upsort').on('click', itemview, function (ev) {
                var utemp = ev.data.prev('.modelplug-item');
                if (utemp.length > 0)
                    utemp.before(ev.data);
                return false;
            });
            itemview.find('a.dnsort').on('click', itemview, function (ev) {
                var utemp = ev.data.next('.modelplug-item');
                if (utemp.length > 0)
                    utemp.after(ev.data);
                return false;
            });
            //插入
            itemview.find('a.insert').on('click', itemview, function (ev) {
                if (max_count > 0) {
                    var items = form_modelplug.find('.modelplug-item');
                    if (items.length >= max_count) {
                        alert('最大只能添加 ' + max_count + ' 栏！');
                        return false;
                    }
                }
                createItem(null, ev.data);
                return false;
            });
            //删除
            itemview.find('a.delete').on('click', itemview, function (ev) {
                if (min_count > 0) {
                    var items = form_modelplug.find('.modelplug-item');
                    if (items.length <= min_count) {
                        alert('至少需要 ' + min_count + ' 栏！');
                        return false;
                    }
                }
                if (delete_confirm) {
                    if (!confirm(delete_confirm)) {
                        return false;
                    }
                }
                ev.data.remove();
                checkItem();
                qelem.trigger('delitem');
                return false;
            });
            if (item) {
                itemview.insertBefore(item);
            } else {
                if (type == 3) {
                    var lastr = table.find('tr:last');
                    itemview.insertAfter(lastr);
                } else {
                    itemview.insertBefore(qelem);
                }
            }
            checkItem();
            setTimeout(function () {
                itemview.find(':input.form-control').trigger('sdopx_update');
                qelem.trigger('additem', [itemview, idx, boxname, row]);
            }, 10);
        };
        //计算
        addbtn.on('click', function () {
            if (max_count > 0) {
                var items = form_modelplug.find('.modelplug-item');
                if (items.length >= max_count) {
                    alert('最大只能添加 ' + max_count + ' 栏！');
                    return false;
                }
            }
            createItem();
            return false;
        });
        var initBoxs = function () {
            var strval = qelem.val() || '';
            var values = [];
            try {
                values = $.parseJSON(strval) || [];
            } catch (e) {
                values = [];
            }
            if ($.isArray(values)) {
                for (var i in values) {
                    createItem(values[i]);
                }
            }
            var items = form_modelplug.find('.modelplug-item');
            if (items.length < min_count) {
                for (var i = items.length; i < min_count; i++) {
                    createItem();
                }
            }
            checkItem();
        };
        initBoxs();

        $(qelem[0].form).on('submit', function () {
            var rows = [];
            form_modelplug.find('.modelplug-item').each(function (idx, elem) {
                var item = $(elem).find(':input[name^="' + boxname + '"]');
                var row = {};
                item.each(function (x, ebox) {
                    var qbox = $(ebox);
                    var key = qbox.attr('name').toString().replace(/^.*\[([^\]]+)\]$/, '$1');
                    row[key] = qbox.val();
                });
                rows.push(row);
            });
            qelem.val($.toJSON(rows));
        });
    }
    $.sdopx_widget('modelplug', Modelplug, 'input.form-control.modelplug:not(.notinit)');
})(jQuery);
