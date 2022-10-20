import * as PIXI from 'pixi.js'
import {FontLoader} from "./fontLoader";
import {FontAtlas} from "./fontAtlas";
import {FontAtlasText} from "./fontAtlasText";
import {EditingEvents} from "./events";
import {createFontAtlasTextApp} from "../tests/utils";
import {FontAtlasTextManipulator} from "./fontAtlasTextManipulator";

// const pseudoText = 'Lorem ipsum dolor sit amet, ex mutat choro vim. Ne novum pertinacia assueverit duo, sint ferri altera has no'
// const pseudoText = 'Lorem ipsum dolor sit amet'
// const pseudoText = 'Lorem ipsum dolor sit amet, ex mutat choro vim.'
// const pseudoText = 'Hello World!\n' + 'It\'s a new day for text rendering.';
const pseudoText = 'a\nb\n'

const textEditingDemo = async() => {
    const app = new PIXI.Application({
        backgroundColor: 0xffffff,
        antialias: true,

    });
    document.body.appendChild(app.view);
    app.view.style.position = 'absolute';
    app.view.style.top = '0px';
    app.view.style.left = '0px';

    global.app = app;
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
    atlas.addGlyphsForString('abcdefghijklmnopqrstuvwxyz');
    atlas.addGlyphsForString('abcdefghijklmnopqrstuvwxyz'.toUpperCase());
    atlas.addGlyphsForString('-.!?');

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

    let textureCount = 0;
    // @ts-ignore
    events.on('change', () => {
        if (textureCount !== atlas.texture.length) {
            const texture = atlas.texture[textureCount];
            const sprite = new PIXI.Sprite(texture);
            sprite.y = 100 + (textureCount * 128);
            app.stage.addChild(sprite)
            textureCount++
        }
    })
}

textEditingDemo();

const test = async() => {
    const {app, text} = await createFontAtlasTextApp(
    'What',
    64,
    64
    );
    global.app = app;

    const manipulator = new FontAtlasTextManipulator(text);
    manipulator.caret.caretVisibleDuration = 0;
    app.stage.addChildAt(manipulator, 0);
    global.manip = manipulator;

    manipulator.click(0, 0, false);
    app.ticker.update();

    (window as any).__PIXI_INSPECTOR_GLOBAL_HOOK__ &&  (window as any).__PIXI_INSPECTOR_GLOBAL_HOOK__.register({ PIXI: PIXI });
}

// test();