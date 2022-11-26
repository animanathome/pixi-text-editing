import * as PIXI from "pixi.js";
import * as THREE from 'three';

import {createFontAtlasTextApp, getRenderedPixels} from "./utils";
import {FontAtlasTextGraphic, GRAPHIC_TYPE} from "../src/fontAtlasTextGraphic";
import {expect} from "chai";
import {buildCurveData, createCurveTexture} from "../src/curveDeformer";
import {CurveData} from "../src/curveData";

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
            expect(pixelSum).to.equal(14570359);
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
            expect(pixelSum).to.equal(16261005);
        })

        it('can transform', async() => {
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
            graphicColor.transforms = [0, 10];
            app.stage.addChildAt(graphicColor, 0);
            app.ticker.update()
        })

        it('can deform', async() => {
            // Assemble
            const displayText = "hello world!\nWhat's up?";
            const {app, text} = await createFontAtlasTextApp({
                displayText,
                fontAtlasSize: 36,
                fontSize: 12,
                fontAtlasResolution: 256,
                width: 96,
                height: 96,
            });
            const offsetX = 20;
            const offsetY = 20;
            const points = [
                new THREE.Vector3( 0 + offsetX, 0 + offsetY, 0),
                new THREE.Vector3( 20 + offsetX, 20 + offsetY, 0),
                new THREE.Vector3( 40 + offsetX, 40 + offsetY, 0),
                new THREE.Vector3( 60 + offsetX, 60 + offsetY, 0),
            ]
            const nSegments = 32;
            const {positions, tangents, normals, length} = buildCurveData({
                points,
                nSegments,
                closed: false,
            });
            const dataTexture = createCurveTexture(positions, normals, tangents);
            text.curveTexture = dataTexture;
            text.curveData = new CurveData(positions, tangents, normals);
            text.flow = 1;
            text.spineLength = length;
            text.pathSegment = 1.0;
            text.spineOffset = 0;
            text.pathOffset = 0.0;
            app.ticker.update();

            // Act
            const graphicColor = new FontAtlasTextGraphic(text);
            graphicColor.graphicType = GRAPHIC_TYPE.BOUNDS;
            app.stage.addChildAt(graphicColor, 0);

            app.ticker.update();
        });
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
            expect(pixelSum).to.equal(14651317);
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
            expect(pixelSum).to.equal(16282614);
        })

        it('can transform', async() => {
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
            graphicColor.transforms = [0, 4, 0, 10];
            app.stage.addChildAt(graphicColor, 0);
            app.ticker.update()

            // Assert
            const pixels = getRenderedPixels(app.renderer as PIXI.Renderer);
            const pixelSum = pixels.reduce((a, b) => a + b);
            expect(pixelSum).to.equal(12912737);
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
            expect(pixelSum).to.equal(14740435);
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
            expect(pixelSum).to.equal(16290630);
        });

        it('can transform', async() => {
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
            graphicColor.transforms = [0, 3, 0, 6, 0, 9, 0, 12];
            app.stage.addChildAt(graphicColor, 0);
            app.ticker.update()
        })
    })
})