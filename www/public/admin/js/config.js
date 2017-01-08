$(function () {
    $('#testsend').on('click', function () {
        var btn = $(this);
        var url = btn.attr('href');
        if ($('form').checkForm()) {
            var data = $('form').serialize();
            $.post(url, data, function (dat) {
                if (dat.status) {
                    alert(dat.success);
                } else {
                    alert(dat.error);
                }
            }, 'json');
        }
        return false;
    });
});