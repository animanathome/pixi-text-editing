import {createFontAtlasTextApp} from "../utils";
import {TextDeformer, TRANSFORM_TYPE} from "../../src/deformers/TextDeformer";

import { expect } from 'chai';

describe.only('TextDeformer', () => {
    describe('can generate anchors for', () => {
        it('bounds', async() => {
            const displayText = 'a b\nc d';
            const {text, app} = await createFontAtlasTextApp({
                displayText
            });

            const deformer = new TextDeformer();
            text.deform.addDeformer(deformer);
            deformer.transformType = TRANSFORM_TYPE.BOUNDS;

            const expectedResult = [9.8994140625, 12]
            expect(deformer._generateScaleAnchors()).to.deep.equal(expectedResult);
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

            // Assert
            const expectedResult = [10.50732421875, 5.9150390625, 7.86181640625, 17.1943359375];
            expect(deformer._generateScaleAnchors()).to.deep.equal(expectedResult);
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

            // Assert
            const expectedResult = [3.2548828125, 5.830078125, 13.03125, 4.55859375, 3.2109375, 17.830078125, 12.5126953125, 16.55859375];
            expect(deformer._generateScaleAnchors()).to.deep.equal(expectedResult);
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

            // Assert
            // NOTE: we probably shouldn't have any anchors for our geometry
            const expectedResult = [3.2548828125, 5.830078125, 10.03125, 4.55859375, 14.759765625, 6, 19.470703125, 5.830078125, 25.7724609375, 4.55859375];
            expect(deformer._generateScaleAnchors()).to.deep.equal(expectedResult);
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

            // Assert
            const expectedResult = [0];
            expect(Array.from(new Set(deformer._generateWeights()))).to.deep.equal(expectedResult);
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

            // Assert
            const expectedResult = [0, 1];
            expect(Array.from(new Set(deformer._generateWeights()))).to.deep.equal(expectedResult);
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

            // Assert
            const expectedResult = [0, 1, 2, 3];
            expect(Array.from(new Set(deformer._generateWeights()))).to.deep.equal(expectedResult);
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

            // Assert
            const expectedResult = [0, 1, 2, 3, 4, 5, 6];
            expect(Array.from(new Set(deformer._generateWeights()))).to.deep.equal(expectedResult);
        })
    });

    it.only('can generate anchors', async() => {
        const displayText = 'Hello World!';
        const {text, app} = await createFontAtlasTextApp({
            displayText
        });

        const deformer = new TextDeformer();
        text.deform.addDeformer(deformer);
        deformer.transformType = TRANSFORM_TYPE.BOUNDS;
        deformer.scales = [0.5, 0.5];
        deformer.transforms = [1.0, 1.0];
        text.deform.printAssembly();

        document.body.appendChild(app.view);
        app.ticker.update();
    });
})