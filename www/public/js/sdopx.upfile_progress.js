(function ($) {
    function UpFileProgress(element) {
        var qem = $(element);
        var ProgressDialog = null;
        var Progressbar = null;
        var ProgressLabel = null;
        qem.on('beginUpfile', function (ev, data) {
            if (ProgressDialog == null) {
                var fileSize = 0;
                if (data.filesize > 1024 * 1024) {
                    fileSize = (Math.round(data.filesize * 100 / (1024 * 1024)) / 100).toString() + 'MB';
                } else {
                    fileSize = (Math.round(data.filesize * 100 / 1024) / 100).toString() + 'KB';
                }
                ProgressDialog = $('<div title="上传进度"><div style="margin-left:10px;line-height:25px;">文件大小：<span>' + fileSize + '</span></div></div>');
                Progress = $('<div style="position: relative;width:230px;margin-left:10px"></div>').appendTo(ProgressDialog);
                ProgressLabel = $('<div style="text-align:center;position:absolute;text-shadow: 1px 1px 0 #fff;left:0;width:230px;top: -2px;">Loading...</div>').appendTo(Progress);
                Progress.progressbar({
                    value: false,
                    change: function () {
                        ProgressLabel.text(Progress.progressbar("value") + "%");
                    },
                    complete: function () {
                        ProgressLabel.text("100%");
                    }
                });
                ProgressDialog.appendTo(document.body);
                ProgressDialog.dialog({
                    autoOpen: true,
                    draggable: false, resizable: false, dialogClass: 'ui-widget-content-border-nobtn',
                    width: 250,
                    height: 140,
                    modal: true,
                    close: function () {
                        ProgressLabel.remove();
                        Progress.remove();
                        ProgressDialog.remove();
                        ProgressDialog = null;
                        Progressbar = null;
                        ProgressLabel = null;
                    }
                });
            }
        });
        qem.on('progressUpfile', function (ev, data) {
            if (Progress != null) {
                var Completed = Math.round(data.loaded * 100 / data.total);
                Progress.progressbar("value", Completed);
            }
        });
        qem.on('afterUpfile', function (ev, data) {
            if (ProgressDialog != null) {
                try {
                    ProgressDialog.dialog('close');
                } catch (e) {
                }
            }
        });
    }

    $.sdopx_widget('upfile_progress', UpFileProgress, 'input.form-control.upfile-progress:not(.notinit)');

})(jQuery);