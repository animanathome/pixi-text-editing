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

    constructor(parent) {
        super();
        this._deformers = [];
        this._parent = parent;
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
        return this._combineVertHeads(deformers) + this._combineVertBodies(deformers);
    }

    // append src since this returns the source code for the shader
    _buildFragmentShader() {
        const deformers = this.deformers.filter(deformer => deformer.enabled);
        return this._combineFragHeads(deformers) + this._combineFragBodies(deformers);
    }

    _combineFragHeads(deformers: Deformer[]) {
        let combinedHeaders = '';
        deformers.forEach(deformer => {
            combinedHeaders += `${deformer._fragHead()}\n`
        })
        return `
        ${combinedHeaders}
        varying vec2 vUvs;
        uniform sampler2D uSampler2;
        uniform vec4 uColor;`;
    }

    _combineFragBodies(deformers: Deformer[]) {
        let aggregateFunctions = '';
        deformers.forEach((deformer) => {
            aggregateFunctions += `${deformer._fragBody()}\n`;
        });

        let mainUVFunction = `vec2 uv0 = vUvs;\n`;
        let lastUVIndex = 0;
        deformers
            .filter(deformer => deformer.enabled && deformer.deformerType.includes(DeformerType.UV))
            .forEach((deformer, index) => {
                mainUVFunction += `vec2 uv${index + 1} = getUV${index + 1}(uv${index});\n`;
                lastUVIndex = index + 1;
            });

        let mainColorFunction = `vec4 color0 = uColor;\n`;
        let lastColorIndex = 0;
        deformers
            .filter(deformer => deformer.enabled && deformer.deformerType.includes(DeformerType.COLOR))
            .forEach((deformer, index) => {
                mainColorFunction += `vec4 color${index + 1} = getColor${index + 1}(color${index});\n`;
                lastColorIndex = index + 1;
            });

        return `
        ${aggregateFunctions}
        void main() {
            ${mainUVFunction}
            ${mainColorFunction}
            gl_FragColor = texture2D(uSampler2, uv${lastUVIndex}) * color${lastColorIndex};
        }
        `;
    }

    _vertexHeads() {
        return `
        attribute vec2 aVertexPosition;
        uniform mat3 projectionMatrix;
        uniform mat3 translationMatrix;`
    }

    _uvHeads() {
        return `
        attribute vec2 aUvs;
        varying vec2 vUvs;`
    }

    _combineVertHeads(deformers: Deformer[]) {
        let combinedHeaders = '';
        let hasWeight = false;
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
                combinedHeaders += `${line}\n`
            });
        })
        return `
        ${this._vertexHeads()}
        ${this._uvHeads()}
        ${combinedHeaders}
        `
    }

    logAssembly() {
        console.log('uniforms', this._combineUniforms());
        console.log('vertex', this._buildVertexShader());
        console.log('fragment', this._buildFragmentShader());
    }

    _uvBodies() {
        return `vUvs = aUvs;`
    }

    _combineVertMains(deformers: Deformer[]) {
        let aggregateFunctions = '';
        deformers.forEach((deformer) => {
            aggregateFunctions += `${deformer._vertMain()}\n`;
        });
        return aggregateFunctions;
    }

    _combineVertBodies(deformers: Deformer[]) {
        let aggregateFunctions = '';
        deformers.forEach((deformer) => {
            aggregateFunctions += `${deformer._vertBody()}\n`;
        });

        let mainFunction = `vec3 vertexPosition0 = vec3(aVertexPosition.xy, 1.0);\n`;
        let lastIndex = 0;
        deformers.forEach((deformer, index) => {
            if (deformer.deformerType.includes(DeformerType.MATRIX)) {
                mainFunction += `vec3 vertexPosition${index + 1} = getTranslationMatrix${index + 1}() * vertexPosition${index};\n`;
                lastIndex = index + 1;
            }
            if (deformer.deformerType.includes(DeformerType.VERTEX)) {
                mainFunction += `vec3 vertexPosition${index + 1} = getVertexPosition${index + 1}(vertexPosition${index});\n`;
                lastIndex = index + 1;
            }
        });
        mainFunction += `vec3 finalPosition = vec3(projectionMatrix * translationMatrix * vertexPosition${lastIndex});\n`;

        return `
        ${aggregateFunctions}
        void main(void) {
            ${mainFunction}
            gl_Position = vec4(finalPosition.xy, 0.0, 1.0);
            ${this._combineVertMains(deformers)}
            ${this._uvBodies()}
        }
        `
    }
}