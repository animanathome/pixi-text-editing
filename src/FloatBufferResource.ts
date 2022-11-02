import * as PIXI from 'pixi.js'


export class FloatBufferResource extends PIXI.Resource {
    data: Float32Array;
    internalFormat: PIXI.INTERNAL_FORMATS;
    format: PIXI.FORMATS;
    type: PIXI.TYPES;
    constructor(source, options) {
        const { width, height, internalFormat, format, type } = options || {};
        if (!width || !height || !internalFormat || !format || !type) {
            const message = 'FloatBufferResource width, height, internalFormat, format, or type invalid';
            throw new Error(message);
        }
        super(width, height);

        this.data = source;
        this.internalFormat = internalFormat;
        this.format = format;
        this.type = type;
  }

  upload(renderer, baseTexture, glTexture) {
        const gl = renderer.gl;

        gl.pixelStorei(
            gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,
            baseTexture.alphaMode === 1 // PIXI.ALPHA_MODES.UNPACK but `PIXI.ALPHA_MODES` are not exported
        );

        glTexture.width = baseTexture.width;
        glTexture.height = baseTexture.height;

        gl.texImage2D(
            baseTexture.target,
            0,
            gl[this.internalFormat],
            baseTexture.width,
            baseTexture.height,
            0,
            gl[this.format],
            gl[this.type],
            this.data
        );

        return true;
    }
}