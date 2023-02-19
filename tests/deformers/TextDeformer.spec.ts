import {createFontAtlasTextApp} from "../utils";
import {TextDeformer, TRANSFORM_TYPE} from "../../src/deformers/TextDeformer";

import { expect } from 'chai';

describe.only('TextDeformer', () => {
    it('passes properties as uniforms to shader', async() => {
        // Assemble
        const displayText = 'AB';
        const {text, app} = await createFontAtlasTextApp({displayText});
        document.body.appendChild(app.view);
        const deformer = new TextDeformer();
        text.deform.addDeformer(deformer);
        deformer.transformType = TRANSFORM_TYPE.BOUNDS;

        // Act
        deformer.scales = [1.5, 1.5];
        deformer.transforms = [10.0, 0.0];
        app.ticker.update();

        // Assert
        expect(text.shader.uniforms.scales).to.deep.equal([1.5, 1.5]);
        expect(text.shader.uniforms.transforms).to.deep.equal([10.0, 0.0]);
        expect(text.shader.uniforms.scaleAnchors).to.deep.equal([7.39453125, 4.734375]);
        expect(deformer.weights).to.deep.equal([0, 0, 0, 0, 0, 0, 0, 0]);
    });

    it('can change transform type', async() => {
        // Assemble
        const displayText = 'A B';
        const {text, app} = await createFontAtlasTextApp({displayText});
        document.body.appendChild(app.view);
        const deformer = new TextDeformer();
        text.deform.addDeformer(deformer);
        deformer.transformType = TRANSFORM_TYPE.BOUNDS;
        app.ticker.update();

        // Act
        deformer.transformType = TRANSFORM_TYPE.WORD;
        app.ticker.update();

        // Assert
        expect(text.shader.uniforms.scales.length).to.equal(4);
        expect(text.shader.uniforms.transforms.length).to.equal(4);
        expect(text.shader.uniforms.scaleAnchors.length).to.equal(4);
        expect(deformer.weights).to.deep.equal([0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1]);
    });

    describe('can generate anchors for', () => {
        it('bounds', async() => {
            const displayText = 'a b\nc d';
            const {text, app} = await createFontAtlasTextApp({
                displayText
            });

            const deformer = new TextDeformer();
            text.deform.addDeformer(deformer);
            deformer.transformType = TRANSFORM_TYPE.BOUNDS;
            app.ticker.update();

            const expectedResult = [9.8994140625, 12]
            expect(deformer.scaleAnchors).to.deep.equal(expectedResult);
        });

        it('line', async() => {
            // Assemble
            const displayText = 'a b\nc d';
            const {text, app} = await createFontAtlasTextApp({
                displayText
            });
            const deformer = new TextDeformer();
            text.deform.addDeformer(deformer);

            // Act
            deformer.transformType = TRANSFORM_TYPE.LINE;
            app.ticker.update();

            // Assert
            const expectedResult = [10.50732421875, 5.9150390625, 7.86181640625, 17.1943359375];
            expect(deformer.scaleAnchors).to.deep.equal(expectedResult);
        });

        it('word', async() => {
            // Assemble
            const displayText = 'a b\nc d';
            const {text, app} = await createFontAtlasTextApp({
                displayText
            });
            const deformer = new TextDeformer();
            text.deform.addDeformer(deformer);

            // Act
            deformer.transformType = TRANSFORM_TYPE.WORD;
            app.ticker.update();

            // Assert
            const expectedResult = [3.2548828125, 5.830078125, 13.03125, 4.55859375, 3.2109375, 17.830078125, 12.5126953125, 16.55859375];
            expect(deformer.scaleAnchors).to.deep.equal(expectedResult);
        });

        it('glyph', async() => {
            // Assemble
            const displayText = 'ab cd';
            const {text, app} = await createFontAtlasTextApp({
                displayText
            });
            const deformer = new TextDeformer();
            text.deform.addDeformer(deformer);

            // Act
            deformer.transformType = TRANSFORM_TYPE.GLYPH;
            app.ticker.update();

            // Assert
            // NOTE: we probably shouldn't have any anchors for our geometry
            const expectedResult = [3.2548828125, 5.830078125, 10.03125, 4.55859375, 14.759765625, 6, 19.470703125, 5.830078125, 25.7724609375, 4.55859375];
            expect(deformer.scaleAnchors).to.deep.equal(expectedResult);
        });
    });

    describe('can generate weights for', () => {
        it('bounds', async() => {
            // Assemble
            const displayText = 'a b\nc d';
            const {text, app} = await createFontAtlasTextApp({
                displayText
            });
            const deformer = new TextDeformer();
            text.deform.addDeformer(deformer);

            // Act
            deformer.transformType = TRANSFORM_TYPE.BOUNDS;
            app.ticker.update();

            // Assert
            const expectedResult = [0];
            expect(Array.from(new Set(deformer.weights))).to.deep.equal(expectedResult);
        })

        it('line', async() => {
            // Assemble
            const displayText = 'a b\nc d';
            const {text, app} = await createFontAtlasTextApp({
                displayText
            });
            const deformer = new TextDeformer();
            text.deform.addDeformer(deformer);

            // Act
            deformer.transformType = TRANSFORM_TYPE.LINE;
            app.ticker.update();

            // Assert
            const expectedResult = [0, 1];
            expect(Array.from(new Set(deformer.weights))).to.deep.equal(expectedResult);
        })

        it('word', async() => {
            // Assemble
            const displayText = 'a b\nc d';
            const {text, app} = await createFontAtlasTextApp({
                displayText
            });
            const deformer = new TextDeformer();
            text.deform.addDeformer(deformer);

            // Act
            deformer.transformType = TRANSFORM_TYPE.WORD;
            app.ticker.update();

            // Assert
            const expectedResult = [0, 1, 2, 3];
            expect(Array.from(new Set(deformer.weights))).to.deep.equal(expectedResult);
        })

        it('glyph', async() => {
            // Assemble
            const displayText = 'a b\nc d';
            const {text, app} = await createFontAtlasTextApp({
                displayText
            });
            const deformer = new TextDeformer();
            text.deform.addDeformer(deformer);

            // Act
            deformer.transformType = TRANSFORM_TYPE.GLYPH;
            app.ticker.update();

            // Assert
            const expectedResult = [0, 1, 2, 3, 4, 5, 6];
            expect(Array.from(new Set(deformer.weights))).to.deep.equal(expectedResult);
        })
    });
})