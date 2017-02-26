import utils=require('sdopx/lib/utils');
declare var Beacon: any;
export class Helper {
    public static explodeAttr(box_attr, temp) {
        for (let key in temp) {
            let val = temp[key];
            if (val !== '') {
                box_attr.push(key + '="' + utils.escapeXml(val) + '"');
            }
        }
    }

    public static explodeData(box_attr, temp) {
        if (!Beacon.isEmpty(temp)) {
            for (let key in temp) {
                let val = temp[key];
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
}