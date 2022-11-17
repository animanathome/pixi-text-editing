export const textureFragmentSrc = `
    varying vec2 vUvs;
    uniform sampler2D uSampler2;
    uniform vec4 uColor;

    void main() {
        gl_FragColor = texture2D(uSampler2, vUvs) * uColor;
    }
`;

export const colorFragmentSrc = `
    uniform vec4 uColor;

    void main() {
        gl_FragColor = uColor;
    }
`;