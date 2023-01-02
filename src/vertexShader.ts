// variable snippets
import {includes} from "lodash";

const varsPos = `
    attribute vec2 aVertexPosition;
    uniform mat3 projectionMatrix;
    uniform mat3 translationMatrix;
`;
const varsUV = `
    attribute vec2 aUvs;
    varying vec2 vUvs;
`;

// function snippets
const funStart = `
    void main() {
`;
const funUV = `
    vUvs = aUvs;
`;
const funEnd = `
    }
`;

export const transformVertexSrc = (
    includeUv = false,
    transformCount = 2,
) => {
    const varsTrans = `
        attribute float aWeight;
        uniform vec2 transforms[${transformCount}];
        uniform vec2 scales[${transformCount}];
        uniform vec2 scaleAnchors[${transformCount}];
    `
    const funTrans = `
        int transformIndex = int(aWeight);
        vec2 vertexOffset = transforms[transformIndex]; // here we actually translate or move the vertex -- rename?
        
        // scale vertex from scale anchor position using scale value
        vec2 vertexScale = scales[transformIndex];
        mat3 scaleMatrix = mat3(vertexScale.x, 0, 0, 0, vertexScale.y, 0, 0, 0, 1);
        vec2 vertexScaleAnchor = scaleAnchors[transformIndex];
        mat3 scaleAnchorMatrix = mat3(1, 0, 0, 0, 1, 0, vertexScaleAnchor.x, vertexScaleAnchor.y, 1);
        mat3 invScaleAnchorMatrix = mat3(1, 0, 0, 0, 1, 0, -vertexScaleAnchor.x, -vertexScaleAnchor.y, 1);
        
        // translate vertex using transform value
        vec2 vertexPosition = aVertexPosition + vertexOffset;
        
        vec3 inbetweenPosition = scaleAnchorMatrix * scaleMatrix * invScaleAnchorMatrix * vec3(vertexPosition, 1.0);
        gl_Position = vec4((projectionMatrix * translationMatrix * inbetweenPosition).xy, 0.0, 1.0);
    `
    // assemble
    let shader;
    shader = varsPos;
    if (includeUv) {
        shader += varsUV;
    }
    shader += varsTrans;
    shader += funStart;
    if (includeUv) {
        shader += funUV;
    }
    shader += funTrans;
    shader += funEnd;
    return shader;
}

export const deformVertexSrc = (includeUv = false) => {
    const varsCurve = `
        uniform sampler2D texture;
        uniform float pathOffset;
        uniform float pathSegment;
        uniform float spineOffset;
        uniform float spineLength;
        uniform int flow;
        float textureLayers = 4.; // look up takes (i + 0.5) / textureLayers
    `
    const funCurve = `
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
        gl_Position = vec4((projectionMatrix * translationMatrix * vec3(transformed.xy, 1.0)).xy, 0.0, 1.0);
    `;

    // assemble
    let shader;
    shader = varsPos;
    if (includeUv) {
        shader += varsUV;
    }
    shader += varsCurve;
    shader += funStart;
    if (includeUv) {
        shader += funUV;
    }
    shader += funCurve;
    shader += funEnd;
    return shader;
}


export const simpleVertexSrc = (includeUv = false) => {
    // function
    const funPos = `
        gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    `;

    // assemble
    let shader;
    shader = varsPos;
    if (includeUv) {
        shader += varsUV;
    }
    shader += funStart;
    shader += funPos;
    if (includeUv) {
        shader += funUV;
    }
    shader += funEnd;
    return shader;
}
