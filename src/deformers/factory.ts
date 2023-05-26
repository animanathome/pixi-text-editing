import {
    ALL_DEFORMERS,
    TEXT_COLOR_DEFORMER,
    TEXT_OPACITY_DEFORMER,
    TEXT_PROGRESS_DEFORMER,
    TEXT_TRANSFORM_DEFORMER,
    TEXT_GRAPHIC_OPACITY_DEFORMER,
    CENTER_SCALE_TRANSFORM_DEFORMER,
    CURVE_DEFORMER,
    TRANSFORM_DEFORMER,
    VERTEX_TRANSFORM_DEFORMER
} from "./constants";

import {TextColorDeformer} from "./text/TextColorDeformer";
import {TextOpacityDeformer} from "./text/TextOpacityDeformer";
import {TextProgressDeformer} from "./text/TextProgressDeformer";
import {TextTransformDeformer} from "./text/TextTransformDeformer";

import {TextGraphicOpacityDeformer} from "./text_graphic/TextGraphicOpacityDeformer";

import {CenterScaleTransformDeformer} from "./base/CenterScaleTransformDeformer";
import {CurveDeformer} from "./base/CurveDeformer";
import {TransformDeformer} from "./base/TransformDeformer";
import {VertexTransformDeformer} from "./base/VertexTransformDeformer";

/**
 * Create a deformer of a specific type by specifying the name.
 * @param deformer
 */
export const createDeformerOfType = (deformer: typeof ALL_DEFORMERS[number]) => {
    switch (deformer) {
        case TEXT_COLOR_DEFORMER: return new TextColorDeformer(); break;
        case TEXT_OPACITY_DEFORMER: return new TextOpacityDeformer(); break;
        case TEXT_PROGRESS_DEFORMER: return new TextProgressDeformer(); break;
        case TEXT_TRANSFORM_DEFORMER: return new TextTransformDeformer(); break;

        case TEXT_GRAPHIC_OPACITY_DEFORMER: return new TextGraphicOpacityDeformer(); break;

        case CENTER_SCALE_TRANSFORM_DEFORMER: return new CenterScaleTransformDeformer(); break;
        case CURVE_DEFORMER: return new CurveDeformer(); break;
        case TRANSFORM_DEFORMER: return new TransformDeformer(); break;
        case VERTEX_TRANSFORM_DEFORMER: return new VertexTransformDeformer(); break;
    }
}