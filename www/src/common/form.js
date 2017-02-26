"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const beacon_1 = require("../core/beacon");
class Validate {
    //字符串格式化输出
    static format(str, args) {
        var args = args;
        let valstr = String(str);
        if (valstr.length == 0 || !args) {
            return valstr;
        }
        if (args instanceof Array == false) {
            args = [args];
        }
        return valstr.replace(/\{(\d+)\}/ig, function ($0, $1) {
            var index = parseInt($1);
            return args.length > index ? args[index] : '';
        });
    }
    ;
    static regRemoute(name, func) {
        Validate.remote_func[name] = func;
    }
    static getFunc(type) {
        let rtype = Validate.getRealType(type);
        if (Validate['rule_' + rtype] && typeof Validate['rule_' + rtype] == 'function') {
            return Validate['rule_' + rtype];
        }
        return null;
    }
    static regFnuc(type, func, error = '格式错误') {
        if (typeof func == 'string') {
            func = Validate.getRealType(func);
            Validate.alias[type] = func;
            return;
        }
        Validate.default_msgs[type] = error;
        Validate['rule_' + type] = func;
    }
    static getRealType(type) {
        if (Validate.alias[type]) {
            return Validate.alias[type];
        }
        return type;
    }
    static rule_required(val) {
        if (val === null) {
            return false;
        }
        if (val instanceof Array && val.length == 0) {
            return false;
        }
        return String(val).length == 0 ? false : true;
    }
    static rule_email(val) {
        return /^([a-zA-Z0-9]+[-|_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[-|_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,4}([\.][a-zA-Z]{2})?$/.test(val);
    }
    static rule_url(val, dc) {
        if (dc && val == '#') {
            return true;
        }
        return /^(http|https|ftp):\/\/\w+\.\w+/i.test(val);
    }
    static rule_equal(val, str) {
        return val == str;
    }
    static rule_notequal(val, str) {
        return val != str;
    }
    static rule_equalto(val, boxid, ctl = null) {
        if (ctl == null) {
            return true;
        }
        if (boxid.length > 0 && /^#\w+/i.test(boxid)) {
            boxid = boxid.replace(/^#/, '');
            let bval = ctl.param('boxid', '');
            if (bval != '') {
                return bval == val;
            }
        }
        return true;
    }
    static rule_mobile(val) {
        return /^1[34578]\d{9}$/.test(val);
    }
    static rule_idcard(val) {
        return /^[1-9]\d{5}(19|20)\d{2}(((0[13578]|1[02])([0-2]\d|30|31))|((0[469]|11)([0-2]\d|30))|(02[0-2][0-9]))\d{3}(\d|X|x)$/.test(val);
    }
    static rule_user(val) {
        return /^[a-zA-Z]\w+$/.test(val);
    }
    static rule_regex(val, regex) {
        let re = null;
        if (regex instanceof RegExp) {
            let re = regex.exec(String(val));
        }
        else {
            new RegExp(regex).exec(String(val));
        }
        return (re && (re.index === 0) && (re[0].length === String(val).length));
    }
    static rule_number(val) {
        return /^[\-\+]?((\d+(\.\d*)?)|(\.\d+))$/.test(val);
    }
    static rule_integer(val) {
        return /^[\-\+]?\d+$/.test(val);
    }
    static rule_max(val, num, noeq) {
        if (noeq === true) {
            return Number(val) < Number(num);
        }
        return Number(val) <= Number(num);
    }
    static rule_min(val, num, noeq) {
        if (noeq === true) {
            return Number(val) > Number(num);
        }
        return Number(val) >= Number(num);
    }
    static rule_range(val, num1, num2, noeq) {
        if (noeq === true) {
            return Number(val) > Number(num1) && Number(val) < Number(num2);
        }
        return Number(val) >= Number(num1) && Number(val) <= Number(num2);
    }
    static rule_minlength(val, len) {
        return String(val).length >= len;
    }
    static rule_maxlength(val, len) {
        return String(val).length <= len;
    }
    static rule_rangelength(val, len1, len2) {
        return String(val).length >= len1 && String(val).length <= len2;
    }
    static checkField(field) {
        return __awaiter(this, void 0, void 0, function* () {
            if (field.error) {
                return false;
            }
            if (field.data_val_off) {
                return true;
            }
            let rules = field.data_val;
            if (rules == null) {
                return true;
            }
            let errors = field.data_val_msg || {};
            let tempErrors = {};
            for (let type in errors) {
                let err = errors[type];
                let rtype = Validate.getRealType(type);
                tempErrors[rtype] = err;
            }
            errors = tempErrors;
            let tempRules = {};
            for (let type in rules) {
                let val = rules[type];
                let rtype = Validate.getRealType(type);
                tempRules[rtype] = val;
            }
            rules = tempRules;
            let value = field.value;
            if (rules.required) {
                if (!Validate.rule_required(value)) {
                    field.error = errors.required || Validate.default_msgs.required;
                    return false;
                }
                delete rules['required'];
            }
            if (String(value).length > 0 || rules.force) {
                delete rules['force'];
                for (let type in rules) {
                    let args = rules[type];
                    if (args instanceof Array == false) {
                        args = [args];
                    }
                    let xargs = args.slice(0);
                    args.unshift(value);
                    if (type == 'remote') {
                        args.unshift(field.box_name);
                    }
                    if (type == 'equalto') {
                        let form = field.getForm();
                        if (form) {
                            args.push(form.ctl);
                        }
                    }
                    let func = Validate.getFunc(type);
                    if (func == null) {
                        continue;
                    }
                    let out = func.apply(null, args);
                    if (typeof out != 'boolean' && beacon_1.Beacon.isPromise(out)) {
                        out = yield out;
                    }
                    if (typeof out == 'boolean') {
                        if (out) {
                            continue;
                        }
                        field.error = Validate.format(errors[type] || Validate.default_msgs[type], xargs);
                        return false;
                    }
                    if (beacon_1.Beacon.isObject(out) && typeof out.status == 'boolean' && out.status == false && typeof out.error == 'string') {
                        field.error = Validate.format(out.error, xargs);
                        return false;
                    }
                }
            }
            return true;
        });
    }
}
Validate.default_msgs = {
    'required': '必选字段',
    'email': '请输入正确格式的电子邮件',
    'url': '请输入正确格式的网址',
    'date': '请输入正确格式的日期',
    'number': '仅可输入数字',
    'mobile': '手机号码格式不正确',
    'idcard': '身份证号码格式不正确',
    'integer': '只能输入整数',
    'equalto': '请再次输入相同的值',
    'equal': '请输入{0}字符',
    'notequal': '数值不能是{0}字符',
    'maxlenght': '请输入一个 长度最多是 {0} 的字符串',
    'minlength': '请输入一个 长度最少是 {0} 的字符串',
    'rangelenght': '请输入 一个长度介于 {0} 和 {1} 之间的字符串',
    'range': '请输入一个介于 {0} 和 {1} 之间的值',
    'max': '请输入一个最大为{0} 的值',
    'min': '请输入一个最小为{0} 的值',
    'remote': '检测数据不符合要求！',
    'regex': '请输入正确格式字符',
    'user': '请使用英文之母开头的字母下划线数字组合',
    'validcode': '验证码不正确！',
};
Validate.alias = {
    'r': 'required',
    'i': 'integer',
    'int': 'integer',
    'num': 'number',
    'minlen': 'minlength',
    'maxlen': 'maxlength',
    'eqto': 'equalto',
    'eq': 'equal',
    'neq': 'notequal'
};
Validate.remote_func = {};
exports.Validate = Validate;
class Field {
    constructor(form, field = {}) {
        this._form = null;
        this.label = '';
        this.name = '';
        this.error = '';
        this.tab_index = '';
        this.view_tab_shared = false;
        this.close = false;
        this.offedit = false;
        this.view_close = false;
        this.value = null;
        this.default = null;
        this.type = 'text';
        this.var_type = 's';
        this.box_name = '';
        this.box_id = '';
        this.data_val_off = null;
        this.data_val = null;
        this.data_val_msg = null;
        for (let key in field) {
            let val = field[key];
            if (typeof val != 'function') {
                this[key] = val;
            }
        }
        this.box_name = this.box_name || this.name;
        this.box_id = this.box_id || this.box_name;
        this._form = form;
    }
    getForm() {
        return this._form;
    }
    getBoxData() {
        let data = {};
        for (let key in this) {
            if (/^data_(.*)$/.test(key)) {
                let val = this[key];
                let nkey = key.replace(/^data_/, '');
                nkey = nkey.replace(/_/g, '-');
                if (typeof val != 'function' && val !== null) {
                    data[nkey] = val;
                }
            }
        }
        if (this.error) {
            data['val-fail'] = this.error;
        }
        return data;
    }
}
exports.Field = Field;
class Form {
    constructor(ctl, type = Form.NONE) {
        this.ctl = null;
        this.type = Form.NONE;
        this._init = false;
        this.use_tab = false;
        this.tabs = {};
        this.tab_index = '';
        this.tab_split = false;
        this.fields = {};
        this._using_fields = null;
        this._load = {};
        this.ctl = ctl;
        this.type = type;
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._init) {
                return;
            }
            this._init = true;
            let fields = yield this.load();
            for (let name in fields) {
                this.addField(name, fields[name]);
            }
        });
    }
    load(fields = null) {
        return __awaiter(this, void 0, void 0, function* () {
            if (fields) {
                this._load = Object.assign(this._load, fields);
            }
            else {
                return this._load;
            }
        });
    }
    addField(name, field, before = '') {
        if (field instanceof Field) {
            field.name = name;
        }
        else if (beacon_1.Beacon.isObject(field)) {
            field.name = name;
            field = new Field(this, field);
        }
        else {
            return this;
        }
        if (before && this.fields[before]) {
            let temps = {};
            for (let key in this.fields) {
                temps[key] = this.fields[key];
                if (key === before) {
                    temps[name] = field;
                }
            }
            this.fields = temps;
        }
        else {
            this.fields[name] = field;
        }
        return this;
    }
    getField(name) {
        return this.fields[name] || null;
    }
    removeField(name) {
        if (this.fields[name]) {
            delete this.fields[name];
        }
        return this;
    }
    getError(name) {
        if (this.fields[name]) {
            return this.fields[name].error;
        }
        return '';
    }
    addError(name, error) {
        if (this.fields[name]) {
            this.fields[name].error = error;
        }
        return this;
    }
    removeError(name) {
        if (this.fields[name]) {
            this.fields[name].error = '';
        }
        return this;
    }
    getFirstError() {
        let fields = this.getUsingFields();
        let name = Object.keys(fields)[0] || null;
        if (name) {
            return this.getError(name);
        }
        return '';
    }
    getAllErrors() {
        let errors = {};
        let fields = this.getUsingFields();
        for (let name in fields) {
            if (fields[name].error.length > 0) {
                errors[name] = fields[name].error;
            }
        }
        return errors;
    }
    cleanAllErrors() {
        let fields = this.getUsingFields();
        for (let name in fields) {
            if (fields[name].error.length > 0) {
                fields[name].error = '';
            }
        }
        return this;
    }
    emptyFieldsValue() {
        for (let key in this.fields) {
            let field = this.fields[key];
            field.value = null;
        }
    }
    /**
     * 获取表单使用的字段
     */
    getUsingFields() {
        if (this._using_fields) {
            return this._using_fields;
        }
        if (this.use_tab && this.tab_split) {
            this.tab_index = this.ctl.get('tab_index:s', '');
            let temp = this._using_fields = {};
            for (let key in this.fields) {
                let field = this.fields[key];
                if (field.view_tab_shared || this.tab_index == field.tab_index) {
                    temp[key] = field;
                }
            }
            return temp;
        }
        if (this.use_tab) {
            let temp = this._using_fields = {};
            for (let key in this.fields) {
                let field = this.fields[key];
                if (field.view_tab_shared || ('' != field.tab_index && this.tabs[field.tab_index])) {
                    temp[key] = field;
                }
            }
            return temp;
        }
        this._using_fields = this.fields;
        return this._using_fields;
    }
    autoComplete(params = null, valid = null) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.init();
            let fields = this.getUsingFields();
            if (valid == null && typeof params == 'boolean') {
                valid = params;
                params = null;
            }
            if (params == null) {
                if (this.ctl.isPost()) {
                    params = Object.assign({}, this.ctl.post());
                }
                else {
                    params = Object.assign({}, this.ctl.get());
                }
            }
            for (let key in fields) {
                let field = fields[key];
                if (this.type == Form.EDIT && field.offedit) {
                    continue;
                }
                if (field.close) {
                    continue;
                }
                if (field.view_close) {
                    field.value = field.default;
                    continue;
                }
                if (Form.formBox[field.type] && typeof Form.formBox[field.type].assign == 'function') {
                    field.value = Form.formBox[field.type].assign(field, params);
                }
                else {
                    if (field.box_name.length == 0) {
                        field.value = params[field.name] || field.default;
                    }
                    else {
                        field.value = params[field.box_name] || field.default;
                    }
                    switch (field.var_type) {
                        case 'i':
                            let ivalue = field.value == null ? '' : String(field.value);
                            field.value = beacon_1.Beacon.toInt(ivalue.trim(), field.default);
                            break;
                        case 'n':
                            let nvalue = field.value == null ? '' : String(field.value);
                            field.value = beacon_1.Beacon.toNumber(nvalue.trim(), field.default);
                            break;
                        case 'b':
                            let bvalue = field.value == null ? '' : String(field.value);
                            field.value = beacon_1.Beacon.toBool(bvalue.trim(), field.default);
                            break;
                        case 'a':
                            if (field.value instanceof Array == false) {
                                field.value = field.default || [];
                            }
                            break;
                        default:
                            field.value = field.value == null ? '' : String(field.value);
                            if (field.default !== null && field.value == '') {
                                field.value = field.default;
                            }
                            break;
                    }
                }
            }
            if (valid === true) {
                let result = yield this.validation();
                if (!result) {
                    let firstError = this.getFirstError();
                    let errors = this.getAllErrors();
                    this.ctl.fail(firstError, errors);
                }
            }
            let vals = yield this.getValues();
            return vals;
        });
    }
    getValues() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.init();
            let vals = {};
            let fields = this.getUsingFields();
            for (let key in fields) {
                let field = fields[key];
                if (this.type == Form.EDIT && field.offedit) {
                    continue;
                }
                if (field.close) {
                    continue;
                }
                if (Form.formBox[field.type] && typeof Form.formBox[field.type].fill == 'function') {
                    Form.formBox[field.type].fill(field, vals);
                }
                else {
                    vals[field.name] = field.value;
                }
            }
            return vals;
        });
    }
    initValues(vals = {}, force = false) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.init();
            let fields = this.getUsingFields();
            for (let key in fields) {
                let field = fields[key];
                if (field.close) {
                    continue;
                }
                if (!force && field.value !== null) {
                    continue;
                }
                if (Form.formBox[field.type] && typeof Form.formBox[field.type].init == 'function') {
                    Form.formBox[field.type].init(field, vals);
                }
                else {
                    field.value = vals[field.name] || null;
                }
            }
        });
    }
    validation() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.init();
            let fields = this.getUsingFields();
            let result = true;
            for (let key in fields) {
                let field = fields[key];
                if (field.error) {
                    result = false;
                    continue;
                }
                if (this.type == Form.EDIT && field.offedit) {
                    continue;
                }
                if (field.close) {
                    continue;
                }
                let ret = yield Validate.checkField(field);
                if (!ret) {
                    result = false;
                }
            }
            return result;
        });
    }
    assignFormScript(name = 'form_script') {
        let fields = this.getUsingFields();
        let codes = [];
        for (let key in fields) {
            let field = fields[key];
            let data = field.getBoxData();
            if (beacon_1.Beacon.isEmpty(data)) {
                continue;
            }
            let code = `$('#${field.box_id}').data(${JSON.stringify(data)});`;
            codes.push(code);
        }
        let script = codes.join("\n");
        this.ctl.assign(name, script);
    }
    insert(tbname) {
        return __awaiter(this, void 0, void 0, function* () {
            let vals = yield this.autoComplete(true);
            yield this.ctl.db.insert(tbname, vals);
        });
    }
    update(tbname, id) {
        return __awaiter(this, void 0, void 0, function* () {
            let vals = yield this.autoComplete(true);
            yield this.ctl.db.update(tbname, vals, id);
        });
    }
}
Form.NONE = 0;
Form.ADD = 1;
Form.EDIT = 2;
Form.formBox = {};
exports.Form = Form;
//# sourceMappingURL=form.js.map