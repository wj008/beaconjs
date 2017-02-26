/* 
 * 本程序由海口尚来网络科技有限公司独立开发，未经允许不可用于其他商业用途
 * 作者：wj008 邮箱:26069680@qq.com  官方网站：www.web0898.com   * 
 */
(function ($) {
    function imgShower(element) {
        var qem = $(element);
        var show_btn = qem.data('show-btn') || 0;
        var btn = $('<a class="sdopx-btn" href="javascript:;" style="margin-left:5px;">查看</a>').insertAfter(qem);
        if (show_btn == 0) {
            btn.hide();
        }
        var show_type = qem.data('show-type') || 0;
        var show_maxwidth = qem.data('show-maxwidth') || 400;
        var show_maxheight = qem.data('show-maxheight') || 300;
        var auto_show = qem.data('auto-show') || 0;
        var shower = null;
        var show = function (url) {
            var re = new RegExp('^.*\.(jpeg|jpg|png|gif|bmp)$', 'ig');
            if (!re.exec(url)) {
                return;
            }
            var img = $('<img/>');
            img.on('load', function () {
                var oldwidth = this.width;
                var oldheight = this.height;
                var width = oldwidth;
                var height = oldheight;
                if (oldwidth > show_maxwidth) {
                    var pt = show_maxwidth / oldwidth;//高比宽
                    oldwidth = width = show_maxwidth;
                    oldheight = height = oldheight * pt;
                }
                if (oldheight > show_maxheight) {
                    var pt = show_maxheight / oldheight;//宽比高
                    height = show_maxheight;
                    width = oldwidth * pt;
                }
                if (shower != null) {
                    shower.remove();
                    shower = null;
                }
                $(this).css({width: width + 'px', height: height + 'px'});
                if (show_type == 0) {
                    shower = $('<div title="查看图片" style="text-align:center"></div>');
                    shower.appendTo(qem.parent());
                    shower.css({'background-color': '#F7F7F7', 'border': 'solid 1px #DDD', 'padding': '10px', 'margin-top': '2px', width: width + 'px', height: height + 'px'});
                    shower.append(img);
                } else if (show_type == 1) {
                    shower = $('<div title="查看图片" style="text-align:center"></div>');
                    shower.prependTo(qem.parent());
                    shower.css({'background-color': '#F7F7F7', 'border': 'solid 1px #DDD', 'padding': '10px', 'margin-top': '2px', width: width + 'px', height: height + 'px'});
                    shower.append(img);

                } else {
                    shower = $('<div  title="查看图片" style="text-align:center"></div>');
                    shower.append(img);
                    shower.css({'padding': '2px', 'margin': '0px'});
                    shower.appendTo(document.body);
                    shower.dialog({
                        autoOpen: true,
                        position: {
                            my: "left top",
                            at: "left bottom+1",
                            of: qem
                        },
                        //   position: [offset.left, offset.top],
                        draggable: false, resizable: false,
                        width: width + 10,
                        height: height + 50,
                        modal: false,
                        close: function () {
                            shower.remove();
                            shower = null;
                        }
                    });
                }
            });
            img.attr('src', url);
        };
        btn.click(function () {
            var url = qem.val();
            show(url);
            return false;
        });
        if (auto_show == 1) {
            var url = qem.val();
            if (url != '') {
                show(url);
            }
        }
        qem.on('initUpfile', function (ev, data) {
            if (show_type == 0) {
                show(data.oldval);
            }
        });
        qem.on('afterUpfile', function (ev, data) {
            if (data && (data.err == '' || data.state == 'SUCCESS')) {
                show(data.msg.url);
            }
        });
        qem.on('emptyUpfile', function (ev) {
            if (shower) {
                shower.remove();
            }
        });
    }
    $.sdopx_widget('imgshower', imgShower, 'input.form-control.imgshower:not(.notinit)');
})(jQuery);