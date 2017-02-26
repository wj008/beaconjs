declare var Beacon: any;
import {Controller} from "../common/controller";
import path=require('path');
import fs=require('fs');
export interface BoxBase {
    code (field: Field, attr: {[key: string]: any}, out: {echo: Function, raw: Function}, sdopx: any);
    assign (field: Field, params: {[key: string]: any});
    fill(field: Field, vals: {[key: string]: any});
    init(field: Field, vals: {[key: string]: any});
}
export class Validate {

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
    };

    private static default_msgs = {
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
    private static alias = {
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

    private static remote_func = {};

    public static regRemoute(name, func) {
        Validate.remote_func[name] = func;
    }

    public static getFunc(type) {
        let rtype = Validate.getRealType(type);
        if (Validate['rule_' + rtype] && typeof Validate['rule_' + rtype] == 'function') {
            return Validate['rule_' + rtype];
        }
        return null;
    }

    public static regFnuc(type: string, func, error = '格式错误') {
        if (typeof func == 'string') {
            func = Validate.getRealType(func);
            Validate.alias[type] = func;
            return;
        }
        Validate.default_msgs[type] = error;
        Validate['rule_' + type] = func;
    }

    public static getRealType(type): string {
        if (Validate.alias[type]) {
            return Validate.alias[type];
        }
        return type;
    }

    public static  rule_required(val) {
        if (val === null) {
            return false;
        }
        if (val instanceof Array && val.length == 0) {
            return false;
        }
        return String(val).length == 0 ? false : true;
    }

    public static  rule_email(val) {
        return /^([a-zA-Z0-9]+[-|_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[-|_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,4}([\.][a-zA-Z]{2})?$/.test(val);
    }

    public static  rule_url(val, dc?: boolean) {
        if (dc && val == '#') {
            return true;
        }
        return /^(http|https|ftp):\/\/\w+\.\w+/i.test(val);
    }

    public static  rule_equal(val, str) {
        return val == str;
    }

    public static  rule_notequal(val, str) {
        return val != str;
    }

    public static  rule_equalto(val: string, boxid: string, ctl: Controller = null) {
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

    public static  rule_mobile(val) {
        return /^1[34578]\d{9}$/.test(val);
    }

    public static  rule_idcard(val) {
        return /^[1-9]\d{5}(19|20)\d{2}(((0[13578]|1[02])([0-2]\d|30|31))|((0[469]|11)([0-2]\d|30))|(02[0-2][0-9]))\d{3}(\d|X|x)$/.test(val);
    }

    public static  rule_user(val) {
        return /^[a-zA-Z]\w+$/.test(val);
    }

    public static  rule_regex(val, regex) {
        let re = null;
        if (regex instanceof RegExp) {
            let re = regex.exec(String(val));
        }
        else {
            new RegExp(regex).exec(String(val));
        }
        return (re && (re.index === 0) && (re[0].length === String(val).length));
    }

    public static  rule_number(val) {
        return /^[\-\+]?((\d+(\.\d*)?)|(\.\d+))$/.test(val);
    }

    public static  rule_integer(val) {
        return /^[\-\+]?\d+$/.test(val);
    }

    public static  rule_max(val, num, noeq?: boolean) {
        if (noeq === true) {
            return Number(val) < Number(num);
        }
        return Number(val) <= Number(num);
    }

    public static  rule_min(val, num, noeq?: boolean) {
        if (noeq === true) {
            return Number(val) > Number(num);
        }
        return Number(val) >= Number(num);
    }

    public static  rule_range(val, num1, num2, noeq?: boolean) {
        if (noeq === true) {
            return Number(val) > Number(num1) && Number(val) < Number(num2);
        }
        return Number(val) >= Number(num1) && Number(val) <= Number(num2);
    }

    public static  rule_minlength(val, len: number) {
        return String(val).length >= len;
    }

    public static  rule_maxlength(val, len: number) {
        return String(val).length <= len;
    }

    public static  rule_rangelength(val, len1: number, len2: number) {
        return String(val).length >= len1 && String(val).length <= len2;
    }

    public static async checkField(field: Field) {
        if (field.error) {
            return false;
        }
        if (field.data_val_off) {
            return true;
        }
        let rules: any = field.data_val;
        if (rules == null) {
            return true;
        }
        let errors: any = field.data_val_msg || {};
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
                if (typeof out != 'boolean' && Beacon.isPromise(out)) {
                    out = await out;
                }
                if (typeof out == 'boolean') {
                    if (out) {
                        continue;
                    }
                    field.error = Validate.format(errors[type] || Validate.default_msgs[type], xargs);
                    return false;
                }
                if (Beacon.isObject(out) && typeof out.status == 'boolean' && out.status == false && typeof out.error == 'string') {
                    field.error = Validate.format(out.error, xargs);
                    return false;
                }
            }
        }
        return true;
    }

}
export class Field {
    private _form: Form = null;
    public label: string = '';
    public name: string = '';
    public error: string = '';
    public tab_index: string = '';
    public view_tab_shared: boolean = false;
    public close: boolean = false;
    public offedit: boolean = false;
    public view_close: boolean = false;
    public value = null;
    public default = null;
    public type = 'text';
    public var_type = 's';
    public box_name = '';
    public box_id = '';
    public data_val_off: boolean = null;
    public data_val: {[key: string]: any} = null;
    public data_val_msg: {[key: string]: string} = null;

    public constructor(form: Form, field: {[key: string]: any} = {}) {
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

    public getForm(): Form {
        return this._form;
    }

    public getBoxData() {
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

    public getBoxAttr() {
        let data = {};
        for (let key in this) {
            if (/^box_(.*)$/.test(key)) {
                let val = this[key];
                let nkey = key.replace(/^box_/, '');
                nkey = nkey.replace(/_/g, '-');
                if (typeof val != 'function' && val !== null) {
                    data[nkey] = val;
                }
            }
        }
        if (this.value !== null && String(this.value).length > 0) {
            data['value'] = this.value;
        }
        return data;
    }

}
export class Form {

    static NONE = 0;
    static ADD = 1;
    static EDIT = 2;

    static boxInstance: {[key: string]: BoxBase} = {};

    public title = '';
    public caption = '';
    public back_uri = '';
    public ctl: Controller = null;
    public type: number = Form.NONE;
    public use_tab: boolean = false;
    public tabs: {[key: string]: string} = {};
    public tab_index: string = '';
    public tab_split: boolean = false;
    public fields: {[key: string]: Field} = {};


    private _init = false;
    private _using_fields: {[key: string]: Field} = null;
    protected _load: {[key: string]: any} = {};


    public constructor(ctl: Controller, type: number = Form.NONE) {
        this.ctl = ctl;
        this.type = type;
    }

    public async init() {
        if (this._init) {
            return this;
        }
        this._init = true;
        let fields = await this.load();
        for (let name in fields) {
            this.addField(name, fields[name]);
        }
        return this;
    }

    public async load(fields: {[key: string]: any} = null) {
        if (fields) {
            this._load = Object.assign(this._load, fields);
        } else {
            return this._load;
        }
    }

    public addField(name: string, field: any, before: string = ''): Form {
        if (field instanceof Field) {
            field.name = name;
        } else if (Beacon.isObject(field)) {
            field.name = name;
            field = new Field(this, field);
        } else {
            return this;
        }
        if (before && this.fields[before]) {
            let temps: {[key: string]: Field} = {};
            for (let key in this.fields) {
                temps[key] = this.fields[key];
                if (key === before) {
                    temps[name] = field;
                }
            }
            this.fields = temps;
        } else {
            this.fields[name] = field;
        }
        return this;
    }

    public getField(name: string): Field {
        return this.fields[name] || null;
    }

    public removeField(name: string): Form {
        if (this.fields[name]) {
            delete this.fields[name];
        }
        return this;
    }

    public getError(name: string): string {
        if (this.fields[name]) {
            return this.fields[name].error;
        }
        return '';
    }

    public addError(name: string, error: string): Form {
        if (this.fields[name]) {
            this.fields[name].error = error;
        }
        return this;
    }

    public removeError(name: string): Form {
        if (this.fields[name]) {
            this.fields[name].error = '';
        }
        return this;
    }

    public getFirstError(): string {
        let fields = this.getUsingFields();
        let name = Object.keys(fields)[0] || null;
        if (name) {
            return this.getError(name);
        }
        return '';
    }

    public getAllErrors(): {[key: string]: string} {
        let errors: {[key: string]: string} = {};
        let fields = this.getUsingFields();
        for (let name in fields) {
            if (fields[name].error.length > 0) {
                errors[name] = fields[name].error;
            }
        }
        return errors;
    }

    public cleanAllErrors(): Form {
        let fields = this.getUsingFields();
        for (let name in fields) {
            if (fields[name].error.length > 0) {
                fields[name].error = '';
            }
        }
        return this;
    }

    public emptyFieldsValue() {
        for (let key in this.fields) {
            let field = this.fields[key];
            field.value = null;
        }
    }

    /**
     * 获取表单使用的字段
     */
    public  getUsingFields(): {[key: string]: Field} {
        if (this._using_fields) {
            return this._using_fields;
        }
        if (this.use_tab && this.tab_split) {
            this.tab_index = this.ctl.get('tab_index:s', '');
            let temp: {[key: string]: Field} = this._using_fields = {};
            for (let key in this.fields) {
                let field = this.fields[key];
                field.box_name = field.box_name || field.name;
                if (field.view_tab_shared || this.tab_index == field.tab_index) {
                    temp[key] = field;
                }
            }
            return temp;
        }
        if (this.use_tab) {
            let temp: {[key: string]: Field} = this._using_fields = {};
            for (let key in this.fields) {
                let field = this.fields[key];
                field.box_name = field.box_name || field.name;
                if (field.view_tab_shared || ('' != field.tab_index && this.tabs[field.tab_index])) {
                    temp[key] = field;
                }
            }
            return temp;
        }
        this._using_fields = this.fields;
        return this._using_fields;
    }

    public async getValues() {
        let vals: {[key: string]: any} = {};
        let fields = this.getUsingFields();
        for (let key in fields) {
            let field = fields[key];
            if (this.type == Form.EDIT && field.offedit) {
                continue;
            }
            if (field.close) {
                continue;
            }
            if (Form.boxInstance[field.type] && typeof Form.boxInstance[field.type].fill == 'function') {
                let p = Form.boxInstance[field.type].fill(field, vals);
                if (Beacon.isPromise(p)) {
                    await p;
                }
            } else {
                vals[field.name] = field.value;
            }
        }
        return vals;
    }

    public async initValues(vals: {[key: string]: any} = {}, force: boolean = false) {
        let fields = this.getUsingFields();
        for (let key in fields) {
            let field = fields[key];
            if (field.close) {
                continue;
            }
            if (!force && field.value !== null) {
                continue;
            }
            if (Form.boxInstance[field.type] && typeof Form.boxInstance[field.type].init == 'function') {
                let p = Form.boxInstance[field.type].init(field, vals);
                if (Beacon.isPromise(p)) {
                    await p;
                }
            } else {
                field.value = vals[field.name] || null;
            }
        }
    }

    public async autoComplete(params: any = null, valid: boolean = null) {
        let fields = this.getUsingFields();
        if (valid == null && typeof params == 'boolean') {
            valid = params;
            params = null;
        }
        if (params == null) {
            if (this.ctl.isPost()) {
                params = Object.assign({}, this.ctl.post());
            } else {
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
            if (Form.boxInstance[field.type] && typeof Form.boxInstance[field.type].assign == 'function') {
                let p = Form.boxInstance[field.type].assign(field, params);
                if (Beacon.isPromise(p)) {
                    await p;
                }
            } else {
                field.value = params[field.box_name] || field.default;
                switch (field.var_type) {
                    case 'i':
                        let ivalue = field.value == null ? '' : String(field.value);
                        field.value = Beacon.toInt(ivalue.trim(), field.default);
                        break;
                    case 'n':
                        let nvalue = field.value == null ? '' : String(field.value);
                        field.value = Beacon.toNumber(nvalue.trim(), field.default);
                        break;
                    case 'b':
                        let bvalue = field.value == null ? '' : String(field.value);
                        field.value = Beacon.toBool(bvalue.trim(), field.default);
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
            let result = await this.validation();
            if (!result) {
                let firstError = this.getFirstError();
                let errors = this.getAllErrors();
                this.ctl.fail(firstError, errors);
            }
        }
        let vals = await this.getValues();
        return vals;
    }

    public async validation() {
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
            let ret = await Validate.checkField(field);
            if (!ret) {
                result = false;
            }
        }
        return result;
    }

    public async insert(tbname: string) {
        let vals = await this.autoComplete(true);
        await this.ctl.db.insert(tbname, vals);
    }

    public async update(tbname: string, id: number) {
        let vals = await this.autoComplete(true);
        await this.ctl.db.update(tbname, vals, id);
    }

    public getScript() {
        if (!this._init) {
            return '';
        }
        let fields = this.getUsingFields();
        let codes = [];
        for (let key in fields) {
            let field = fields[key];
            let data = field.getBoxData();
            if (Beacon.isEmpty(data)) {
                continue;
            }
            let code = `$('#${field.box_id}').data(${JSON.stringify(data)});`;
            codes.push(code);
        }
        let script = '<script>' + codes.join("\n") + '</script>';
        return script;
    }

    public display(tplname: string = 'common/form') {
        if (!this._init) {
            return;
        }
        this.ctl.assign('form', this);
        this.ctl.display(tplname);
    }

    public static regPlugin(name: string, instance: BoxBase) {
        if (name.length > 0) {
            Form.boxInstance[name] = instance;
        }
    }

    public static addPluginDir(dirname: string) {
        if (dirname.length == 0) {
            return;
        }
        if (dirname[0] == '.' && dirname[1] == '/') {
            dirname = path.join(Beacon.RUNTIME_PATH, dirname.substring(2));
            console.log(dirname);
        }
        if (fs.existsSync(dirname)) {
            var files = fs.readdirSync(dirname);
            let result = [];
            files.forEach(function (item) {
                let file = path.join(dirname, item);
                var stat = fs.statSync(file);
                if (stat.isFile() && /\.box\.js$/i.test(file)) {
                    result.push(item);
                }
            });
            for (let item of result) {
                let fname = item.replace(/\.box\.js$/, '');
                if (fname == '') {
                    continue;
                }
                let file = path.join(dirname, item);
                let pick = require(file);
                try {
                    let className = Beacon.toCamel(fname) + 'Box';
                    if (pick[className]) {
                        let classInterfaces = new pick[className]();
                        this.regPlugin(fname, classInterfaces);
                    }
                } catch (e) {

                }
            }
        }
    }

    public static hasPlugin(name: string) {
        return Form.boxInstance[name] !== void 0;
    }

    public static getPlugin(name: string) {
        return Form.boxInstance[name] || null;
    }
}
