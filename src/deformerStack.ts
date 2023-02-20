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
        return this._deformers.filter(deformer => deformer.deformerType === DeformerType.MATRIX);
    }

    get vertexDeformers() {
        return this._deformers.filter(deformer => deformer.deformerType === DeformerType.VERTEX);
    }

    get deformers() {
        return this._deformers;
    }

    /* Add a deformer. */
    public addDeformer(deformer: Deformer): void {
        deformer._deformerStack = this;
        this._deformers.push(deformer);
        deformer.update();
        this.emit('deformerAdded');
    }

    public addDeformerAtIndex(deformer: Deformer, index: number): void {
        deformer._deformerStack = this;
        this._deformers.splice(index, 0, deformer);
    }

    /* Remove a deformer. */
    public removeDeformer(deformer: Deformer): void {
        const index = this._deformers.indexOf(deformer as VertexDeformer);
        if (index >= 0) {
            this._deformers.splice(index, 1);
        }
        this.emit('deformerRemoved');
    }

    public moveDeformerToIndex(deformer: Deformer, index: number): void {
        this.removeDeformer(deformer);
        this.addDeformerAtIndex(deformer, index);
    }

    public deformerIndex(deformer: Deformer): number {
        return this._deformers.indexOf(deformer as VertexDeformer);
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

    printAssembly() {
        console.log('uniforms', this._combineUniforms());
        console.log('header', this._combineVertHeads());
        console.log('body', this._combineVertBodies());
    }

    _uvBodies() {
        return `vUvs = aUvs;`
    }

    _combineVertBodies() {
        let aggregateFunctions = '';
        this.deformers.forEach((deformer) => {
            aggregateFunctions += `${deformer._vertBody()}\n`;
        });

        let mainFunction = `vec3 vertexPosition0 = vec3(aVertexPosition.xy, 1.0);\n`;
        this.deformers.forEach((deformer, index) => {
            if (deformer.deformerType === DeformerType.MATRIX) {
                mainFunction += `vec3 vertexPosition${index + 1} = getTranslationMatrix${index + 1}() * vertexPosition${index};\n`;
            }
            if (deformer.deformerType === DeformerType.VERTEX) {
                mainFunction += `vec3 vertexPosition${index + 1} = getVertexPosition${index + 1}(vertexPosition${index});\n`;
            }
        });
        mainFunction += `vec3 finalPosition = vec3(projectionMatrix * translationMatrix * vertexPosition${this.deformers.length});\n`;

        return `
        ${aggregateFunctions}
        void main(void) {
            ${mainFunction}
            gl_Position = vec4(finalPosition.xy, 0.0, 1.0);
            ${this._uvBodies()}
        }
        `
    }
}