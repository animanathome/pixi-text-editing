import * as fs from "fs";
import { expect } from 'chai';
import {FontAtlasText} from "../src/fontAtlasText";
import {FontLoader} from "../src/fontLoader";
import {FontAtlas} from "../src/fontAtlas";
import * as PIXI from "pixi.js";

const createFontAtlasText = async(
    displayText = 'abc',
    width = 128,
    height = 128,
    fontAtlasSize = 12,
    fontAtlasResolution = 128,
    fontUrl = 'http://localhost:8000/resources/Roboto-Regular.ttf'
) => {
    const fontLoader = new FontLoader();
    fontLoader.sourceUrl = fontUrl;
    await fontLoader.load();

    const atlas = new FontAtlas({
        font: fontLoader.font,
        resolution: fontAtlasResolution,
        fontSize: fontAtlasSize,
    })

    const text = new FontAtlasText();
    text.atlas = atlas;
    text.maxHeight = width;
    text.maxWidth = height;
    text.text = displayText;
    text._build();

    return {
        fontLoader,
        atlas,
        text,
    }
}

describe('fontAtlasText', () => {
    it('can render latin text', async () => {
        // Arrange
        // TODO: look into shared loader
        const app = new PIXI.Application({
            backgroundColor: 0xffffff,
            width: 128,
            height: 128,
        });
        app.ticker.stop();

        const fontLoader = new FontLoader();
        const fontUrl = 'http://localhost:8000/resources/Roboto-Regular.ttf'
        fontLoader.sourceUrl = fontUrl;
        await fontLoader.load();

        const atlas = new FontAtlas({
            font: fontLoader.font,
            resolution: 128,
            fontSize: 24,
        })

        const text = new FontAtlasText();
        text.atlas = atlas;
        text.maxHeight = 128;
        text.maxWidth = 128;
        text.text = 'hello World!\n' + 'It\'s a new day for text rendering.';

        // Act
        text._build();
        app.stage.addChild(text);
        app.ticker.update();

        // Assert

        // @ts-ignore
        const url = app.view.toDataURL()
        const base64Data = url.replace(/^data:image\/png;base64,/, "");
        fs.writeFile('./tests/test.png', base64Data, 'base64', function (err) {
            console.log(err);
        });
        // const expectedImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAARqElEQVR4Xu3cBZBdxRIG4Fnc3d3d3Qnu7u4UTuFuwd3dnSK4u7u7u2sgQAi+r75JzdbdJSQvyzJMLtNVqd2695wzPd1/y/x9Ni2tra2tocp/1gItFQD/Wd/HjVcA/Lf93xcA3bp1Cy0tLeHee+9tM8d9990XDjzwwDDYYIOFe+65Z4BmWnXVVcMXX3wRHnrooXjtxBNPHNZdd91w+OGHD/DexguWX375MOaYY4YjjzwyjDXWWPGrrbfeOrz++uuBnttvv30YddRRw08//RQ222yz8Mknn7TTe2AWW2+99cIrr7wSnn322X7etuuuu4Zjjz02pCpp/ZFGGinccMMNA7NM0ddGAHC+f3/88UebssCw6KKLhkUWWSQrACaZZJLw8ccfR8dMOeWU4Ycffgizzz57ePPNN8OCCy4YLr/88jDeeOOFc845J+y1115hhRVWCOedd16njNwRABzd2BLttttu4bjjjmv7bPjhhw8jjDBC+Pzzzzu1Xok3tQPA77//HnVkhPvvv78dAHx23XXXhSuvvDI8//zzYaqppooOmGuuuSJ4+pcBZAb3cp6InWaaaWJUL7XUUvHeRllnnXXC9ddfHy655JKw7LLLhrvuuitsscUWEQg///xzePnllyMwVlpppXD77beHs846K2y44Ybhgw8+CBdddFG817WzzTZb2GOPPcKMM84Y15CNPv3005g97rzzzvD999+HRgDY3x133BHXtb8ZZpghAvGBBx5oA8C4444bVfWcZpE2ANjQ/vvv37YvBjn44IPbMsC1114bunfvHoYZZphoHCl5iCGGiPdIjf0DgFIiSkceeeQYvaJ5uOGGCwcccEBYY4012tny+OOPD4ccckhYe+2143pHHHFEdDKwcPjJJ58cnatU/Pjjj+Hxxx8Pk046adhkk03CbbfdFkvPiCOOGJ0IKJ4HpJNPPnksLS+++GKYZZZZwsMPP9wOAJx/0EEHRafLen4qZ3369GkDwNRTTx1/f+ONN5rF/317gBSF6n2jKAmpBGy77bbhtddei45hzK+++iqcdNJJYYEFFohO6h8AVltttdCzZ8/YUyy88MLhjDPOiMZeeumlw/nnn99uzffeey+uyfCPPPJIkBFGGWWUWO933nnneI/1peZVVlklHHbY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';
        // expect(outputImage).to.equal(expectedImage);
    })

    describe('can calculate', () => {
        it('bounds', async() => {
            // Assemble
            const displayText = 'Hello World!\n' + 'It\'s a new day for text rendering.';
            const {text} = await createFontAtlasText(displayText)

            // Act
            const {x, y, width, height} = text.getBounds()

            // Assert
            expect(x).to.equal(0.8203125);
            expect(y).to.equal(0);
            expect(width).to.equal(115.353515625);
            expect(height).to.equal(35.49609375);
        });

        it('line index array', async() => {
            // Assemble
            const displayText = 'Hello World!\n' + 'It\'s a new day for text rendering.';
            const {text} = await createFontAtlasText(displayText)

            // Act and assert
            // TODO: not sure how useful this actually is. I would imagine we only need the first and last glyph
            //  index for each line to determine the range
            let expectedLines = [
                [0, 1, 2, 3, 4, 6, 7, 8, 9, 10, 11],
                [13, 14, 15, 16, 18, 20, 21, 22, 24, 25, 26, 28, 29, 30, 32, 33, 34, 35],
                [37, 38, 39, 40, 41, 42, 43, 44, 45, 46]
            ]
            expect(text.lines).to.eql(expectedLines);
        });

        it('word index array', async() => {
            // Assemble
            const displayText = 'Hello World!\n' + 'It\'s a new day for text rendering.';
            const {text} = await createFontAtlasText(displayText)

            // Act and assert
            // TODO: not sure how useful this actually is. I would imagine we only need the first and last glyph
            //  index for each word to determine the range
            const expectedWords = [
              [ 0, 1, 2, 3, 4 ],
              [ 6, 7, 8, 9, 10, 11 ],
              [ 13, 14, 15, 16 ],
              [ 18 ],
              [ 20, 21, 22 ],
              [ 24, 25, 26 ],
              [ 28, 29, 30 ],
              [ 32, 33, 34, 35 ],
              [ 37, 38, 39, 40, 41, 42, 43, 44, 45, 46]
            ]
            expect(text.words).to.eql(expectedWords);
        });
    });

    describe('can get', () => {
        it('word index for glyph', async() => {
            // Assemble
            const displayText = 'Hello World!\n' + 'It\'s a new day for text rendering.';
            const {text} = await createFontAtlasText(displayText)

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
            const {text} = await createFontAtlasText(displayText)

            // Act and assert
            expect(text.glyphLineIndex(0)).to.equal(0)
            expect(text.glyphLineIndex(11)).to.equal(0)
            expect(text.glyphLineIndex(21)).to.equal(1)
            expect(text.glyphLineIndex(37)).to.equal(2)
            expect(text.glyphLineIndex(46)).to.equal(2)
        });
    })

    describe('can select', () => {
        describe('glyph', () => {
            it('closest to position', async() => {
                // Assemble
                const displayText = 'Hello World!\n' + 'It\'s a new day for text rendering.';
                const {text} = await createFontAtlasText(displayText)

                // Act and assert
                expect(text.closestGlyph(12, 8)).to.eql([1, 1]);
                expect(text.closestGlyph(42, 28)).to.eql([44, 1]);
                expect(text.closestGlyph(62, 18)).to.eql([25, 0]);
                expect(text.closestGlyph(39, 4)).to.eql([6, 1]);
                expect(text.closestGlyph(37, 16)).to.eql([21, 0]);
            })
            it('to the left', async() => {
                const displayText = 'Hello World!\n' + 'It\'s a new day for text rendering.';
                const {text} = await createFontAtlasText(displayText)

                expect(text.getGlyphBefore(0)).to.equal(0);
                expect(text.getGlyphBefore(5)).to.equal(4);
                expect(text.getGlyphBefore(7)).to.equal(6);
                expect(text.getGlyphBefore(12)).to.equal(11);
                expect(text.getGlyphBefore(100)).to.equal(46);
           });

            it('to the right', async() => {
                const displayText = 'Hello World!\n' + 'It\'s a new day for text rendering.';
                const {text} = await createFontAtlasText(displayText)

                expect(text.getGlyphAfter(0)).to.equal(1);
                expect(text.getGlyphAfter(5)).to.equal(6);
                expect(text.getGlyphAfter(11)).to.equal(12);
                expect(text.getGlyphAfter(38)).to.equal(39);
                expect(text.getGlyphAfter(100)).to.equal(46);
           });

            it('above', async() => {
                const displayText = 'Hello World!\n' + 'It\'s a new day for text rendering.';
                const {text} = await createFontAtlasText(displayText)

                expect(text.getGlyphAbove(0)).to.eql([0, 0]);
                expect(text.getGlyphAbove(13)).to.eql([0, 0]);
                expect(text.getGlyphAbove(15)).to.eql([1, 0]);
                expect(text.getGlyphAbove(23)).to.eql([8, 1]);
                expect(text.getGlyphAbove(35)).to.eql([11, 1]);
           });

            it('below', async() => {
                const displayText = 'Hello World!\n' + 'It\'s a new day for text rendering.';
                const {text} = await createFontAtlasText(displayText)

                // NOTE: we should always select the LEFT position unless
                // we're at the end of the line
                expect(text.getGlyphBelow(0)).to.eql([15, 0]);
                expect(text.getGlyphBelow(4)).to.eql([18, 1]);
                expect(text.getGlyphBelow(9)).to.eql([24, 0]);
                expect(text.getGlyphBelow(11)).to.eql([25, 1]);
                expect(text.getGlyphBelow(46)).to.eql([46, 0]);
                // TODO: this is a bug - it jumps to the left instead of below
                // expect(text.getGlyphBelow(12)).to.eql([25, 0]);
           });
        });

        describe('word', () => {
            it('closest to position', async() => {
                // Assemble
                const displayText = 'Hello World!\n' + 'It\'s a new day for text rendering.';
                const {text} = await createFontAtlasText(displayText)

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
                const {text} = await createFontAtlasText(displayText)

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
            let width, height;
            const displayText = 'Hello World!\n' + 'It\'s a new day for text rendering.';
            const {text} = await createFontAtlasText(displayText)

            // Act and assert
            text._build();
            ({width, height} = text.getBounds());
            expect(width).to.equal(115.353515625);
            expect(height).to.equal(35.49609375);

            text.text = 'Hello World!\n' + 'It\'s a new day';
            text._build();
            ({width, height} = text.getBounds());
            expect(width).to.equal(70.822265625);
            expect(height).to.equal(24);

            text.text = 'Hello World!';
            text._build();
            ({width, height} = text.getBounds());
            expect(width).to.equal(63.041015625);
            expect(height).to.equal(12);
       })
    });
});