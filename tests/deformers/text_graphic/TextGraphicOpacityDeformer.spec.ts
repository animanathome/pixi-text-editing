import {createFontAtlasTextApp} from "../../utils";
import {TextGraphicOpacityDeformer} from "../../../src/deformers/text_graphic/TextGraphicOpacityDeformer";
import {TextOpacityDeformer} from "../../../src/deformers/text/TextOpacityDeformer";
import {TRANSFORM_TYPE} from "../../../src/deformers/text/TextDeformer";
import {FontAtlasTextGraphic, GRAPHIC_TYPE} from "../../../src/fontAtlasTextGraphic";

describe('TextGraphicOpacityDeformer', () => {
    it('can be added to the stack', async() => {
        const displayText = "hello world!\nWhat's up?";
        const {text, app} = await createFontAtlasTextApp({
            displayText,
            width: 64,
            height: 64,
        })

        const textDeformer = new TextOpacityDeformer();
        text.deform.addDeformer(textDeformer);
        textDeformer.transformType = TRANSFORM_TYPE.WORD;
        textDeformer.opacities = [0.25, 1.0, 1.0, 0.25];
        console.log('opacities', textDeformer.opacities);

        //
        const graphicColor = new FontAtlasTextGraphic(text);
        graphicColor.graphicType = GRAPHIC_TYPE.WORD;
        app.stage.addChildAt(graphicColor, 0);
        app.ticker.update()

        console.log('weights', graphicColor._weights)

        const deformer = new TextGraphicOpacityDeformer()
        graphicColor.deform.addDeformer(deformer);
        const value = [0.25, 1.0, 1.0, 1.0];
        console.log('opacities', value);
        deformer.opacities = value;

        graphicColor.deform.logAssembly();
        //
        app.ticker.start()
    });
});