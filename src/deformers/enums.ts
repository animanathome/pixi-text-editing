export enum TEXT_TRANSFORM_ENUM {
    BOUNDS,
    LINE,
    WORD,
    GLYPH
}

export enum DEFORMER_MANIP_ENUM {
    VERTEX  , // manipulates vertices
    MATRIX, // manipulates the transformation matrix
    UV  , // manipulates uvs
    COLOR = 4, // manipulates colors
}

export enum TRANSFORM_DIRECTION {
    LEFT_TO_RIGHT,
    RIGHT_TO_LEFT,
    TOP_TO_BOTTOM,
    BOTTOM_TO_TOP
}