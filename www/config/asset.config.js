'use strict';

module.exports = {
    baseUrl: '/assets/js',
    version: "0.0.1",
    paths: {
        'jquery': 'jquery-1.12.3.min',
        'jquery-json': 'jquery.json',
        'jquery-cookie': 'jquery.cookie',
        'jquery-ui': '../jquery-ui/jquery-ui',
        'yee': 'yee',
        'yee-validate': 'yee.validate-2.0.1',
        'layer': '../layer/layer',
        'yee-layer': 'yee.layer',
        'yee-confirm': 'yee.confirm',
        'yee-ajaxlink': 'yee.ajaxlink',
        'yee-ajaxform': 'yee.ajaxform',
        'yee-editbox': 'yee.editbox',
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
    }
};