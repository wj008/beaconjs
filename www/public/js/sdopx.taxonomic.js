(function($) {
    $.taxonomic = function(listurl, cookiename) {
        if (!cookiename) {
            cookiename = window.location.pathname.replace(/[\/\.]/g, '_');
        }
        var cdata = [];
        var showcookie = true;
        var codes = [];
        var appCode = function(items) {
            for (var i in items) {
                var key = items[i].id;
                var code = items[i].code;
                codes['p' + key] = code;
            }
        };
        var initCodes = function(func) {
            $.get(listurl + '?ids=' + cdata.join('.'), function(rt) {
                appCode(rt);
                func();
            }, 'json');
        };
        var getCode = function(id, func) {
            if (codes['p' + id]) {
                func(codes['p' + id]);
                return;
            }
            else {
                $.get(listurl + '?ids=' + id, function(rt) {
                    appCode(rt);
                    if (codes['p' + id]) {
                        func(codes['p' + id]);
                        return;
                    }
                }, 'json');
            }
        };
        var addcookie = function(pid) {
            var temp = [];
            for (var i = 0; i < cdata.length; i++) {
                if (pid != cdata[i]) {
                    temp.push(cdata[i]);
                }
            }
            temp.push(pid);
            cdata = temp;
            $.cookie(cookiename, cdata.join('.'));
        };
        var delcookie = function(pid) {
            var temp = [];
            for (var i = 0; i < cdata.length; i++) {
                if (pid != cdata[i]) {
                    temp.push(cdata[i]);
                }
            }
            cdata = temp;
            $.cookie(cookiename, cdata.join('.'));
        };
        var update_state = function(tr) {
            var pid = tr.attr('pid');
            for (var i = 0; i < cdata.length; i++) {
                if (pid == cdata[i]) {
                    tr.data('state', 1);
                }
            }
        };
        var showpid = function(pid) {
            var tr = $('tr[pid=' + pid + ']');
            var tbody = $('tr[trpid=' + pid + ']');
            if (tbody.length == 0) {
                getCode(pid, function(rt) {
                    var trs = $('<table>' + rt + '</table>').find('tr');
                    trs.insertAfter(tr);
                    trs.each(function() {
                        var xtr = $(this);
                        xtr.attr('class', tr.attr('class'));
                        xtr.addClass('trpid' + pid);
                        xtr.attr('trpid', pid);
                        if (showcookie) {
                            update_state(xtr);
                            if (xtr.data('state') == 1) {
                                var xpid = xtr.attr('pid');
                                showpid(xpid);
                            }
                        }
                    });
                });
            }
            else {
                tbody.show();
                tbody.each(function() {
                    var em = $(this);
                    if (em.data('state') == 1) {
                        var xpid = em.attr('pid');
                        showpid(xpid);
                    }
                });
            }
            tr.data('state', 1);
            addcookie(pid);
            var img = $('img[pid=' + pid + ']');
            img.attr('src', img.attr('hide'));
        };
        var hidepid = function(pid) {
            var trs = $('tr.trpid' + pid).hide();
            var img = $('img[pid=' + pid + ']');
            img.attr('src', img.attr('show'));
            trs.each(function(idx, elem) {
                var xpid = $(elem).attr('pid');
                var ximg = $('img[pid=' + xpid + ']');
                ximg.attr('src', ximg.attr('show'));
            });
            $('tr[pid=' + pid + ']').data('state', 0);
            delcookie(pid);
        };
        $(document).delegate('img[pid]', 'click', function() {
            //showcookie = false;
            var pid = $(this).attr('pid');
            var show = $('tr[pid=' + pid + ']').data('state') || 0;
            if (show == 1) {
                hidepid(pid);
            }
            else {
                showpid(pid);
            }
        });
        var sdata = $.cookie(cookiename);
        if (sdata) {
            var load = false;
            cdata = sdata.split('.');
            initCodes(function() {
                $('tr[pid]').each(function(idx, elem) {
                    var xtr = $(elem);
                    update_state(xtr);
                    if (xtr.data('state') == 1) {
                        var xpid = xtr.attr('pid');
                        showpid(xpid);
                        load = true;
                    }
                });
                if (!load) {
                    cdata = [];
                    $.cookie(cookiename, cdata.join('.'));
                }
            });
        }
    };
})(jQuery);




