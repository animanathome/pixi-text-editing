// variable snippets
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
