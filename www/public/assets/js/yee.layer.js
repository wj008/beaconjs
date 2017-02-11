if (window.top !== window) {
    if (window.top.layer) {
        window.layer = window.top.layer;
    }
} else {
    if (!window.layer) {
        document.write('<script type="text/javascript" src="/assets/layer/layer.js"></script>');
    }
}
