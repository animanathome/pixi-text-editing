import * as PIXI from "pixi.js";
import {FontAtlasText} from "./fontAtlasText";
import {printVertexArray} from "./utils";

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

export class FontAtlasTextSelection extends PIXI.Container {
    _glyphSelection = []
    _dirty = false;
    _mesh = undefined;
    fontAtlasText = null;

    constructor(fontAtlasText: FontAtlasText) {
        super();
        this.fontAtlasText = fontAtlasText;
    }

    get empty() {
        return this._glyphSelection.length === 0
    }

    get selection() {
        return this._glyphSelection
    }

    get selectionLength() {
        return this._glyphSelection.length
    }

    extendSelection(glyph) {
        this._glyphSelection.push(glyph)
        console.log('selection', this._glyphSelection);
        this._dirty = true;
    }

    resetSelection() {
        this._glyphSelection = [];
        this._dirty = true;
    }

    _update() {
        if(!this._dirty) {
            return;
        }

        this._deleteMesh();

        if (this._glyphSelection.length === 0) {
            return;
        }

        let startIndex;
        let endIndex;
        const last = this._glyphSelection.length - 1;
        if (this._glyphSelection[0] > this._glyphSelection[last]) {
            startIndex = last;
            endIndex = 0;
        }
        else {
            startIndex = 0;
            endIndex = last;
        }
        const start = this.fontAtlasText.getGlyphVertexArray(this._glyphSelection[startIndex]);
        const end = this.fontAtlasText.getGlyphVertexArray(this._glyphSelection[endIndex]);
        const lineHeight = this.fontAtlasText.atlas.fontSize

        let geometry;
        if (end[3] - start[3] < lineHeight / 2) { // is multi-line select
            geometry = this._singleLine(start, end)
        }
        else {
            geometry = this._multiLine(start, end)
        }
        this._createMesh(geometry);
        this._dirty = false;
    }

    _singleLine(start, end) : PIXI.Geometry {
        const lineHeight = this.fontAtlasText.atlas.fontSize
        const line = Math.ceil(start[7] / lineHeight);

        const x0 = start[4];
        const x1 = end[0];
        const y0 = (line - 1) * lineHeight;
        const y1 = line * lineHeight;

        const vertices = [
            x1, y1,
            x1, y0,
            x0, y0,
            x0, y1,
        ];
        const indices = [
            0, 1, 2,
            2, 3, 0
        ];

        const geometry = new PIXI.Geometry();
        geometry.addAttribute('aVertexPosition', vertices, 2);
        geometry.addIndex(indices);
        return geometry
    }

    _multiLine(start, end) : PIXI.Geometry {
        const bounds = this.fontAtlasText.getBounds();
        const minX = bounds.x
        const maxX = bounds.x + bounds.width;

        const lineHeight = this.fontAtlasText.atlas.fontSize
        const line = Math.ceil(start[7] / lineHeight);
        const lines = Math.ceil((end[1] - start[3]) / lineHeight);

        const minY = (line -1) * lineHeight
        const maxY = minY + (lines * lineHeight)
        const x0 = start[4];
        const x1 = end[0];

        let vertices = [
            // bottom
            x1, maxY,
            x1, maxY - lineHeight,
            minX, maxY - lineHeight,
            minX, maxY,

            // top
            maxX, minY + lineHeight,
            maxX, minY,
            x0, minY,
            x0, minY + lineHeight,
        ];

        let indices = [
            0, 1, 2,
            0, 2, 3,

            4, 5, 6,
            4, 6, 7
        ];

        if (lines > 2) {
            // inbetween
            vertices = vertices.concat([
                maxX, maxY - lineHeight,
                maxX, minY + lineHeight,
                minX, minY + lineHeight,
                minX, maxY - lineHeight
            ]);
            indices = indices.concat([
                8, 9, 10,
                8, 10, 11
            ]);
        }

        const geometry = new PIXI.Geometry();
        geometry.addAttribute('aVertexPosition', vertices, 2);
        geometry.addIndex(indices);
        return geometry
    }

    get hasMesh() {
        return !!this._mesh;
    }

    _deleteMesh() {
        if (!this._mesh) {
            return;
        }
        this._mesh.destroy(true);
        this._mesh = null;
    }

    _createMesh(geometry) {
        const color = [0.75, 0, 0, 0.75];
        const uniforms = {
            uColor: color,
        };
        const shader = PIXI.Shader.from(vertexSrc, fragmentSrc, uniforms);
        const mesh = new PIXI.Mesh(geometry, shader);
        this._mesh = mesh;
        this.addChild(mesh);
    }

    _render(renderer: PIXI.Renderer) {
        // we need to make sure our text is up to date
        this.fontAtlasText._render(renderer);

        this._update();
        super._render(renderer);
    }
}