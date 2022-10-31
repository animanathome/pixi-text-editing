import * as PIXI from 'pixi.js'
import * as dat from 'dat.gui';

import {FontLoader} from "./fontLoader";
import {FontAtlas} from "./fontAtlas";
import {FontAtlasText} from "./fontAtlasText";
import {EditingEvents} from "./events";
import {createFontAtlasTextApp} from "../tests/utils";
import {FontAtlasTextManipulator} from "./fontAtlasTextManipulator";
import { Bezier } from "bezier-js";
import { Vector } from "./vector";


class CustomBufferResource extends PIXI.Resource {
    data: Float32Array;
    internalFormat: PIXI.INTERNAL_FORMATS;
    format: PIXI.FORMATS;
    type: PIXI.TYPES;
    constructor(source, options) {
        const { width, height, internalFormat, format, type } = options || {};

        if (!width || !height || !internalFormat || !format || !type) {
          throw new Error(
            'CustomBufferResource width, height, internalFormat, format, or type invalid'
          );
        }

        super(width, height);

        this.data = source;
        this.internalFormat = internalFormat;
        this.format = format;
        this.type = type;
  }

  upload(renderer, baseTexture, glTexture) {
    const gl = renderer.gl;

    gl.pixelStorei(
      gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,
      baseTexture.alphaMode === 1 // PIXI.ALPHA_MODES.UNPACK but `PIXI.ALPHA_MODES` are not exported
    );

    glTexture.width = baseTexture.width;
    glTexture.height = baseTexture.height;

    gl.texImage2D(
      baseTexture.target,
      0,
      gl[this.internalFormat],
      baseTexture.width,
      baseTexture.height,
      0,
      gl[this.format],
      gl[this.type],
      this.data
    );

    return true;
  }
}

// const pseudoText = 'Lorem ipsum dolor sit amet, ex mutat choro vim. Ne novum pertinacia assueverit duo, sint ferri altera has no'
// const pseudoText = 'Lorem ipsum dolor sit amet'
// const pseudoText = 'Lorem ipsum dolor sit amet, ex mutat choro vim.'
// const pseudoText = 'Hello World!\n' + 'It\'s a new day for text rendering.';
const pseudoText = 'Hello World'

const buildCurve = (points, resolution, nSegments = 10) => {
    const width = resolution.width;
    const height = resolution.height;

    // build curve
    const bezier = new Bezier(points);
    const length = bezier.length();
    const curve = new PIXI.Graphics();
    curve.lineStyle(2, 0xFF0000);

    const nCurve = new PIXI.Graphics();
    nCurve.lineStyle(2, 0x00FF00);

    const tCurve = new PIXI.Graphics();
    tCurve.lineStyle(2, 0x0000FF);

    const positions = [];
    const normals = [];
    const tangents = [];

    const segmentLength = length / nSegments;
    for (let i = 0; i < nSegments; i++) {
        const u = (1.0 / (nSegments - 1)) * i;

        // collect data
        const pos = bezier.get(u);
        const npos = {x: pos.x, y: pos.y};
        const tan = bezier.derivative(u);
        const ntan = new Vector(tan.x, tan.y).normalize();
        const nor = bezier.normal(u)
        const nnor = new Vector(nor.x, nor.y).normalize();

        // build debug curve
        // display normals
        nCurve.moveTo(pos.x, pos.y);
        nCurve.lineTo(pos.x + (nnor.x * 10), pos.y + (nnor.y * 10));

        // display tangents
        // tCurve.moveTo(pos.x, pos.y);
        // tCurve.lineTo(pos.x + (ntan.x * 10), pos.y + (ntan.y * 10));

        positions.push(npos);
        tangents.push(ntan);
        normals.push(nnor);

        if (i === 0) {
            curve.moveTo(pos.x, pos.y);
        }
        else {
            curve.lineTo(pos.x, pos.y);
        }
    }
    return {
        curve,
        nCurve,
        tCurve,
        positions,
        tangents,
        normals,
        length,
        segmentLength
    };
}

const BITS = 3;
function setTextureValue(index, x, y, o, width, data) {
    const i = BITS * width * (o || 0);
    data[index * BITS + i + 0] = x;
    data[index * BITS + i + 1] = y;
    data[index * BITS + i + 2] = 0;
}

const createTexture = (positions, normals, tangents) => {
    const width = positions.length;
    const resolution = width * 4 * BITS;
    const data = new Float32Array(resolution);
    for (let i = 0; i < width; i++) {
        setTextureValue(i, positions[i].x,
            positions[i].y, 0, width, data);

        setTextureValue(i, tangents[i].x,
            tangents[i].y, 1, width, data);

        setTextureValue(i, normals[i].x,
            normals[i].y, 2, width, data);
    }
    const resource = new CustomBufferResource(data, {
      width: width,
      height: 4,
      internalFormat: 'RGB32F',
      format: 'RGB', // var RGBFormat = 1022;
      type: 'FLOAT' // var FloatType = 1015;
    });
    const baseDataTexture = new PIXI.BaseTexture(resource, { scaleMode: PIXI.SCALE_MODES.NEAREST });
    const dataTexture = new PIXI.Texture(baseDataTexture);
    baseDataTexture.scaleMode = PIXI.SCALE_MODES.LINEAR;
    baseDataTexture.mipmap = PIXI.MIPMAP_MODES.OFF;
    return dataTexture;
}

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

    const points = [
        50, 0,
        50, 75,
        50, 100,
        75, 100,
        200, 100,
    ]
    const nSegments = 16;
    const {curve, nCurve, tCurve, positions, normals,
        tangents, length, segmentLength} = buildCurve(
        points, {width: 512, height: 512}, nSegments);
    app.stage.addChild(curve);
    app.stage.addChild(nCurve);
    app.stage.addChild(tCurve);
    const dataTexture = createTexture(positions, normals, tangents);

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
    text.maxWidth = 128;
    text.spineLength = length;
    text.pathSegment = 1.0;
    text.spineOffset = 0;
    text.pathOffset = 0.25;
    text.flow = 1;
    text.text = 'Hello World!\nHow are you?';
    app.stage.addChild(text);
    global.text = text;
    text._curveTexture = dataTexture

    const events = new EditingEvents(app.view, app.stage);
    global.events = events;

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