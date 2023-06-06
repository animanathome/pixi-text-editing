const fs = require('fs');
const path = require('path');

const writeSnap = (file, buffer) => {
    if (!fs.existsSync(path.dirname(file))) {
        fs.mkdirSync(path.dirname(file));
    }
    fs.writeFileSync(file, buffer);
    return true;
}

module.exports = function (chai, utils) {
    utils.addMethod(chai.Assertion.prototype, "storeSnapshot", function (passedContext) {
        const actual = utils.flag(this, 'object');

        const context = passedContext.test ? passedContext.test : passedContext

        const suiteTitle = context.parent.title.replace(/\s+/g, '-');
        const testTitle = context.title.replace(/\s+/g, '-');
        const snapshotFile = `./tests/artifacts/${suiteTitle}-${testTitle}.png`;

        writeSnap(snapshotFile, actual);
    });
};