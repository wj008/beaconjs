import {BoxBase, Field} from "../../common/form";
declare var Beacon: any;
import utils=require('sdopx/lib/utils');
export class TextBox implements BoxBase {

    public code(field: Field, attr: {[key: string]: any}, out: {echo: Function, raw: Function}, sdopx: any) {
        let temp: any = Object.assign(field == null ? {} : field.getBoxAttr(), attr);
        let box_attr = [];
        temp.type = 'text';
        for (let key in temp) {
            let val = temp[key];
            if (val !== '') {
                box_attr.push(key + '="' + utils.escapeXml(val) + '"');
            }
        }
        out.raw('<input ' + box_attr.join(' ') + ' />');
    }

    public assign(field: Field, params: {[key: string]: any;}) {
        field.value = params[field.box_name] || field.default;
        field.value = field.value == null ? '' : String(field.value);
        if (field.default !== null && field.value == '') {
            field.value = field.default;
        }
    }

    public fill(field: Field, vals: {[key: string]: any;}) {
        vals[field.name] = field.value;
    }

    public init(field: Field, vals: {[key: string]: any;}) {
        field.value = vals[field.name] || null;
    }

}