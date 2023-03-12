import * as PIXI from "pixi.js";
import {FontLoader} from "../src/fontLoader";
import {FontAtlas} from "../src/fontAtlas";
import {FontAtlasText} from "../src/fontAtlasText";
import {randomText1, randomText2, randomText3} from "./text";
import {TextOpacityDeformer} from "../src/deformers/text/TextOpacityDeformer";
import {TRANSFORM_TYPE} from "../src/deformers/text/TextDeformer";
import {TextProgressDeformer} from "../src/deformers/text/TextProgressDeformer";

// Add <script src="https://greggman.github.io/webgl-memory/webgl-memory.js" crossorigin></script> to index header

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

export const lotsOfText = async () => {
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
    const gl = app.renderer.gl as PIXI.Renderer;
    const ext = gl.getExtension('GMAN_webgl_memory');
    console.log('ext', ext);

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

    const addText = () => {
        // text 1
        const text1 = createTextAsset(atlas, randomText1)
        app.stage.addChild(text1);

        // text 2
        const text2 = createTextAsset(atlas, randomText2)
        text2.position.x = 256;

        const opacityDeformer = new TextOpacityDeformer();
        text2.deform.addDeformer(opacityDeformer);
        opacityDeformer.transformType = TRANSFORM_TYPE.WORD;
        const text2WordCount = opacityDeformer._expectTransformsLength(1);
        const opacities = Array(text2WordCount).fill(0);
        opacityDeformer.opacities = opacities;
        app.stage.addChild(text2);
        console.log('text2', text2WordCount);

        // text 3
        const text3 = createTextAsset(atlas, randomText3)
        const progressDeformer = new TextProgressDeformer()
        text3.deform.addDeformer(progressDeformer);
        progressDeformer.transformType = TRANSFORM_TYPE.WORD;
        const text3WordCount = progressDeformer._expectTransformsLength(1);
        const progresses = Array(text3WordCount).fill(0.0);
        progressDeformer.progresses = progresses;
        console.log('text3', text3WordCount);
        app.stage.addChild(text3);
        text3.position.x = 256;
        text3.position.y = 256;

        return {text1, opacities, progresses, text2WordCount, text3WordCount}
    }

    const {text1,   opacities, progresses, text2WordCount, text3WordCount} = addText();
    app.ticker.start();

    let opacityIndex = 0;
    let progressIndex = 0;
    let tickerCounter = 0;
    app.ticker.add(() => {
        tickerCounter += 1;

        if (tickerCounter === 100 || tickerCounter === 200) {
            if (ext) {
                const info = ext.getMemoryInfo();
                console.log(info);
                console.log(JSON.stringify(info.memory));
                console.log(JSON.stringify(info.resources));
            }
            console.log('frameBuffers', app.renderer.framebuffer.managedFramebuffers.length);
            console.log('textures', app.renderer.texture.managedTextures.length);
            console.log('buffers', Object.keys(app.renderer.buffer.managedBuffers).length);
        }

        // text 1
        if (text1.position.y < 50) {
            text1.position.y += 0.1;
        }

        // text 2
        if (tickerCounter % 10 === 1) {
            opacities[opacityIndex] = 1.0;
            if (opacityIndex < text2WordCount) {
                opacityIndex += 1;
            }
        }

        // text 3
        if (tickerCounter % 2 === 1) {
            progresses[progressIndex] += 0.1;
            if (progresses[progressIndex] >= 1.0) {
                if (progressIndex < text3WordCount) {
                    progressIndex++;
                }
            }

        }
    });
    global.app = app;
}