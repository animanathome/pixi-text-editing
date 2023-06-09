// text deformer constants
export const TEXT_COLOR_DEFORMER = 'textColorDeformer';
export const TEXT_OPACITY_DEFORMER = 'textOpacityDeformer';
export const TEXT_PROGRESS_DEFORMER = 'textProgressDeformer';
export const TEXT_TRANSFORM_DEFORMER = 'textTransformDeformer';
export const TEXT_DEFORMERS = [
    TEXT_COLOR_DEFORMER,
    TEXT_OPACITY_DEFORMER,
    TEXT_PROGRESS_DEFORMER,
    TEXT_TRANSFORM_DEFORMER,
]

export const CENTER_SCALE_TRANSFORM_DEFORMER = 'centerScaleTransformDeformer';
export const CURVE_DEFORMER = 'curveDeformer';
export const TRANSFORM_DEFORMER = 'transformDeformer';
export const VERTEX_TRANSFORM_DEFORMER = 'vertexTransformDeformer';
export const BASE_DEFORMERS = [
    CENTER_SCALE_TRANSFORM_DEFORMER,
    CURVE_DEFORMER,
    TRANSFORM_DEFORMER,
    VERTEX_TRANSFORM_DEFORMER,
]

// text graphic deformer constants
export const TEXT_GRAPHIC_OPACITY_DEFORMER = 'textGraphicOpacityDeformer';
export const TEXT_GRAPHIC_DEFORMERS = [
    TEXT_GRAPHIC_OPACITY_DEFORMER,
]

// all deformers
export const ALL_DEFORMERS = TEXT_DEFORMERS
    .concat(BASE_DEFORMERS)
    .concat(TEXT_GRAPHIC_DEFORMERS);