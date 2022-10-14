import * as PIXI from "pixi.js";
import {FontAtlasText} from "./fontAtlasText";

const vertexSrc = `    
    attribute vec2 aVertexPosition;
    uniform mat3 projectionMatrix;

    void main() {
        gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
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

export class FontAtlasTextDrawCaret extends PIXI.Container {
    fontAtlasText = undefined;
    _dirty = false;
    _glyphIndex = 0;
    _glyphPosition = CARET_POSITION.START;
    caretWidth = 2;
    _mesh = null;
    _caretLastVisibilitySwitch = Date.now();
    _caretVisibleDuration = 500;

    constructor(fontAtlasText: FontAtlasText) {
        super();
        this.fontAtlasText = fontAtlasText;
    }

    set glyphIndex(value) {
        if (this.glyphIndex === value) {
            return;
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

        this._deleteMesh();

        if (this._glyphIndex === -1) {
            return;
        }

        const vertexArray = this.fontAtlasText.getGlyphVertexArray(this.glyphIndex);
        let x0, x1, y0, y1;
        if (this.glyphPosition === CARET_POSITION.START) {
            x0 = vertexArray[4] - this.caretWidth;
            x1 = vertexArray[4];
        }
        else {
            x0 = vertexArray[0];
            x1 = vertexArray[0] + this.caretWidth;
        }

        const lineHeight = this.fontAtlasText.atlas.fontSize
        const line = Math.ceil(vertexArray[7] / lineHeight);
        y0 = (line - 1) * lineHeight;
        y1 = line * lineHeight;

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

        this._createMesh(geometry);

        this._dirty = false;
    }

    _deleteMesh() {
        if (!this._mesh) {
            return;
        }
        this._mesh.destroy(true);
        this._mesh = null;
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
        if ((this._caretLastVisibilitySwitch + this._caretVisibleDuration) > now) {
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
        this._update();
        this._toggleVisibility();
        super._render(renderer);
    }
}