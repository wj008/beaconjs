module.exports = {
    path: './apps/home',
    uri: '',
    rules: [
        {
            reg: new RegExp('^/(\\w+)/(\\w+)/(\\d+)\\.html$', 'i'),
            arg: {ctl: '$1', act: '$2', id: '$3'}
        },
        {
            reg: new RegExp('^/(\\w+)/(\\w+)\\.html$', 'i'),
            arg: {ctl: '$1', act: '$2'}
        },
        {
            reg: new RegExp('^/(\\w+)\\.html$', 'i'),
            arg: {ctl: '$1'}
        },
        {
            reg: new RegExp('^/$', 'i'),
            arg: {ctl: 'index'}
        }
    ],
    //default: {ctl: 'index', act: 'index'},
    resolve: [
        '/{ctl}/{act}/{id}.html',
        '/{ctl}/{act}.html',
        '/{ctl}.html'
    ]
};