import {Field, BoxBase} from "../../common/form";
import {Helper} from "./helper";
import utils=require('sdopx/lib/utils');
declare var Beacon: any;
export class SelectBox implements BoxBase {

    public code(field: Field, args: {[key: string]: any}, out: {echo: Function, raw: Function}, sdopx: any) {
        let attr: any = Object.assign(field.getBoxAttr(), args);
        let data = field.getBoxData();
        let value = (attr['value'] === void 0 || attr['value'] == null) ? '' : attr['value'];
        let options = field['options'] || [];
        let name = attr['name'];
        delete attr['value'];
        delete attr['type'];

        let box_attr = [];
        Helper.explodeAttr(box_attr, attr);
        Helper.explodeData(box_attr, data);
        out.raw('<select ' + box_attr.join(' ') + ' />\n');
        for (let item of options) {
            if (typeof item == 'string' || typeof item == 'number' || typeof item == 'boolean') {
                item = {value: item};
            }
            let {text = null, tips = null, group = null}=item;
            let val = item.value;
            text = text || val;
            if (group) {
                if (Beacon.isArray(group)) {
                    out.raw(`<optgroup`);
                    if (text) {
                        out.raw(' label="' + utils.escapeXml(text) + '"');
                    }
                    out.raw(`>`);
                    for (let item of group) {
                        if (typeof item == 'string' || typeof item == 'number' || typeof item == 'boolean') {
                            item = {value: item};
                        }
                        let {text = null, tips = null, group = null}=item;
                        let val = item.value;
                        text = text || val;
                        let selected = val == value ? ' selected="selected"' : '';
                        out.raw(`<option value="${utils.escapeXml(val)}"${selected}>`);
                        out.raw(utils.escapeXml(text));
                        if (tips) {
                            out.raw('|' + utils.escapeXml(tips));
                        }
                        out.raw(`</option>`);
                    }
                    out.raw(`</optgroup>`);
                }
                continue;
            }
            let selected = val == value ? ' selected="selected"' : '';
            out.raw(`<option value="${utils.escapeXml(val)}"${selected}>`);
            out.raw(utils.escapeXml(text));
            if (tips) {
                out.raw('|' + utils.escapeXml(tips));
            }
            out.raw(`</option>`);
        }
        out.raw(`</select>`);
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
        if (field.varType == 'b') {
            vals[field.name] = field.value ? 1 : 0;
        } else {
            vals[field.name] = field.value;
        }
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