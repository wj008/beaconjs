import {BoxBase, Field} from "../../common/form";
import {Helper} from "./helper";
declare var Beacon: any;

export class XheditorBox implements BoxBase {

    public code(field: Field, args: {[key: string]: any}, out: {echo: Function, raw: Function}, sdopx: any) {
        if (sdopx.context) {
            sdopx.context.addAsset('yee-xheditor');
        }
        let attr: any = Object.assign(field.getBoxAttr(), args);
        let box_attr = [];
        delete attr['type'];
        let value = (attr['value'] === null || attr['value'] === void 0) ? '' : attr['value'];
        attr['yee-module'] = 'xheditor';
        let data = field.getBoxData();
        Helper.explodeAttr(box_attr, attr);
        Helper.explodeData(box_attr, data);
        out.raw('<textarea ' + box_attr.join(' ') + ' >');
        out.echo(value);
        out.raw('</textarea>');
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