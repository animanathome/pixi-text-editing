import * as PIXI from "pixi.js";
import * as fs from "fs";

import {FontLoader} from "../src/fontLoader";
import {FontAtlas} from "../src/fontAtlas";
import {FontAtlasText} from "../src/fontAtlasText";

export const writeDataUrlToDisk = (url, outputFile = 'test') => {
    const base64Data = url.replace(/^data:image\/png;base64,/, "");
    fs.writeFile(`./tests/${outputFile}.png`, base64Data, 'base64', function (err) {
        console.log(err);
    });
}

export const createFontAtlasTextApp = async(
    displayText = 'abc',
    width = 128,
    height = 128,
    fontAtlasSize = 12,
    fontAtlasResolution = 128,
    fontUrl = 'http://localhost:8000/resources/Roboto-Regular.ttf'
) => {
    const app = new PIXI.Application({
        backgroundColor: 0xffffff,
        width,
        height,
    });
    app.ticker.stop();

    const {fontLoader, atlas, text} = await createFontAtlasText(
        displayText,
        width,
        height,
        fontAtlasSize,
        fontAtlasResolution,
        fontUrl,
    )

    app.stage.addChild(text);
    app.ticker.update();

    return {
        app,
        fontLoader,
        atlas,
        text
    }
}

export const createFontAtlasText = async(
    displayText = 'abc',
    width = 128,
    height = 128,
    fontAtlasSize = 12,
    fontAtlasResolution = 128,
    fontUrl = 'http://localhost:8000/resources/Roboto-Regular.ttf'
) => {
    const fontLoader = new FontLoader();
    fontLoader.sourceUrl = fontUrl;
    await fontLoader.load();

    const atlas = new FontAtlas({
        font: fontLoader.font,
        resolution: fontAtlasResolution,
        fontSize: fontAtlasSize,
    })

    const text = new FontAtlasText();
    text.atlas = atlas;
    text.maxHeight = width;
    text.maxWidth = height;
    text.text = displayText;
    text._build();

    return {
        fontLoader,
        atlas,
        text,
    }
}