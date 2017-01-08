$(function () {
    var tabrow = $('div.form-panel').each(function (idx, elem) {
        $(elem).data('idx', idx);
    });
    var tabbtn = $('.form-tabs b,.form-tabs a').each(function (idx, elem) {
        $(elem).data('idx', idx).on('click', function () {
            var that = $(this), idx = that.data('idx');
            tabbtn.removeClass('on');
            that.addClass('on');
            tabrow.hide();
            tabrow.eq(idx).show();
            $(window).triggerHandler('resize');
            return false;
        });
    });
    $('form').on('displayAllError', function (e, items) {
        $(items).each(function () {
            var tabls = this.elem.parents('div.form-panel:first');
            if (tabls.length > 0) {
                var idx = tabls.data('idx');
                tabbtn.eq(idx).trigger('click');
            }
            return false;
        });
    });
});

