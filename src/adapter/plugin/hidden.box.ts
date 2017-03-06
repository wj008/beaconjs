import {BoxBase, Field} from "../../common/form";
import {Helper} from "./helper";
declare var Beacon: any;

export class HiddenBox implements BoxBase {

    public code(field: Field, args: {[key: string]: any}, out: {echo: Function, raw: Function}, sdopx: any) {
        let attr: any = Object.assign(field.getBoxAttr(), args);
        let box_attr = [];
        attr.type = 'hidden';
        let data = field.getBoxData();
        Helper.explodeAttr(box_attr, attr);
        Helper.explodeData(box_attr, data);
        out.raw('<input ' + box_attr.join(' ') + ' />');
    }

    public assign(field: Field, params: {[key: string]: any;}) {
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
            default:
                field.value = field.value == null ? '' : String(field.value);
                if (field.default !== null && field.value == '') {
                    field.value = field.default;
                }
                break;
        }
    }

    public fill(field: Field, vals: {[key: string]: any;}) {
        vals[field.name] = field.value;
    }

    public init(field: Field, vals: {[key: string]: any;}) {
        field.value = vals[field.name] === void 0 ? null : vals[field.name];
        switch (field.varType) {
            case 'i':
                let ivalue = field.value == null ? '' : String(field.value);
                field.value = Beacon.toInt(ivalue.trim(), 0);
                break;
            case 'n':
                let nvalue = field.value == null ? '' : String(field.value);
                field.value = Beacon.toNumber(nvalue.trim(), 0);
                break;
            case 'b':
                let bvalue = field.value == null ? '' : String(field.value);
                field.value = Beacon.toBool(bvalue.trim(), false);
                break;
            default:
                field.value = field.value == null ? '' : String(field.value);
                break;
        }
    }


}