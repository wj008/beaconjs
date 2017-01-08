$(function () {
    $('#spec_data').sdopx_goods_spec_plug();
    var specbox = $(':input[name=spec_vals]');
    if (specbox.length > 0 && specbox.val() != '') {
        try {
            var data = $.parseJSON(specbox.val());
            for (var name in data) {
                var keyname = '#spec_' + $.md5(name);
                var val = data[name];
                $(keyname).val(val);
            }
        } catch (e) {
        }
    }
    $('div.form-panel').on('mouseup', '.goodspecplug .sdopx-labelgroup a', function (ev) {
        var that = $(this);
        var tav = that.text();
        var parent = that.parent();
        var opts = parent.find('a');
        var extname = ' ' + $('#extname').val() + ' ';
        var fined = false;

        opts.each(function () {
            var optv = $(this).text();
            optv = $.trim(optv);
            if (extname.indexOf(' ' + optv + ' ') >= 0) {
                fined = true;
                extname = extname.replace(' ' + optv + ' ', ' ' + tav + ' ');
                return false;
            }
        });

        if (!fined) {
            extname = extname + ' ' + tav + ' ';
        }
        extname = $.trim(extname);
        $('#extname').val(extname);
    });

});