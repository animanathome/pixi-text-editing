import process from 'process';
import {Buffer} from "buffer";
import {Context} from "mocha";
const {Assertion} = require("chai");

const fs = require('fs');
const PNG = require('pngjs').PNG;
const pixelmatch = require('pixelmatch');
const path = require('path');

const DEBUG = process.env.DEBUG === '1';
console.log('DEBUG', DEBUG);

// inspired by https://github.com/monojitb02/mocha-chai-snapshot

/** This directory contains the snapshots which are currently being generated when running the tests */
const CURRENT_DIR = './tests/current/';
/** This directory contains the expected snapshots */
const EXPECTED_DIR = './tests/expected/';
/**
 * This directory contains the difference, if any, between the current and expected snapshots. If the test fails, the
 * difference is written to this directory
 */
const ARTIFACTS_DIR = './tests/artifacts/';

const writeImageToDisk = (file: string, buffer: Buffer) => {
    if (!fs.existsSync(path.dirname(file))) {
        fs.mkdirSync(path.dirname(file));
    }
    fs.writeFileSync(file, buffer);
}

const doImagesMatch = (currentImageFile: string, expectedImageFile: string) => {
    // inspired by https://stackoverflow.com/questions/18510897/how-to-compare-two-images-using-node-js
    // TODO: use https://stackoverflow.com/questions/4196453/simple-and-fast-method-to-compare-images-for-similarity
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

/**
 * Get an array of all the titles given the specified context.
 * @param context
 * @param titles
 */
function getParentTitle(context, titles: Array<string>) {
    if ('title' in context && context.title.length > 0) {
        titles.push(context.title.replace(/\s+/g, '-'));
    }
    if (context.parent) {
        getParentTitle(context.parent, titles);
    }
    return titles;
}

/**
 * Get the full test name.
 * @param context
 */
function getImageName(context) {
    const parent_titles = getParentTitle(context, []);
    return parent_titles.reverse().join('-');
}

declare global {
    export namespace Chai {
        interface Assertion {
            matchesSnapshot(passedContext: Context): void;
        }
    }
}
Assertion.addMethod("matchesSnapshot", function (passedContext) {
    const actual = this._obj as Buffer;
    const context = passedContext.test ? passedContext.test : passedContext

    const title = getImageName(context);
    const imageName = `${title}.png`;

    // save the current image to the current directory
    const currentTestImage = path.join(CURRENT_DIR, imageName);
    if (fs.existsSync(currentTestImage)) {
        fs.unlinkSync(currentTestImage);
    }
    writeImageToDisk(currentTestImage, actual);

    // load the expected image from the expected directory
    const expectedTestImage = path.join(EXPECTED_DIR, imageName);
    let result = true;
    let message = '';

    // we only need to evaluate this condition when on CI
    if (!fs.existsSync(expectedTestImage)) {
        if (DEBUG) {
            console.warn(`Image ${imageName} does not exist yet. Please copy current result into expected folder`)
            return true;
        }
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