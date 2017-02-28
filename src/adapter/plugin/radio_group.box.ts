import {Field, BoxBase} from "../../common/form";
import {Helper} from "./helper";
import utils=require('sdopx/lib/utils');
declare var Beacon: any;
export class RadioGroupBox implements BoxBase {

    public code(field: Field, args: {[key: string]: any}, out: {echo: Function, raw: Function}, sdopx: any) {
        let attr: any = Object.assign(field.getBoxAttr(), args);
        let data = field.getBoxData();
        let value = (attr['value'] === void 0 || attr['value'] == null) ? '' : attr['value'];
        let options = field['options'] || [];
        let ul_attr = [];
        Helper.explodeAttr(ul_attr, {
            'style': attr['style'] || null,
            'class': attr['class'] || null
        });
        let name = attr['name'];
        data['bind-name'] = attr['name'];
        delete attr['value'];
        delete attr['style'];
        delete attr['class'];
        delete attr['name'];
        attr['type'] = 'hidden';
        attr['yee-module'] = 'radio_group';
        let box_attr = [];
        Helper.explodeAttr(box_attr, attr);
        Helper.explodeData(box_attr, data);
        out.raw('<input ' + box_attr.join(' ') + ' />\n');
        if (field['isUl']) {
            out.raw(`<ul id="radio_group_${ attr['id']}" ${ul_attr.join(' ')}>\n`);
            for (let item of options) {
                if (typeof item == 'string' || typeof item == 'number' || typeof item == 'boolean') {
                    item = {value: item};
                }
                let {text = null, tips = null}=item;
                let val = item.value;
                text = text || val;
                let selected = val == value ? ' checked="checked"' : '';
                out.raw(`<li><label>`);
                out.raw(`<input type="radio" name="${name}" value="${utils.escapeXml(val)}"${selected}/>`);
                out.raw(`<span>${text}${(tips == null ? '' : '<em>' + tips + '</em>')}</span>`);
                out.raw(`</label></li>\n`);
            }
            out.raw(`</ul>`);
        } else {
            out.raw(`<div id="radio_group_${ attr['id']}" ${ul_attr.join(' ')}>\n`);
            for (let item of options) {
                if (typeof item == 'string' || typeof item == 'number' || typeof item == 'boolean') {
                    item = {value: item};
                }
                let {text = null, tips = null}=item;
                let val = item.value;
                text = text || val;
                let selected = val == value ? ' checked="checked"' : '';
                out.raw(`<label>`);
                out.raw(`<input type="radio" name="${name}" value="${utils.escapeXml(val)}"${selected}/>`);
                out.raw(`<span>${text}${(tips == null ? '' : '<em>' + tips + '</em>')}</span>`);
                out.raw(`</label>\n`);
            }
            out.raw(`</div>`);
        }
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