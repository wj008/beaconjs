(function ($) {
    var FrameIndex = 0;
    var qalert = function (str) {
        if (typeof ($.alert) === 'function') {
            $.alert(str);
        } else {
            alert(str);
        }
    };

    function strToData(str) {
        if (str == "false") {
            return null;
        }
        var jsonstr = $.trim(str);
        if (jsonstr !== '') {
            try {
                var data = $.parseJSON(jsonstr);
                return data;
            } catch (ex) {
                // alert(str);
                alert('返回数据格式不符，请检查上传提交的页面 是否正确！');
                return null;
            }
        }
        return null;
    }

    //获取文件信息
    function getFileInfo(filebox) {
        if (typeof (FormData) !== 'undefined' && filebox.is('[multiple=multiple]')) {
            var datas = [];
            var files = filebox[0].files;
            for (var i = 0; i < files.length; i++) {
                var ofile = files[i];
                var path = ofile.name.toString();
                var filesize = ofile.size;
                var extension = path.lastIndexOf('.') === -1 ? '' : path.substr(path.lastIndexOf('.') + 1, path.length).toLowerCase();
                datas.push({filename: path, filesize: filesize, extension: extension});
            }
            return datas;

        } else if (/msie/.test(navigator.userAgent.toLowerCase())) {
            var path = filebox.val();
            var extension = path.lastIndexOf('.') === -1 ? '' : path.substr(path.lastIndexOf('.') + 1, path.length).toLowerCase();
            var obj_img = new Image();
            obj_img.dynsrc = filebox[0].value;
            var filesize = obj_img.fileSize;
            return [{filename: path, filesize: filesize, extension: extension}];
        }
        return [];
    }
    //创建上传表单
    function FrameUpload(qem, upbtn, keyname, upurl, extensions, bindData, multiple, callback) {
        FrameIndex++;
        var frame_name = 'sdopx_upload_frame_' + FrameIndex;
        var form = $('<form action="' + upurl + '" target="' + frame_name + '" method="post" enctype="multipart/form-data"></form>').appendTo(document.body);
        var iframe = $('<iframe name="' + frame_name + '" src="javascript:false;"  width="500" style="position:absolute; top:-550px; left:80px" height="200" id="' + frame_name + '" ></iframe>').appendTo(document.body);
        iframe.load(function () {
            form.trigger('reset');
            var str = this.contentWindow.document.body.innerHTML;
            if (str === 'false') {
                return;
            }
            var data = strToData(str);
            if (data) {
                callback(data);
            }
        });
        var file_layout = $('<div style="overflow:hidden;position:absolute;"></div>');
        file_layout.hide();
        file_layout.css({'opacity': 0, 'background-color': '#06F', 'zIndex': 1000000, 'cursor': 'pointer'});
        file_layout.appendTo(form);
        upbtn.on('mouseenter', function () {
            if (qem.is(':disabled')) {
                return;
            }
            var left = upbtn.offset().left;
            var top = upbtn.offset().top;
            var width = upbtn.outerWidth();
            var height = upbtn.outerHeight();
            file_layout.css({left: left + 'px', top: top + 'px', width: width + 'px', height: height + 'px'}).show();
        });
        file_layout.on('mouseleave', function () {
            $(this).hide();
        });
        //处理输入区域
        var file_area = $('<div></div>').css({'float': 'left', 'margin-left': '-2px', 'margin-top': '-2px'}).appendTo(file_layout);
        $('<input type="hidden" name="UPLOAD_IDENTIFIER"/>').appendTo(file_area);
        if (bindData) {
            for (var key in bindData) {
                $('<input type="hidden"/>').attr('name', key).val(bindData[key]).appendTo(file_area);
            }
        }
        //处理输入项
        var filebox = $('<input type="file" style="cursor:pointer"/>').appendTo(file_area);
        filebox.css({'font-size': '460px', 'margin': '0', 'padding': '0', 'border': '0', 'width': '100px'});
        filebox.attr('name', keyname);
        if (multiple) {
            filebox.attr('multiple', 'multiple');
        }
        //上传
        filebox.on('change', function () {
            var info = getFileInfo(filebox);
            var re = new RegExp("(^|\\s|,)" + info.extension + "($|\\s|,)", "ig");
            if (extensions !== '' && (re.exec(extensions) === null || info.extension === '')) {
                qalert('对不起，只能上传 ' + extensions + ' 类型的文件。');
                form.trigger('reset');
                return false;
            }
            var updo = qem.triggerHandler('beginUpfile', [info]);
            if (updo === false) {
                return;
            }
            form.trigger('submit');
        });
        this.reset = function () {
            if (form !== null) {
                form.trigger('reset');
            }
        };
        this.remove = function () {
            upbtn.off('mouseenter');
            if (filebox !== null) {
                filebox.remove();
                filebox = null;
            }
            if (file_area !== null) {
                file_area.remove();
                file_area = null;
            }
            if (file_layout !== null) {
                file_layout.remove();
                file_layout = null;
            }
            if (form !== null) {
                form.remove();
                form = null;
            }
            if (iframe !== null) {
                iframe.remove();
                iframe = null;
            }
        };
    }
    //使用HTML5上传
    function Html5Upload(qem, upbtn, keyname, upurl, extensions, bindData, multiple, callback) {
        if (typeof (FormData) === 'undefined') {
            alert('浏览器不支持HTML5上传！');
            return;
        }
        var form = $('<form"></form>').hide().appendTo(document.body);
        var filebox = $('<input type="file" style="cursor:pointer"/>').appendTo(form);
        filebox.attr('name', keyname);
        if (multiple) {
            filebox.attr('multiple', 'multiple');
        }
        var Upload = function () {
            var infos = getFileInfo(filebox);
            var total = 0;
            for (var i in infos) {
                var info = infos[i];
                total += info.filesize;
                var re = new RegExp("(^|\\s|,)" + info.extension + "($|\\s|,)", "ig");
                if (extensions !== '' && (re.exec(extensions) === null || info.extension === '')) {
                    qalert('对不起，只能上传 ' + extensions + ' 类型的文件。');
                    form.trigger('reset');
                    return;
                }
            }
            var updo = qem.triggerHandler('beginUpfile', [infos]);
            if (updo === false) {
                return;
            }
            filebox.attr('name', keyname);
            var length = filebox[0].files.length;
            if (multiple) {
                filebox.attr('multiple', 'multiple');
            } else {
                length = 1;
                total = filebox[0].files[0].size;
            }
            var tice = 0;
            var loaded = 0;
            var redata = [];
            var xhr = new XMLHttpRequest();
            xhr.upload.addEventListener("progress", function (evt) {
                qem.triggerHandler('progressUpfile', [{total: evt.total, loaded: loaded + evt.loaded}]);
            }, false);
            xhr.addEventListener("load", function (evt) {
                var data = strToData(evt.target.responseText);
                loaded += filebox[0].files[tice].size;
                tice++;
                redata.push(data);
                if (tice == length) {
                    filebox.val('');
                    var rtdata = {err: '', list: []};
                    $(redata).each(function () {
                        rtdata.err = rtdata.err != '' ? rtdata.err : this.err;
                        if (this.state && !rtdata.state) {
                            rtdata.state = this.state;
                        }
                        if (this.msg) {
                            rtdata.list.push(this.msg);
                            if (!rtdata.msg) {
                                rtdata.msg = this.msg;
                            }
                        }
                    });
                    callback(rtdata);
                } else {
                    uploadOne(filebox[0].files[tice]);
                }
            }, false);
            var uploadOne = function (file) {
                var fd = new FormData();
                if (bindData) {
                    for (var key in bindData) {
                        fd.append(key, bindData[key]);
                    }
                }
                fd.append(keyname, file);
                xhr.open("POST", upurl);
                xhr.send(fd);
            };
            uploadOne(filebox[0].files[0]);
            return;
        };
        //上传
        filebox.on('change', function () {
            Upload();
            return false;
        });
        upbtn.on('click', function () {
            filebox.trigger('click');
            return false;
        });
        this.reset = function () {
            if (form !== null) {
                form.trigger('reset');
            }
        };
        this.remove = function () {
            upbtn.off('click');
            if (filebox !== null) {
                filebox.remove();
                filebox = null;
            }
            if (form !== null) {
                form.remove();
                form = null;
            }
        };
    }
    //大文件Html5上传
    function BigHtml5Upload(qem, upbtn, keyname, upurl, extensions, bindData, multiple, callback) {
        if (typeof (FormData) === 'undefined') {
            alert('浏览器不支持HTML5上传！');
            return;
        }
        var form = $('<form"></form>').hide().appendTo(document.body);
        var filebox = $('<input type="file" style="cursor:pointer"/>').appendTo(form);
        filebox.attr('name', keyname);
        var bigUpfile = function () {
            var info = getFileInfo(filebox)[0];
            var re = new RegExp("(^|\\s|,)" + info.extension + "($|\\s|,)", "ig");
            if (extensions !== '' && (re.exec(extensions) === null || info.extension === '')) {
                qalert('对不起，只能上传 ' + extensions + ' 类型的文件。');
                form.trigger('reset');
                return;
            }
            var updo = qem.triggerHandler('beginUpfile', [info]);
            if (updo === false) {
                return;
            }
            var file = filebox[0].files[0];
            var xhr = new XMLHttpRequest();
            var blobSlice = File.prototype.mozSlice || File.prototype.webkitSlice || File.prototype.slice;
            var chunkSize = 2097152;//2M 拆分
            var total = file.size;
            var loaded = 0;
            var chunks = Math.ceil(total / chunkSize);//总片数
            var currentChunk = 0;
            var partname = '';
            var localname = file.name;
            var sendNext = function () {
                var form = new FormData();
                var start = currentChunk * chunkSize, end = start + chunkSize >= file.size ? file.size : start + chunkSize;
                var packet = blobSlice.call(file, start, end);
                form.append("bigup", "true");       //使用分片
                form.append("partname", partname);  //分片名称
                form.append("localname", localname);
                form.append("total", chunks);       //总片数
                form.append("index", currentChunk); //本次上传片数
                form.append(keyname, packet);
                xhr.open("POST", upurl);
                xhr.send(form);
            };
            xhr.upload.addEventListener("progress", function (evt) {
                qem.triggerHandler('progressUpfile', [{total: total, loaded: loaded + evt.loaded}]);
            }, false);
            xhr.addEventListener("load", function (evt) {
                var str = evt.target.responseText;
                var data = strToData(str);
                if (data) {
                    if (data.state === 'SUCCESS') {
                        currentChunk++;
                        partname = data.msg.partname;
                        if (currentChunk < chunks) {
                            loaded += chunkSize;
                            sendNext();
                        } else {
                            loaded = total;
                            callback(data);
                        }
                    } else {
                        alert(data.err);
                    }
                }
            }, false);
            sendNext();
        };
        //上传
        filebox.on('change', function () {
            bigUpfile();
            return false;
        });
        upbtn.on('click', function () {
            filebox.trigger('click');
            return false;
        });
        this.reset = function () {
            if (form !== null) {
                form.trigger('reset');
            }
        };
        this.remove = function () {
            upbtn.off('click');
            if (filebox !== null) {
                filebox.remove();
                filebox = null;
            }
            if (form !== null) {
                form.remove();
                form = null;
            }
        };
    }

    function UpFile(element, options) {
        var qem = $(element);
        options = options || {};
        options.input = options.input || qem.data('input') || null;
        options.image = options.image || qem.data('image') || null;
        options.upbtn = options.upbtn || qem.data('upbtn') || null;
        options.multiple = !!(options.multiple || qem.data('multiple'));
        options.extensions = options.extensions || qem.data('extensions') || '';//扩展名
        options.mode = options.mode || qem.data('mode') || 'auto';//上传方式 auto frame html5 flash
        options.keyname = options.keyname || qem.data('keyname') || 'filedata'; //上传域名称
        options.upurl = options.upurl || qem.data('upurl') || '/service/upfile.php'; //上传路径
        options['strict-size'] = (!!(options['strict-size'] || qem.data('strict-size'))) ? true : false;
        options['img-width'] = options['img-width'] || qem.data('img-width') || 0;
        options['img-height'] = options['img-height'] || qem.data('img-height') || 0;
        options['btn-text'] = options['btn-text'] || qem.data('btn-text') || '选择文件';
        options['bind-data'] = options['bind-data'] || qem.data('bind-data') || {};
        options['empty-btn'] = options['empty-btn'] || qem.data('empty-btn') || 0;

        //-----------------
        var bindbox = options.input ? $(options.input) : null; //绑定的输入框
        var bindimg = options.image ? $(options.image) : null; //绑定的图片
        var isinput = qem.is('input');
        var reval = isinput ? qem.val() : (bindbox ? bindbox.val() : null);
        if (bindimg && reval) {
            bindimg.attr('src', reval);
        }
        setTimeout(function () {
            qem.triggerHandler('initUpfile', [{oldval: reval}]);//触发上传初始化事件
        }, 10);

        var Uploader = null;
        //严格要求尺寸
        var bindData = options['bind-data'];
        if (options['strict-size']) {
            if (options['img-width'] && options['img-height']) {
                bindData.img_width = options['img-width'];
                bindData.img_height = options['img-height'];
                bindData.strict_size = 1;
            }
        }
        if (options['empty-btn']) {
            var emptybtn = $('<a class="sdopx-btn" href="javascript:;" style="margin-left:5px;">清除</a>').insertAfter(qem);
            emptybtn.on('click', function () {
                if (bindimg) {
                    bindimg.attr('src', '');
                }
                if (isinput) {
                    qem.val('');
                }
                if (bindbox) {
                    bindbox.val('');
                }
                qem.triggerHandler('emptyUpfile');
            });
        }
        var upbtn = null;
        if (options.upbtn) {
            upbtn = $(options.upbtn);
        } else if (isinput) {
            qem.addClass('not-radius-left');
            upbtn = $('<button type="button" class="sdopx-upfile-btn not-radius-right">' + options['btn-text'] + '</button>').insertBefore(qem);
        } else {
            upbtn = qem;
        }

        var uploadComplete = function (data) {
            if (Uploader) {
                Uploader.reset();
            }
            if (data) {
                var r = qem.triggerHandler('afterUpfile', [data]);
                if (r === false) {
                    return;
                }
                if (data.err && data.err !== '') {
                    qalert(data.err);
                    return;
                }
                if (!data.err || data.err === '' || data.state === 'SUCCESS') {
                    if (bindimg) {
                        bindimg.attr('src', data.msg.url);
                    }
                    if (isinput) {
                        qem.val(data.msg.url);
                    }
                    if (bindbox) {
                        bindbox.val(data.msg.url);
                    }
                }
            }
        };
        if (options.mode === 'auto') {
            if (typeof (FormData) === 'undefined') {
                options.mode = 'frame';
            } else {
                options.mode = 'html5';
            }
        }

        if (options.mode === 'bightml5') {
            Uploader = new BigHtml5Upload(qem, upbtn, options.keyname, options.upurl, options.extensions, bindData, options.multiple, uploadComplete);
        } else if (options.mode === 'html5') {
            Uploader = new Html5Upload(qem, upbtn, options.keyname, options.upurl, options.extensions, bindData, options.multiple, uploadComplete);
        } else {
            Uploader = new FrameUpload(qem, upbtn, options.keyname, options.upurl, options.extensions, bindData, options.multiple, uploadComplete);
        }
        this.destroy = function () {
            if (Uploader) {
                Uploader.remove();
            }
        };
    }
    $.sdopx_widget('upfile', UpFile, 'input.form-control.upfile:not(.notinit),input.form-control.upimg:not(.notinit)');

})(jQuery);