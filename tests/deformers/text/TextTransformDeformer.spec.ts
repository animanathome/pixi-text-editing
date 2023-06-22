require('../../chia/matchesSnapshot');
import {createFontAtlasTextApp, extractImageData} from "../../utils";
import {TEXT_TRANSFORM_ENUM, TRANSFORM_DIRECTION} from "../../../src/deformers/enums";
import {TextTransformDeformer} from "../../../src/deformers/text/TextTransformDeformer";

import {expect} from 'chai';
import {CurveDeformer} from "../../../src/deformers/base/CurveDeformer";
import * as PIXI from "pixi.js";
import {buildCurveData, createCurveTexture, getStraightLinePositions} from "../../../src/curveDeformer";
import {TextProgressDeformer} from "../../../src/deformers/text/TextProgressDeformer";

describe('TextTransformDeformer', () => {
    it('can mix deformers', async function()  {
        // Assemble
        const displayText = 'TITLES';
        const {text, app} = await createFontAtlasTextApp({
            displayText,
            fontSize: 24,
            fontAtlasSize: 24,
            fontAtlasResolution: 256,
            fontUrl: '../../../resources/Roboto-Bold.ttf'
        });
        document.body.appendChild(app.view);

        // Act
        const start = new PIXI.Point(-64, 10);
        const end = new PIXI.Point(64, -10);
        const points = getStraightLinePositions(start, end, 5);
        const {positions, tangents, normals, length} = buildCurveData({
            points,
            nSegments: 32,
            closed: false,
            normalOverride: new PIXI.Point(0, 1),
        });
        const dataTexture = createCurveTexture(positions, normals, tangents);

        // Act
        const progressDeformer = new TextProgressDeformer()
        text.deform.addDeformer(progressDeformer);
        progressDeformer.transformType = TEXT_TRANSFORM_ENUM.BOUNDS;
        progressDeformer.direction = TRANSFORM_DIRECTION.TOP_TO_BOTTOM;
        progressDeformer.progresses = [0.5];

        const transDeformer = new TextTransformDeformer();
        text.deform.addDeformer(transDeformer);
        transDeformer.transformType = TEXT_TRANSFORM_ENUM.BOUNDS;
        transDeformer.transforms = [0, 10];

        const curveDeformer = new CurveDeformer();
        curveDeformer.texture = dataTexture;
        curveDeformer.spineLength = length;
        curveDeformer.pathOffset = 0.15;
        text.deform.addDeformer(curveDeformer);
        app.ticker.update();

        // Assert
        const imageData = await extractImageData(app.view);
        expect(imageData).to.matchesSnapshot(this);

        // Cleanup
        app.destroy(true, true);
    });

    it('passes properties as uniforms to shader', async() => {
        // Assemble
        const {text, app} = await createFontAtlasTextApp({
            displayText: 'AB',
        });
        document.body.appendChild(app.view);
        const deformer = new TextTransformDeformer();
        text.deform.addDeformer(deformer);
        deformer.transformType = TEXT_TRANSFORM_ENUM.BOUNDS;

        // Act
        deformer.scales = [1.5, 1.5];
        deformer.transforms = [10.0, 10.0];
        app.ticker.update();

        // Assert
        expect(text.shader.uniforms.uScales).to.deep.equal([1.5, 1.5]);
        expect(text.shader.uniforms.uTransforms).to.deep.equal([10.0, 10.0]);
        expect(text.shader.uniforms.uScaleAnchors).to.deep.equal([8.508, 7.4159999999999995]);
        expect(deformer.weights).to.deep.equal([0, 0, 0, 0, 0, 0, 0, 0]);

        // Cleanup
        app.destroy(true, true);
    });

    describe('can change transform type', () => {
        it('from bounds to word', async () => {
            // Assemble
            const displayText = 'A B C';
            const {text, app} = await createFontAtlasTextApp({displayText});
            document.body.appendChild(app.view);
            app.ticker.update();

            const deformer = new TextTransformDeformer();
            text.deform.addDeformer(deformer);
            deformer.transformType = TEXT_TRANSFORM_ENUM.BOUNDS;
            app.ticker.update();

            // Act
            deformer.transformType = TEXT_TRANSFORM_ENUM.WORD;
            deformer.transforms = [0.0, 1.0, 0.0, -1.0, 0.0, 0.0];
            app.ticker.update();

            // Assert
            expect(text.shader.uniforms.uScales.length).to.equal(6);
            expect(text.shader.uniforms.uTransforms.length).to.equal(6);
            expect(text.shader.uniforms.uScaleAnchors.length).to.equal(6);

            // Cleanup
            app.destroy(true, true);
        });
    })

    describe('can generate anchors for', () => {
        it('bounds', async() => {
            const displayText = 'a b\nc d';
            const {text, app} = await createFontAtlasTextApp({
                displayText
            });

            const deformer = new TextTransformDeformer();
            text.deform.addDeformer(deformer);
            deformer.transformType = TEXT_TRANSFORM_ENUM.BOUNDS;
            app.ticker.update();

            const expectedResult = [10.884, 12]
            expect(deformer.scaleAnchors).to.deep.equal(expectedResult);

            // Cleanup
            app.destroy(true, true);
        });

        it('line', async() => {
            // Assemble
            const displayText = 'a b\nc d';
            const {text, app} = await createFontAtlasTextApp({
                displayText
            });
            const deformer = new TextTransformDeformer();
            text.deform.addDeformer(deformer);

            // Act
            deformer.transformType = TEXT_TRANSFORM_ENUM.LINE;
            app.ticker.update();

            // Assert
            const expectedResult = [
                11.511000000000001,
                7.2330000000000005,
                8.46,
                19.830000000000002
            ];
            expect(deformer.scaleAnchors).to.deep.equal(expectedResult);

            // Cleanup
            app.destroy(true, true);
        });

        it('word', async() => {
            // Assemble
            const displayText = 'a b\nc d';
            const {text, app} = await createFontAtlasTextApp({
                displayText
            });
            const deformer = new TextTransformDeformer();
            text.deform.addDeformer(deformer);

            // Act
            deformer.transformType = TEXT_TRANSFORM_ENUM.WORD;
            app.ticker.update();

            // Assert
            const expectedResult = [
                3.306,
                8.466000000000001,
                14.466000000000001,
                7.194,
                3.4139999999999997,
                20.466,
                13.506,
                19.194000000000003
            ];
            expect(deformer.scaleAnchors).to.deep.equal(expectedResult);

            // Cleanup
            app.destroy(true, true);
        });

        it('glyph', async() => {
            // Assemble
            const displayText = 'ab cd';
            const {text, app} = await createFontAtlasTextApp({
                displayText
            });
            const deformer = new TextTransformDeformer();
            text.deform.addDeformer(deformer);

            // Act
            deformer.transformType = TEXT_TRANSFORM_ENUM.GLYPH;
            app.ticker.update();

            // Assert
            // NOTE: we probably shouldn't have any anchors for our geometry
            const expectedResult = [
                3.306,
                8.466000000000001,
                11.466000000000001,
                7.194,
                16.716,
                6,
                21.630000000000003,
                8.466000000000001,
                28.722,
                7.194
            ];
            expect(deformer.scaleAnchors).to.deep.equal(expectedResult);

            // Cleanup
            app.destroy(true, true);
        });
    });

    describe('can generate weights for', () => {
        it('bounds', async() => {
            // Assemble
            const displayText = 'a b\nc d';
            const {text, app} = await createFontAtlasTextApp({
                displayText
            });
            const deformer = new TextTransformDeformer();
            text.deform.addDeformer(deformer);

            // Act
            deformer.transformType = TEXT_TRANSFORM_ENUM.BOUNDS;
            app.ticker.update();

            // Assert
            const expectedResult = [0];
            expect(Array.from(new Set(deformer.weights))).to.deep.equal(expectedResult);

            // Cleanup
            app.destroy(true, true);
        })

        it('line', async() => {
            // Assemble
            const displayText = 'a b\nc d';
            const {text, app} = await createFontAtlasTextApp({
                displayText
            });
            const deformer = new TextTransformDeformer();
            text.deform.addDeformer(deformer);

            // Act
            deformer.transformType = TEXT_TRANSFORM_ENUM.LINE;
            app.ticker.update();

            // Assert
            const expectedResult = [0, 1];
            expect(Array.from(new Set(deformer.weights))).to.deep.equal(expectedResult);

            // Cleanup
            app.destroy(true, true);
        })

        it('word', async() => {
            // Assemble
            const displayText = 'a b\nc d';
            const {text, app} = await createFontAtlasTextApp({
                displayText
            });
            const deformer = new TextTransformDeformer();
            text.deform.addDeformer(deformer);

            // Act
            deformer.transformType = TEXT_TRANSFORM_ENUM.WORD;
            app.ticker.update();

            // Assert
            const expectedResult = [0, 1, 2, 3];
            expect(Array.from(new Set(deformer.weights))).to.deep.equal(expectedResult);

            // Cleanup
            app.destroy(true, true);
        })

        it('glyph', async() => {
            // Assemble
            const displayText = 'a b\nc d';
            const {text, app} = await createFontAtlasTextApp({
                displayText
            });
            const deformer = new TextTransformDeformer();
            text.deform.addDeformer(deformer);

            // Act
            deformer.transformType = TEXT_TRANSFORM_ENUM.GLYPH;
            app.ticker.update();

            // Assert
            const expectedResult = [0, 1, 2, 3, 4, 5, 6];
            expect(Array.from(new Set(deformer.weights))).to.deep.equal(expectedResult);

            // Cleanup
            app.destroy(true, true);
        })
    });
})