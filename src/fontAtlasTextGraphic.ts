import * as PIXI from "pixi.js";
import {FontAtlasText} from "./fontAtlasText";
import {deformVertexSrc, simpleVertexSrc, transformVertexSrc} from "./vertexShader";
import {colorFragmentSrc, rectangleFragmentSrc, textureFragmentSrc} from "./fragmentShader";
import {MeshMixin} from "./meshMixin";
import {DeformerStack} from "./deformers/deformerStack";

const VERBOSE = false;
export enum GRAPHIC_TYPE {
    BOUNDS,
    LINE,
    WORD,
    GLYPH
}

type Padding = {
    left: number,
    right: number,
    top: number,
    bottom: number,
}

export class FontAtlasTextGraphic extends MeshMixin(PIXI.Container){
    _fontAtlasText = null;
    _mesh: PIXI.Mesh = null;
    _dirty = true;
    _graphicType: GRAPHIC_TYPE = GRAPHIC_TYPE.WORD;
    _graphicCount: number = 0;
    _padding: Padding = {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
    };
    _color: number[] = [0.0, 1.0, 0.0, 1.0];
    _deformerStack: DeformerStack;

    constructor(fontAtlasText: FontAtlasText) {
        super();
        this._fontAtlasText = fontAtlasText;
        this._deformerStack = new DeformerStack(this, {uvs: false});

        // @ts-ignore
        this._deformerStack.on('deformerAdded', () => {
            VERBOSE && console.log('deformer added');
            this._buildShader();
        });
        // when do we need this? what exactly is changed? uniforms should just sync up. Maybe when we need to
        // re-calculate attributes?
        // @ts-ignore
        this._deformerStack.on('deformerChanged', () => {
            VERBOSE && console.log('deformer changed');
            this._buildShader();
        });
    }

    get deform() {
        return this._deformerStack;
    }

    get color() {
        return this._color;
    }

    set color(value:number[]) {
        this._color = value;
        this._setUniform('uColor', value);
    }

    _setUniform(property, value) {
        if (!this._mesh) {
            return
        }
        this._mesh.shader.uniforms[property] = value;
    }

    set graphicType(value: GRAPHIC_TYPE) {
        this._graphicType = value;
        this._dirty = true;
    }

    get graphicType() {
        return this._graphicType;
    }

    get graphicCount() {
        return this._graphicCount;
    }

    get padding() {
        return this._padding;
    }

    _buildGeometry() {
        let vertices, indices, uvs, weights = [];
        let count;
        switch (this._graphicType) {
            case GRAPHIC_TYPE.BOUNDS:
                ({vertices, indices, uvs, weights, count} = this._buildBoundsGraphics());
                break;
            case GRAPHIC_TYPE.LINE:
                ({vertices, indices, uvs, weights, count} = this._buildLineGraphics());
                break;
            case GRAPHIC_TYPE.WORD:
                ({vertices, indices, uvs, weights, count} = this._buildWordGraphics());
                break;
            default: console.log('unknown');
        }

        const geometry = new PIXI.Geometry();
        geometry.addAttribute('aVertexPosition', vertices, 2);
        geometry.addAttribute('aUvs', uvs, 2);
        geometry.addAttribute('aWeight', weights, 1);
        geometry.addIndex(indices);
        this._geometry = geometry;
        this._graphicCount = count;

        this._weights = weights; // for debugging
    }

    _buildBoundsGraphics() {
        const bounds = this._fontAtlasText.getBounds();
        const x0 = bounds.x - this.padding.left
        const x1 = bounds.x + bounds.width + this.padding.right
        const y0 = bounds.y - this.padding.top;
        const y1 = bounds.y + bounds.height + this.padding.bottom;
        const {vertices, indices, uvs, weights} = this._buildRectangle(x0, x1, y0, y1, 0, 0);
        return {
            vertices,
            indices,
            uvs,
            weights,
            count: 1
        }
    }

    _buildLineGraphics() {
        let selection = []
        for (let i = 0; i < this._fontAtlasText.lines.length; i++) {
            const [start, end] = this._fontAtlasText._getLineGlyphRange(i)
            selection.push([start, end]);
        }
        return this._buildSelection(selection);
    }

    _buildWordGraphics() {
        const selection = this._fontAtlasText.words as number[][];
        return this._buildSelection(selection);
    }

    /**
     *
     * @param x0
     * @param x1
     * @param y0
     * @param y1
     * @param indexOffset: vertex count offset
     * @param weightOffset: rectangle index
     */
    _buildRectangle(x0: number, x1: number, y0: number, y1: number, indexOffset = 0, weightOffset = 0) {
        const vertices = [
            x1, y1,
            x1, y0,
            x0, y0,
            x0, y1,
        ];
        const indices = [
            0 + indexOffset,
            1 + indexOffset,
            2 + indexOffset,
            2 + indexOffset,
            3 + indexOffset,
            0 + indexOffset
        ];
        const uvs = [
            1, 1,
            1, 0,
            0, 0,
            0, 1,
        ]
        const weights = [
            weightOffset,
            weightOffset,
            weightOffset,
            weightOffset
        ]
        return {
            vertices,
            indices,
            uvs,
            weights
        }
    }

    _buildSelection(selection) {
        const wordHeight = this._fontAtlasText.atlas.fontSize * this._fontAtlasText._fontFactor;
        const lineHeight = wordHeight * this._fontAtlasText._lineHeight;

        const allVertices:number[][] = [];
        const allIndices:number[][] = [];
        const allUvs:number[][] = [];
        const allWeights:number[][] = [];
        let count = 0;
        let wordIndex = 0;
        for(let word of selection) {
            const glyphStartIndex = word[0];
            const glyphEndIndex = word[word.length - 1];

            const startVertexArray = this._fontAtlasText.getGlyphVertexArray(glyphStartIndex);
            const endVertexArray = this._fontAtlasText.getGlyphVertexArray(glyphEndIndex);
            const x0 = startVertexArray[4] - this.padding.left
            const x1 = endVertexArray[0] + this.padding.right

            let line = Math.ceil(startVertexArray[1] / lineHeight) - 1;
            const y0 = (line * lineHeight) - this.padding.top;
            const y1 = (y0 + wordHeight) + this.padding.bottom;

            const {vertices, indices, uvs, weights} = this._buildRectangle(x0, x1, y0, y1, wordIndex * 4, wordIndex);
            allVertices.push(vertices);
            allIndices.push(indices)
            allUvs.push(uvs);
            allWeights.push(weights);
            wordIndex++;
            count++;
        }
        return {
            vertices: allVertices.flat(),
            indices: allIndices.flat(),
            uvs: allUvs.flat(),
            weights: allWeights.flat(),
            count
        }
    }

    _deleteGeometry() {
        if (!this._geometry) {
            return;
        }
        this._geometry.destroy();
        this._geometry = null;
    }

    _buildShader() {
        VERBOSE && console.log('_buildShader');
        // build shader
        // TODO: make into a property
        //  is this the same as tint?
        // const color = [1.0, 0.0, 0.0, 1.0];

        let uniforms = Object.assign({
            uColor: this.color,
            translationMatrix: this.transform.worldTransform.toArray(true)
        }, this.deform._combineUniforms())
        const vertexShader = this.deform._buildVertexShader();
        const fragmentShader = this.deform._buildFragmentShader();
        const shader = PIXI.Shader.from(vertexShader, fragmentShader, uniforms);
        this._shader = shader;
    }

    _build() {
        if (!this._dirty) {
            return;
        }
        this._deleteGeometry();
        this._buildGeometry();
        this._buildShader();
        this._dirty = false;
    }

    _render(renderer: PIXI.Renderer) {
        this._build();
        if (this.deform.dirty) {
            this.deform.update();
            this._buildShader();
        }
        this._renderDefault(renderer);
    }
}