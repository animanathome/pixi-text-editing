afterEach(function() {
    // remove canvas from body
    const elements = Array.from(document.body.children as HTMLCollection);
    elements.forEach(item => {
        if (item.nodeName === 'CANVAS') {
            item.remove();
        }
    });
})