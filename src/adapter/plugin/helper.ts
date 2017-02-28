import utils=require('sdopx/lib/utils');
declare var Beacon: any;
export class Helper {
    public static explodeAttr(box_attr, attr) {
        for (let key in attr) {
            let val = attr[key];
            if (val === null || val === '') {
                continue;
            }
            box_attr.push(key + '="' + utils.escapeXml(val) + '"');
        }
    }

    public static explodeData(box_attr, data) {
        if (!Beacon.isEmpty(data)) {
            for (let key in data) {
                let val = data[key];
                if (val === null || val === '') {
                    continue;
                }
                if (Beacon.isObject(val)) {
                    box_attr.push('data-' + key + '="' + utils.escapeXml(JSON.stringify(val)) + '"');
                } else {
                    if (String(val).length == 0) {
                        continue;
                    }
                    box_attr.push('data-' + key + '="' + utils.escapeXml(val) + '"');
                }
            }
        }
    }

    public static has(array, find) {
        for (let item of array) {
            if (item == find) {
                return true;
            }
        }
        return false;
    }
}