"use strict";
const sdopx_1 = require("sdopx");
//替换更目录
sdopx_1.Sdopx.registerFilter('pre', function (content, sdopx) {
    if (sdopx.context) {
        let uri = sdopx.context.route('uri', '');
        content = content.replace(/__APPROOT__/g, uri);
    }
    return content;
});
//注册uri 函数
sdopx_1.Sdopx.registerPlugin('uri', function (params, out, sdopx) {
    if (!sdopx.context) {
        return;
    }
    let { url = '', args = {}, app = '', ctl = '', act = '' } = params;
    if (url.length == 0) {
        if (ctl.length == 0) {
            if (act.length == 0) {
                sdopx.addError(`uri: missing 'url','ctl' parameter`);
                return;
            }
            ctl = sdopx.context.route('ctl');
        }
        url = '/' + ctl;
        if (act.length > 0) {
            url += '/' + act;
        }
        out.raw(sdopx.context.url(url, args, app));
        return;
    }
    url = url.substring(1);
    out.raw(sdopx.context.url(url, args, app));
    return;
});
//# sourceMappingURL=sdopx_ext.js.map