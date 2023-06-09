const fs = require('fs');
const PNG = require('pngjs').PNG;
const pixelmatch = require('pixelmatch');
const path = require('path');

// inspired by https://github.com/monojitb02/mocha-chai-snapshot

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

    const difference = pixelmatch(img1.data, img2.data, diff.data, width, height, { threshold: 0.1 });
    const diffImageFile = path.join(ARTIFACTS_DIR, path.basename(currentImageFile));
    if (difference > 0) {
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

        // save the current image to the current directory
        const currentTestImage = path.join(CURRENT_DIR, imageName);
        if (!fs.existsSync(currentTestImage)) {
            fs.unlinkSync(currentTestImage);
        }
        writeImageToDisk(currentTestImage, actual);

        // load the expected image from the expected directory
        const expectedTestImage = path.join(EXPECTED_DIR, imageName);
        let result = true;
        let message = '';
        if (!fs.existsSync(expectedTestImage)) {
            result = false;
            message = `Image does not exist`;
        }

        // compare the current image with the expected image
        if (!doImagesMatch(currentTestImage, expectedTestImage)) {
            result = false;
            message = `Image does not match snapshot`;
        }
        this.assert(result, message);
    });
};