export const textureFragmentSrc = `
    varying vec2 vUvs;
    uniform sampler2D uSampler2;
    uniform vec4 uColor;

    void main() {
        gl_FragColor = texture2D(uSampler2, vUvs) * uColor;
    }
`;

export const rectangleFragmentSrc = `
    varying vec2 vUvs;
    uniform bool xInvert;
    uniform bool yInvert;
    uniform float xProgress;
    uniform float yProgress;
    uniform vec4 uColor;
    
    void main(){
        // horizontal
        float xValue = xInvert ? 1.0 - vUvs.x : vUvs.x;
        vec2 sth = vec2(xValue, 1);
        vec2 blh = step(vec2(xProgress),sth);
        float pcth = blh.x * blh.y;
        
        // vertical
        float yValue = yInvert ? 1.0 - vUvs.y : vUvs.y;
        vec2 stv = vec2(1, yValue);
        vec2 blv = step(vec2(yProgress),stv);
        float pctv = blv.x * blv.y;
        gl_FragColor = uColor * ((1.0 - pcth) * (1.0 - pctv));
    }
`

export const colorFragmentSrc = `
    uniform vec4 uColor;

    void main() {
        gl_FragColor = uColor;
    }
`;