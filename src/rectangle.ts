import * as PIXI from 'pixi.js';
import {MeshMixin} from "./meshMixin";
import {simpleVertexSrc} from "./vertexShader";
import {colorFragmentSrc} from "./fragmentShader";
import {DeformerStack} from "./deformerStack";

export class Rectangle extends MeshMixin(PIXI.Container) {
    _width: number = 1;
    _height: number = 1;
    _deformerStack: DeformerStack;

    constructor({x = 0, y = 0, width = 1, height = 1}) {
        super();
        this.x = x;
        this.y = y;
        this._width = width;
        this._height = height;
        this._deformerStack = new DeformerStack();
        this._dirty = true;
    }

    get deform() {
        return this._deformerStack;
    }

    set width(value: number) {
        if (value !== this.width) {
            this._dirty = true;
        }
        this._width = value;
    }

    get width() {
        return this._width;
    }

    set height(value: number) {
        if (value !== this.height) {
            this._dirty = true;
        }
        this._height = value;
    }

    get height() {
        return this._height;
    }

    _buildGeometry() {
        const vertexArray = [
            1 * this._width, 1 * this._height,
            1 * this._width, 0,
            0, 0,
            0, 1 * this._height
        ]
        const uvArray = [
            1, 1,
            1, 0,
            0, 0,
            0, 1,
        ]
        const indexArray = [
            0, 1, 2,
            2, 3, 0,
        ]
        const geometry = new PIXI.Geometry();
        geometry.addAttribute('aVertexPosition', vertexArray, 2);
        geometry.addAttribute('aUvs', uvArray, 2);
        geometry.addIndex(indexArray);
        this._geometry = geometry;
    }

    _buildShader() {
        console.log('_buildShader');
        const color = [1.0, 0.0, 0.0, 1.0];

        let uniforms = Object.assign({
            uColor: color,
        }, this.deform._combineUniforms())

        let vertexShader = this.deform._buildVertexShader();

        let shader = PIXI.Shader.from(vertexShader, colorFragmentSrc, uniforms);
        this._shader = shader;
    }

    _render(renderer: PIXI.Renderer) {
        if(this._dirty) {
            this._buildGeometry();
            this._buildShader();
            this._dirty = false;
        }
        super._renderDefault(renderer);
    }
}