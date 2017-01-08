$(function () {
    $('#spec_fields').on('additem', function (ev, lay) {
        var input = lay.find('textarea.form-control.spec-options:not(.notinit)');
        input.sdopx_spec_options();
    });
});