import * as PIXI from "pixi.js";
import {TextDeformer} from "./TextDeformer";
import {DeformerType} from "../BaseDeformer";

const red = 16711680;
const green = 65280;
const blue = 255;

export class TextColorDeformer extends TextDeformer {
    _deformerType: DeformerType[] = [DeformerType.COLOR];
    _colors: number [] = [red, green, blue];
    _colorIndices = [0];

    _uniforms(): {} {
        return {
            uColors: this.colorsAsVec3, // convert to vec4
            uColorIndices: this.colorIndices,
        }
    }

    get colors() {
        return this._colors;
    }

    get colorsAsVec3() {
        return this._colors.flatMap(color => PIXI.utils.hex2rgb(color) as number[]);
    }

    set colors(value: number[]) {
        // TODO: we should probably check if the length matches the indices
        //  we use in the colorIndices array
        this._colors = value;
    }

    get colorIndices() {
        return this._colorIndices;
    }

    set colorIndices(value: number[]) {
        this._validateData(value, 1);
        this._colorIndices = value;
    }

    _vertexHeader(): string {
        const colorCount = this.colors.length;

        // this is based on the selected transform type
        // we need a color per transform element (glyph, word, line, etc)
        // which is animatable
        const colorIndexCount = this.colorIndices.length;

        return `
        attribute float aWeight;
        uniform vec3 uColors[${colorCount}];
        uniform float uColorIndices[${colorIndexCount}];
        varying vec3 vColor;`
    }

    _vertexMain(): string {
        return `
        int colorTransformIndex = int(aWeight);
        int colorIndex = int(uColorIndices[colorTransformIndex]);
        vColor = uColors[colorIndex];
        `
    }

    _fragmentHeader(): string {
        return `
        varying vec3 vColor;
        `
    }

    _fragBody(): string {
        return `
        vec4 getColor${this.index}(vec4 inputColor) {
            return vec4(vColor, 1.0);
        }
        `
    }
}