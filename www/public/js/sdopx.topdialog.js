// JavaScript Document

if (!window.TDialogInit) {

    $(function () {
        $(document).delegate('a[dialog=true]', 'click', function (ev) {
            var that = $(this);
            var url = that.attr('href');
            var title = that.attr('title');
            var height = that.attr('dialog_height') || 620;
            var width = that.attr('dialog_width') || 960;
            window.openTDialog(url, 'dialog', title, this, {height: height, width: width});
            ev.preventDefault();
            return false;
        });
    });

    window.TDialogInit = function (doc, Dialog) {
        $('.form-submit', doc).hide();
        var buttons = [];
        $('.form-submit', doc).find("input[type='submit'],input[type='button'],input[type='reset']").each(function (index, element) {
            var that = $(element, doc);
            if (that.is("input[type='submit']")) {
                buttons.push({text: that.val(), click: function () {
                        that.click();
                    }, 'class': 'ui-button-submit'});
            } else {
                buttons.push({text: that.val(), click: function () {
                        that.click();
                    }});
            }
        });
        Dialog.dialog({buttons: buttons});
    };

    window.openTDialog = function (url, name, title, target, options, callwin) {
        window.top.printById();
        callwin = callwin || window;
        if (window.top != window && typeof (window.top.openTDialog) === 'function') {
            window.top.openTDialog(url, name, title, target, options, callwin);
            return;
        }
        title = title || '网页对话框';
        var Dialog = $('<div style="overflow:hidden;"></div>').attr('title', title).appendTo(window.document.body);
        var iframe = $('<iframe name="' + name + '" src="javascript:false;" frameborder="false" scrolling="auto" style="overflow-x:hidden;border:none;" width="100%" height="100%" id="' + name + '" ></iframe>').appendTo(Dialog);
        var doFix = function (event, ui) {
            $('iframe', this).each(function () {
                $('<div class="ui-draggable-iframeFix" style="background: #FFF;"></div>')
                        .css({
                            width: '100%', height: '100%',
                            position: 'absolute', opacity: '0.7', overflowX: 'hidden'
                        })
                        .css($(this).position())
                        .appendTo($(this).offsetParent());
            });
        };
        var removeFix = function (event, ui) {
            $("div.ui-draggable-iframeFix").each(function () {
                this.parentNode.removeChild(this);
            });
        };
        options = options || {};
        var maxZ = Math.max.apply(null, $.map($('body > *'), function (e, n) {
            if ($(e).css('position') === 'absolute') {
                return parseInt($(e).css('z-index')) || 1;
            }
        }));
        options.zIndex = maxZ;
        options.width = options.width || 960;
        options.height = options.height || 620;
        options.modal = typeof (options.modal) === 'undefined' ? true : options.modal;
        options.close = function () {
            iframe.remove();
            Dialog.remove();
            Dialog = null;
        };
        options.autoOpen = true;
        options.dragStart = doFix;
        options.dragStop = removeFix;
        options.resizeStart = doFix;
        options.resizeStop = removeFix;
        Dialog.dialog(options);
        var LayerIndex = null;
        if (window.layer) {
            LayerIndex = window.layer.load(1, {
                shade: [0.01, '#FFF'] //0.1透明度的白色背景
            });
        }
        iframe.load(function () {
            var dialogWindow = this.contentWindow;
            Dialog.window = dialogWindow;
            try {
                dialogWindow.openTDialog = function (url, name, title, target, options, callwin) {
                    callwin = callwin || dialogWindow;
                    window.opDialog(url, name, title, target, options, callwin);
                };
                dialogWindow.closeTDialog = function (data) {
                    target && $(target).trigger('dataTDialog', [data]);
                    Dialog.dialog('close');
                };
                dialogWindow.closeAndreload = function () {
                    callwin.location.reload();
                    Dialog.dialog('close');
                };
                TDialogInit(dialogWindow.document, Dialog);
                if (!options.modal) {
                    var DialogParent = Dialog.parent();
                    var AllDialog = DialogParent.prevAll('.ui-dialog[role="dialog"]');
                    var Dofs = DialogParent.offset();
                    Dofs.left += 20 * AllDialog.length;
                    Dofs.top += 20 * AllDialog.length;
                    Dialog.dialog({position: [Dofs.left, Dofs.top]});
                }
                if (dialogWindow.document.title === null || dialogWindow.document.title === '') {
                    Dialog.dialog({title: title});
                } else {
                    Dialog.dialog({title: dialogWindow.document.title});
                }
                if (window.layer && LayerIndex !== null) {
                    window.layer.close(LayerIndex);
                }

            } catch (e) {
            }

        });
        iframe.attr('src', url);
    };
}