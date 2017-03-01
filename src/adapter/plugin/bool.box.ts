import {Field, BoxBase} from "../../common/form";
import {Helper} from "./helper";
declare var Beacon: any;
export class BoolBox implements BoxBase {

    public code(field: Field, args: {[key: string]: any}, out: {echo: Function, raw: Function}, sdopx: any) {
        let attr: any = Object.assign(field.getBoxAttr(), args);
        let box_attr = [];
        if (attr['value'] && Beacon.toBool(attr['value'])) {
            attr['checked'] = 'checked';
        }
        attr.type = 'checkbox';
        attr['value'] = 1;
        let data = field.getBoxData();
        Helper.explodeAttr(box_attr, attr);
        Helper.explodeData(box_attr, data);
        out.raw('<input ' + box_attr.join(' ') + ' />');
    }

    public assign(field: Field, params: {[key: string]: any;}) {
        field.value = params[field.boxName] || field.default;
        let ivalue = field.value == null ? '' : String(field.value);
        field.value = Beacon.toBool(ivalue.trim(), field.default);
    }

    public fill(field: Field, vals: {[key: string]: any;}) {
        vals[field.name] = field.value ? 1 : 0;
    }

    public init(field: Field, vals: {[key: string]: any;}) {
        if (vals[field.name] === void 0 || vals[field.name] == null) {
            field.value = null;
            return;
        }
        field.value = vals[field.name] == 1 ? true : false;
    }

}