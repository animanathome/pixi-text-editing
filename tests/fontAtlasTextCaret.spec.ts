import * as PIXI from "pixi.js";
import {FontLoader} from "../src/fontLoader";
import {FontAtlas} from "../src/fontAtlas";
import {FontAtlasText} from "../src/fontAtlasText";
import {CARET_POSITION, FontAtlasTextDrawCaret} from "../src/fontAtlasTextDrawCaret";

describe('FontAtlasTextCaret', () => {
    describe('can draw caret', () => {
        it('at the start', async () => {
            const app = new PIXI.Application({
                backgroundColor: 0xffffff,
                width: 128,
                height: 128,
            });
            app.ticker.stop();

            const fontLoader = new FontLoader();
            const url = 'http://localhost:8000/resources/MontserratBold.ttf'
            fontLoader.sourceUrl = url;
            await fontLoader.load();

            const atlas = new FontAtlas({
                font: fontLoader.font,
                resolution: 128,
                fontSize: 12,
            })

            const text = new FontAtlasText();
            text.atlas = atlas;
            text.maxHeight = 128;
            text.maxWidth = 128;
            text.text = 'Hello World!\n' + 'It\'s a new day for text rendering.';

            // Act
            text._build();
            app.stage.addChild(text);

            const caret = new FontAtlasTextDrawCaret(text);
            caret.glyphIndex = 1;
            caret.glyphPosition = CARET_POSITION.START;
            caret._update();

            app.stage.addChild(caret);
            app.ticker.update();

            const outputImage = app.view.toDataURL()
            console.log(outputImage);
        });

        it('at the end', async () => {
            const app = new PIXI.Application({
                backgroundColor: 0xffffff,
                width: 128,
                height: 128,
            });
            app.ticker.stop();

            const fontLoader = new FontLoader();
            const url = 'http://localhost:8000/resources/MontserratBold.ttf'
            fontLoader.sourceUrl = url;
            await fontLoader.load();

            const atlas = new FontAtlas({
                font: fontLoader.font,
                resolution: 128,
                fontSize: 12,
            })

            const text = new FontAtlasText();
            text.atlas = atlas;
            text.maxHeight = 128;
            text.maxWidth = 128;
            text.text = 'Hello World!\n' + 'It\'s a new day for text rendering.';

            // Act
            text._build();
            app.stage.addChild(text);

            const caret = new FontAtlasTextDrawCaret(text);
            caret.glyphIndex = 4;
            caret.glyphPosition = CARET_POSITION.END;
            caret._update();

            app.stage.addChild(caret);
            app.ticker.update();

            const outputImage = app.view.toDataURL()
            console.log(outputImage);
        });
    });
});