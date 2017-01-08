/* 
 * 本程序由海口尚来网络科技有限公司独立开发，未经允许不可用于其他商业用途
 * 作者：wj008 邮箱:26069680@qq.com  官方网站：www.web0898.com   * 
 */
(function ($) {
    function RGB(r, g, b) {
        this.r = Math.max(Math.min(r, 255), 0);
        this.g = Math.max(Math.min(g, 255), 0);
        this.b = Math.max(Math.min(b, 255), 0);
        this.toString = function () {
            var hex = "#";
            var keys = ['r', 'g', 'b'];
            for (var c in keys) {
                var h = this[keys[c]].toString(16).toUpperCase();
                if (h.length == 1) {
                    hex += "0" + h;
                } else {
                    hex += h;
                }
            }
            return hex;
        };
    }
    function ColorSelecter(elem, options) {
        var qem = $(elem);
        var button = $('<a class="sdopx-color-selecter" href="#"></a>').insertBefore(qem);
        var val = qem.val();
        var sideLength = options.side || 6;
        function generateBlockcornerColor(r) {
            var a = new Array(2);
            a[0] = [new RGB(r, 0, 0), new RGB(r, 255, 0)];
            a[1] = [new RGB(r, 0, 255), new RGB(r, 255, 255)];
            return a;
        }
        function gradientColor(startColor, endColor) {
            var gradientArray = [];
            gradientArray[0] = startColor;
            gradientArray[sideLength - 1] = endColor;
            var averageR = Math.round((endColor.r - startColor.r) / sideLength);
            var averageG = Math.round((endColor.g - startColor.g) / sideLength);
            var averageB = Math.round((endColor.b - startColor.b) / sideLength);
            for (var i = 1; i < sideLength - 1; i++) {
                gradientArray[i] = new RGB(startColor.r + i * averageR, startColor.g + i * averageG, startColor.b + i * averageB);
            }
            return gradientArray;
        }
        this.getAllColorArray = function () {
            var allColorArray = new Array(sideLength * 3 + 2);
            //计算第一列的数组
            var mixColorArray = [];
            var blackWhiteGradientArray = gradientColor(new RGB(0, 0, 0), new RGB(255, 255, 255));
            for (var i = 0; i < blackWhiteGradientArray.length; i++) {
                mixColorArray[i] = blackWhiteGradientArray[i];
            }
            var baseArray = [new RGB(255, 0, 0), new RGB(0, 255, 0), new RGB(0, 0, 255), new RGB(255, 255, 0), new RGB(0, 255, 255), new RGB(255, 0, 255), new RGB(204, 255, 0), new RGB(153, 0, 255), new RGB(102, 255, 255), new RGB(51, 0, 0), new RGB(240, 0, 0), new RGB(0, 0, 240), new RGB(0, 240, 0), new RGB(240, 240, 0), new RGB(0, 240, 240), new RGB(240, 0, 240), new RGB(220, 220, 220), new RGB(230, 230, 230), new RGB(240, 240, 240), new RGB(247, 247, 247)];
            mixColorArray = mixColorArray.concat(baseArray.slice(0, sideLength));
            allColorArray[0] = mixColorArray;
            //计算第二列的数组
            var blackArray = new Array(sideLength * 2);
            for (var i = 0; i < blackArray.length; i++) {
                blackArray[i] = new RGB(0, 0, 0);
            }
            allColorArray[1] = blackArray;

            //计算六个区域的数组
            var cornerColorArray = new Array();//六个元素，每个元素放6个区域的四角颜色二维数组
            cornerColorArray.push(generateBlockcornerColor(0), generateBlockcornerColor(51), generateBlockcornerColor(102), generateBlockcornerColor(153), generateBlockcornerColor(204), generateBlockcornerColor(255));
            var count = 0;
            var halfOfAllArray1 = [];
            var halfOfAllArray2 = [];
            for (var i = 0; i < cornerColorArray.length; i++) {
                var startArray = gradientColor(cornerColorArray[i][0][0], cornerColorArray[i][0][1]);
                var endArray = gradientColor(cornerColorArray[i][1][0], cornerColorArray[i][1][1]);
                for (var j = 0; j < sideLength; j++) {
                    if (i < 3) {
                        halfOfAllArray1[count] = gradientColor(startArray[j], endArray[j]);
                    } else {
                        halfOfAllArray2[count - sideLength * 3] = gradientColor(startArray[j], endArray[j]);

                    }
                    count++;
                }
            }
            for (var i = 0; i < halfOfAllArray1.length; i++) {
                allColorArray[i + 2] = halfOfAllArray1[i].concat(halfOfAllArray2[i]);
            }
            //将数组里所有的RGB颜色转换成Hex形式
            for (var i = 0; i < allColorArray.length; i++) {
                for (var j = 0; j < allColorArray[i].length; j++) {
                    allColorArray[i][j] = allColorArray[i][j].toString();
                }
            }
            return allColorArray;
        };
        var colors = this.getAllColorArray();
        if (val !== '') {
            button.css('background-color', val);
        }
        var ColorMeun = $('<div  class="sdopx-color-meun"></div>').hide().appendTo(button);
        var dlgwidth = (3 * sideLength + 2) * 11 + 12;
        var dlgheigth = (2 * sideLength) * 11 + 30;
        ColorMeun.css({width: dlgwidth, height: dlgheigth});
        var MeunTop = $('<ul class="sdopx-color-head">\n\
<li><div></div></li>\n\
<li><input type="text" size="7" maxlength="7" value="#000000"/></li>\n\
<li><span>清除色值</span></li>\n\
</ul>').appendTo(ColorMeun);

        MeunTop.find('span').click(function (ev) {
            button.css('background-color', '');
            qem.val('');
            ColorMeun.hide();
            ev.preventDefault();
            return false;
        });

        var sel = MeunTop.find('div');
        var box = MeunTop.find('input');
        var inbox = false;
        box.on('mouseout', function (ev) {
            inbox = false;
            button.focus();
        }).on('keyup keypress', function () {
            if (/#[0-9a-fA-F]{6}/.test(this.value)) {
                val = this.value;
                qem.val(val);
                sel.css('background-color', val);
                button.css('background-color', val);
            }
        }).on('focus', function () {
            inbox = true;
        });
        sel.css('background-color', val);
        box.val(val);
        var MeunBody = $('<div class="sdopx-color-body"></div>').appendTo(ColorMeun);
        for (var i = 0; i < colors.length; i++) {
            var row = $('<ul></ul>').appendTo(MeunBody);
            for (var j = 0; j < colors[0].length; j++) {
                var clval = colors[i][j].toString();
                $('<li></li>').css('background-color', clval).data('color', clval).on('click', function (ev) {
                    var cl = $(this).data('color');
                    button.css('background-color', cl);
                    val = cl;
                    qem.val(cl);
                    ColorMeun.fadeOut();
                    ev.preventDefault();
                    return false;
                }).hover(function () {
                    var cl = $(this).addClass('on').data('color');
                    sel.css('background-color', cl);
                    box.val(cl);
                }, function () {
                    $(this).removeClass('on');
                }).appendTo(row);
            }
        }
        MeunBody.on('mouseout', function () {
            sel.css('background-color', val);
            box.val(val);
        });
        button.on('click', function (ev) {
            ColorMeun.fadeIn();
            ev.preventDefault();
            button.focus();
            return false;
        });
        ColorMeun.on('click', function (ev) {
            ev.preventDefault();
            return false;
        });
        button.on('blur', function () {
            window.setTimeout(function () {
                if (inbox) {
                    return;
                }
                ColorMeun.fadeOut();
            }, 100);
        });
    }
    $.sdopx_widget('color', ColorSelecter, 'input.form-control.color:not(.notinit)');
})(jQuery);