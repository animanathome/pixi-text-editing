import * as PIXI from 'pixi.js'
import * as dat from 'dat.gui';
import * as THREE from 'three';

import {FontLoader} from "./fontLoader";
import {FontAtlas} from "./fontAtlas";
import {FontAtlasText} from "./fontAtlasText";
import {EditingEvents} from "./events";
import {createFontAtlasTextApp, LOCALHOST} from "../tests/utils";
import {FontAtlasTextManipulator} from "./fontAtlasTextManipulator";
import {buildCurve, buildCurveData, createCurveTexture} from "./curveDeformer";
import {PingPongTimeline, TickerTimeline} from "./timeline";
import {TextTransformDeformer, TRANSFORM_TYPE} from "./deformers/TextDeformer";

const curveDemo = async() => {
    const app = new PIXI.Application({
        backgroundColor: 0xffffff,
        antialias: true,
        height: 512,
        width: 512,
    });

    document.body.appendChild(app.view);
    app.view.style.position = 'absolute';
    app.view.style.top = '0px';
    app.view.style.left = '0px';
    // global.app = app;

    const offsetX = 100;
    const offsetY = 100;
    const points = [
        new THREE.Vector3( 0 + offsetX, 0 + offsetY, 0),
        new THREE.Vector3( 50 + offsetX, 0 + offsetY, 0),
        new THREE.Vector3( 100 + offsetX, 0 + offsetY, 0),
    ]
    const nSegments = 2;
    const {positions, tangents, normals} = buildCurveData({
        points,
        nSegments,
        closed:false
    });
    buildCurve(positions, tangents, normals, app.stage);
}

// curveDemo();

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
    // app.renderer.multisample = 8;

    document.body.appendChild(app.view);
    app.view.style.position = 'absolute';
    app.view.style.top = '0px';
    app.view.style.left = '0px';
    // global.app = app;

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
    const {positions, tangents, normals, length} = buildCurveData({points, nSegments});
    buildCurve(positions, tangents, normals, app.stage);
    const dataTexture = createCurveTexture(positions, normals, tangents);

    // load the font
    const fontLoader = new FontLoader();
    const url = LOCALHOST + 'Roboto-Regular.ttf'
    fontLoader.sourceUrl = url;
    await fontLoader.load();

    // pre-built characters
    const atlas = new FontAtlas({
        font: fontLoader.font,
        resolution: 512,
        fontSize: 48,
    })
    // global.atlas = atlas;
    atlas.addGlyphsForString('abcdefghijklmnopqrstuvwxyz');
    atlas.addGlyphsForString('abcdefghijklmnopqrstuvwxyz'.toUpperCase());
    atlas.addGlyphsForString('_-.!?');

    // display text
    const text = new FontAtlasText();
    // text.x = 20;
    // text.y = 20;
    text.atlas = atlas;
    // text.fontSize = 18;
    // text.lineHeight = 1.2;
    // text.maxHeight = 128;
    // text.maxWidth = 196;
    // text.spineLength = length;
    // text.pathSegment = 1.0;
    // text.spineOffset = 0;
    // text.pathOffset = 0.15;
    // text.flow = 1;
    text.text = 'Hello World!';
    app.stage.addChild(text);
    // global.text = text;
    // text._curveTexture = dataTexture
    // text._curveData = new CurveData(positions, tangents, normals);

    const events = new EditingEvents(app.view, app.stage);
    // global.events = events;

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

// textEditingDemo();


// note: we could store a table with all of the values!
function normalizedSigmoid(z) {
    return sigmoid((z * 10) - 5);
}

function sigmoid(z) {
  return 1 / (1 + Math.exp(-z));
}

// 0 to 0.75
function normalizedTanh(x) {
    const clampedValue = Math.min(tanh(x), 0.75)
    const normalizedValue = clampedValue * 1.3333;
    return normalizedValue;
}

function tanh(x) {
   const e = Math.exp(2*x);
   return (e - 1) / (e + 1) ;
}

const animation = async() => {
    const {app, text} = await createFontAtlasTextApp({
        displayText: 'A\nB\nC',
        width: 64,
        height: 64
    });
    global.text = text;
    app.ticker.start();

    const deformer = new TextTransformDeformer();
    text.deform.addDeformer(deformer);
    deformer.transformType = TRANSFORM_TYPE.WORD;

    const timeline = new TickerTimeline(app.ticker);
    timeline.duration = 5000;
    timeline.play();

    const translateProgress = new PingPongTimeline()
    translateProgress.start = 0;
    translateProgress.duration = 5000;
    translateProgress.effect = 1000;

    global.text = text;

    let translation = [0, 0, 0, 0, 0, 0]
    app.ticker.add(() => {
        const progress = translateProgress.value(timeline.time);
        translation[0] = progress * 50; // linear
        translation[2] = normalizedTanh(progress) * 50; // tan
        translation[4] = normalizedSigmoid(progress) * 50; // sigmoid
        deformer.transforms = translation;
        const flicker = Math.random() * 1.0;
        deformer.opacities = [1, flicker, .5];
    });
}

animation();


const test = async() => {
    const {app, text} = await createFontAtlasTextApp({
        displayText: 'What now?',
        width: 64,
        height: 64
    });
    // global.app = app;

    text.x = 0;
    text.y = 0;

    const manipulator = new FontAtlasTextManipulator(text);
    manipulator.caret.caretVisibleDuration = 0;
    app.stage.addChildAt(manipulator, 0);
    // global.manip = manipulator;

    manipulator.click(0, 0, false);
    app.ticker.update();

    (window as any).__PIXI_INSPECTOR_GLOBAL_HOOK__ &&  (window as any).__PIXI_INSPECTOR_GLOBAL_HOOK__.register({ PIXI: PIXI });
}