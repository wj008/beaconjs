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
//替换资源
sdopx_1.Sdopx.registerFilter('output', function (content, sdopx) {
    if (sdopx.context) {
        let html = [];
        let asset = sdopx.context.getAsset();
        asset.css.forEach(function (item) {
            html.push(`<link rel="stylesheet" type="text/css" href="${item}" />`);
        });
        asset.js.forEach(function (item) {
            html.push(`<script type="text/javascript" src="${item}"></script>`);
        });
        if (/<!--#asset#-->/.test(content)) {
            content = content.replace(/<!--#asset#-->/, html.join("\n"));
        }
        else if (/(<\/head>)/i.test(content)) {
            content = content.replace(/<\/head>/i, function ($0) {
                return html.join("\n") + "\n" + $0;
            });
        }
        else {
            content += html.join("\n");
        }
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
//注册资源引用
sdopx_1.Sdopx.registerPlugin('asset', function (params, out, sdopx) {
    if (!sdopx.context) {
        return;
    }
    if (sdopx.context._asset == null) {
        out.raw('<!--#asset#-->');
    }
    if (!params.src && typeof (params.src) != 'string') {
        return;
    }
    let name = params.src;
    let depend = params.depend || null;
    if (depend) {
        sdopx.context.addAsset(name, depend);
    }
    else {
        sdopx.context.addAsset(name);
    }
});
//# sourceMappingURL=sdopx_ext.js.map