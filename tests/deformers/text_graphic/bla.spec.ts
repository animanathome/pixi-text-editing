import {createFontAtlasTextApp} from "../../utils";
import {TextGraphicOpacityDeformer} from "../../../src/deformers/text_graphic/TextGraphicOpacityDeformer";
import {TextOpacityDeformer} from "../../../src/deformers/text/TextOpacityDeformer";
import {TEXT_TRANSFORM_ENUM} from "../../../src/deformers/enums";
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
        textDeformer.transformType = TEXT_TRANSFORM_ENUM.WORD;
        textDeformer.opacities = [0.25, 1.0, 1.0, 0.25];
        app.ticker.update()

        const graphicColor = new FontAtlasTextGraphic(text);
        graphicColor.graphicType = GRAPHIC_TYPE.WORD;
        app.stage.addChildAt(graphicColor, 0);
        graphicColor._build();
        // app.ticker.update()

        const deformer = new TextGraphicOpacityDeformer()
        graphicColor.deform.addDeformer(deformer);
        deformer.opacities = [0.25, 0.5, 0.75, 1.0];

        app.ticker.update();

        // text.deform.logAssembly();
        // console.log(text.shader.uniforms);
        // console.log('text', text.shader.program.uniformData);
        // console.log(text.shader)
        // console.log('-------------')
        // graphicColor.deform.logAssembly();
        // console.log(graphicColor.shader.uniforms);
        // console.log('graphic', graphicColor.shader.program.uniformData); // uniform data is not updated
        // console.log(text.shader);
        // graphicColor.shader.program.uniformData.uOpacities.size = 4;
        // graphicColor.shader.program.uniformData.uOpacities.value = [0.25, 0.5, 0.75, 1.0];
    });
});