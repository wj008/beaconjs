// JavaScript Document
var Timer = null;

var newpage = function (url, title) {
    new PageObject(url, title);
};

var PageObject = function (url, title) {
    var that = this, tag, frame, lable;
    this.url = url;
    this.title = title;
    //更新宽度==
    var update = function () {
        var items = $('#movebar a');
        var barwidth = 0;
        items.each(function (index, element) {
            barwidth += $(element).outerWidth(true);
        });
        //预留300
        barwidth += 500;
        $('#movebar').width(barwidth);
    };
    var setLast = function () {
        var scrollLeft = $('#movebar').width() - $('#pbar').width() - 490;
        if (scrollLeft > 0) {
            $('#pbar').scrollLeft(scrollLeft);
        }
    };

    var meun = null;
    //创建==
    var create = (function () {
        var items = $('#movebar a');
        items.removeClass('idx');
        tag = $('<a href="#" class="idx tag"><span class="text">正在打开...</span><b></b></a>').appendTo('#movebar');
        update();
        setLast();
        lable = tag.find('.text');
        tag[0].mypage = that;
        tag.on('click', function () {
            that.show();
            return false;
        });
        tag.on('mouseup', function (ev) {
            ev.stopPropagation();
            return false;
        });
        var yesdomain = false;

        tag.on('contextmenu', function (ev) {
            if (meun) {
                meun.remove();
            }
            meun = $('<div class="contextmenu">\
            <a class="opentag" href="javascript:;">新标签打开</a>\
            <a target="_blank" href="' + that.url + '">在浏览器标签打开</a>\
            <a class="reload"  href="javascript:;">重新加载(原连接)</a>\
            <hr/>\
            <a class="close_left" href="javascript:;">关闭左侧所有标签</a>\
            <a class="close_right" href="javascript:;">关闭右侧所有标签</a>\
            <a class="close_other" href="javascript:;">关闭其他标签</a>\
            <a class="close_self" href="javascript:;">关闭当前标签</a>\
            </div>').data('tag', tag).appendTo(document.body);

            if (yesdomain) {
                var relc = $('<a href="javascript:;">重新加载(当前页)</a>').insertBefore(meun.find('a.reload'));
                relc.one('click', function () {
                    var mtag = meun.data('tag');
                    if (mtag[0].mypage) {
                        mtag[0].mypage.reload(true);
                    }
                    meun.remove();
                    return false;
                });
            }

            meun.find('a.close_left').one('click', function () {
                var mtag = meun.data('tag');
                var seltags = mtag.prevAll('a.tag');
                seltags.each(function (idx, elem) {
                    if (elem.mypage) {
                        elem.mypage.remove();
                    }
                });
                meun.remove();
                return false;
            });

            meun.find('a.close_right').one('click', function () {
                var mtag = meun.data('tag');
                var seltags = mtag.nextAll('a.tag');
                seltags.each(function (idx, elem) {
                    if (elem.mypage) {
                        elem.mypage.remove();
                    }
                });
                meun.remove();
                return false;
            });

            meun.find('a.close_other').one('click', function () {
                var mtag = meun.data('tag');
                var seltags1 = mtag.prevAll('a.tag');
                seltags1.each(function (idx, elem) {
                    if (elem.mypage) {
                        elem.mypage.remove();
                    }
                });
                var seltags2 = mtag.nextAll('a.tag');
                seltags2.each(function (idx, elem) {
                    if (elem.mypage) {
                        elem.mypage.remove();
                    }
                });
                meun.remove();
                return false;
            });

            meun.find('a.close_self').one('click', function () {
                var mtag = meun.data('tag');
                if (mtag[0].mypage) {
                    mtag[0].mypage.remove();
                }
                meun.remove();
                return false;
            });

            meun.find('a.reload').one('click', function () {
                var mtag = meun.data('tag');
                if (mtag[0].mypage) {
                    mtag[0].mypage.reload();
                }
                meun.remove();
                return false;
            });

            meun.find('a.opentag').one('click', function () {
                var mtag = meun.data('tag');
                if (mtag[0].mypage) {
                    newpage(mtag[0].mypage.url, mtag[0].mypage.title);
                }
                meun.remove();
                return false;
            });

            meun.css({top: ev.clientY + 'px', left: ev.clientX + 'px'});
            meun.on('mouseup', function (ev) {
                ev.stopPropagation();
                return false;
            });
            $(document).one('mouseup', function () {
                meun.remove();
            });
            $(window).one('blur', function () {
                meun.remove();
            });
            return false;
        });

        tag.find('b').click(function () {
            that.remove();
            return false;
        });
        $('#rcontent iframe').hide();
        frame = $('<iframe scrolling="auto" frameborder="0" width="100%" height="100%"></iframe>').appendTo('#rcontent');
        frame.load(function () {
            try {
                var doc = this.contentWindow.document;
                yesdomain = true;
                lable.text(doc.title);
            } catch (e) {
                yesdomain = false;
                lable.text(title);
            }
            frame.show();
            update();
        });
        frame.attr('src', url);
    })();

    this.show = function () {
        $('#movebar a').removeClass('idx');
        $('#rcontent iframe').hide();
        tag.addClass('idx');
        frame.show();
    };

    this.reload = function (cq) {
        $('#movebar a').removeClass('idx');
        $('#rcontent iframe').hide();
        tag.addClass('idx');
        if (cq) {
            try {
                frame[0].contentWindow.location.reload();
            } catch (e) {
                frame[0].src = frame[0].src;
            }
        } else {
            frame[0].src = frame[0].src;
        }
    };

    this.remove = function () {
        frame.remove();
        if (tag.mypage != null) {
            delete(tag.mypage);
            tag.mypage = null;
        }
        if (tag.is('.idx')) {
            var ptag = tag.prev('a');
            if (ptag.length > 0 && typeof (ptag[0].mypage) != 'undefined') {
                ptag[0].mypage.show();
            } else {
                ptag = tag.next('a');
                if (ptag.length > 0 && typeof (ptag[0].mypage) != 'undefined') {
                    ptag[0].mypage.show();
                }
            }
        }
        tag.remove();
        var iframes = $('#rcontent iframe');
        if (iframes.length == 1) {
            iframes.show();
        }
        update();
    };
};



$(function () {
    var tOnePage = false;
    var tempOnePage = OnePage || '';
    tempOnePage = tempOnePage.toLowerCase();
    if (tempOnePage.toLowerCase() == 'on' || tempOnePage.toLowerCase() == 'yes' || tempOnePage.toLowerCase() == '1' || tempOnePage.toLowerCase() == 'true') {
        tOnePage = true;
    }
    window.onresize = function () {
        var h = document.body.clientHeight - document.getElementById("header").offsetHeight;
        document.getElementById("content").style.height = (h < 100 ? 100 : h) + 'px';
        h = h - document.getElementById("pagebar").offsetHeight;
        document.getElementById("rcontent").style.height = (h < 100 ? 100 : h) + 'px';
        if (!tOnePage) {
            document.getElementById("pbar").style.width = (document.getElementById("pagebar").offsetWidth - document.getElementById("pbtns").offsetWidth - 10) + 'px';
        }
    };
    window.onresize();
    var show_btn = $('#bardiv').click(function () {
        if ($(this).is('.hide')) {
            $(this).removeClass('hide');
            $('#left').show();
            $('#right').removeClass('big');
        } else {
            $(this).addClass('hide');
            $('#left').hide();
            $('#right').addClass('big');
        }
        var tempOnePage = OnePage || '';
        tempOnePage = tempOnePage.toLowerCase();
        if (!tOnePage) {
            document.getElementById("pbar").style.width = (document.getElementById("pagebar").offsetWidth - document.getElementById("pbtns").offsetWidth - 10) + 'px';
        }

    });
    show_btn.css('opacity', 0);
    show_btn.mouseenter(function (e) {
        $(this).css('opacity', 0.5);
    });
    show_btn.mouseleave(function (e) {
        $(this).css('opacity', 0);
    });

    var atops = $('#mainmune li');
    atops.click(function () {
        atops.removeClass('idx').removeClass('lidx');
        var that = $(this);
        that.addClass('idx');
        that.prev('li').addClass('lidx');
        var url = that.find('a').attr('href');
        if (url.length > 0 && url !== '#') {
            $.get(url, null, function (html) {
                $('#left').html(html);
            });
        }
        return false;
    });
    $('#mainmune li.idx').click();

    $('#left').on('click', 'a[target="Main"]', function () {
        $('#left a[target="Main"]').removeClass('active');
        var that = $(this).addClass('active');
        var url = that.attr('href');
        var text = that.text();
        if (tOnePage) {
            $('#Main').attr('src', url);
        } else {
            var items = $('#movebar a.tag');
            var has = false;
            items.each(function (idx, elem) {
                if (elem.mypage && elem.mypage.url == url) {
                    //elem.mypage.show();
                    elem.mypage.reload(false);
                    has = true;
                    return false;
                }
            });
            has || newpage(url, text);
        }
        return false;
    });

    $('#moveleft').mousedown(function () {
        if (Timer != null) {
            window.clearInterval(Timer);
            Timer = null;
        }
        var bar_area = $('#pbar');
        Timer = window.setInterval(function () {
            var L = bar_area.scrollLeft();
            if (L <= 0)
                return;
            L -= 15;
            L = L < 0 ? 0 : L;
            bar_area.scrollLeft(L);
        }, 20);
        $(document).one('mouseup', function () {
            if (Timer != null) {
                window.clearInterval(Timer);
                Timer = null;
            }
        });
    });

    $('#moveright').mousedown(function () {
        if (Timer != null) {
            window.clearInterval(Timer);
            Timer = null;
        }
        var bar_area = $('#pbar');
        var mL = $('#movebar').width() - bar_area.width() - 490;
        if (mL <= 0)
            return;
        Timer = window.setInterval(function () {
            var L = bar_area.scrollLeft();
            if (L >= mL)
                return;
            L += 15;
            L = L > mL ? mL : L;
            bar_area.scrollLeft(L);
        }, 20);
        $(document).one('mouseup', function () {
            if (Timer != null) {
                window.clearInterval(Timer);
                Timer = null;
            }
        });
    });

    $('#closeall').click(function () {
        if (!confirm("确定要关闭所有标签页面吗？"))
            return;
        $('#movebar a').each(function (index, element) {
            if (typeof (element.mypage) != 'undefined') {
                element.mypage.remove();
            }
        });
    });

    $('#left').on('click', 'dt', function () {
        var icon = $(this).find('i');
        if (icon.is('.folder-open')) {
            icon.removeClass('folder-open').addClass('folder-close');
            $(this).siblings('dd').hide();
            $(this).parent('dl').css('padding-bottom', '0px');
            $(this).removeClass('item_open').addClass('item_close');
        } else {
            icon.removeClass('folder-close').addClass('folder-open');
            $(this).siblings('dd').show();
            $(this).parent('dl').css('padding-bottom', '5px');
            $(this).removeClass('item_close').addClass('item_open');
        }
    });
});