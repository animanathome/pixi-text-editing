import * as PIXI from "pixi.js";
import {FontAtlasText} from "./fontAtlasText";

const vertexSrc = `    
    attribute vec2 aVertexPosition;
    uniform mat3 projectionMatrix;
    uniform mat3 translationMatrix;

    void main() {
        gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    }
`;

const fragmentSrc = `
    uniform vec4 uColor;

    void main() {
        gl_FragColor = uColor;
    }
`;

export enum CARET_POSITION {
    START,
    END
}

export enum SELECTION_DIRECTION {
    LEFT,
    RIGHT
}

export class FontAtlasTextCaret extends PIXI.Container {
    fontAtlasText = undefined;
    _dirty = false;
    _glyphIndex = -1;
    _glyphPosition = CARET_POSITION.START;
    caretWidth = 2;
    _mesh = null;
    _caretLastVisibilitySwitch = Date.now();
    caretVisibleDuration = 500;

    constructor(fontAtlasText: FontAtlasText) {
        super();
        this.fontAtlasText = fontAtlasText;
        this._createMesh(new PIXI.Geometry());
    }

    set glyphIndex(value) {
        if (this.glyphIndex === value) {
            return;
        }
        if (this.glyphIndex > this.fontAtlasText.text.length - 1) {
            console.warn('-- to big --');
        }
        this._glyphIndex = value;
        this._dirty = true;
    }

    get glyphIndex() {
        return this._glyphIndex;
    }

    set glyphPosition(value) {
        if (this.glyphPosition === value) {
            return;
        }
        this._glyphPosition = value;
        this._dirty = true;
    }

    get glyphPosition() {
        return this._glyphPosition;
    }

    _update() {
        if(!this._dirty) {
            return;
        }

        if (this._glyphIndex === -1) {
            return;
        }

        const token = this.fontAtlasText.text[this.glyphIndex]
        const vertexArray = this.fontAtlasText.getGlyphVertexArray(this.glyphIndex);
        const lineHeight = this.fontAtlasText.atlas.fontSize * this.fontAtlasText._fontFactor;

        let x0, x1, y0, y1;
        // no text
        if (this.fontAtlasText.text.length === 0) {
            x0 = 0;
            x1 = this.caretWidth;
            y0 = 0;
            y1 = lineHeight;
        }
        // @ts-ignore
        // new line
        else if (PIXI.TextMetrics.isNewline(token)) {
            x0 = 0;
            x1 = this.caretWidth;

            let line = Math.ceil(vertexArray[7] / lineHeight);
            if (this.glyphPosition === CARET_POSITION.START) {
               line -= 1;
            }
            y0 = line * lineHeight;
            y1 = (line + 1) * lineHeight;
        }
        // text
        else {
            if (this.glyphPosition === CARET_POSITION.START) {
                const x = vertexArray[4] < this.caretWidth ? this.caretWidth : vertexArray[4];
                x0 = x - this.caretWidth;
                x1 = x;
            }
            else {
                const x = vertexArray[0] < 0 ? 0 : vertexArray[0];
                x0 = x;
                x1 = x + this.caretWidth;
            }

            const line = Math.ceil(vertexArray[7] / lineHeight);
            y0 = (line - 1) * lineHeight;
            y1 = line * lineHeight;
        }
        const caretVertices = [
            x1, y1,
            x1, y0,
            x0, y0,
            x0, y1,
        ];

        const caretIndices = [0, 1, 2, 2, 3, 0];

        const geometry = new PIXI.Geometry();
        geometry.addAttribute('aVertexPosition', caretVertices, 2);
        geometry.addIndex(caretIndices);
        this._mesh.geometry = geometry;
        this._dirty = false;
    }

    _createMesh(geometry) {
        const color = [1.0, 0, 0, 1.0];
        const uniforms = {
            uColor: color,
        };
        const shader = PIXI.Shader.from(vertexSrc, fragmentSrc, uniforms);
        const mesh = new PIXI.Mesh(geometry, shader);
        this._mesh = mesh;
        this.addChild(mesh);
    }

    _toggleVisibility() {
        const now = Date.now();
        if ((this._caretLastVisibilitySwitch + this.caretVisibleDuration) > now) {
            return;
        }
        this._caretLastVisibilitySwitch = Date.now();

        if (!this._mesh) {
            return;
        }

        if (this._mesh.visible === true) {
            this._mesh.visible = false;
        }
        else {
            this._mesh.visible = true;
        }
    }

    _render(renderer: PIXI.Renderer) {
        // we need to make sure our text is up to date
        this.fontAtlasText._render(renderer);

        this._update();
        if (this.caretVisibleDuration !== 0) {
            this._toggleVisibility();
        }
        super._render(renderer);
    }
}