import * as PIXI from 'pixi.js';
import {BaseDeformer, DeformerType} from "./BaseDeformer";

export class CurveDeformer extends BaseDeformer {
    _deformerType: DeformerType = DeformerType.VERTEX;
    texture: PIXI.Texture;
    pathOffset: number = 0.0;
    pathSegment: number = 1.0;
    spineOffset: number = 0.0;
    spineLength: number = 0.0;
    flow: number = 1;

    _uniforms() {
        return {
            texture: this.texture,
            pathOffset: this.pathOffset,
            pathSegment: this.pathSegment,
            spineOffset: this.spineOffset,
            spineLength: this.spineLength,
            flow: this.flow,
        };
    }

    _vertHead() {
        return `
        uniform sampler2D texture;
        uniform float pathOffset;
        uniform float pathSegment;
        uniform float spineOffset;
        uniform float spineLength;
        uniform int flow;
        float textureLayers = 4.; // look up takes (i + 0.5) / textureLayers
        `;
    }

    _vertBody() {
        return `
        vec3 getVertexPosition${this.index}() {
            vec4 worldPos = vec4(aVertexPosition.xy, 0.0, 1.0);
            bool bend = flow > 0;
            float xWeight = bend ? 0.0 : 1.0;
            float spinePortion = bend ? (worldPos.x + spineOffset) / spineLength : 0.;
            float mt = spinePortion * pathSegment + pathOffset;
            
            vec3 spinePos = texture2D(texture, vec2(mt, (0.5) / textureLayers)).xyz;
            vec3 a = texture2D(texture, vec2(mt, (1. + 0.5) / textureLayers)).xyz;
            vec3 b = texture2D(texture, vec2(mt, (2. + 0.5) / textureLayers)).xyz;
            vec3 c = vec3(0.0, 0.0, 1.0);
            mat3 basis = mat3(a, b, c);
            
            vec3 transformed = basis
                * vec3(worldPos.x * xWeight, worldPos.y * 1., 0)
                + spinePos;
                
            return transformed;
        }`;
    }
}