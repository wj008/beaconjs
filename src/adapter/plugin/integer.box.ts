import {Field} from "../../common/form";
import {TextBox} from "./text.box";
declare var Beacon: any;
import utils=require('sdopx/lib/utils');
export class IntegerBox extends TextBox {

    public code(field: Field, attr: {[key: string]: any}, out: {echo: Function, raw: Function}, sdopx: any) {
        let temp: any = Object.assign(field == null ? {} : field.getBoxAttr(), attr);
        let box_attr = [];
        temp.type = 'text';
        temp['yee-module'] = 'integer';
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
        let ivalue = field.value == null ? '' : String(field.value);
        field.value = Beacon.toInt(ivalue.trim(), field.default);
    }

}