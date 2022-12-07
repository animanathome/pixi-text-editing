import * as PIXI from "pixi.js";
import {scaleVertexSrc, simpleVertexSrc} from "./vertexShader";
import {colorFragmentSrc, imageFragmentSrc, textureFragmentSrc} from "./fragmentShader";

export class ImageContainer extends PIXI.Container {
    _dirty:boolean = true;
    _shader: PIXI.Shader = undefined;
    _texture: PIXI.Texture = undefined

    _update() {
        console.log('_update');
        if(!this._dirty) {
            return;
        }
        const geometry = new PIXI.Geometry();
        geometry.addAttribute('aVertexPosition', [
            200, 100,
            200, 0,
            0, 0,
            0, 100
        ], 2);
        geometry.addIndex([0, 1, 2, 2, 3, 0]);
        geometry.addAttribute('aUvs', [
            1, 1,
            1, 0,
            0, 0,
            0, 1,
        ], 2)

        const vertexShader = simpleVertexSrc(true)
        const uniforms = {
            uColor: [1.0, 0.0, 1.0, 1.0],
            uSampler2: this._texture,
        };
        const shader = PIXI.Shader.from(vertexShader, imageFragmentSrc, uniforms);
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