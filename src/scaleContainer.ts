import * as PIXI from "pixi.js";
import {scaleVertexSrc, simpleVertexSrc} from "./vertexShader";
import {colorFragmentSrc} from "./fragmentShader";

export class ScaleContainer extends PIXI.Container {
    _dirty:boolean = true;
    _shader: PIXI.Shader = undefined;
    _uScale: number[] = [1, 1];
    _uScaleAnchor: number[] = [0, 0];

    get scale() {
        return this._uScale;
    }

    set scale(value) {
        this._uScale = value;
        this._setUniform('uScale', value);
    }

    get scaleAnchor() {
        return this._uScaleAnchor;
    }

    set scaleAnchor(value) {
        this._uScaleAnchor = value;
        this._setUniform('uScaleAnchor', value);
    }

    _setUniform(property, value) {
        if (!this._shader) {
            return
        }
        this._shader.uniforms[property] = value;
    }

    _update() {
        console.log('_update');
        if(!this._dirty) {
            return;
        }
        const geometry = new PIXI.Geometry();
        geometry.addAttribute('aVertexPosition', [
            20, 10,
            20, 0,
            0, 0,
            0, 10
        ], 2);
        geometry.addIndex([0, 1, 2, 2, 3, 0]);

        const vertexShader = scaleVertexSrc()
        const uniforms = {
            uColor: [1.0, 0, 0, 1.0],
            uScaleAnchor: this.scaleAnchor,
            uScale: this.scale,
        };
        const shader = PIXI.Shader.from(vertexShader, colorFragmentSrc, uniforms);
        this._shader = shader;
        const mesh = new PIXI.Mesh(geometry, shader);
        this.addChild(mesh);
        this._dirty = false;
    }

    protected _render(_renderer: PIXI.Renderer) {
        this._update();
        super._render(_renderer);
    }
}