import {TextDeformer} from "./TextDeformer";
import {DEFORMER_MANIP_ENUM} from "../enums";

const VERBOSE = false;

export class TextOpacityDeformer extends TextDeformer {
    _deformerType: DEFORMER_MANIP_ENUM[] = [DEFORMER_MANIP_ENUM.COLOR];
    _opacities = [];

    public get animatableProperties() {
        return ['opacities'];
    }
    _uniforms(): {} {
        return {
            uOpacities: this.opacities,
        }
    }

    _resetStateOnProperties(expectedLength) {
        VERBOSE && console.log('resetting state on properties', expectedLength);
        this._opacities = new Array(expectedLength).fill(1.0);
    }

    _updateProperties() {
        // Ensure we have populated the opacities array in case we haven't set it yet, otherwise we will get a shader
        // error.
        if (this._opacities.length === 0) {
            this._resetState()
        }
        super._updateProperties();
    }

    get opacities() {
        return this._opacities;
    }

    set opacities(value: number[]) {
        this._validateData(value, 1);
        this._opacities = value;
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