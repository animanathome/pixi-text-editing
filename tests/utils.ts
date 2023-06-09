import * as PIXI from "pixi.js";
import * as fs from "fs";

import {FontLoader} from "../src/fontLoader";
import {FontAtlas} from "../src/fontAtlas";
import {FontAtlasText} from "../src/fontAtlasText";
import {Rectangle} from "../src/rectangle";

export const LOCALHOST = 'http://localhost:8080/resources/'
const VERBOSE = false;

export const extractImageData = async(canvas: HTMLCanvasElement) => {
    const blob: Blob = await new Promise(resolve => canvas.toBlob(resolve));
    const arrayBuffer = await blob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return buffer
}

export const roundBounds = (bounds) => {
    return {
        x: Math.round(bounds.x),
        y: Math.round(bounds.y),
        width: Math.round(bounds.width),
        height: Math.round(bounds.height),
    }
}

export const getRenderedPixels = (renderer:PIXI.Renderer) => {
    const width = renderer.width;
    const height = renderer.height;
    const pixels = new Uint8Array(width * height * 4);
    const gl = renderer.gl;
    gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    return pixels
}

export const writeDataUrlToDisk = (url, outputFile = 'test') => {
    const base64Data = url.replace(/^data:image\/png;base64,/, "");
    fs.writeFile(`./tests/${outputFile}.png`, base64Data, 'base64', function (err) {});
}

export const createRectangleApp = () => {
    const width = 128;
    const height = 128;
    const app = new PIXI.Application({
        backgroundColor: 0xffffff,
        antialias: true,
        autoStart: false,
        width,
        height,
    });
    document.body.appendChild(app.view);
    app.view.style.height = `${height}px`;
    app.view.style.width = `${width}px`;

    const gridTexture = PIXI.Texture.from(LOCALHOST + 'grid.png');
    const grid = new PIXI.Sprite(gridTexture);
    app.stage.addChild(grid);

    const rectangle = new Rectangle({
        x: 32, y:32,
        width:64, height:64
    });
    app.stage.addChild(rectangle);

    return {
        app,
        rectangle
    }
}

/**
 * Convenience function to create a simple PIXI app with a preloaded FontAtlasText object. This object can be used in
 * tests.
 * @param displayText
 * @param width
 * @param height
 * @param resolution
 * @param fontSize
 * @param fontAtlasSize
 * @param fontAtlasResolution
 * @param fontUrl
 */
export const createFontAtlasTextApp = async({
        displayText = 'abc',
        width = 128,
        height = 128,
        resolution = 2,
        fontSize = 12,
        fontAtlasSize = 12,
        fontAtlasResolution = 128,
        fontUrl = LOCALHOST + 'Montserrat-Regular.ttf'
    }) => {

    const app = new PIXI.Application({
        backgroundColor: 0xffffff,
        antialias: true,
        autoStart: false,
        width,
        height,
        resolution,
    });
    document.body.appendChild(app.view);
    app.view.style.height = `${height}px`;
    app.view.style.width = `${width}px`;

    const {fontLoader, atlas, text} = await createFontAtlasText({
        displayText,
        width,
        height,
        fontAtlasSize,
        fontAtlasResolution,
        fontUrl,
        fontSize,
    })

    app.stage.addChild(text);
    // text.deform.logAssembly();
    app.ticker.update();

    return {
        app,
        fontLoader,
        atlas,
        text
    }
}

export const createFontAtlasText = async({
     displayText = 'abc',
     width = 128,
     height = 128,
     fontAtlasSize = 12,
     fontAtlasResolution = 1024,
     fontUrl = LOCALHOST + 'Roboto-Regular.ttf',
     fontSize = 12,
 }) => {
    const fontLoader = new FontLoader();
    fontLoader.sourceUrl = fontUrl;
    await fontLoader.load();
    VERBOSE && console.log('loaded font', fontLoader.sourceUrl)

    const atlas = new FontAtlas({
        fontLoader,
        resolution: fontAtlasResolution,
        fontSize: fontAtlasSize,
    })
    atlas.update();

    // pre-load glyphs
    atlas.addGlyphsForString('abcdefghijklmnopqrstuvwxyz');
    atlas.addGlyphsForString('abcdefghijklmnopqrstuvwxyz'.toUpperCase());
    atlas.addGlyphsForString('.!?');

    const text = new FontAtlasText();
    text.atlas = atlas;
    text.maxHeight = width;
    text.maxWidth = height;
    text.fontSize = fontSize;
    text.text = displayText;
    text._update();

    return {
        fontLoader,
        atlas,
        text,
    }
}