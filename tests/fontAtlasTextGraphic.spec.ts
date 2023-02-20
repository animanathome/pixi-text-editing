import * as PIXI from "pixi.js";

import {createFontAtlasTextApp, getRenderedPixels} from "./utils";
import {FontAtlasTextGraphic, GRAPHIC_TYPE} from "../src/fontAtlasTextGraphic";
import {expect} from "chai";

describe('FontAtlasTextGraphic', () => {
    describe('bounds', () => {
        it('can color', async() => {
            // Assemble
            const displayText = "hello world!\nWhat's up?";
            const {text, app} = await createFontAtlasTextApp({
                displayText,
                width: 64,
                height: 64,
            })

            // Act
            const graphicColor = new FontAtlasTextGraphic(text);
            graphicColor.graphicType = GRAPHIC_TYPE.BOUNDS;
            graphicColor.xProgress = 0.5;
            app.stage.addChildAt(graphicColor, 0);
            app.ticker.update()

            // Assert
            const pixels = getRenderedPixels(app.renderer as PIXI.Renderer);
            const pixelSum = pixels.reduce((a, b) => a + b);
            expect(pixelSum).to.equal(14415988);

            // Cleanup
            app.destroy(true, true);
        })

        it('can mask', async() => {
            // Assemble
            const displayText = "hello world!\nWhat's up?";
            const {text, app} = await createFontAtlasTextApp({
                displayText,
                width: 64,
                height: 64,
            })

            // Act
            const graphicMask = new FontAtlasTextGraphic(text);
            graphicMask.graphicType = GRAPHIC_TYPE.BOUNDS;
            graphicMask.xProgress = 0.5;
            app.stage.addChildAt(graphicMask, 0);
            app.ticker.update()

            // generate mask texture
            const texture = app.renderer.generateTexture(graphicMask._mesh);
            const graphicMaskSprite = new PIXI.Sprite(texture);
            app.stage.addChild(graphicMaskSprite);
            text.mask = graphicMaskSprite;
            graphicMask.visible = false;
            app.ticker.update()

            // Assert
            const pixels = getRenderedPixels(app.renderer as PIXI.Renderer);
            const pixelSum = pixels.reduce((a, b) => a + b);
            expect(pixelSum).to.equal(16260867);

            // Cleanup
            app.destroy(true, true);
        })
    })

    describe('line', () => {
        it('can color', async() => {
            // Assemble
            const displayText = "hello world!\nWhat's up?";
            const {text, app} = await createFontAtlasTextApp({
                displayText,
                width: 64,
                height: 64,
            })
            text.lineHeight = 1.5;

            // Act
            const graphicColor = new FontAtlasTextGraphic(text);
            graphicColor.graphicType = GRAPHIC_TYPE.LINE;
            graphicColor.xProgress = 0.5;
            app.stage.addChildAt(graphicColor, 0);
            app.ticker.update()

            // Assert
            const pixels = getRenderedPixels(app.renderer as PIXI.Renderer);
            const pixelSum = pixels.reduce((a, b) => a + b);
            expect(pixelSum).to.equal(14488266);

            // Cleanup
            app.destroy(true, true);
        })

        it('can mask', async() => {
            // Assemble
            const displayText = "hello world!\nWhat's up?";
            const {text, app} = await createFontAtlasTextApp({
                displayText,
                width: 64,
                height: 64,
            })
            text.lineHeight = 1.5;

            // Act
            const graphicMask = new FontAtlasTextGraphic(text);
            graphicMask.graphicType = GRAPHIC_TYPE.LINE;
            graphicMask.xProgress = 0.5;
            app.stage.addChildAt(graphicMask, 0);
            app.ticker.update()

            // generate mask texture
            const texture = app.renderer.generateTexture(graphicMask._mesh);
            const graphicMaskSprite = new PIXI.Sprite(texture);
            app.stage.addChild(graphicMaskSprite);
            text.mask = graphicMaskSprite;
            graphicMask.visible = false;
            app.ticker.update()

            // Assert
            const pixels = getRenderedPixels(app.renderer as PIXI.Renderer);
            const pixelSum = pixels.reduce((a, b) => a + b);
            expect(pixelSum).to.equal(16282485);

            // Cleanup
            app.destroy(true, true);
        })
    })

    describe('word', () => {
        it('can color', async() => {
            // Assemble
            const displayText = "hello world!\nWhat's up?";
            const {text, app} = await createFontAtlasTextApp({
                displayText,
                width: 64,
                height: 64,
            })
            text.lineHeight = 1.5;

            // Act
            const graphicColor = new FontAtlasTextGraphic(text);
            graphicColor.graphicType = GRAPHIC_TYPE.WORD;
            graphicColor.xProgress = 0.5;
            app.stage.addChildAt(graphicColor, 0);
            app.ticker.update()

            // Assert
            const pixels = getRenderedPixels(app.renderer as PIXI.Renderer);
            const pixelSum = pixels.reduce((a, b) => a + b);
            expect(pixelSum).to.equal(14569256);

            // Cleanup
            app.destroy(true, true);
        });

        it('can mask', async() => {
            // Assemble
            const displayText = "hello world!\nWhat's up?";
            const {text, app} = await createFontAtlasTextApp({
                displayText,
                width: 64,
                height: 64,
            })
            text.lineHeight = 1.5;

            // Act - build graphic
            const graphicMask = new FontAtlasTextGraphic(text);
            graphicMask.graphicType = GRAPHIC_TYPE.WORD;
            graphicMask.xProgress = 0.5;
            app.stage.addChildAt(graphicMask, 0);
            app.ticker.update()

            // generate mask texture
            const texture = app.renderer.generateTexture(graphicMask._mesh);
            const graphicMaskSprite = new PIXI.Sprite(texture);
            app.stage.addChild(graphicMaskSprite);
            text.mask = graphicMaskSprite;
            graphicMask.visible = false;
            app.ticker.update()

            // Assert
            const pixels = getRenderedPixels(app.renderer as PIXI.Renderer);
            const pixelSum = pixels.reduce((a, b) => a + b);
            expect(pixelSum).to.equal(16290507);

            // Cleanup
            app.destroy(true, true);
        });
    })
})