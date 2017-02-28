import {Field, BoxBase} from "../../common/form";
import {Helper} from "./helper";
declare var Beacon: any;
export class IntegerBox implements BoxBase {

    public code(field: Field, args: {[key: string]: any}, out: {echo: Function, raw: Function}, sdopx: any) {
        let attr: any = Object.assign(field.getBoxAttr(), args);
        let box_attr = [];
        attr.type = 'text';
        attr['yee-module'] = 'integer';
        let data = field.getBoxData();
        Helper.explodeAttr(box_attr, attr);
        Helper.explodeData(box_attr, data);
        out.raw('<input ' + box_attr.join(' ') + ' />');
    }

    public assign(field: Field, params: {[key: string]: any;}) {
        field.value = params[field.boxName] || field.default;
        let ivalue = field.value == null ? '' : String(field.value);
        field.value = Beacon.toInt(ivalue.trim(), field.default);
    }

    public fill(field: Field, vals: {[key: string]: any;}) {
        vals[field.name] = field.value;
    }

    public init(field: Field, vals: {[key: string]: any;}) {
        field.value = Beacon.toInt(vals[field.name] || null, 0);
    }

}