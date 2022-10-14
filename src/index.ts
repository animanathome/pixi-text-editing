import * as PIXI from 'pixi.js'
import {FontLoader} from "./fontLoader";
import {FontAtlas} from "./fontAtlas";
import {FontAtlasText} from "./fontAtlasText";
import {EditingEvents} from "./events";

// const pseudoText = 'Lorem ipsum dolor sit amet, ex mutat choro vim. Ne novum pertinacia assueverit duo, sint ferri altera has no'
// const pseudoText = 'Lorem ipsum dolor sit amet'
// const pseudoText = 'Lorem ipsum dolor sit amet, ex mutat choro vim.'
const pseudoText = 'Hello World!\n' + 'It\'s a new day for text rendering.';

const app = new PIXI.Application({
    backgroundColor: 0xffffff,
    antialias: true,

});
document.body.appendChild(app.view);
app.view.style.position = 'absolute';
app.view.style.top = '0px';
app.view.style.left = '0px';

global.app = app;

const textEditingDemo = async() => {
    console.log('textEditingDemo');

    // load the font
    const fontLoader = new FontLoader();
    const url = 'http://localhost:8000/resources/Roboto-Regular.ttf'
    fontLoader.sourceUrl = url;
    await fontLoader.load();
    global.font = fontLoader;

    // pre-built characters
    const atlas = new FontAtlas({
        font: fontLoader.font,
        resolution: 128,
        fontSize: 12,
    })
    global.atlas = atlas;
    // atlas.addGlyphsForString('abcdefghijklmnopqrstuvwxyz');
    // atlas.addGlyphsForString('abcdefghijklmnopqrstuvwxyz'.toUpperCase());
    // atlas.addGlyphsForString('.!?');

    // display text
    const text = new FontAtlasText();
    text.atlas = atlas;
    text.maxHeight = 128;
    text.maxWidth = 128;
    // TODO: add fontSize
    // TODO: add leading (line height)
    text.text = pseudoText;
    app.stage.addChild(text);
    global.text = text;

    const events = new EditingEvents(app.view, app.stage);
    global.events = events;

    // @ts-ignore
    events.on('change', () => {
        console.log('textures', atlas.texture.length);
    })
}

textEditingDemo();