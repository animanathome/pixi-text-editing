before(function() {
    console.log('options', global.options);
});

afterEach(function() {
    // remove canvas from body
    const elements = Array.from(document.body.children as HTMLCollection);
    elements.forEach(item => {
        if (item.nodeName === 'CANVAS') {
            item.remove();
        }
    });
})