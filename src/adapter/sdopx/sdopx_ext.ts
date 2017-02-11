import {Sdopx} from "sdopx";
import {Beacon} from "../../core/beacon";
import impurl = require('url');
//Sdopx.create_runfile=true;
//替换更目录
Sdopx.registerFilter('pre', function (content: string, sdopx: Sdopx) {
    if (sdopx.context) {
        let uri = sdopx.context.route('uri', '');
        content = content.replace(/__APPROOT__/g, uri);
    }
    return content;
});

//替换资源
Sdopx.registerFilter('output', function (content: string, sdopx: Sdopx) {
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
            if (html.length == 0) {
                return content;
            }
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
Sdopx.registerPlugin('uri', function (params, out, sdopx) {
    if (!sdopx.context) {
        return;
    }
    let {url = '', args = {}, app = '', ctl = '', act = ''}=params;
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
Sdopx.registerPlugin('asset', function (params, out, sdopx) {
    if (!sdopx.context) {
        return;
    }
    if (sdopx.context._asset == null) {
        out.raw('<!--#asset#-->');
        sdopx.context._asset = {};
    }
    if (!params.src && typeof(params.src) != 'string') {
        return;
    }
    let name = params.src;
    let depend = params.depend || null;
    if (depend) {
        sdopx.context.addAsset(name, depend);
    } else {
        sdopx.context.addAsset(name);
    }
});

//注册资源引用
Sdopx.registerPlugin('pagebar', function (params, out, sdopx) {
    if (!sdopx.context) {
        return;
    }
    let config = Beacon.getConfig('pagebar:*') || {};
    if (params.data === void 0 || !Beacon.isObject(params.data)) {
        sdopx.addError(`pagebar: missing 'data' parameter`);
        return;
    }
    config = Object.assign({
        info: '共有信息：#count#  页次：#page#/#page_count# 每页 #page_size#',
        show_info: 1,
        show_first: 1,
        show_last: 1,
        show_prev: 1,
        show_next: 1,
        show_nbpage: 1,
        show_input: 1,
        nbpage_size: 10,
        first: '首页',
        last: '尾页',
        prev: '上页',
        next: '下页',
        link: '',
        keyname: 'page',
    }, config, params);
    let data = params.data;
    let pagelink = (function () {
        let link = config.link || data.query;
        let items = [];
        let urlInfo = impurl.parse(link, true, true);
        urlInfo.query[config.keyname] = '#page#';
        for (let key in urlInfo.query) {
            if (key == config.keyname) {
                items.push(key + '=' + urlInfo.query[key]);
            } else {
                items.push(key + '=' + encodeURIComponent(urlInfo.query[key]));
            }
        }
        return '?' + items.join('&');
    })();
    let maxpage = parseInt(data.page_count || 0);
    let page = parseInt(data.page || 1);
    let html = [];
    //第一页
    if (config.show_first == 1 || config.show_first == 3) {
        html.push(`<a class="first" href="${pagelink.replace(/#page#/, '1')}">${config.first}</a>`);
    }
    //上页
    if (config.show_prev == 2) {
        let p_page = page - 1;
        if (p_page < 1) {
            html.push(`<a class="prev disabled" href="javascript:;">${config.prev}</a>`);
        } else {
            html.push(`<a class="prev" href="${pagelink.replace(/#page#/, String(p_page))}">${config.prev}</a>`);
        }
    } else if (config.show_prev == 1) {
        if (page > 1) {
            let p_page = page - 1;
            html.push(`<a class="prev" href="${pagelink.replace(/#page#/, String(p_page))}">${config.prev}</a>`);
        }
    }

    if (config.show_nbpage == 1) {
        let size = config.nbpage_size;
        let inc = Math.round(size / 2);
        let start = (maxpage < size || page <= inc) ? 1 : (page + inc > maxpage ? maxpage - (size - 1) : page - (inc - 1));
        let temp = start + (size - 1);
        let temp2 = temp > maxpage ? maxpage : temp;
        let end = (page + inc > maxpage) ? maxpage : temp2;
        if (config.show_first == 2 || config.show_first == 3) {
            if (start > 1) {
                html.push(`<a href="${pagelink.replace(/#page#/, '1')}">1</a><span class="break">...</span>`);
            }
        }
        for (let i = start; i <= end; i++) {
            let p_page = i;
            if (p_page == page) {
                html.push(`<b>${p_page}</b>`);
            } else {
                html.push(`<a href="${pagelink.replace(/#page#/, String(p_page))}">${p_page}</a>`);
            }
        }
        if (config.show_last == 2 || config.show_last == 3) {
            if (start > 1) {
                html.push(`<span class="break">...</span><a href="${pagelink.replace(/#page#/, String(maxpage))}">${maxpage}</a>`);
            }
        }
    }

    //显示下一页
    if (config.show_next == 2) {
        let p_page = page + 1;
        if (p_page > maxpage) {
            html.push(`<a class="next disabled" href="javascript:;">${config.next}</a>`);
        } else {
            html.push(`<a class="next" href="${pagelink.replace(/#page#/, String(p_page))}">${config.next}</a>`);
        }
    } else if (config.show_next == 1) {
        if (page < maxpage) {
            let p_page = page + 1;
            html.push(`<a class="next" href="${pagelink.replace(/#page#/, String(p_page))}">${config.next}</a>`);
        }
    }
    if (config.show_last == 1 || config.show_last == 3) {
        html.push(`<a class="last" href="${pagelink.replace(/#page#/, String(maxpage))}">${config.last}</a>`);
    }
    let ctext = '';
    if (config.show_info == 1) {
        let code = config.info.replace(/#count#/g, data.records_count);
        code = code.replace(/#page#/g, data.page);
        code = code.replace(/#page_count#/g, data.page_count);
        code = code.replace(/#max_page#/g, data.page_count);
        code = code.replace(/#page_size#/g, data.page_size);
        ctext = `<div class="pagebar_info">${code}</div>`;
    }

    if (config.show_input == 1) {
        sdopx.context.addAsset('jquery');
        let id = Beacon.uuid(10);
        html.push(`<input id="${id}" type="text" class="inp" value="${page}"/><a class="gopage" data-url="${pagelink.replace('#page#', '#gopage#')}" href="javascript:;">GO</a>`);
        html.push("<script>$('#" + id + "').on('keyup',function(e){if(e.keyCode==13){ var t=$(this).next().click();window.location.href=t.attr('href');}}).next()" +
            ".on('click',function(){var t=$(this),v=t.prev().val()||1;t.attr('href',(t.data('url')||'').replace('#gopage#',/^\\d+$/.test(v)?v:1));return !0;});</script>");
    }
    let outhtml = `<div class="pagebar">${html.join("\n")}</div>` + ctext;
    out.raw(outhtml);

});