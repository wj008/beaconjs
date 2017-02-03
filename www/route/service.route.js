module.exports = {
    path: './apps/service',
    uri: '/service',
    rules: [
        {
            reg: new RegExp('^/(\\w+)/(\\w+)/(\\d+)$', 'i'),
            arg: {ctl: '$1', act: '$2', id: '$3'}
        },
        {
            reg: new RegExp('^/(\\w+)/(\\w+)$', 'i'),
            arg: {ctl: '$1', act: '$2'}
        },
        {
            reg: new RegExp('^/(\\w+)$', 'i'),
            arg: {ctl: '$1'}
        },
        {
            reg: new RegExp('^/$', 'i'),
            arg: {ctl: 'index'}
        }
    ],
   // default: {ctl: 'index', act: 'index'},
    resolve: [
        '/{ctl}/{act}/{id}',
        '/{ctl}/{act}',
        '/{ctl}'
    ]
};