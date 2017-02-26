import {Field} from "../../common/form";
import {TextBox} from "./text.box";
import {Helper} from "./helper";
declare var Beacon: any;
export class IntegerBox extends TextBox {

    public code(field: Field, attr: {[key: string]: any}, out: {echo: Function, raw: Function}, sdopx: any) {
        let temp: any = Object.assign(field == null ? {} : field.getBoxAttr(), attr);
        let box_attr = [];
        temp.type = 'text';
        temp['yee-module'] = 'integer';
        let data = field == null ? {} : field.getBoxData();
        Helper.explodeAttr(box_attr, temp);
        Helper.explodeData(box_attr, data);
        out.raw('<input ' + box_attr.join(' ') + ' />');
    }

    public assign(field: Field, params: {[key: string]: any;}) {
        field.value = params[field.boxName] || field.default;
        let ivalue = field.value == null ? '' : String(field.value);
        field.value = Beacon.toInt(ivalue.trim(), field.default);
    }

}