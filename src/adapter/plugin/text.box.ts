import {BoxBase, Field} from "../../common/form";
import {Helper} from "./helper";
declare var Beacon: any;

export class TextBox implements BoxBase {

    public code(field: Field, attr: {[key: string]: any}, out: {echo: Function, raw: Function}, sdopx: any) {
        let temp: any = Object.assign(field == null ? {} : field.getBoxAttr(), attr);
        let box_attr = [];
        temp.type = 'text';
        let data = field == null ? {} : field.getBoxData();
        Helper.explodeAttr(box_attr, temp);
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
        vals[field.name] = field.value;
    }

    public init(field: Field, vals: {[key: string]: any;}) {
        field.value = vals[field.name] || null;
    }

}