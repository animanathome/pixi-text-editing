import {DeformerType} from "../BaseDeformer";
import {TextGraphicDeformer} from "./TextGraphicDeformer";

export class TextGraphicOpacityDeformer extends TextGraphicDeformer {
    _deformerType: DeformerType[] = [DeformerType.COLOR];
    _opacities = [1.0];

    _uniforms(): {} {
        return {
            uOpacities: this.opacities,
        }
    }

    /**
     * UpdateProperties gets called as part of the update step if the object is dirty.
     */
    _updateProperties() {
        // We need to specify the array length at shader compilation time. We can not change it once it's created!
        const expectedLength = this.parent.graphicCount;
        this._opacities = new Array(expectedLength).fill(1.0);
    }

    get opacities() {
        return this._opacities;
    }

    set opacities(value: number[]) {
        this._validateData(value, 1);
        this._opacities = value;
        this.parent.shader.uniforms.uOpacities = new Float32Array(value);
    }

    _vertexHeader(): string {
        const transformCount = this.opacities.length;

        return `
        varying float vOpacity;
        attribute float aWeight;
        uniform float uOpacities[${transformCount}];
        `
    }

    _vertexMain(): string {
        return `
        int opacityTransformIndex = int(aWeight);
        vOpacity = uOpacities[opacityTransformIndex];
        `
    }

    _fragmentHeader(): string {
        return `
        varying float vOpacity;
        `
    }

    _fragBody(): string {
        return `
        vec4 getColor${this.index}(vec4 inputColor) {
            return vec4(inputColor.rgb, vOpacity);
        }
        `
    }
}