import {createFontAtlasTextApp} from "../../utils";
import {FontAtlasTextGraphic, GRAPHIC_TYPE} from "../../../src/fontAtlasTextGraphic";
import {TextGraphicDeformer} from "../../../src/deformers/text_graphic/TextGraphicDeformer";

describe('TextGraphicDeformer', () => {
    it('can be initialized', async() => {
        const displayText = "hello world!\nWhat's up?";
        const {text, app} = await createFontAtlasTextApp({
            displayText,
            width: 64,
            height: 64,
        })

        const graphicColor = new FontAtlasTextGraphic(text);
        graphicColor.graphicType = GRAPHIC_TYPE.LINE;
        app.stage.addChildAt(graphicColor, 0);
        app.ticker.update()

        const deformer= new TextGraphicDeformer()
        graphicColor.deform.addDeformer(deformer);
        console.log(deformer.parent);
    });
});