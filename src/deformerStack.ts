import * as PIXI from 'pixi.js';
import {BaseDeformer, DeformerType} from "./deformers/BaseDeformer";
import {CurveDeformer} from "./deformers/CurveDeformer";
import {TextTransformDeformer} from "./deformers/text/TextTransformDeformer";
import {TransformDeformer} from "./deformers/TransformDeformer";
import {VertexTransformDeformer} from "./deformers/VertexTransformDeformer";
import {TextProgressDeformer} from "./deformers/text/TextProgressDeformer";

type Deformer = BaseDeformer | TransformDeformer | CurveDeformer | TextProgressDeformer | VertexTransformDeformer | TextTransformDeformer;

export class DeformerStack extends PIXI.utils.EventEmitter {
    _deformers: Deformer[];
    _parent = undefined;
    _uvs = true;

    constructor(parent, settings = {uvs: false}) {
        super();
        this._deformers = [];
        this._parent = parent;
        if ('uvs' in settings) {
            console.log('uvs', settings.uvs);
            this._uvs = settings.uvs;
        }
    }

    get uvs() {
        return this._uvs;
    }

    get isDirty() {
        return this.deformers.some(deformer => deformer.isDirty);
    }

    update() {
        this.deformers.forEach(deformer => deformer.update());
    }

    get matrixDeformers() {
        return this._deformers.filter(deformer => deformer.deformerType.includes(DeformerType.MATRIX));
    }

    get vertexDeformers() {
        return this._deformers.filter(deformer => deformer.deformerType.includes(DeformerType.VERTEX));
    }

    get deformers() {
        return this._deformers;
    }

    /* Add a deformer. */
    public addDeformer(deformer: Deformer): void {
        deformer._deformerStack = this;
        this._deformers.push(deformer);
        deformer.update();
        // TODO: fix me
        (this as any).emit('deformerAdded');
    }

    public addDeformerAtIndex(deformer: Deformer, index: number): void {
        deformer._deformerStack = this;
        this._deformers.splice(index, 0, deformer);
    }

    /* Remove a deformer. */
    public removeDeformer(deformer: Deformer): void {
        const index = this._deformers.indexOf(deformer as Deformer);
        if (index >= 0) {
            this._deformers.splice(index, 1);
        }
        (this as any).emit('deformerRemoved');
    }

    public moveDeformerToIndex(deformer: Deformer, index: number): void {
        this.removeDeformer(deformer);
        this.addDeformerAtIndex(deformer, index);
    }

    public deformerIndex(deformer: Deformer): number {
        return this._deformers.indexOf(deformer as Deformer);
    }

    /* Remove all deformers. */
    public removeAllDeformers(): void {
        while(this.hasDeformers) {
            this.removeDeformer(this.deformers[0]);
        }
    }

    get hasDeformers() {
        return this.deformers.length > 0;
    }

    _combineUniforms() {
        const deformers = this.deformers.filter(deformer => deformer.enabled);

        const uniforms = Object.assign({}, ...deformers.map(deformer => deformer._uniforms()));
        return uniforms;
    }

    // append src since this returns the source code for the shader
    _buildVertexShader() {
        const deformers = this.deformers.filter(deformer => deformer.enabled);
        return this._combineVertexHeaders(deformers) + this._combineVertexBodies(deformers);
    }

    // append src since this returns the source code for the shader
    _buildFragmentShader() {
        const deformers = this.deformers.filter(deformer => deformer.enabled);
        return this._combineFragmentHeaders(deformers) + this._combineFragmentBodies(deformers);
    }

    _combineFragmentHeaders(deformers: Deformer[]) {
        let combinedDeformerHeaders = '';
        deformers.forEach(deformer => {
            combinedDeformerHeaders += `${deformer._fragmentHeader()}\n`
        })

        let uvHeaders = '';
        if (this.uvs) {
            uvHeaders = `
            varying vec2 vUvs;
            uniform sampler2D uSampler2;`;
        }

        return `
        ${combinedDeformerHeaders}
        ${uvHeaders}
        uniform vec4 uColor;`;
    }

    _combineFragmentBodies(deformers: Deformer[]) {
        let aggregateFunctions = '';
        deformers.forEach((deformer) => {
            aggregateFunctions += `${deformer._fragBody()}\n`;
        });

        // uv
        let mainUVFunction = '';
        if (this.uvs) {
            mainUVFunction = `vec2 uv0 = vUvs;\n`;
            let lastUVIndex = 0;
            deformers
                .filter(deformer => deformer.enabled && deformer.deformerType.includes(DeformerType.UV))
                .forEach((deformer, index) => {
                    mainUVFunction += `vec2 uv${index + 1} = getUV${index + 1}(uv${index});\n`;
                    lastUVIndex = index + 1;
                });
            mainUVFunction += `vec4 ocolor = texture2D(uSampler2, uv${lastUVIndex});`;
        }
        else {
            mainUVFunction = `vec4 ocolor = uColor;`;
        }

        // color
        let mainColorFunction = `vec4 color0 = uColor;\n`;
        let lastColorIndex = 0;
        deformers
            .filter(deformer => deformer.enabled && deformer.deformerType.includes(DeformerType.COLOR))
            .forEach((deformer, index) => {
                mainColorFunction += `vec4 color${index + 1} = getColor${index + 1}(color${index});\n`;
                lastColorIndex = index + 1;
            });

        // final
        const mainFunction = `gl_FragColor = ocolor * color${lastColorIndex};`;

        // main
        return `
        ${aggregateFunctions}
        void main() {
            ${mainUVFunction}
            ${mainColorFunction}
            ${mainFunction}
        }
        `;
    }

    _combineVertexHeaders(deformers: Deformer[]) {
        let hasWeight = false;
        let combineDeformerHeaders = '';
        deformers.forEach(deformer => {
            // TODO: this is really just visual cleanup -- we don't really need this...
            const lines = deformer._vertHead()
                .split(/\r?\n/)
                .map(item => item.trim())
                .filter(item => item.length > 0);

            // TODO: warning, this assumes every deformer uses the same transform type!!!
            //  we probably don't want this
            lines.forEach(line => {
                // remove possible duplicate aWeight
                if (line.includes('aWeight')) {
                    if (hasWeight) {
                        return;
                    }
                    hasWeight = true;
                }
                combineDeformerHeaders += `${line}\n`
            });
        })

        let uvHeaders = '';
        if (this.uvs) {
            uvHeaders = `
            attribute vec2 aUvs;
            varying vec2 vUvs;`
        }

        return `
        attribute vec2 aVertexPosition;
        uniform mat3 projectionMatrix;
        uniform mat3 translationMatrix;
        ${uvHeaders}
        ${combineDeformerHeaders}
        `
    }

    logAssembly() {
        console.log('uniforms', this._combineUniforms());
        console.log('vertex', this._buildVertexShader());
        console.log('fragment', this._buildFragmentShader());
    }

    _combineVertexBodies(deformers: Deformer[]) {
        // the matrix or vertex computation function for each deformer.
        // these methods are going to be called within the main function.
        let combineFunctions = '';
        deformers.forEach((deformer) => {
            combineFunctions += `${deformer._vertBody()}\n`;
        });

        // blocks of code which execute compute a matrix or vertex deformer deformer function
        // these functions contribute to the final vertex position
        let callFunctions = `vec3 vertexPosition0 = vec3(aVertexPosition.xy, 1.0);\n`;
        let lastIndex = 0;
        deformers.forEach((deformer, index) => {
            if (deformer.deformerType.includes(DeformerType.MATRIX)) {
                callFunctions += `vec3 vertexPosition${index + 1} = getTranslationMatrix${index + 1}() * vertexPosition${index};\n`;
                lastIndex = index + 1;
            }
            if (deformer.deformerType.includes(DeformerType.VERTEX)) {
                callFunctions += `vec3 vertexPosition${index + 1} = getVertexPosition${index + 1}(vertexPosition${index});\n`;
                lastIndex = index + 1;
            }
        });
        callFunctions += `vec3 finalPosition = vec3(projectionMatrix * translationMatrix * vertexPosition${lastIndex});\n`;

        // blocks of code which prepare the varying variables for the fragment shader
        let varyingUVCodeBlock = '';
        if (this.uvs) {
            varyingUVCodeBlock = `vUvs = aUvs;`;
        }
        let varyingCodeBlocks = '';
        deformers.forEach((deformer) => {
            varyingCodeBlocks += `${deformer._vertexMain()}\n`;
        });

        return `
        ${combineFunctions}
        void main(void) {
            ${callFunctions}
            gl_Position = vec4(finalPosition.xy, 0.0, 1.0);
            ${varyingCodeBlocks}
            ${varyingUVCodeBlock}
        }`
    }
}