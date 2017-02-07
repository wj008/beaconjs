'use strict';

module.exports = {
    baseUrl: '/assets/js',
    version: "0.0.1",
    paths: {
        'jquery': 'jquery-1.12.3.min',
        'jquery-json': 'jquery.json',
        'jquery-cookie': 'jquery.cookie',
        'jquery-ui': '../jquery-ui/jquery-ui',
    },
    depends: {
        'jquery-ui': ['../jquery-ui/custom.css', 'jquery'],
    }
};