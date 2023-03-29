import {buildTextCanvas} from "./utilities";
import {ProgressTimeline, TickerTimeline} from "../src/animation/timeline";
import {TextOpacityDeformer} from "../src/deformers/text/TextOpacityDeformer";
import {TRANSFORM_TYPE} from "../src/deformers/text/TextDeformer";
import {ProgressIncrementer} from "../src/animation/progressIncrementer";
import {InterpolationCache} from "../src/animation/interpolationCache";
import {FontAtlasTextGraphic, GRAPHIC_TYPE} from "../src/fontAtlasTextGraphic";
import {TextGraphicOpacityDeformer} from "../src/deformers/text_graphic/TextGraphicOpacityDeformer";
import {OneByOne} from "../src/animation/oneByOne";


export const focusOnWordByWordByUsingGraphic = async() => {
    const {app, asset} = await buildTextCanvas("Lorem ipsum dolor sit amet, novum dolore concludaturque vis ne. Cu usu nibh idque, id sit mutat.");

    const graphicColor = new FontAtlasTextGraphic(asset);
    graphicColor.graphicType = GRAPHIC_TYPE.WORD;
    app.stage.addChildAt(graphicColor, 0);
    graphicColor._build();

    const graphicOpacityDeformer = new TextGraphicOpacityDeformer()
    graphicColor.deform.addDeformer(graphicOpacityDeformer);

    const wordCount = graphicColor.graphicCount;
    const oneByOneOpacity = new OneByOne(wordCount);
    oneByOneOpacity.update();

    graphicOpacityDeformer.opacities = oneByOneOpacity.array as any;


    // time
    const tickerTimeline = new TickerTimeline(app.ticker);
    tickerTimeline.duration = 8000; // 1 second
    tickerTimeline.play();

    const progressTimeline = new ProgressTimeline();
    progressTimeline.start = 0;
    progressTimeline.end = 6000;

    app.ticker.add(() => {
        const progress = progressTimeline.value(tickerTimeline.time);

        oneByOneOpacity.progress = progress;
        oneByOneOpacity.update();

        graphicOpacityDeformer.opacities = oneByOneOpacity.array as any;
    });
    app.ticker.start();
}

/**
 * Focus on each word one at a time by toggling the word's opacity from partially transparent to fully opaque.
 */
export const focusOnWordByWordByUsingOpacity = async() => {
    const {app, asset} = await buildTextCanvas("Lorem ipsum dolor sit amet, novum dolore concludaturque vis ne. Cu usu nibh idque, id sit mutat.");

    const steppedInterpolationCache = new InterpolationCache(100, 'stepped', 0.25, 1.0);

    const assetOpacityDeformer = new TextOpacityDeformer();
    asset.deform.addDeformer(assetOpacityDeformer);
    assetOpacityDeformer.transformType = TRANSFORM_TYPE.WORD;
    const assetGlyphCount = assetOpacityDeformer._expectTransformsLength(1);

    const opacityIncrementer = new ProgressIncrementer(assetGlyphCount, steppedInterpolationCache, 1);
    opacityIncrementer.duration = 5;
    opacityIncrementer.update();
    assetOpacityDeformer.opacities = opacityIncrementer.array as any;

    // time
    const tickerTimeline = new TickerTimeline(app.ticker);
    tickerTimeline.duration = 8000; // 1 second
    tickerTimeline.play();

    const progressTimeline = new ProgressTimeline();
    progressTimeline.start = 0;
    progressTimeline.end = 6000;

    app.ticker.add(() => {
        const progress = progressTimeline.value(tickerTimeline.time);

        opacityIncrementer.progress = progress;
        opacityIncrementer.update();

        assetOpacityDeformer.opacities = opacityIncrementer.array as any;
    });
    app.ticker.start();
}