declare var Beacon: any;
import {Controller} from "../common/controller";
import path=require('path');
import fs=require('fs');
export interface BoxBase {
    code (field: Field, args: {[key: string]: any}, out: {echo: Function, raw: Function}, sdopx: any);
    assign (field: Field, params: {[key: string]: any});
    fill(field: Field, vals: {[key: string]: any});
    init(field: Field, vals: {[key: string]: any});
}
export class Validate {

    private static default_errors = {
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

    //字符串格式化输出
    private static format(str, args) {
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
        Validate.default_errors[type] = error;
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

    private remoteFunc: {[key: string]: Function} = {};
    private func: {[key: string]: Function} = {};
    private default_errors: {[key: string]: string} = {};

    public regRemoute(name: string, func: Function) {
        this.remoteFunc[name] = func;
    }

    public regFunc(type: string, func: Function, error: string = null) {
        this.func[type] = func;
        if (error) {
            this.default_errors[type] = error;
        }
    }

    public async checkField(field: Field) {
        let name = field.name;
        if (field.error) {
            return false;
        }
        if (field.dataValOff) {
            return true;
        }
        let rules: any = field.dataVal;
        if (rules == null) {
            return true;
        }
        let errors: any = field.dataValMsg || {};
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
            let func = this.func['required'] || Validate.rule_required;
            let p = func(value);
            if (Beacon.isPromise(p)) {
                p = await p;
            }
            if (!p) {
                field.error = errors.required || Validate.default_errors.required;
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
                if (type == 'equalto') {
                    let form = field.getForm();
                    if (form) {
                        args.push(form.ctl);
                    }
                }
                let func = null;
                if (type == 'remote') {
                    func = field['remoteFunc'] || this.remoteFunc[name] || null;
                } else {
                    func = this.func[type] || Validate.getFunc(type);
                }
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
                    field.error = Validate.format(errors[type] || this.default_errors[type] || Validate.default_errors[type], xargs);
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
    public tabIndex: string = '';
    public viewTabShared: boolean = false;
    public close: boolean = false;
    public offEdit: boolean = false;
    public viewClose: boolean = false;
    public value = null;
    public default = null;
    public type = 'text';
    public varType = 's';
    public boxName = '';
    public boxId = '';
    public dataValOff: boolean = null;
    public dataVal: {[key: string]: any} = null;
    public dataValMsg: {[key: string]: string} = null;
    public remoteFunc: Function = null;

    public constructor(form: Form, field: {[key: string]: any} = {}) {
        for (let key in field) {
            let val = field[key];
            let nkey = Beacon.toCamel(key, true);
            if (typeof val != 'function' || nkey == 'remoteFunc') {
                this[nkey] = val;
            }
        }
        this.boxName = this.boxName || this.name;
        this.boxId = this.boxId || this.boxName;
        this._form = form;
    }

    public getForm(): Form {
        return this._form;
    }

    public getBoxData() {
        let data = {};
        for (let key in this) {
            if (/^data([A-Z].*)$/.test(key)) {
                let val = this[key];
                let nkey = key.replace(/^data/, '');
                nkey = Beacon.toUnder(nkey, true);
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
            if (/^box([A-Z].*)$/.test(key)) {
                let val = this[key];
                let nkey = key.replace(/^box/, '');
                nkey = Beacon.toUnder(nkey, true);
                if (typeof val != 'function' && val !== null) {
                    data[nkey] = val;
                }
            }
        }
        if (this.value !== null && String(this.value).length > 0) {
            data['value'] = this.value;
        }
        if ((!this._form || this._form.type == Form.ADD) && (data['value'] === void 0 || data['value'] == null)) {
            if (this.default !== null) {
                data['value'] = this.default;
            }
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
    public backUri = '';
    public ctl: Controller = null;
    public type: number = Form.NONE;
    public useTab: boolean = false;
    public tabs: {[key: string]: string} = {};
    public tabIndex: string = '';
    public tabSplit: boolean = false;
    public fields: {[key: string]: Field} = {};

    private _validate: Validate = null;
    private _init = false;
    private _using_fields: {[key: string]: Field} = null;
    protected _load: {[key: string]: any} = {};
    protected _hideBox: {[key: string]: any} = {};

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

    public setType(type) {
        this.type = type;
        return this;
    }

    public isAdd() {
        return this.type == Form.ADD;
    }

    public isEdit() {
        return this.type == Form.EDIT;
    }

    public isNone() {
        return this.type == Form.NONE;
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
            let field = fields[name];
            if (field.error.length > 0) {
                errors[field.boxName] = field.error;
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

    public addHideBox(name: string, value: any) {
        this._hideBox[name] = value;
    }

    public getHideBox(name: string = null) {
        if (name === null) {
            return this._hideBox;
        }
        return this._hideBox[name];
    }

    /**
     * 获取表单使用的字段
     */
    public  getUsingFields(): {[key: string]: Field} {
        if (this._using_fields) {
            return this._using_fields;
        }
        if (this.useTab && this.tabSplit) {
            this.tabIndex = this.ctl.get('tabIndex:s', '');
            let temp: {[key: string]: Field} = this._using_fields = {};
            for (let key in this.fields) {
                let field = this.fields[key];
                field.boxName = field.boxName || field.name;
                if (field.viewTabShared || this.tabIndex == field.tabIndex) {
                    temp[key] = field;
                }
            }
            return temp;
        }
        if (this.useTab) {
            let temp: {[key: string]: Field} = this._using_fields = {};
            for (let key in this.fields) {
                let field = this.fields[key];
                field.boxName = field.boxName || field.name;
                if (field.viewTabShared || ('' != field.tabIndex && this.tabs[field.tabIndex])) {
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
            if (this.type == Form.EDIT && field.offEdit) {
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
            if (this.type == Form.EDIT && field.offEdit) {
                continue;
            }
            if (field.close) {
                continue;
            }
            if (field.viewClose) {
                field.value = field.default;
                continue;
            }
            if (Form.boxInstance[field.type] && typeof Form.boxInstance[field.type].assign == 'function') {
                let p = Form.boxInstance[field.type].assign(field, params);
                if (Beacon.isPromise(p)) {
                    await p;
                }
            } else {
                field.value = params[field.boxName] || field.default;
                switch (field.varType) {
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
        if (this['beforeValid'] && typeof this['beforeValid'] == 'function') {
            let p = this['beforeValid']();
            if (Beacon.isPromise(p)) {
                await p;
            }
        }
        if (valid === true) {
            let result = await this.validation();
            if (!result) {
                let errors = this.getAllErrors();
                this.ctl.fail(errors);
            }
        }
        if (this['afterValid'] && typeof this['afterValid'] == 'function') {
            let p = this['afterValid']();
            if (Beacon.isPromise(p)) {
                await p;
            }
        }
        let vals = await this.getValues();
        return vals;
    }

    public getValidate(): Validate {
        if (this._validate == null) {
            this._validate = new Validate();
        }
        return this._validate;
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
            if (this.type == Form.EDIT && field.offEdit) {
                continue;
            }
            if (field.close) {
                continue;
            }
            let ret = await this.getValidate().checkField(field);
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

    public display(tplname: string = 'common/form') {
        if (!this._init) {
            return;
        }
        if (!this.backUri) {
            this.backUri = this.ctl.getReferrer();
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
