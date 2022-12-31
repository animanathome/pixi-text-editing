import * as PIXI from 'pixi.js';
import * as THREE from 'three';

import { expect } from 'chai';
import {TRANSFORM_TYPE} from "../src/fontAtlasText";
import {createFontAtlasText, createFontAtlasTextApp, getRenderedPixels, roundBounds} from "./utils";
import {LEFT, RIGHT} from "../src/fontAtlasTextGeometry";
import {buildCurveData, createCurveTexture} from "../src/curveDeformer";
import {CurveData} from "../src/curveData";

// TODO: fix fontAtlasSize
// TODO: glyph lookup across multiple textures

describe('fontAtlasText', () => {
    it('can change font size', async() => {
        // Assemble + act
        const displayText = "hello world!\nWhat's up?";
        const {text, app} = await createFontAtlasTextApp({
            displayText,
            width: 256,
            height: 256,
            fontSize: 12
        });
        document.body.appendChild(app.view);
        app.ticker.update();

        // Assert fontSize 12
        let {x, y, width, height} = roundBounds(text.getBounds());
        expect(x).to.equal(0);
        expect(y).to.equal(0);
        expect(width).to.equal(64);
        expect(height).to.equal(24);

        // Act - double the font size from 12 to 24
        text.fontSize = 24;
        app.ticker.update();

        // Assert fontSize 24
        ({x, y, width, height} = roundBounds(text.getBounds()));
        expect(x).to.equal(1);
        expect(y).to.equal(0);
        expect(width).to.equal(128);
        expect(height).to.equal(48);
    });

    it('can change line height', async() => {
        // Assemble + act
        const {text} = await createFontAtlasText({
            displayText: 'a\nb'
        });

        // Assert
        let {x, y, width, height} = roundBounds(text.getBounds());
        expect(x).to.equal(1);
        expect(y).to.equal(0);
        expect(width).to.equal(9);
        expect(height).to.equal(21);

        // Act
        text.lineHeight = 2.0;
        text._build();

        // Assert
        ({x, y, width, height} = roundBounds(text.getBounds()));
        expect(x).to.equal(1);
        expect(y).to.equal(0);
        expect(width).to.equal(9);
        expect(height).to.equal(33);
    });

    it('can render simple text', async () => {
        // Assemble
        const displayText = 'hello World!\n' + 'It\'s a new day for text rendering.';
        const fontAtlasSize = 36; // a multiple of the fontSize results in sharper text
        const fontSize = 12;
        const fontAtlasResolution = 256;
        const {app} = await createFontAtlasTextApp({
            width: 128,
            height: 128,
            resolution: 2, // 2 results in sharper text
            displayText,
            fontAtlasSize,
            fontAtlasResolution,
            fontSize
        })

        // Act
        const pixels = getRenderedPixels(app.renderer as PIXI.Renderer);

        // Assert
        expect(pixels.reduce((a, b) => a + b)).to.be.lessThan(pixels.length * 255)
    })

    describe('can calculate', () => {
        it('bounds', async() => {
            // Assemble
            const displayText = 'Hello World!\n' + 'It\'s a new day for text rendering.';
            const {text} = await createFontAtlasText({
                displayText
            })

            // Act
            const {x, y, width, height} = text.getBounds()

            // Assert
            expect(x).to.equal(0.8203125);
            expect(y).to.equal(0);
            expect(width).to.equal(115.353515625);
            expect(height).to.equal(35.49609375);
        });

        describe('line index array for', () => {
            it('broken lines with new lines', async() => {
                // Assemble
                const displayText = 'Hello World!\n' + 'It\'s a new day for text rendering.';
                const {text} = await createFontAtlasText({
                    displayText
                })

                // Act and assert
                let expectedLines = [12, 36, 46]
                // console.log(text._logGlyphs(text.lines))
                expect(text.lines).to.eql(expectedLines);
            });

            it('two broken lines do not start with a space', async() => {
                const displayText = 'ab cd ef gh'
                const {text} = await createFontAtlasText({
                    displayText,
                    width: 32,
                    height: 32
                })

                let expectedLines = [5, 10]
                // console.log(text._logGlyphs(text.lines))
                expect(text.lines).to.eql(expectedLines);
            })

            it('two broken lines do not start with multiple spaces', async() => {
                const displayText = 'ab cd   ef gh'
                const {text} = await createFontAtlasText({
                    displayText,
                    width: 32,
                    height: 32,
                })

                let expectedLines = [7, 12]
                // console.log(text._logGlyphs(text.lines))
                expect(text.lines).to.eql(expectedLines);
            })

            it('new line at the end of the line', async() => {
                const displayText = 'ab cd\nef gh'
                const {text} = await createFontAtlasText({
                    displayText,
                    width: 32,
                    height: 32,
                })

                let expectedLines = [5, 10]
                // console.log(text._logGlyphs(text.lines))
                expect(text.lines).to.eql(expectedLines);
            })

            it('two new lines', async() => {
                const displayText = '\n\n'
                const {text} = await createFontAtlasText({
                    displayText,
                    width: 32,
                    height: 32,
                });

                let expectedLines = [0, 1]
                // console.log(text._logGlyphs(text.lines))
                expect(text.lines).to.eql(expectedLines);
            })

            it('two characters with each a new line', async() => {
                const displayText = 'a\nb\n'
                const {text} = await createFontAtlasText({
                    displayText
                });

                let expectedLines = [1, 3];
                // console.log(text._logGlyphs(text.lines))
                expect(text.lines).to.eql(expectedLines);
            })
        });

        it('word index array', async() => {
            // Assemble
            const displayText = 'Hello World!\n' + 'It\'s a new day for text rendering.';
            const {text} = await createFontAtlasText({
                displayText
            });

            // Act and assert
            const expectedWords = [
                // line 1
                [ 0, 1, 2, 3, 4 ], // Hello
                [ 6, 7, 8, 9, 10, 11 ], // World!
                // line 2
                [ 13, 14, 15, 16 ], // It's
                [ 18 ], // a
                [ 20, 21, 22 ], // new
                [ 24, 25, 26 ], // day
                [ 28, 29, 30 ], // for
                [ 32, 33, 34, 35 ], // text
                // line 3
                [ 37, 38, 39, 40, 41, 42, 43, 44, 45, 46] // rendering.
            ]
            expect(text.words).to.eql(expectedWords);
        });
    });

    describe('can get', () => {
        it('word index for glyph', async() => {
            // Assemble
            const displayText = 'Hello World!\n' + 'It\'s a new day for text rendering.';
            const {text} = await createFontAtlasText({
                displayText
            });

            // Act and assert
            expect(text.glyphWordIndex(0)).to.equal(0)
            expect(text.glyphWordIndex(8)).to.equal(1)
            expect(text.glyphWordIndex(15)).to.equal(2)
            expect(text.glyphWordIndex(18)).to.equal(3)
            expect(text.glyphWordIndex(37)).to.equal(8)
        });

        it('line index for glyph', async() => {
            // Assemble
            const displayText = 'Hello World!\n' + 'It\'s a new day for text rendering.';
            const {text} = await createFontAtlasText({
                displayText
            });

            // Act and assert
            expect(text.glyphLineIndex(0)).to.equal(0)
            expect(text.glyphLineIndex(11)).to.equal(0)
            expect(text.glyphLineIndex(21)).to.equal(1)
            expect(text.glyphLineIndex(37)).to.equal(2)
            expect(text.glyphLineIndex(46)).to.equal(2)
        });

        describe('glyph', () => {
            it('closest to position', async() => {
                // Assemble
                const displayText = 'Hello World!\n' + 'It\'s a new day for text rendering.';
                const {text} = await createFontAtlasText({
                    displayText
                });

                // Act and assert
                expect(text.closestGlyph(12, 8)).to.eql([1, 1]);
                expect(text.closestGlyph(42, 28)).to.eql([44, 1]);
                expect(text.closestGlyph(62, 18)).to.eql([25, 0]);
                expect(text.closestGlyph(39, 4)).to.eql([6, 1]);
                expect(text.closestGlyph(37, 16)).to.eql([21, 0]);
            })

            it('before', async() => {
                const displayText = 'Hello World!\n' + 'It\'s a new day for text rendering.';
                const {text} = await createFontAtlasText({
                    displayText
                });

                // Act and aser
                expect(text.getGlyphBefore(0, 0)).to.eql([0, LEFT]);
                expect(text.getGlyphBefore(5, 0)).to.eql([4, LEFT]);
                expect(text.getGlyphBefore(7, 0)).to.eql([6, LEFT]);
                expect(text.getGlyphBefore(12, 0)).to.eql([11, LEFT]);
                expect(text.getGlyphBefore(100, 0)).to.eql([46, LEFT]);
           });

            it('after', async() => {
                // Hello World!
                // It's a new day for text
                // rendering.
                const displayText = 'Hello World!\n' + 'It\'s a new day for text rendering.';
                const {text} = await createFontAtlasText({
                    displayText
                });

                // Act and assert
                expect(text.getGlyphAfter(0, LEFT)).to.eql([1,LEFT]);
                expect(text.getGlyphAfter(5, LEFT)).to.eql([6,LEFT]);
                expect(text.getGlyphAfter(11, LEFT)).to.eql([11, RIGHT]);
                expect(text.getGlyphAfter(38, LEFT)).to.eql([39,LEFT]);
                expect(text.getGlyphAfter(100, LEFT)).to.eql([46,LEFT]);
           });

            it('above', async() => {
                // Hello World!
                // It's a new day for text
                // rendering.
                const displayText = 'Hello World!\n' + 'It\'s a new day for text rendering.';
                const {text} = await createFontAtlasText({
                    displayText
                });

                expect(text.getGlyphAbove(0)).to.eql([0, LEFT]);
                expect(text.getGlyphAbove(13)).to.eql([0, LEFT]);
                expect(text.getGlyphAbove(15)).to.eql([1, LEFT]);
                expect(text.getGlyphAbove(23)).to.eql([8, LEFT]);
                expect(text.getGlyphAbove(35)).to.eql([12, RIGHT]);
           });

            it('below', async() => {
                // Hello World!
                // It's a new day for text
                // rendering.
                const displayText = 'Hello World!\n' + 'It\'s a new day for text rendering.';
                const {text} = await createFontAtlasText({
                    displayText
                });

                // Act and assert
                expect(text.getGlyphBelow(0)).to.eql([15, LEFT]);
                expect(text.getGlyphBelow(4)).to.eql([18, LEFT]);
                expect(text.getGlyphBelow(9)).to.eql([24, LEFT]);
                expect(text.getGlyphBelow(11)).to.eql([25, LEFT]);
                expect(text.getGlyphBelow(13)).to.eql([37, LEFT]);
                expect(text.getGlyphBelow(46)).to.eql([46, LEFT]);
           });
        });

        describe('word', () => {
            it('closest to position', async() => {
                // Assemble
                const displayText = 'Hello World!\n' + 'It\'s a new day for text rendering.';
                const {text} = await createFontAtlasText({
                    displayText
                });

                // Act and assert
                expect(text.closestWord(12, 8)).to.eql(0);
                expect(text.closestWord(42, 28)).to.eql(8);
                expect(text.closestWord(62, 18)).to.eql(5);
                expect(text.closestWord(39, 4)).to.eql(1);
                expect(text.closestWord(37, 16)).to.eql(4);
            })
        })

        describe('line', () => {
            it('closest to position', async() => {
                // Assemble
                const displayText = 'Hello World!\n' + 'It\'s a new day for text rendering.';
                const {text} = await createFontAtlasText({
                    displayText
                });

                // Act and assert
                expect(text.closestLine(12, 8)).to.eql(0);
                expect(text.closestLine(42, 28)).to.eql(2);
                expect(text.closestLine(62, 18)).to.eql(1);
                expect(text.closestLine(39, 4)).to.eql(0);
                expect(text.closestLine(37, 16)).to.eql(1);
            })
        })
    });

    describe('can edit', () => {
        it('text', async() => {
            // Assemble
            const displayText = 'Hello World!\n' + 'It\'s a new day for text rendering.';
            const {app, text} = await createFontAtlasTextApp({
                displayText
            });
            // uncomment if you want to see the text
            // document.body.appendChild(app.view);

            // Act and assert
            app.ticker.update();
            let roundedBounds = roundBounds(text.getBounds());
            expect(roundedBounds.width).to.equal(115);
            expect(roundedBounds.height).to.equal(35);

            // Act and assert
            text.text = 'Hello World!\n' + 'It\'s a new day';
            app.ticker.update();
            roundedBounds = roundBounds(text.getBounds());
            expect(roundedBounds.width).to.equal(71);
            expect(roundedBounds.height).to.equal(24);
       })
    });

    describe('can deform', () => {
        it('using a linear curve', async() => {
            // Assemble
            const displayText = "hello world!\nWhat's up?";
            const {app, text} = await createFontAtlasTextApp({
                displayText,
                fontAtlasSize: 36,
                fontSize: 12,
                fontAtlasResolution: 256,
                width: 96,
                height: 96,
                resolution: 2,
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
            const normal = {x: 0, y: 1, z: 0};
            const {positions, tangents, normals, length} = buildCurveData({
                points,
                nSegments,
                closed: false,
                normalOverride: normal
            });
            const dataTexture = createCurveTexture(positions, normals, tangents);

            // Act
            // TODO: need a cleaner way to deal with deformers
            text.curveTexture = dataTexture;
            text.curveData = new CurveData(positions, tangents, normals);
            text.flow = 1;
            text.spineLength = length;
            text.pathSegment = 1.0;
            text.spineOffset = 0;
            text.pathOffset = 0.0;
            app.ticker.update()

            // Assert
            const program = text.shader.program;
            expect(program.vertexSrc).to.include('spinePortion');
            expect(program.fragmentSrc).to.include('uSampler2');

            // TODO: make a convenience method for this
            const pixels = getRenderedPixels(app.renderer as PIXI.Renderer)
            expect(pixels.reduce((a, b) => a + b)).to.equal(37046445);
        })

        it('using a bezier curve', async() => {
            // Assemble
            const displayText = "hello world!\nWhat's up?";
            const {app, text} = await createFontAtlasTextApp({
                displayText,
                fontAtlasSize: 36,
                fontSize: 12,
                fontAtlasResolution: 256,
                width: 96,
                height: 96,
                resolution: 2,
            });

            const offsetX = 20;
            const offsetY = -16;
            const radius = 48;
            const points = [
                new THREE.Vector3( 0 + offsetX, 0 + offsetY, 0),
                new THREE.Vector3( 0 + offsetX, radius + offsetY, 0),
                new THREE.Vector3( radius + offsetX, radius + offsetY, 0),
                new THREE.Vector3( radius + offsetX, 0 + offsetY, 0),
            ]
            const nSegments = 32;
            const {positions, tangents, normals, length} = buildCurveData({
                points,
                nSegments
            });
            const dataTexture = createCurveTexture(positions, normals, tangents);

            // Act
            // TODO: need a cleaner way to deal with deformers
            text.curveTexture = dataTexture;
            text.curveData = new CurveData(positions, tangents, normals);
            text.flow = 1;
            text.spineLength = length;
            text.pathSegment = 1.0;
            text.spineOffset = 0;
            text.pathOffset = 0.24;
            app.ticker.update();

            // Assert
            const program = text.shader.program;
            expect(program.vertexSrc).to.include('spinePortion');
            expect(program.fragmentSrc).to.include('uSampler2');
            const pixels = getRenderedPixels(app.renderer as PIXI.Renderer)
            expect(pixels.reduce((a, b) => a + b)).to.equal(36459858);
        })
    })

    describe('can translate', () => {
        // todo: add object mode
        it('line', async() => {
            // Assemble
            const displayText = "hello world!\nWhat's up?";
            const {app, text} = await createFontAtlasTextApp({
                displayText,
                transformType: TRANSFORM_TYPE.LINE, // TODO: make dynamic (not just on init)
                width: 72,
                height: 72,
            });
            text.transforms = [0, 0, 10, 0];
            app.ticker.update();

            // ASSERT
            const pixels = getRenderedPixels(app.renderer as PIXI.Renderer)
            expect(pixels.reduce((a, b) => a + b)).to.equal(20369448);
        });

        it('word', async() => {
            // Assemble
            const displayText = "hello world!\nWhat's up?";
            const {app, text} = await createFontAtlasTextApp({
                displayText,
                transformType: TRANSFORM_TYPE.WORD, // TODO: make dynamic (not just on init)
                width: 72,
                height: 72,
            });
            text.transforms = [0, 2, 0, 4, 0, 6, 0, 8];
            app.ticker.update();

            // ASSERT
            const pixels = getRenderedPixels(app.renderer as PIXI.Renderer)
            expect(pixels.reduce((a, b) => a + b)).to.equal(20369448);
        });

        it('glyph', async() => {
            // Assemble
            const displayText = "hello world!\nWhat's up?";
            const {app, text} = await createFontAtlasTextApp({
                displayText,
                transformType: TRANSFORM_TYPE.GLYPH, // TODO: make dynamic (not just on init)
                width: 72,
                height: 72,
            });

            // TODO: see how we can add support to the spread operator
            const glyphs = (text) => {
                const result = []
                for (const c in text) result.push(c)
                return result;
            }
            // offset each glyph by one more than the previous glyph
            const transforms = glyphs(displayText)
                .map((glyph, index) => [0, index])
                .flat()
            text.transforms = transforms;
            app.ticker.update();

            // ASSERT
            // TODO: the pixel count is actually the same accross the different transform tests so we need to
            //  use something else
            const pixels = getRenderedPixels(app.renderer as PIXI.Renderer)
            expect(pixels.reduce((a, b) => a + b)).to.equal(20369448);
        });
    })

    describe('can scale', () => {
        it.only('bounds', async() => {
            // Assemble
            const displayText = "hello world!\nWhat's up?";
            const {app, text} = await createFontAtlasTextApp({
                displayText,
                transformType: TRANSFORM_TYPE.LINE, // TODO: make dynamic (not just on init)
                width: 72,
                height: 72,
            });
            text.transforms = [0, 0, 0, 0];
            text.scales = [0.5, 0.5, 1.5, 1.5];
            app.ticker.update();

            // ASSERT
            // const pixels = getRenderedPixels(app.renderer as PIXI.Renderer)
            // expect(pixels.reduce((a, b) => a + b)).to.equal(20369448);
        });
    })
});