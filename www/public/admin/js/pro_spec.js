$(function () {
    $('form').on('beforeValid', function (e, elem, msg) {
        layer.closeAll('tips');
        return false;
    });

    var SKUTemps = null;

    function getSKUTemps(tabs) {
        var temp = null;
        if (SKUTemps == null) {
            return null;
        }
        $(SKUTemps).each(function (idx, rs) {
            if (rs.spec.length != tabs.length) {
                return;
            }
            for (var i in rs.spec) {
                if (rs.spec[i] != tabs[i]) {
                    return;
                }
            }
            temp = rs;
            return false;
        });
        return temp;
    }


    function createTable(data) {
        var keeping = $('#keeping').hide();
        var tbdiv = keeping.parent().find('.keeping-table');
        keeping.removeAttr('name');
        tbdiv = tbdiv.length >= 1 ? tbdiv : $('<div class="keeping-table"></div>').insertBefore('#keeping');
        tbdiv.empty();
        if (SKUTemps == null) {
            var strval = keeping.val() || '[]';
            SKUTemps = $.parseJSON(strval) || [];
        }
        var table = $('<table class="spec_table"></table>').appendTo(tbdiv);
        var thead = $('<thead></thead>').appendTo(table);
        var tbody = $('<tbody></tbody>').appendTo(table);
        var htr = $('<tr></tr>').appendTo(thead);
        $(data.heads).each(function () {
            $('<th></th>').text(this).appendTo(htr);
        });

        $('<th class="th-price"><em>*</em>价格<div class="batch"><i class="fa fa-pencil-square-o" title="批量操作"></i>\
                  <div class="batch-input" style="display: none;">\
                    <h6>批量设置价格：</h6>\
                    <a href="javascript:void(0)" class="close">×</a>\
                    <input type="text" class="form-control number">\
                    <a href="javascript:void(0)" class="sdopx-btn" data-type="price">设置</a><span class="arrow"></span></div>\
                </div></th>').appendTo(htr);

        $('<th class="th-mkprice"><em>*</em>市场价<div class="batch"><i class="fa fa-pencil-square-o" title="批量操作"></i>\
                  <div class="batch-input" style="display: none;">\
                    <h6>批量设置市场价：</h6>\
                    <a href="javascript:void(0)" class="close">×</a>\
                    <input type="text" class="form-control number">\
                    <a href="javascript:void(0)" class="sdopx-btn" data-type="mkprice">设置</a><span class="arrow"></span></div>\
                </div></th>').appendTo(htr);

        $('<th class="th-stock"><em>*</em>库存<div class="batch"><i class="fa fa-pencil-square-o" title="批量操作"></i>\
                  <div class="batch-input" style="display: none;">\
                    <h6>批量设置库存：</h6>\
                    <a href="javascript:void(0)" class="close">×</a>\
                    <input type="text" class="form-control integer">\
                    <a href="javascript:void(0)" class="sdopx-btn" data-type="stock">设置</a><span class="arrow"></span></div>\
                </div></th>').appendTo(htr);

        $('<th class="th-alarm">预警值<div class="batch"><i class="fa fa-pencil-square-o" title="批量操作"></i>\
                  <div class="batch-input" style="display: none;">\
                    <h6>批量设置预警值：</h6>\
                    <a href="javascript:void(0)" class="close">×</a>\
                    <input type="text" class="form-control integer">\
                    <a href="javascript:void(0)" class="sdopx-btn" data-type="alarm">设置</a><span class="arrow"></span></div>\
                </div></th>').appendTo(htr);

        $('<th class="th-sncode">商家货号</th>').appendTo(htr);
        $('<th class="th-barcode">条形码</th>').appendTo(htr);

        htr.find('i.fa-pencil-square-o').on('click', function () {
            htr.find('.batch-input').hide();
            var box = $(this).parent('.batch').find('.batch-input');
            var input = box.find(':input');
            setTimeout(function () {
                input.focus();
            }, 10);
            input.val('');
            box.show();
        });
        htr.find('a.close').on('click', function () {
            $(this).parent('.batch-input').hide();
        });

        htr.find('.batch-input :input').on('keypress', function (ev) {
            if (ev.which == 13) {
                var btn = $(this).next('a.sdopx-btn');
                setTimeout(function () {
                    btn.trigger('click');
                }, 1);
                return false;
            }
        });

        htr.find('a.sdopx-btn').on('click', function () {
            var box = $(this).parent('.batch-input');
            var val = box.find('input').val();
            var type = $(this).data('type');
            if (val != '') {
                var items = tbody.find(':input.inp-' + type);
                items.val(val).trigger('change');
                items.setDefault();
                box.hide();
            }
        });

        var n = 0;
        $(data.rows).each(function () {
            var tr = $('<tr></tr>').appendTo(tbody);
            var item = this;
            var m = 0;
            $(item).each(function () {
                var td = $('<td></td>').text(this).appendTo(tr);
                $('<input type="hidden" name="keeping[o' + n + '][spec][' + m + ']" class="form-control stext">').val(this).appendTo(td);
                m++;
            });
            $('<td class="th-price">\
            <input type="hidden" name="keeping[o' + n + '][skuid]" class="form-control text inp-skuid">\
            <input type="text" name="keeping[o' + n + '][price]" class="form-control number inp-price"  data-val="{&quot;required&quot;:true}" data-val-msg="{&quot;required&quot;:&quot;价格不能为空&quot;}" data-val-for="#keeping_info"> 元</td>').appendTo(tr);
            $('<td class="th-mkprice"><input type="text" name="keeping[o' + n + '][mkprice]" data-val="{&quot;required&quot;:true}" data-val-msg="{&quot;required&quot;:&quot;市场价不能为空&quot;}"  class="form-control number inp-mkprice"  data-val-for="#keeping_info"> 元</td>').appendTo(tr);
            $('<td class="th-stock"><input type="text" name="keeping[o' + n + '][stock]"  data-val="{&quot;required&quot;:true}" class="form-control integer inp-stock" data-val-msg="{&quot;required&quot;:&quot;库存数量不能为空&quot;}"  data-val-for="#keeping_info"></td>').appendTo(tr);
            $('<td class="th-alarm"><input type="text" name="keeping[o' + n + '][alarm]"  class="form-control integer inp-alarm"></td>').appendTo(tr);
            $('<td class="th-sncode"><input type="text" name="keeping[o' + n + '][num]" class="form-control text inp-sncode"></td>').appendTo(tr);
            $('<td class="th-barcode"><input type="text" name="keeping[o' + n + '][code]" class="form-control text inp-barcode"></td>').appendTo(tr);
            var defval = getSKUTemps(item);
            if (defval == null) {
                defval = {};
                defval.spec = item;
                defval.skuid = 0;
                defval.price = $('#price').val() || '';
                defval.mkprice = $('#market_price').val() || '';
                defval.stock = '';
                defval.alarm = '';
                defval.sncode = '';
                defval.barcode = '';
                SKUTemps.push(defval);
            }
            if (typeof (defval.skuid) != 'undefined') {
                tr.find(':input.inp-skuid').val(defval.skuid);
            }
            if (typeof (defval.price) != 'undefined') {
                tr.find(':input.inp-price').val(defval.price || $('#price').val() || '');
            }
            if (typeof (defval.mkprice) != 'undefined') {
                tr.find(':input.inp-mkprice').val(defval.mkprice || $('#market_price').val() || '');
            }
            if (typeof (defval.stock) != 'undefined') {
                tr.find(':input.inp-stock').val(defval.stock || $('#stock').val() || '');
            }
            if (typeof (defval.alarm) != 'undefined') {
                tr.find(':input.inp-alarm').val(defval.alarm || $('#alarm').val() || '');
            }
            if (typeof (defval.sncode) != 'undefined') {
                tr.find(':input.inp-sncode').val(defval.sncode);
            }
            if (typeof (defval.barcode) != 'undefined') {
                tr.find(':input.inp-barcode').val(defval.barcode);
            }

            tr.find(':input.inp-price').on('blur change', {vals: defval}, function (ev) {
                if ($(this).val() != '') {
                    ev.data.vals.price = $(this).val();
                }
            });
            tr.find(':input.inp-mkprice').on('blur change', {vals: defval}, function (ev) {
                if ($(this).val() != '') {
                    ev.data.vals.mkprice = $(this).val();
                }
            });
            tr.find(':input.inp-stock').on('blur change', {vals: defval}, function (ev) {
                if ($(this).val() != '') {
                    ev.data.vals.stock = $(this).val();
                }
            });
            tr.find(':input.inp-alarm').on('blur change', {vals: defval}, function (ev) {
                if ($(this).val() != '') {
                    ev.data.vals.alarm = $(this).val();
                }
            });
            tr.find(':input.inp-sncode').on('blur change', {vals: defval}, function (ev) {
                if ($(this).val() != '') {
                    ev.data.vals.sncode = $(this).val();
                }
            });
            tr.find(':input.inp-barcode').on('blur change', {vals: defval}, function (ev) {
                if ($(this).val() != '') {
                    ev.data.vals.barcode = $(this).val();
                }
            });

            n++;
        });
        table.find(':input.form-control').trigger('sdopx_update');


    }
    var InitTimeer = null;
    function updateSpecTable() {
        //检查是否全部栏目有勾选
        var items = $('#row_spec div.modelplug-item');
        if (items.length >= 3) {
            $('#row_spec>div.form-group:first').hide();
        } else {
            $('#row_spec>div.form-group:first').show();
        }
        var types = [];
        items.each(function () {
            var item = $(this);
            var boxs = item.find('.checkgroup :input[type="checkbox"]:checked');
            if (boxs.length <= 0) {
                types = [];
                return false;
            }
            var vals = [];
            var name = item.find(':input.name').val();
            boxs.each(function () {
                vals.push($(this).val());
            });
            types.push({name: name, vals: vals});
        });
        var zuhefun = function (base, items) {
            var temps = [];
            if (base.length === 0) {
                for (var i = 0; i < items.length; i++) {
                    temps.push([items[i]]);
                }
            } else {
                for (var n = 0; n < base.length; n++) {
                    for (var i = 0; i < items.length; i++) {
                        var item = base[n].slice(0);
                        item.push(items[i]);
                        temps.push(item);
                    }
                }
            }
            return temps;
        };
        var table = null;
        if (types.length > 0) {
            table = {heads: [], rows: []};
            for (var i = 0; i < types.length; i++) {
                table.heads.push(types[i].name);
                table.rows = zuhefun(table.rows, types[i].vals);
            }
        }
        if (table) {
            if (InitTimeer != null) {
                window.clearTimeout(InitTimeer);
                InitTimeer = null;
            }
            InitTimeer = window.setTimeout(function () {
                $('#row_keeping').show();
                createTable(table);
            }, 10);
        } else {
            if (InitTimeer != null) {
                window.clearTimeout(InitTimeer);
                InitTimeer = null;
            }
            $('#row_keeping').hide();
        }

    }

    function addItem(val, itemview, idx) {
        var ul = itemview.find('ul.samao-box.form-control.checkgroup.optvals');
        var li = $('<li style="width:140px" class="form-control checkgroup"></li>').appendTo(ul);
        var label = $('<label></label>').appendTo(li);
        $('<input type="checkbox" name="spec[' + idx + '][optvals][]">').val(val).appendTo(label);
        $('<span></span>').text(val).appendTo(label);
    }

    function updateOptions(itemview) {
        var options = itemview.find(':input.options');
        var optitem = itemview.find('.checkgroup :input[type="checkbox"]');
        var temps = [];
        optitem.each(function () {
            temps.push($(this).val());
        });
        options.val($.toJSON(temps));
    }

    $('#spec').on('inititem', function (ev, itemview, idx, boxname, row) {
        if (!row) {
            return;
        }
        $(row.options).each(function () {
            addItem(this, itemview, idx);
        });
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
                                    var label = cbox.parent('label');
                                    var tempinp = label.find(':input.tempval').length >= 1 ? label.find(':input.tempval') : $('<input  style="width:100px;" placeholder="规格选项值"  class="form-control text tempval" value="" type="text">').appendTo(label);
                                    var span = label.find('span');
                                    span.hide();
                                    tempinp.val(cval).show();
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
        setVal(row);
        return false;
    });

    $('#spec').on('additem', function (ev, lay, idx) {
        updateSpecTable();
        lay.find(':input.name').on('displayError', function (e, msg) {
            var idx = layer.tips(msg, $(this), {
                tips: [2, '#F90'],
                time: 0,
                tipsMore: true
            });
            $(this).one('mousedown', {idx: idx}, function (ev) {
                layer.close(ev.data.idx);
            });
            return false;
        });
        var spid = lay.find(':input.spid');
        if (spid.length > 0 && spid.val() != '' && spid.val() != '0') {
            lay.find('.delete').hide();
        }
        var addlay = lay.find('.add-spval');
        var addinp = lay.find(':input.addinp');
        var addvalbtn = lay.find('a.spval_add');
        var spval_submit = lay.find('a.spval_submit');
        var spval_cancel = lay.find('a.spval_cancel');
        addvalbtn.on('click', function () {
            addlay.show();
            addinp.val('');
            addvalbtn.hide();
            addinp.focus();
        });
        spval_cancel.on('click', function () {
            addlay.hide();
            addvalbtn.show();
        });
        addinp.on('keypress', function (ev) {
            if (ev.which == 13) {
                var dat = spval_submit.triggerHandler('click');
                if (dat == false) {
                    return false;
                }
                setTimeout(function () {
                    addvalbtn.trigger('click');
                }, 1);
                return false;
            }
        });

        spval_submit.on('click', function () {
            var val = addinp.val();
            val = $.trim(val);
            if (val == '') {
                layer.alert('选项值不可为空！');
                return false;
            }
            var has = false;
            var boxs = $(this).parents('div.spval_opts:first').find('ul.optvals :input[type="checkbox"]');
            boxs.each(function () {
                var that = $(this);
                if (that.val() == val) {
                    has = true;
                    return false;
                }
            });

            if (has) {
                layer.alert('选项值已经存在！');
                return false;
            }
            addItem(val, lay, idx);
            addlay.hide();
            addvalbtn.show();
            updateOptions(lay);
        });

        lay.on('click', '.checkgroup :input[type="checkbox"]', function () {
            var that = $(this);
            var label = that.parent('label');
            var tempinp = label.find(':input.tempval').length >= 1 ? label.find(':input.tempval') : $('<input  style="width:100px;" placeholder="规格选项值"  class="form-control text tempval" value="" type="text">').appendTo(label);
            var span = label.find('span');
            if (that.is(':checked')) {
                var val = that.val();
                span.hide();
                tempinp.val(val).show();
            } else {
                var val = tempinp.val();
                val = $.trim(val);
                if (val == '') {
                    label.parent('li').remove();
                }
                span.text(val).show();
                tempinp.val('').hide();
                that.val(val);
            }
            updateOptions(lay);
            updateSpecTable();
        });

        lay.on('blur', '.checkgroup :input.tempval', function () {
            var that = $(this);
            var val = that.val();
            val = $.trim(val);
            var label = that.parent('label');
            var checkbox = label.find(':input[type="checkbox"]');
            var boxs = $(this).parents('div.spval_opts:first').find('ul.optvals :input[type="checkbox"]').not(checkbox[0]);
            var has = false;
            boxs.each(function () {
                var that = $(this);
                if (that.val() == val) {
                    has = true;
                    return false;
                }
            });
            if (has) {
                that.val(checkbox.val());
                layer.alert('选项值已经存在！');
                that.focus();
                return;
            }
            checkbox.val(val);
            updateOptions(lay);
            updateSpecTable();
        });

        lay.on('blur', '.form-label :input[type="text"]', function () {
            updateSpecTable();
        });

    });

    $('#spec').on('delitem', function (ev) {
        updateSpecTable();
    });

});