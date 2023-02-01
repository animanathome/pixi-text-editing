import {createFontAtlasTextApp} from "../utils";

describe.only('TextComponentTransformDeformer', () => {
    it('can add deformer', async() => {
        const displayText = 'Hello World!';
        const {text, app} = await createFontAtlasTextApp({
            displayText
        });
        document.body.appendChild(app.view);
        app.ticker.update();
    });
})