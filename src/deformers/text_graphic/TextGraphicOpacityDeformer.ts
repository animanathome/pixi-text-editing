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

    _resetStateOnProperties(expectedLength) {
        this._opacities = new Array(expectedLength).fill(1.0);
    }

    get opacities() {
        return this._opacities;
    }

    set opacities(value: number[]) {
        this._validateData(value, 1);
        this._opacities = value;
        console.log('sync opacities', value);
        this.parent.shader.uniforms.uOpacities = value;
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
        vOpacity = uOpacities[0];
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