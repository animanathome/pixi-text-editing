import * as PIXI from "pixi.js";
import {FontLoader} from "../src/fontLoader";
import {FontAtlas} from "../src/fontAtlas";
import {FontAtlasText} from "../src/fontAtlasText";
import {FontAtlasTextGraphic, GRAPHIC_TYPE} from "../src/fontAtlasTextGraphic";

const createTextAsset = (atlas: FontAtlas, text = 'test') => {
    const asset = new FontAtlasText();
    asset.atlas = atlas;
    asset.maxHeight = 200;
    asset.maxWidth = 200;
    asset.fontSize = 18;
    asset.text = text;
    // this is a hack! we should not need to do this
    // we should remove this and fix the core (dependency) issue
    asset._build();
    return asset
}

export const graphicStyles = async() => {
    const width = 512;
    const height = 512;
    const app = new PIXI.Application({
        backgroundColor: 0xffffff,
        antialias: true,
        autoStart: false,
        width,
        height,
        resolution: 2,
    });
    document.body.appendChild(app.view);
    app.view.style.height = `${height}px`;
    app.view.style.width = `${width}px`;
    global.app = app;

    const fontLoader = new FontLoader();
    const fontUrl = '../../../resources/Roboto-Regular.ttf';
    console.log('fontUrl', fontUrl);
    fontLoader.sourceUrl = fontUrl;
    await fontLoader.load();

    const atlas = new FontAtlas({
        font: fontLoader.font,
        resolution: 512,
        fontSize: 24,
    })
    // pre-load glyphs
    atlas.addGlyphsForString('abcdefghijklmnopqrstuvwxyz');
    atlas.addGlyphsForString('abcdefghijklmnopqrstuvwxyz'.toUpperCase());
    atlas.addGlyphsForString('.!?');

    const text = createTextAsset(atlas, 'Hello World!\nHow are you?')
    text.position.x = 100;
    text.position.y = 100;

    const graphicColor = new FontAtlasTextGraphic(text);
    graphicColor.graphicType = GRAPHIC_TYPE.BOUNDS;
    graphicColor.padding.left = 10;
    graphicColor.padding.right = 10;
    graphicColor.padding.top = 10;
    graphicColor.padding.bottom = 10;
    graphicColor.position.x = 100;
    graphicColor.position.y = 100;
    app.stage.addChildAt(graphicColor, 0);
    app.ticker.update()
    app.stage.addChild(text);

    app.ticker.start();
}