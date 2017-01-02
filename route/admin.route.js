module.exports = {
    path: './apps/admin',
    uri: '/admin',
    rules: [
        {
            reg: new RegExp('^/(\\w+)/(\\w+)/(\\d+)\\.html', 'i'),
            arg: {ctl: '$1', act: '$2', id: '$3'}
        },
        {
            reg: new RegExp('^/(\\w+)/(\\w+)\\.html', 'i'),
            arg: {ctl: '$1', act: '$2'}
        },
        {
            reg: new RegExp('^/(\\w+)\\.html', 'i'),
            arg: {ctl: '$1'}
        }
    ],
    default: {ctl: 'index', act: 'index'},
    reverse: [
        '/{ctl}_{act}/{id}.html',
        '/{ctl}_{act}.html',
        '/{ctl}.html'
    ]
};