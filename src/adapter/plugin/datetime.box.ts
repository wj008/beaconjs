import {BoxBase, Field} from "../../common/form";
import {Helper} from "./helper";
declare var Beacon: any;

export class DatetimeBox implements BoxBase {

    public code(field: Field, args: {[key: string]: any}, out: {echo: Function, raw: Function}, sdopx: any) {
        if (sdopx.context) {
            sdopx.context.addAsset('yee-datetime');
        }
        let attr: any = Object.assign(field.getBoxAttr(), args);
        let box_attr = [];
        attr.type = 'text';
        attr['yee-module'] = 'datetime';
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
        vals[field.name] = field.value;
    }

    public init(field: Field, vals: {[key: string]: any;}) {
        field.value = vals[field.name] || null;
        if (field.value != null && String(field.value).length > 0) {
            field.value = Beacon.datetime(field.value, 'yyyy-MM-dd HH:mm:ss');
        }
    }

}