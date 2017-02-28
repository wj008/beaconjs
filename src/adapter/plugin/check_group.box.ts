import {Field, BoxBase} from "../../common/form";
import {Helper} from "./helper";
import utils=require('sdopx/lib/utils');
declare var Beacon: any;
export class CheckGroupBox implements BoxBase {

    public code(field: Field, args: {[key: string]: any}, out: {echo: Function, raw: Function}, sdopx: any) {
        let attr: any = Object.assign(field.getBoxAttr(), args);
        let data = field.getBoxData();
        let values = [];
        if (attr['value'] instanceof Array) {
            values = attr['value'];
        }
        else if (typeof attr['value'] == 'string' && /^\[.*\]$/.test(attr['value'])) {
            values = JSON.parse(attr['value']);
        }
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
        attr['yee-module'] = 'check_group';
        let box_attr = [];
        Helper.explodeAttr(box_attr, attr);
        Helper.explodeData(box_attr, data);
        out.raw('<input ' + box_attr.join(' ') + ' />\n');
        if (field['isUl']) {
            out.raw(`<ul id="check_group_${ attr['id']}" ${ul_attr.join(' ')}>\n`);
            for (let item of options) {
                if (typeof item == 'string' || typeof item == 'number' || typeof item == 'boolean') {
                    item = {value: item};
                }
                let {value = '', text = null, tips = null}=item;
                text = text || value;
                let selected = Helper.has(values, value) ? ' checked="checked"' : '';
                out.raw(`<li><label>`);
                out.raw(`<input type="checkbox" name="${name}" value="${utils.escapeXml(value)}"${selected}/>`);
                out.raw(`<span>${text}${(tips == null ? '' : '<em>' + tips + '</em>')}</span>`);
                out.raw(`</label></li>\n`);
            }
            out.raw(`</ul>`);
        } else {
            out.raw(`<div id="check_group_${ attr['id']}" ${ul_attr.join(' ')}>\n`);
            for (let item of options) {
                if (typeof item == 'string' || typeof item == 'number' || typeof item == 'boolean') {
                    item = {value: item};
                }
                let {value = '', text = null, tips = null}=item;
                text = text || value;
                let selected = Helper.has(values, value) ? ' checked="checked"' : '';
                out.raw(`<label>`);
                out.raw(`<input type="checkbox" name="${name}" value="${utils.escapeXml(value)}"${selected}/>`);
                out.raw(`<span>${text}${(tips == null ? '' : '<em>' + tips + '</em>')}</span>`);
                out.raw(`</label>\n`);
            }
            out.raw(`</div>`);
        }
    }

    public assign(field: Field, params: {[key: string]: any;}) {
        let avalue = params[field.boxName] || field.default || [];
        if (avalue instanceof Array == false) {
            avalue = field.default || [];
        }
        field.value = avalue;
    }

    public fill(field: Field, vals: {[key: string]: any;}) {
        if (field['bitComp']) {
            let value = 0;
            if (Beacon.isArray(field.value)) {
                for (let item of field.value) {
                    let sitem = String(item).trim();
                    if (/^\d+$/.test(sitem)) {
                        let optv = parseInt(sitem);
                        value = value | optv;
                    }
                }
            }
            vals[field.name] = value;
            return;
        }
        if (field['names']) {
            let names = field['names'];
            if (!Beacon.isArray(field.value)) {
                for (let name of names) {
                    vals[name] = 0;
                }
                return;
            }
            let options = field['options'] || [];
            let temp = [];
            for (let item of options) {
                if (typeof item == 'string' || typeof item == 'number' || typeof item == 'boolean') {
                    temp.push(item);
                } else {
                    temp.push(item.value);
                }
            }
            let idx = 0;
            for (let name of names) {
                let val = temp[idx] || null;
                if (val != null && Helper.has(field.value, val)) {
                    vals[name] = 1;
                }
                else {
                    vals[name] = 0;
                }
                idx++;
            }
            return;
        }
        if (!Beacon.isArray(field.value)) {
            vals[field.name] = '';
        } else {
            vals[field.name] = JSON.stringify(field.value);
        }
    }

    public init(field: Field, vals: {[key: string]: any;}) {

        if (field['bitComp']) {
            let value = Beacon.toInt(vals[field.name], 0);
            let tvals = [];
            let options = field['options'] || [];
            let temp = [];
            for (let item of options) {
                if (typeof item == 'string' || typeof item == 'number' || typeof item == 'boolean') {
                    temp.push(item);
                } else {
                    temp.push(item.value);
                }
            }
            for (let item of temp) {
                if (!/^\d+$/.test(item)) {
                    continue;
                }
                item = parseInt(item);
                let val = value & item;
                if (val > 0) {
                    tvals.push(item);
                }
            }
            field.value = tvals;
            return;
        }
        if (field['names']) {
            let tvals = [];
            let names = field['names'];
            let options = field['options'] || [];
            let temp = [];
            for (let item of options) {
                if (typeof item == 'string' || typeof item == 'number' || typeof item == 'boolean') {
                    temp.push(item);
                } else {
                    temp.push(item.value);
                }
            }
            let idx = 0;
            for (let name of names) {
                let val = temp[idx] || null;
                if (val === null) {
                    idx++;
                    continue;
                }
                if (vals[name] && vals[name] == 1) {
                    tvals.push(val);
                }
                idx++;
            }
            field.value = tvals;
            return;
        }
        let val = vals[field.name];
        if (val != '' && /^\[.*\]$/.test(val)) {
            try {
                field.value = JSON.parse(val);
            } catch (e) {
                field.value = null;
            }
        } else {
            field.value = null;
        }
        return;
    }

}