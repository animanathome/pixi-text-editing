const fs = require('fs');
const PNG = require('pngjs').PNG;
const pixelmatch = require('pixelmatch');
const path = require('path');

// This directory contains the snapshots which are currently being generated when running the tests
const CURRENT_DIR = './tests/current/';
// This directory contains the expected snapshots
const EXPECTED_DIR = './tests/expected/';
// This directory contains the difference, if any, between the current and expected snapshots
// If the test fails, the difference is written to this directory
const ARTIFACTS_DIR = './tests/artifacts/';

const writeImageToDisk = (file, buffer) => {
    if (!fs.existsSync(path.dirname(file))) {
        fs.mkdirSync(path.dirname(file));
    }
    fs.writeFileSync(file, buffer);
}

const doImagesMatch = (currentImageFile, expectedImageFile) => {
    // inspired by https://stackoverflow.com/questions/18510897/how-to-compare-two-images-using-node-js
    const img1 = PNG.sync.read(fs.readFileSync(currentImageFile));
    const img2 = PNG.sync.read(fs.readFileSync(expectedImageFile));
    const {width, height} = img1;
    const diff = new PNG({width, height});

    const difference = pixelmatch(img1.data, img2.data, diff.data, width, height, {threshold: 0.1});
    const diffImageFile = path.join(ARTIFACTS_DIR, path.basename(currentImageFile));
    if (difference > 0) {
        console.log('images do not match - difference: ' + difference)
        writeImageToDisk(diffImageFile, PNG.sync.write(diff));
        return false;
    }
    return true;
}

module.exports = function (chai, utils) {
    utils.addMethod(chai.Assertion.prototype, "matchesSnapshot", function (passedContext) {
        const actual = utils.flag(this, 'object');

        const context = passedContext.test ? passedContext.test : passedContext

        const suiteTitle = context.parent.title.replace(/\s+/g, '-');
        const testTitle = context.title.replace(/\s+/g, '-');
        const imageName = `${suiteTitle}-${testTitle}.png`;

        const currentTestImage = path.join(CURRENT_DIR, imageName);
        writeImageToDisk(currentTestImage, actual);

        const expectedTestImage = path.join(EXPECTED_DIR, imageName);
        if (!fs.existsSync(expectedTestImage)) {
            // no previous test image exists
            return false;
        }
        return doImagesMatch(currentTestImage, expectedTestImage);
    });
};