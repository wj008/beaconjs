import {BoxBase, Field} from "../../common/form";
import {Helper} from "./helper";
declare var Beacon: any;

export class PasswordBox implements BoxBase {

    public code(field: Field, args: {[key: string]: any}, out: {echo: Function, raw: Function}, sdopx: any) {
        let attr: any = Object.assign(field.getBoxAttr(), args);
        attr.value = null;
        let box_attr = [];
        attr.type = 'password';
        let data = field.getBoxData();
        Helper.explodeAttr(box_attr, attr);
        Helper.explodeData(box_attr, data);
        out.raw('<input ' + box_attr.join(' ') + ' />');
    }

    public assign(field: Field, params: {[key: string]: any;}) {
        field.value = params[field.boxName] || field.default;
        field.value = field.value == null ? '' : String(field.value);
        if (field.default !== null && field.value == '') {
            field.value = field.default;
        }
    }

    public fill(field: Field, vals: {[key: string]: any;}) {
        if (field.value === null || field.value === '') {
            vals[field.name] = '';
            return;
        }
        if (typeof field['encodeFunc'] == 'string' && field['encodeFunc'] == 'md5') {
            vals[field.name] = Beacon.md5(field.value);
            return;
        }
        if (typeof field['encodeFunc'] == 'function') {
            vals[field.name] = field['encodeFunc'](field.value);
            return;
        }
        vals[field.name] = field.value;
    }

    public init(field: Field, vals: {[key: string]: any;}) {
        field.value = vals[field.name] || null;
    }

}