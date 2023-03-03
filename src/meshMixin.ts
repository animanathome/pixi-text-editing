import * as PIXI from "pixi.js";

export type MeshMixinInterface = {
    get geometry(): PIXI.Geometry;
    /**
     * Represents the vertex and fragment shaders that processes the geometry and runs on the GPU.
     * Can be shared between multiple Mesh objects.
     * @type {PIXI.Shader|PIXI.MeshMaterial}
     */
    get shader(): PIXI.MeshMaterial;
    /**
     * Represents the WebGL state the Mesh required to render, excludes shader and geometry. E.g.,
     * blend mode, culling, depth testing, direction of rendering triangles, backface, etc.
     */
    get state(): PIXI.State;
    /** The way the Mesh should be drawn, can be any of the {@link PIXI.DRAW_MODES} constants. */
    get drawMode(): PIXI.DRAW_MODES;
    /**
     * How much of the geometry to draw, by default `0` renders everything.
     * @default 0
     */
    get size(): number;
    /**
     * Typically the index of the IndexBuffer where to start drawing.
     * @default 0
     */
    get start(): number;
    _buildShader(): void;
    _buildGeometry(): void;
    _renderDefault(renderer: PIXI.Renderer): void;
}

export type MixinBase<T = any> = new (...args: any[]) => T;
export type GetConstructorParameters<TBase> = TBase extends new (props: infer P) => any ? P : never;
export type GetInstance<TBase> = TBase extends new (...args: any[]) => infer I ? I : never;
export type GetMultipleConstructorParameters<TBase> = TBase extends new (...props: infer P) => any ? P : never;
export type MergeConstructors<A, B> = new (...props:
                                           GetMultipleConstructorParameters<A> &
                                           GetMultipleConstructorParameters<B>
                                          ) => GetInstance<A> & GetInstance<B>;
export type PublicConstructor<T> = new (props: GetConstructorParameters<T>) => T;

/**
 * This mixin adds rendering capabilities
 * @param Base
 * @constructor
 */
export const MeshMixin = <TBase extends MixinBase>(Base: TBase) => {
    const Derived = class extends (Base as any) implements MeshMixinInterface {
        _shader : PIXI.MeshMaterial | PIXI.Shader = null;
        _geometry : PIXI.Geometry = null;
        _state: PIXI.State = PIXI.State.for2d();
        _size: number = 0;
        _start: number = 0;
        _drawMode: number = PIXI.DRAW_MODES.TRIANGLES;

        constructor() {
            super();
        }

        get drawMode() {
            return this._drawMode;
        }

        get state() {
            return this._state;
        }

        get start() {
            return this._start;
        }

        get size() {
            return this._size;
        }

        _buildShader() {
            throw Error('To be implemented');
        }

        get shader() {
            return this._shader;
        }

        _buildGeometry() {
            throw Error('To be implemented');
        }

        get geometry() {
            return this._geometry;
        }

        _renderDefault(renderer: PIXI.Renderer) {
            console.log('rendering default')
            if (!this.shader || !this.geometry) {
                console.log('no shader or geometry available. Nothing to render');
                return;
            }
            this.shader.alpha = this.worldAlpha;
            // if the shader has an update method, call it. This is where PIXI updates both the color
            // and uvMatrix if dirty
            if (this.shader.update)
            {
                this.shader.update();
            }
            renderer.batch.flush();

            // console.log('renderer', renderer.CONTEXT_UID);
            // const bufferSystem = renderer.buffer;
            // for (let i = 0; i < this.geometry.buffers.length; i++) {
            //     const buffer = this.geometry.buffers[i];
            //     const GLbuffer = buffer._glBuffers[renderer.CONTEXT_UID] || bufferSystem.createGLBuffer(buffer);
            //     // bufferSystem.update(buffer);
            // }

            // this.shader.uniforms.translationMatrix = this.transform.worldTransform.toArray(true);
            renderer.shader.bind(this.shader, false);
            renderer.state.set(this.state);
            renderer.geometry.bind(this.geometry, this.shader);
            renderer.geometry.draw(this.drawMode, this.size, this.start, this.geometry.instanceCount);
        }
    }

    return Derived as MergeConstructors<typeof Derived, TBase>;
}