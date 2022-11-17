import * as PIXI from "pixi.js";
import {FontAtlasText} from "./fontAtlasText";
import {deformVertexSrc, simpleVertexSrc} from "./vertexShader";
import {colorFragmentSrc} from "./fragmentShader";


export class FontAtlasTextSelection extends PIXI.Container {
    _glyphSelection = []
    _dirty = false;
    _mesh = undefined;
    fontAtlasText = null;

    constructor(fontAtlasText: FontAtlasText) {
        super();
        this.fontAtlasText = fontAtlasText;
        this._createMesh();
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
        if (this._glyphSelection.indexOf(glyph) !== -1) {
            return;
        }
        this._glyphSelection.push(glyph)
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

        if (this._glyphSelection.length === 0) {
            this._mesh.visible = false;
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
        this._mesh.geometry = geometry;
        this._mesh.visible = true;
        this._dirty = false;
    }

    _subdivideRectangle(x0 : number, y0 : number, x1 : number, y1 : number, segments = 1) {
        const xOffset = (x1 - x0) / segments;
        const xpos = []
        for (let i = 0; i < (segments + 1); i++) {
            xpos.push(x0 + (xOffset * i));
        }

        const vertices = [];
        for (let i = 0; i < xpos.length; i++) {
            // bottom
            vertices.push(xpos[i]);
            vertices.push(y1);

            // top
            vertices.push(xpos[i]);
            vertices.push(y0);
        }

        const indices = [];
        for (let i = 0; i < (vertices.length - 4) / 4; i++) {
            const indexOffset = i * 2;
            const f0 = [
                indexOffset + 0,
                indexOffset + 1,
                indexOffset + 3
            ]

            const f1 = [
                indexOffset + 0,
                indexOffset + 3,
                indexOffset + 2
            ]
            indices.push(...f0);
            indices.push(...f1);
        }

        return {
            vertices,
            indices
        }
    }

    _singleLine(start, end, segments = 10) : PIXI.Geometry {
        const lineHeight = this.fontAtlasText.atlas.fontSize * this.fontAtlasText._fontFactor;
        const line = Math.ceil(start[7] / lineHeight);

        const x0 = start[4];
        const x1 = end[0];
        const y0 = (line - 1) * lineHeight;
        const y1 = line * lineHeight;
        const {vertices, indices} = this._subdivideRectangle(x0, y0, x1, y1, 10);

        const geometry = new PIXI.Geometry();
        geometry.addAttribute('aVertexPosition', vertices, 2);
        geometry.addIndex(indices);
        return geometry
    }

    _multiLine(start, end) : PIXI.Geometry {
        const bounds = this.fontAtlasText.getBounds();
        const minX = bounds.x
        const maxX = bounds.x + bounds.width;

        const lineHeight = this.fontAtlasText.atlas.fontSize * this.fontAtlasText._fontFactor;
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

    _createMesh(geometry = undefined) {
        const color = [0.75, 0, 0, 0.75];

        if (!geometry) {
            geometry = new PIXI.Geometry();
            geometry.addAttribute('aVertexPosition', [0, 0, 0, 0, 0, 0], 2);
            geometry.addIndex([0, 1, 2])
        }

        let shader;
        // simple
        if (!this.fontAtlasText._curveTexture) {
            const uniforms = {
                uColor: color,
            };
            let vertexShader = simpleVertexSrc(false);
            shader = PIXI.Shader.from(vertexShader, colorFragmentSrc, uniforms);
        }
        // deformed
        else {
            const uniforms = {
                // color
                uColor: color,

                // deform
                texture: this.fontAtlasText._curveTexture,
                pathOffset: this.fontAtlasText._pathOffset,
                pathSegment: this.fontAtlasText._pathSegment,
                spineOffset: this.fontAtlasText._spineOffset,
                spineLength: this.fontAtlasText._spineLength,
                flow: this.fontAtlasText._flow,
            };
            let vertexShader = deformVertexSrc(false);
            shader = PIXI.Shader.from(vertexShader, colorFragmentSrc, uniforms);
        }

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