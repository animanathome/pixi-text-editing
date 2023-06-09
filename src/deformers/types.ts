import { TextColorDeformer } from './text/TextColorDeformer';
import { TextOpacityDeformer } from './text/TextOpacityDeformer';
import { TextProgressDeformer } from './text/TextProgressDeformer';
import { TextTransformDeformer} from "./text/TextTransformDeformer";
import { TextGraphicOpacityDeformer} from "./text_graphic/TextGraphicOpacityDeformer";
import { CenterScaleTransformDeformer } from './base/CenterScaleTransformDeformer';
import { CurveDeformer } from './base/CurveDeformer';
import { TransformDeformer } from './base/TransformDeformer';
import { VertexTransformDeformer } from './base/VertexTransformDeformer';

export type TextDeformerType = TextColorDeformer | TextOpacityDeformer | TextProgressDeformer | TextTransformDeformer;
export type TextGraphicDeformerType = TextGraphicOpacityDeformer;
export type BaseDeformerType = CenterScaleTransformDeformer | CurveDeformer | TransformDeformer | VertexTransformDeformer;
export type DeformerType = TextDeformerType | TextGraphicDeformerType | BaseDeformerType;