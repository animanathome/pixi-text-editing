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
const pseudoText = 'Hello\nWorld\n'

const textEditingDemo = async() => {
    // @ts-ignore
    PIXI.settings.PRECISION_FRAGMENT = 'highp';
    // @ts-ignore
    PIXI.settings.PRECISION_VERTEX = 'highp';
    PIXI.settings.ROUND_PIXELS = true;

    const app = new PIXI.Application({
        backgroundColor: 0xffffff,
        antialias: false,
        // transparent: true,
        height: 512,
        width: 512,
    });
    console.log(app.renderer)
    // app.renderer.multisample = 8;

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
        resolution: 512,
        fontSize: 48,
    })
    global.atlas = atlas;
    atlas.addGlyphsForString('abcdefghijklmnopqrstuvwxyz');
    atlas.addGlyphsForString('abcdefghijklmnopqrstuvwxyz'.toUpperCase());
    atlas.addGlyphsForString('-.!?');

    // display text
    const text = new FontAtlasText();
    text.x = 20;
    text.y = 20;
    text.atlas = atlas;
    text.fontSize = 12;
    text.lineHeight = 2;
    text.maxHeight = 128;
    text.maxWidth = 128;
    // TODO: add fontSize
    // TODO: add leading (line height)
    text.text = pseudoText;
    app.stage.addChild(text);
    global.text = text;

    const events = new EditingEvents(app.view, app.stage);
    global.events = events;


    const texture = atlas.texture[0];
    const sprite = new PIXI.Sprite(texture);
    sprite.y = 128;
    app.stage.addChild(sprite)

    document.body.appendChild(atlas.canvas);
    atlas.canvas.style.position = 'absolute';
    atlas.canvas.style.top = '334px';

}

textEditingDemo();

const test = async() => {
    const {app, text} = await createFontAtlasTextApp(
    'What',
    64,
    64
    );
    global.app = app;

    text.x = 10;
    text.y = 10;

    const manipulator = new FontAtlasTextManipulator(text);
    manipulator.caret.caretVisibleDuration = 0;
    app.stage.addChildAt(manipulator, 0);
    global.manip = manipulator;

    manipulator.click(0, 0, false);
    app.ticker.update();

    (window as any).__PIXI_INSPECTOR_GLOBAL_HOOK__ &&  (window as any).__PIXI_INSPECTOR_GLOBAL_HOOK__.register({ PIXI: PIXI });
}

// test();