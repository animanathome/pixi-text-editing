import * as PIXI from "pixi.js";
import * as fs from "fs";

import {FontLoader} from "../src/fontLoader";
import {FontAtlas} from "../src/fontAtlas";
import {FontAtlasText, TRANSFORM_TYPE} from "../src/fontAtlasText";

export const LOCALHOST = 'http://localhost:8080/resources/'

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
    fs.writeFile(`./tests/${outputFile}.png`, base64Data, 'base64', function (err) {
        console.log(err);
    });
}

export const createFontAtlasTextApp = async({
        displayText = 'abc',
        transformType = TRANSFORM_TYPE.NONE,
        width = 128,
        height = 128,
        resolution = 2,
        fontSize = 12,
        fontAtlasSize = 12,
        fontAtlasResolution = 128,
        fontUrl = LOCALHOST + 'Roboto-Regular.ttf'
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
        transformType,
        width,
        height,
        fontAtlasSize,
        fontAtlasResolution,
        fontUrl,
        fontSize,
    })

    app.stage.addChild(text);
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
     transformType= TRANSFORM_TYPE.LINE,
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

    const atlas = new FontAtlas({
        font: fontLoader.font,
        resolution: fontAtlasResolution,
        fontSize: fontAtlasSize,
    })
    // pre-load glyphs
    atlas.addGlyphsForString('abcdefghijklmnopqrstuvwxyz');
    atlas.addGlyphsForString('abcdefghijklmnopqrstuvwxyz'.toUpperCase());
    atlas.addGlyphsForString('.!?');

    const text = new FontAtlasText();
    text.atlas = atlas;
    text.maxHeight = width;
    text.maxWidth = height;
    text.transformType = transformType;
    text.fontSize = fontSize;
    text.text = displayText;
    text._build();

    return {
        fontLoader,
        atlas,
        text,
    }
}