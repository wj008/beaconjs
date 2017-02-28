import {BoxBase, Field} from "../../common/form";
import {Helper} from "./helper";
declare var Beacon: any;

export class UpimagesBox implements BoxBase {

    public code(field: Field, args: {[key: string]: any}, out: {echo: Function, raw: Function}, sdopx: any) {
        if (sdopx.context) {
            sdopx.context.addAsset('yee-upfile');
            sdopx.context.addAsset('yee-imgshower');
        }
        let attr: any = Object.assign(field.getBoxAttr(), args);
        let box_attr = [];
        attr.type = 'hidden';
        attr['yee-module'] = 'upfile imgshower';
        let data = field.getBoxData();
        data['show-type'] = data['show-type'] || 1;
        data['hide-input'] = data['hide-input'] || 0;
        data['btn-text'] = data['btn-text'] || '选择图片';
        data['show-maxwidth'] = data['show-maxwidth'] || 120;
        data['show-maxheight'] = data['show-maxheight'] || 120;
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
    }

}