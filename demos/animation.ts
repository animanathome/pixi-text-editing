import * as PIXI from "pixi.js";
import {FontAtlasText} from "../src/fontAtlasText";
import {FontLoader} from "../src/fontLoader";
import {FontAtlas} from "../src/fontAtlas";
import {PingPongTimeline, ProgressTimeline, TickerTimeline} from "../src/animation/timeline";
import {ProgressIncrementer} from "../src/animation/progressIncrementer";
import {TextOpacityDeformer} from "../src/deformers/text/TextOpacityDeformer";
import {TRANSFORM_TYPE} from "../src/deformers/text/TextDeformer";
import {TextProgressDeformer, TRANSFORM_DIRECTION} from "../src/deformers/text/TextProgressDeformer";
import {InterpolationCache} from "../src/animation/interpolationCache";

const text = 'It is now more important than ever to keep up with health information technology.';
// TODO: alignment options - left, right and center

const buildTextCanvas = async(text: string) => {
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

    // load font
    const fontLoader = new FontLoader();
    const fontUrl = '../../../resources/Roboto-Regular.ttf';
    console.log('fontUrl', fontUrl);
    fontLoader.sourceUrl = fontUrl;
    await fontLoader.load();
    console.log('loaded font');

    // build atlas
    const atlas = new FontAtlas({
        font: fontLoader.font,
        resolution: 512,
        fontSize: 24,
    })
    // pre-load glyphs
    atlas.addGlyphsForString('abcdefghijklmnopqrstuvwxyz');
    atlas.addGlyphsForString('abcdefghijklmnopqrstuvwxyz'.toUpperCase());
    atlas.addGlyphsForString('.!?');

    // build text
    const asset = new FontAtlasText();
    asset.atlas = atlas;
    asset.maxHeight = 200;
    asset.maxWidth = 340;
    asset.fontSize = 18;
    asset.text = text;
    app.stage.addChild(asset);
    asset._build();

    return {
        app,
        asset,
        fontLoader,
        atlas,
    }
}

// similar animation to odyssey:text_default
export const animation = async () => {
    const {app, asset, fontLoader, atlas} = await buildTextCanvas(text);

    const sigmoidInterpolationCache = new InterpolationCache(100, 'sigmoid');

    const progressDeformer = new TextProgressDeformer();
    asset.deform.addDeformer(progressDeformer);
    progressDeformer.transformType = TRANSFORM_TYPE.LINE;
    const textLineCount = progressDeformer._expectTransformsLength(1);
    progressDeformer.direction = TRANSFORM_DIRECTION.TOP_TO_BOTTOM;

    const progressIncrementer = new ProgressIncrementer(textLineCount, sigmoidInterpolationCache);
    progressIncrementer.revert = true;
    progressIncrementer.update();

    const opacityDeformer = new TextOpacityDeformer();
    asset.deform.addDeformer(opacityDeformer);
    opacityDeformer.transformType = TRANSFORM_TYPE.LINE;

    const opacityIncrementer = new ProgressIncrementer(textLineCount, sigmoidInterpolationCache);
    opacityIncrementer.revert = true;
    opacityIncrementer.update();
    opacityDeformer.opacities = opacityIncrementer.array as any;

    // time
    const tickerTimeline = new TickerTimeline(app.ticker);
    tickerTimeline.duration = 3000; // 1 second
    tickerTimeline.play();

    const progressTimeline = new PingPongTimeline();
    progressTimeline.start = 0;
    progressTimeline.duration = 2000;
    progressTimeline.effect = 750;

    app.ticker.add(() => {
        // a timeline can drive the progress for one or multiple incrementers
        const progress = progressTimeline.value(tickerTimeline.time);

        // update incrementers
        opacityIncrementer.progress = progress;
        opacityIncrementer.update();

        progressIncrementer.progress = progress;
        progressIncrementer.update();

        // update deformers
        opacityDeformer.opacities = opacityIncrementer.array as any;
        progressDeformer.progresses = progressIncrementer.array as any;
    });
    app.ticker.start();
}

export const growingUp = async () => {

}