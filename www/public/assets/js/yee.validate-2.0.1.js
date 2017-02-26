//表单验证器
(function ($, Yee) {

    var NotPlaceholderSupport = !('placeholder' in document.createElement('input'));
    if (NotPlaceholderSupport) {
        $.fn.yee_oldPlaceholderSupportVal = $.fn.val;
        $.fn.val = function (value) {
            var that = this;
            if (value === undefined) {
                if (that[0] && (that.is(':text[placeholder],textarea[placeholder]'))) {
                    var holder = that.attr('placeholder');
                    if (holder && that.yee_oldPlaceholderSupportVal() == holder) {
                        return '';
                    }
                }
                return that.yee_oldPlaceholderSupportVal();
            }//读
            return that.yee_oldPlaceholderSupportVal(value);
        };
    }
    Yee.extend(':text[placeholder],textarea[placeholder]', 'placeholder', function (element) {
        if (!NotPlaceholderSupport) {
            return false;
        }
        var that = $(element);
        var holder = that.attr('placeholder');
        that.removeAttr('placeholder');
        if (holder && that.val() === '') {
            that.addClass('placeholder');
            that.val(holder);
            that.on('focus', {holder: holder}, function (ev) {
                var that = $(this);
                that.removeClass('placeholder');
                if (that.val() === ev.data.holder) {
                    that.val('');
                }
            });
            that.on('blur', {holder: holder}, function (ev) {
                var that = $(this);
                if (that.val() === '') {
                    that.addClass('placeholder');
                    that.val(ev.data.holder);
                }
            });
        }
    }, false);
    //字符串格式化输出
    var StringFormat = function (str, args) {
        var args = args;
        if (str == '' || str == null || args == void 0) {
            return str;
        }
        if (!$.isArray(args)) {
            args = [args];
        }
        return str.replace(/\{(\d+)\}/ig, function ($0, $1) {
            var index = parseInt($1);
            return args.length > index ? args[index] : '';
        });
    };
    //获得随机数
    var randomString = function (len) {
        var len = len || 32;
        var chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
        var maxPos = chars.length;
        var run = '';
        for (var i = 0; i < len; i++) {
            run += chars.charAt(Math.floor(Math.random() * maxPos));
        }
        return run;
    };
    //获得URL参数
    var getQueryString = function (name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
        var r = window.location.search.substr(1).match(reg);
        if (r) {
            return unescape(r[2]);
        }
        return '';
    };

    function YeeValidate() {

        var Config = {
            rules: 'val'				    //验证器规则
            , val_msg: 'val-msg'		 		    //验证消息
            , val_events: 'val-events'                      //触发事件进行验证
            , val_off: 'val-off'			    //关闭验证
            , val_info: 'val-info'                    //默认描述
            , val_valid: 'val-valid'                     //正确描述
            , val_error: 'val-error'                    //服务器返回错误
            , val_for: 'val-for'			//显示消息控件属性值 = id
            //-CSS--------------------------
            , field_error: 'field-error'
            , field_valid: 'field-valid'
            , field_default: 'field-default'
            , input_error: 'input-error'
            , input_valid: 'input-valid'
            , input_default: 'input-default'
        };

        var Messages = {
            required: '必选字段'
            , email: '请输入正确格式的电子邮件'
            , url: '请输入正确格式的网址'
            , date: '请输入正确格式的日期'
            , number: '仅可输入数字'
            , integer: '只能输入整数'
            , equalto: '请再次输入相同的值'
            , maxlenght: '请输入一个 长度最多是 {0} 的字符串'
            , minlength: '请输入一个 长度最少是 {0} 的字符串'
            , rangelenght: '请输入 一个长度介于 {0} 和 {1} 之间的字符串'
            , range: '请输入一个介于 {0} 和 {1} 之间的值'
            , max: '请输入一个小于 {0} 的值'
            , min: '请输入一个大于 {0} 的值'
            , remote: '检测数据不符合要求'
            , regex: '请输入正确格式字符'
            , mobile: '手机号码格式不正确'
            , idcard: '身份证号码格式不正确'
        };

        var setMessages = function (msgs) {
            Messages = $.extend(Messages, msgs);
        };

        var setConfig = function (cfg) {
            Config = $.extend(Config, cfg);
        };

        //显示队列
        var TempValFors = {};
        var remoteElems = [];
        var FormSubmitState = false;

        //函数管理器
        var FuncManager = new (function () {
            var Funcs = {};
            var ShotName = {};
            this.getFunc = function (name) {
                return Funcs[name] || null;
            };
            this.getOirName = function (shotname) {
                if (ShotName[shotname])
                    return ShotName[shotname];
                return shotname;
            };
            var regFunc = this.regFunc = function (name, fn, defmsg) {
                if (typeof (fn) === 'function') {
                    Funcs[name] = fn;
                    if (typeof (defmsg) !== 'undefined') {
                        Messages[name] = defmsg;
                    }
                } else if (typeof (fn) === 'string') {
                    ShotName[name] = fn;
                }
            };
            regFunc('required', function (val, bwo) {
                if (val === null) {
                    return false;
                }
                if (bwo === 1) {
                    val = val.replace(/\s+/, '');
                }
                if (bwo === 2) {
                    val = val.replace(/<[^>]+>/, '');
                    val = val.replace(/\s+/, '');
                }
                return !(val === null || val === '' || val.length === 0);
            });
            regFunc('email', function (val) {
                return /^([a-zA-Z0-9]+[-|_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[-|_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,8}([\.][a-zA-Z]{2,8})?$/.test(val);
            });
            regFunc('number', function (val) {
                return /^[\-\+]?((\d+(\.\d*)?)|(\.\d+))$/.test(val);
            });
            regFunc('integer', function (val) {
                return /^[\-\+]?\d+$/.test(val);
            });
            regFunc('max', function (val, num, noeq) {
                if (noeq === true)
                    return val < Number(num);
                else
                    return val <= Number(num);
            });
            regFunc('min', function (val, num, noeq) {
                if (noeq === true)
                    return val > Number(num);
                else
                    return val >= Number(num);
            });
            regFunc('range', function (val, num1, num2, noeq) {
                if (noeq === false) {
                    return val > Number(num1) && val < Number(num2);
                } else {
                    return val >= Number(num1) && val <= Number(num2);
                }
            });
            regFunc("minlength", function (val, len) {
                return val.length >= len;
            });
            regFunc("maxlength", function (val, len) {
                return val.length <= len;
            });
            regFunc("rangelength", function (val, len1, len2) {
                return val.length >= len1 && val.length <= len2;
            });
            regFunc('money', function (val) {
                return /^[-]{0,1}\d+[\.]\d{1,2}$/.test(val) || /^[-]{0,1}\d+$/.test(val);
            }, '仅可输入带有2位小数以内的数字及整数');
            regFunc("date", function (val) {
                return /^\d{4}-\d{1,2}-\d{1,2}(\s\d{1,2}(:\d{1,2}(:\d{1,2})?)?)?$/.test(val);
            });
            regFunc("url", function (val, jh) {
                if (jh && val == '#') {
                    return true;
                }
                return /^(http|https|ftp):\/\/\w+\.\w+/i.test(val);
            });
            regFunc("equal", function (val, str) {
                return val === str;
            });
            regFunc("notequal", function (val, str) {
                return val !== str;
            });
            regFunc("equalto", function (val, str) {
                return val === $(str).val();
            });
            regFunc("mobile", function (val) {
                return /^1[34578]\d{9}$/.test(val);
            });
            regFunc("idcard", function (val) {
                return /^[1-9]\d{5}(19|20)\d{2}(((0[13578]|1[02])([0-2]\d|30|31))|((0[469]|11)([0-2]\d|30))|(02[0-2][0-9]))\d{3}(\d|X|x)$/.test(val);
            });
            regFunc("user", function (val, num1, num2) {
                var r = /^[a-zA-Z]\w+$/.test(val);
                if (num1 !== undefined && isNaN(parseInt(num1)))
                    r = r && val.length >= parseInt(num1);
                if (num2 !== undefined && isNaN(parseInt(num2)))
                    r = r && val.length <= parseInt(num2);
                return r;
            }, '请使用英文之母开头的字母下划线数字组合');
            regFunc("regex", function (val, str) {
                var re = new RegExp(str).exec(val);
                return (re && (re.index === 0) && (re[0].length === val.length));
            });
            regFunc('num', 'number');
            regFunc('r', 'required');
            regFunc('int', 'integer');
            regFunc('digits', 'integer');
            regFunc('minlen', 'minlength');
            regFunc('maxlen', 'maxlength');
            regFunc('rangelen', 'rangelength');
            regFunc('eqto', 'equalto');
            regFunc('eq', 'equal');
            regFunc('neq', 'notequal');
        })();
        //获得控件标签
        var getInfoLabel = function (elem) {
            var label = null;
            var id = elem.attr('id') || '';
            var forid = elem.data(Config.val_for) || '';
            if (forid == '') {
                forid = id == '' ? '' : '#' + id + '_info';
                elem.data(Config.val_for, forid);
            }
            if (forid) {
                label = $(forid.replace(/(:|\.)/g, '\\$1'));
                if (label.length == 0) {
                    id = forid.substr(1);
                    label = $('<span id="' + id + '"></span>').appendTo(elem.parent());
                }
            } else {
                id = randomString(20);
                label = $('<span id="temp_info_' + id + '"></span>').appendTo(elem.parent());
                elem.data(Config.val_for, '#temp_info_' + id);
            }
            return label;
        };
        //呈现形式 默认
        var displayDefault = function (elem, msg) {
            if (elem.triggerHandler('displayDefault', [msg]) === false || elem.parents('form').triggerHandler('displayDefault', [elem, msg]) === false) {
                return;
            }
            elem.removeClass(Config.input_error + ' ' + Config.input_valid).addClass(Config.input_default);
            var label = getInfoLabel(elem);
            label.removeClass(Config.field_error + ' ' + Config.field_valid).addClass(Config.field_default);
            label.html(msg);
            if (!msg) {
                label.hide();
            }
        };
        //正确形式
        var displayValid = function (elem, msg) {
            if (elem.triggerHandler('displayValid', [msg]) === false || elem.parents('form').triggerHandler('displayValid', [elem, msg]) === false) {
                return;
            }
            elem.removeClass(Config.input_error + ' ' + Config.input_default).addClass(Config.input_valid);
            if (msg) {
                var label = getInfoLabel(elem);
                label.show();
                label.removeClass(Config.field_error + ' ' + Config.field_default).addClass(Config.field_valid);
                label.html(msg);
            } else {
                displayDefault(elem, msg);
            }
        };
        //错误形式
        var displayError = function (elem, msg) {
            if (elem.triggerHandler('displayError', [msg]) === false || elem.parents('form').triggerHandler('displayError', [elem, msg]) === false) {
                return;
            }
            elem.removeClass(Config.input_valid + ' ' + Config.input_default).addClass(Config.input_error);
            if (msg) {
                var label = getInfoLabel(elem);
                label.removeClass(Config.field_valid + ' ' + Config.field_default).addClass(Config.field_error);
                label.show();
                label.html(msg);
            }
        };
        //验证远程
        var ajaxRemote = function (elem, data, fn) {
            var elemcache = elem.data('yee-ajax-cache');
            if (typeof (elemcache) === 'object') {
                if (elem.val() === elemcache.val) {
                    data.pass = elemcache.pass;
                    data.erropt = 'remote';
                    data.remote_msg = elemcache.remote_msg;
                    data.remote_valid = elemcache.remote_valid;
                    fn(data);
                    return;
                }
            }
            var val = data.rules.remote;
            var name = elem.attr('name');
            if (name === undefined || name === '') {
                return;
            }
            var url = '';
            var type = 'post';
            var otvals = '';//而外要附加的字段ID
            if ($.isArray(val)) {
                url = val[0] || '';
                type = val[1] || 'post';
                otvals = val[2] || '';
            } else {
                url = val;
            }
            var opt = {};
            var value = elem.val();
            opt[name] = value;
            var form = $(elem).parents('form:first');
            if (otvals !== '') {
                var arrtemp = otvals.split(',');
                for (var i in arrtemp) {
                    var xname = arrtemp[i];
                    var sle = ':input[name=' + xname + ']';
                    var _elem = form.find(sle);
                    if (_elem.length > 0) {
                        opt[xname] = _elem.val();
                    } else {
                        var val = getQueryString(xname);
                        if (val !== '') {
                            opt[xname] = val;
                        }
                    }
                }
            }
            $.ajax({
                url: url, data: opt, type: type.toUpperCase(), dataType: 'json', success: function (ret) {
                    if (typeof (ret) == 'boolean') {
                        if (ret === true) {
                            data.pass = true;
                        } else {
                            data.pass = false;
                            data.erropt = 'remote';
                        }
                        elem.data('yee-ajax-cache', {val: value, pass: data.pass});
                        fn(data);
                    } else {
                        if (ret.status === true) {
                            data.pass = true;
                            data.remote_valid = ret.message || null;
                        } else {
                            data.remote_msg = ret.message;
                            data.pass = false;
                            data.erropt = 'remote';
                        }
                        elem.data('yee-ajax-cache', {
                            val: value,
                            pass: data.pass,
                            remote_msg: (ret.status == false ? ret.message : null),
                            remote_valid: (ret.status == true ? ret.message : null)
                        });
                        fn(data);
                    }
                }
            });
        };
        //获取元素数据
        var getElemData = function (elem) {
            var rules = elem.data(Config.rules) || null;
            if (rules === null) {
                return null;
            }
            var val_msg = elem.data(Config.val_msg) || {};
            var msg_default = elem.data(Config.val_info) || '';
            var msg_valid = elem.data(Config.val_valid) || '';
            var msg_error = elem.data(Config.val_error) || '';
            var val_events = elem.data(Config.val_events) || '';
            var val_off = elem.data(Config.val_off) || '';
            val_off = (val_off === 'true' || val_off === true || val_off == '1' || val_off === 'on');
            var temp_rules = {};
            var temp_msgs = {};
            for (var key in rules) {
                var bkey = FuncManager.getOirName(key);
                if (bkey === 'required') {
                    temp_rules[bkey] = rules[key];
                    break;
                }
            }
            for (var key in rules) {
                var bkey = FuncManager.getOirName(key);
                if (bkey !== 'remote' && bkey !== 'required') {
                    temp_rules[bkey] = rules[key];
                }
            }
            for (var key in rules) {
                var bkey = FuncManager.getOirName(key);
                if (bkey === 'remote') {
                    temp_rules[bkey] = rules[key];
                    break;
                }
            }
            for (var key in val_msg) {
                var bkey = FuncManager.getOirName(key);
                temp_msgs[bkey] = val_msg[key];
            }
            for (var key in temp_rules) {
                if (!temp_msgs[key] && Messages[key]) {
                    temp_msgs[key] = Messages[key];
                }
            }
            var dat = {
                rules: temp_rules,
                msgs: temp_msgs,
                msg_default: msg_default,
                msg_valid: msg_valid,
                msg_error: msg_error,
                erropt: null,
                pass: true,
                remote: !!rules.remote,
                off: val_off,
                events: val_events
            };
            return dat;
        };

        var setError = function (elem, msg, force) {
            force = typeof (force) === 'undefined' ? true : force;
            if (force) {
                displayError(elem, msg);
                return;
            }
            var forid = elem.data(Config.val_for) || '';
            if (forid !== '') {
                if (typeof (TempValFors[forid]) == 'undefined') {
                    TempValFors[forid] = msg;
                } else {
                    msg = TempValFors[forid];
                }
            }
            displayError(elem, msg);
        };

        var setValid = function (elem, msg, force) {
            force = typeof (force) === 'undefined' ? true : force;
            if (force) {
                displayValid(elem, msg);
                return;
            }
            var forid = elem.data(Config.val_for) || '';
            if (forid !== '') {
                if (typeof (TempValFors[forid]) != 'undefined') {
                    return;
                }
            }
            displayValid(elem, msg);
        };

        var setDefault = function (elem, msg) {
            displayDefault(elem, msg);
        };

        var elem_mousedown = function () {
            var elem = $(this);
            var data = getElemData(elem);
            if (!data) {
                return;
            }
            setDefault(elem, data.msg_default);
        };

        var elem_chcek = function () {
            var elem = $(this);
            var data = getElemData(elem);
            if (!data || data.off) {
                return;
            }
            data = checkElem(elem, data);
            if (!data.pass) {
                var msg = data.msgs[data.erropt] || '';
                msg = StringFormat(msg, data.rules[data.erropt]);
                if (!(elem.data('yee-remote-display') === true && !FormSubmitState)) {
                    setError(elem, msg, true);
                }
                return;
            }
            if (data.remote) {
                ajaxRemote(elem, data, function (tdata) {
                    if (!tdata.pass) {
                        var msg = tdata.msgs[tdata.erropt] || '';
                        if (tdata.remote_msg) {
                            msg = tdata.remote_msg;
                        }
                        msg = StringFormat(msg, tdata.rules[tdata.erropt]);
                        setError(elem, msg, true);
                    } else {
                        setValid(elem, tdata.remote_valid || tdata.msg_valid, true);
                    }
                });
                return;
            }
            setValid(elem, data.msg_valid);
        };

        var checkElem = function (elem, data) {
            elem.off('mousedown', elem_mousedown);
            elem.on('mousedown', elem_mousedown);
            var val = elem.val();
            var rules = data.rules;
            var type = (elem.attr('type') || elem[0].type || 'text').toLowerCase();
            if (type === 'checkbox' || type === 'radio') {
                val = elem.is(':checked') ? val : '';
            }
            for (var key in rules) {
                if (key === 'remote') {
                    if (FormSubmitState) {
                        remoteElems.push(elem);
                        var rmdata = elem.data('yee-ajax-cache');
                        if (rmdata && !rmdata.pass) {
                            data.erropt = key;
                            data.pass = false;
                            if (rmdata.remote_msg) {
                                data.msgs.remote = rmdata.remote_msg;
                            }
                        }
                    }
                    continue;
                }
                var func = FuncManager.getFunc(key);
                if (!func || typeof (func) !== 'function') {
                    continue;
                }
                //验证非空====
                if ((key === 'required') && rules[key] !== false && !func(val, rules[key])) {
                    data.erropt = key;
                    data.pass = false;
                }
                if (!rules.force) {
                    if (val === '') {
                        return data;
                    }
                }
                var args = rules[key];
                if (!$.isArray(args)) {
                    args = [args];
                }
                args = args.slice(0);
                args.unshift(val);
                if (!func.apply(elem, args)) {
                    data.erropt = key;
                    data.pass = false;
                    return data;
                }
            }
            return data;
        };

        var initElem = function (elem) {
            if (elem.data('yee-validate-init')) {
                return;
            }
            elem.data('yee-validate-init', true);
            var data = getElemData(elem);
            if (data && data.msg_default) {
                setDefault(elem, data.msg_default);
            }
            //显示来自服务器的错误数据
            if (elem.data(Config.val_error)) {
                setTimeout(function () {
                    var msg = elem.data(Config.val_error);
                    elem.removeData(Config.val_error);
                    elem.on('mousedown', elem_mousedown);
                    setError(elem, msg, true);
                }, 100);
            }
            if (!data || data.off) {
                return;
            }
            if (data.events) {
                elem.on(data.events, elem_chcek);
            }
            if (data.remote && !/blur/.test(data.events)) {
                elem.data('yee-remote-display', true);
                elem.on('blur', elem_chcek);
            }
        };

        var getFormElems = function (form) {
            var inputs = [];
            for (var i = 0; i < form.elements.length; i++) {
                inputs.push(form.elements.item(i));
            }
            inputs = $(inputs).filter(':input[type!=submit][type!=reset][type!=button][disabled!=disabled]');
            return inputs;
        };

        var initValidator = function (form) {
            FormSubmitState = false;
            var qform = $(form);
            qform.data('yee-validate-init', true);
            var init = function () {
                qform.on('update', function () {
                    var inputs = getFormElems(qform[0]);
                    inputs.yee_placeholder();
                    inputs.each(function (index, element) {
                        var elem = $(element);
                        initElem(elem);
                    });
                }).triggerHandler('update');
            };
            var initjson = function (data) {
                for (var sel in data) {
                    var box = $(sel);
                    if (box.length > 0) {
                        for (var key in  data[sel]) {
                            box.data(key, data[sel][key]);
                        }
                    }
                }
                init();
            };
            if (qform.data('json')) {
                var url = qform.data('json');
                if (typeof (url) == 'string') {
                    var url = url + '.json';
                    $.getJSON(url, initjson);
                } else {
                    initjson(url);
                }
            } else {
                init();
            }
        };

        var checkFormNoRemote = function (form) {
            TempValFors = {};
            FormSubmitState = true;
            remoteElems = [];
            var allpass = true;
            var errItems = [];
            var inputs = getFormElems(form);
            inputs.each(function (index, element) {
                var elem = $(element);
                var data = getElemData(elem);
                if (!data || data.off) {
                    return;
                }
                data = checkElem(elem, data);
                //接管处理请求
                var Result = elem.triggerHandler('timely', [data]);
                if (!data.pass) {
                    var msg = data.msgs[data.erropt] || '';
                    msg = StringFormat(msg, data.rules[data.erropt]);
                    errItems.push({elem: elem, msg: msg, data: data});
                } else {
                    setValid(elem, data.msg_valid, false);
                }
                allpass = allpass && data.pass;
                if (Result === false) {
                    if (!allpass) {
                        return false;
                    }
                }
            });

            if (allpass === false) {

                if ($(form).triggerHandler('displayAllError', [errItems]) !== false) {
                    $(errItems).each(function () {
                        setError(this.elem, this.msg, false);
                        /*
                         if (this.data.events == '') {
                         this.data.events = 'blur';
                         this.elem.off('blur', elem_chcek);
                         this.elem.on('blur', elem_chcek);
                         }
                         */
                    });
                }

                setTimeout(function () {
                    try {
                        if (errItems[0].elem.is(':hidden')) {
                            errItems[0].elem.triggerHandler('focus');
                        } else {
                            errItems[0].elem.trigger('focus');
                        }
                    } catch (e) {
                        errItems[0].elem.triggerHandler('focus');
                    }
                }, 10);

            }
            //如果全部通过
            if (allpass && NotPlaceholderSupport) {
                var holderinputs = inputs.filter(':text[placeholder],textarea[placeholder]');
                holderinputs.each(function (index, element) {
                    var that = $(element);
                    if (that.val() == '') {
                        that.val('');
                    }
                });
            }
            return allpass;
        };
        //检查表单数据==
        var checkForm = function (form) {
            var qform = $(form);
            form = qform[0];
            var beforeValid = qform.triggerHandler('beforeValid');
            if (beforeValid === false) {
                return false;
            }
            var allpass = checkFormNoRemote(form);
            var i = 0;
            var nextajax = function () {
                if (i >= remoteElems.length) {
                    return;
                }
                var xcelem = remoteElems[i];
                var xcdata = getElemData(xcelem);
                i++;
                ajaxRemote(xcelem, xcdata, function (tdata) {
                    if (!tdata.pass) {
                        var msg = tdata.msgs[tdata.erropt] || '';
                        if (tdata.remote_msg) {
                            msg = tdata.remote_msg;
                        }
                        msg = StringFormat(msg, tdata.rules[tdata.erropt]);
                        setError(xcelem, msg, true);
                    } else {
                        setValid(xcelem, tdata.remote_valid || xcdata.msg_valid, true);
                    }
                    nextajax();
                });
            };
            if (!allpass) {
                nextajax();
            }
            FormSubmitState = false;
            if (!allpass) {
                return false;
            }
            var afterValid = qform.triggerHandler('afterValid');
            if (afterValid === false) {
                return false;
            }
            return allpass;
        };

        return {
            checkForm: checkForm,
            initValidator: initValidator,
            regFunc: FuncManager.regFunc,
            getFunc: FuncManager.getFunc,
            setError: function (selector, msg, force) {
                $(selector).each(function () {
                    var elem = $(this);
                    if (!elem.is(':input')) {
                        return;
                    }
                    setError(elem, msg, force);
                });
            },
            setValid: function (selector, msg, force) {
                $(selector).each(function () {
                    var elem = $(this);
                    if (!elem.is(':input')) {
                        return;
                    }
                    setError(elem, msg, force);
                });
            },
            setDefault: function (selector, msg) {
                $(selector).each(function () {
                    var elem = $(this);
                    if (!elem.is(':input')) {
                        return;
                    }
                    setDefault(elem, msg);
                });
            },
            getElemData: getElemData,
            initElem: function (selector) {
                $(selector).each(function () {
                    var elem = $(this);
                    if (!elem.is(':input')) {
                        return;
                    }
                    initElem(elem);
                });
            },
            setMessages: setMessages,
            setConfig: setConfig
        };
    }

    var YeeValidator = $.YeeValidator = window.YeeValidator = YeeValidate();
    $.fn.extend({
        checkForm: function () {
            return YeeValidator.checkForm(this[0]);
        },
        initElem: function () {
            YeeValidator.initElem(this);
            return this;
        },
        setError: function (msg, force) {
            YeeValidator.setError(this, msg, force);
            return this;
        },
        setValid: function (msg, force) {
            YeeValidator.setValid(this, msg, force);
            return this;
        },
        setDefault: function (msg) {
            YeeValidator.setDefault(this, msg);
            return this;
        },
        showError: function (formError) {
            var that = $(this[0]);
            var first = null;
            for (var name in formError) {
                var elem = that.find(":input[name='" + name + "']");
                if (elem.length == 0) {
                    elem = that.find(":input[id='" + name + "']");
                }
                if (elem.length) {
                    if (!first) {
                        first = elem;
                    }
                    var msg = formError[name];
                    YeeValidator.setError(elem, msg, true);
                }
            }
            if (first) {
                setTimeout(function () {
                    try {
                        if (first.is(':hidden')) {
                            first.triggerHandler('focus');
                        } else {
                            first.trigger('focus');
                        }
                    } catch (e) {
                        first.triggerHandler('focus');
                    }
                }, 10);
            }
            return this;
        }
    });
    Yee.extend('form', 'validate', function (element) {
        if (element.nodeName.toLowerCase() !== 'form') {
            return;
        }
        YeeValidator.initValidator(element);
        $(element).on('submit', function (ev) {
            try {
                return YeeValidator.checkForm(this);
            } catch (e) {
                return false;
            }
        });
    });
})(jQuery, Yee);