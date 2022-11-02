import * as PIXI from 'pixi.js'
import * as dat from 'dat.gui';
import * as THREE from 'three';

import {FontLoader} from "./fontLoader";
import {FontAtlas} from "./fontAtlas";
import {FontAtlasText} from "./fontAtlasText";
import {EditingEvents} from "./events";
import {createFontAtlasTextApp} from "../tests/utils";
import {FontAtlasTextManipulator} from "./fontAtlasTextManipulator";
import {buildCurve, buildCurveData, createCurveTexture} from "./curveDeformer";

const textEditingDemo = async() => {
    // @ts-ignore
    PIXI.settings.PRECISION_FRAGMENT = 'highp';
    // @ts-ignore
    PIXI.settings.PRECISION_VERTEX = 'highp';
    PIXI.settings.ROUND_PIXELS = true;

    const app = new PIXI.Application({
        backgroundColor: 0xffffff,
        antialias: true,
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

    const offsetX = 100;
    const offsetY = 100;
    const radius = 100;
    const points = [
        new THREE.Vector3( 0 + offsetX, 0 + offsetY, 0),
        new THREE.Vector3( 0 + offsetX, radius + offsetY, 0),
        new THREE.Vector3( radius + offsetX, radius + offsetY, 0),
        new THREE.Vector3( radius + offsetX, 0 + offsetY, 0),
    ]

    const nSegments = 32;
    const {positions, tangents, normals, length} = buildCurveData(points, nSegments);
    // buildCurve(positions, tangents, normals, app.stage);
    const dataTexture = createCurveTexture(positions, normals, tangents);

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
    atlas.addGlyphsForString('_-.!?');

    // display text
    const text = new FontAtlasText();
    // text.x = 20;
    // text.y = 20;
    text.atlas = atlas;
    text.fontSize = 18;
    text.lineHeight = 1.2;
    text.maxHeight = 128;
    text.maxWidth = 196;
    text.spineLength = length;
    text.pathSegment = 1.0;
    text.spineOffset = 0;
    text.pathOffset = 0.15;
    text.flow = 1;
    text.text = 'Hello World! How are you?';
    app.stage.addChild(text);
    global.text = text;
    text._curveTexture = dataTexture

    const events = new EditingEvents(app.view, app.stage);
    global.events = events;

    // interactive UI
    const gui = new dat.GUI();
    const params = {
        path: 0,
        flow: text.flow,
        spineOffset: text.spineOffset,
        pathOffset: text.pathOffset,
    }
    gui.add( params, 'flow' ).onChange( value => text.flow = value );
    gui.add( params, 'spineOffset').onChange( value => text.spineOffset = value )
    gui.add( params, 'pathOffset').onChange( value => text.pathOffset = value )

    // parent curve texture to dom
    // const sprite = new PIXI.Sprite(dataTexture);
    // sprite.y = 128;
    // app.stage.addChild(sprite)

    // parent font canvas to dom
    // document.body.appendChild(atlas.canvas);
    // atlas.canvas.style.position = 'absolute';
    // atlas.canvas.style.top = '334px';
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