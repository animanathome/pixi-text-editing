import * as PIXI from 'pixi.js';
import {BaseDeformer, DeformerType} from "./deformers/BaseDeformer";
import {CurveDeformer} from "./deformers/CurveDeformer";
import {TextDeformer} from "./deformers/TextDeformer";
import {TransformDeformer} from "./deformers/TransformDeformer";
import {VertexTransformDeformer} from "./deformers/VertexTransformDeformer";
import {Container} from "pixi.js";

type MatrixDeformer = TransformDeformer | CurveDeformer;
type VertexDeformer = VertexTransformDeformer | CurveDeformer | TextDeformer;
type Deformer = MatrixDeformer | VertexDeformer;

export class DeformerStack extends PIXI.utils.EventEmitter {
    _vertexDeformers: VertexDeformer[];
    _matrixDeformers: MatrixDeformer[];
    _parent = undefined;

    constructor(parent) {
        super();
        this._matrixDeformers = [];
        this._vertexDeformers = [];
        this._parent = parent;
    }

    get isDirty() {
        return this.deformers.some(deformer => deformer.isDirty);
    }

    update() {
        this.deformers.forEach(deformer => deformer.update());
    }

    get matrixDeformers() {
        return this._matrixDeformers;
    }

    get vertexDeformers() {
        return this._vertexDeformers;
    }

    get deformers() {
        return this._vertexDeformers.concat(this._matrixDeformers);
    }

    /* Add a deformer. */
    public addDeformer(deformer: Deformer): void {
        deformer._deformerStack = this;
        if (deformer.deformerType === DeformerType.VERTEX) {
            this._vertexDeformers.push(deformer as VertexDeformer);
        }
        else if (deformer.deformerType === DeformerType.MATRIX) {
            this._matrixDeformers.push(deformer as MatrixDeformer);
        }
        deformer.update();
        this.emit('deformerAdded');
    }

    public addDeformerAtIndex(deformer: Deformer, index: number): void {
        deformer._deformerStack = this;

        if (deformer.deformerType === DeformerType.VERTEX) {
            this._vertexDeformers.splice(index, 0, deformer as VertexDeformer);
        }
        else if (deformer.deformerType === DeformerType.MATRIX) {
            this._matrixDeformers.splice(index, 0, deformer as MatrixDeformer);
        }
    }

    /* Remove a deformer. */
    public removeDeformer(deformer: Deformer): void {
        if (deformer.deformerType === DeformerType.VERTEX) {
            const index = this._vertexDeformers.indexOf(deformer as VertexDeformer);
            if (index >= 0) {
                this._vertexDeformers.splice(index, 1);
            }
        }
        else if (deformer.deformerType === DeformerType.MATRIX) {
            const index = this._matrixDeformers.indexOf(deformer as MatrixDeformer);
            if (index >= 0) {
                this._matrixDeformers.splice(index, 1);
            }
        }
        this.emit('deformerRemoved');
    }

    public moveDeformerToIndex(deformer: Deformer, index: number): void {
        this.removeDeformer(deformer);
        this.addDeformerAtIndex(deformer, index);
    }

    public deformerIndex(deformer: Deformer): number {
        if (deformer.deformerType === DeformerType.VERTEX) {
            return this._vertexDeformers.indexOf(deformer as VertexDeformer);
        }
        else if(deformer.deformerType === DeformerType.MATRIX) {
            return this._matrixDeformers.indexOf(deformer as MatrixDeformer);
        }
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
        const uniforms = Object.assign({}, ...this.deformers.map(deformer => deformer._uniforms()));
        return uniforms;
    }

    _buildVertexShader() {
        return this._combineVertHeads() + this._combineVertBodies()
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

    _combineVertHeads() {
        let combinedHeaders = '';
        this.deformers.forEach(deformer => {
            combinedHeaders += `${deformer._vertHead()}\n`
        })

        return `
        ${this._vertexHeads()}
        ${this._uvHeads()}
        ${combinedHeaders}
        `
    }

    // hasWeights() {
    //     return this.deformers.some(deformer => deformer.hasWeights);
    // }
    //
    // _getWeights() {
    //     const deformer = this.deformers.find(deformer => deformer.hasWeights);
    //     console.log('deformer with weights', deformer);
    //     if (!deformer) {
    //         console.log('no deformer with weights');
    //         return [];
    //     }
    //     return deformer._generateWeights();
    // }

    get hasVertexDeformers() {
        return this._vertexDeformers.length > 0;
    }

    get hasMatrixDeformers() {
        return this._matrixDeformers.length > 0;
    }

    printAssembly() {
        console.log('uniforms', this._combineUniforms());
        console.log('header', this._combineVertHeads());
        console.log('body', this._combineVertBodies());
    }

    _uvBodies() {
        return `vUvs = aUvs;`
    }

    _combineVertBodies() {
        let combinedFuncs = '';
        this.deformers.forEach((deformer) => {
            combinedFuncs += `${deformer._vertBody()}\n`;
        });

        // combine matrices into a single matrix
        let combineMatrixFuncs = '';
        if (this.hasMatrixDeformers) {
            combineMatrixFuncs = 'mat3 combinedMatrix =';
            this.matrixDeformers.forEach((deformer, index) => {
                    combineMatrixFuncs += index === 0 ? ` getTranslationMatrix${index}()` : ` * getTranslationMatrix${index}()`;
                })
            combineMatrixFuncs += ';';
        }

        // add vertex deformers together to a final vertex position
        let combinedVertexFuncs = `vec3 vertexPosition = vec3(aVertexPosition.xy, 1.0);\n`;
        if (this.hasVertexDeformers) {
            this.vertexDeformers.forEach((deformer, index) => {
                    if (index === 0) {
                        combinedVertexFuncs += `vec3 vertexPosition${index} = getVertexPosition${index}(vertexPosition);\n`;
                    }
                    else {
                        combinedVertexFuncs += `vec3 vertexPosition${index} = getVertexPosition${index}(vertexPosition${index - 1});\n`;
                    }
                })
        }

        // combine all the matrices and vertex deformers into a final position
        let combinedFunctions = 'vec3 finalPosition = vec3(projectionMatrix * translationMatrix ';
        combinedFunctions += this.hasMatrixDeformers ? '* combinedMatrix ' : ' ';
        combinedFunctions += this.hasVertexDeformers ? `* vertexPosition${this.vertexDeformers.length - 1}` : '* vertexPosition';
        combinedFunctions += ');';

        return `
        ${combinedFuncs}
        void main(void) {
            ${combinedVertexFuncs}
            ${combineMatrixFuncs}
            ${combinedFunctions}
            gl_Position = vec4(finalPosition.xy, 0.0, 1.0);
            ${this._uvBodies()}
        }
        `
    }
}