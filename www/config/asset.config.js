'use strict';

module.exports = {
    baseUrl: '/assets/js',
    version: "0.0.1",
    paths: {
        'jquery': 'jquery-1.12.3.min',
        'jquery-json': 'jquery.json',
        'jquery-cookie': 'jquery.cookie',
        'jquery-ui': '../jquery-ui/jquery-ui.min',
        'yee': 'yee',
        'yee-validate': 'yee.validate-2.0.1',
        'layer': '../layer/layer',
        'yee-layer': 'yee.layer',
        'yee-confirm': 'yee.confirm',
        'yee-ajaxlink': 'yee.ajaxlink',
        'yee-ajaxform': 'yee.ajaxform',
        'yee-editbox': 'yee.editbox',
        'yee-xheditor': 'yee.xheditor',
        'yee-date': 'yee.date',
        'yee-datetime': 'yee.datetime',
        'yee-upfile': 'yee.upfile-1.1.0',
    },
    depends: {
        'jquery-ui': ['../jquery-ui/custom.css', 'jquery'],
        'layer': ['jquery'],
        'yee': ['jquery'],
        'yee-validate': ['yee'],
        'yee-confirm': ['yee', 'yee-layer'],
        'yee-ajaxlink': ['yee', 'yee-layer'],
        'yee-ajaxform': ['yee', 'yee-layer'],
        'yee-editbox': ['yee', 'yee-layer'],
        'yee-xheditor': ['yee', '../xheditor/xheditor-1.2.2.min.js'],
        'yee-date': ['yee', 'jquery-ui'],
        'yee-datetime': ['yee', 'jquery-ui', 'jquery-ui-timepicker-addon.js'],
    }
};