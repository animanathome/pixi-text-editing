/**
 * Manages all animation for a given object. Animation gets added to an object by
 * create an Incrementer and Timeline for each driven property
 */
import {Animation} from "./animation";

const VERBOSE = false;

export class AnimationStack {
    _time = 0;
    _parent = undefined;
    _animations: Animation[] = [];

    constructor(parent) {
        this._parent = parent;
    }

    get animations() {
        return this._animations;
    }

    // NOTE: is it possible to animate a text property (container.x, y)
    addAnimation(deformer, property: string) {
        if (!property) {
            throw new Error('property is required');
        }
        VERBOSE && console.log('add animation', deformer, property)
        // TODO: ensure the property exists on the deformer
        const animation = new Animation(deformer, property);
        this._animations.push(animation);
        return animation;
    }

    getAnimation(deformer, property: string) {
        return this._animations.find(animation => animation.target === deformer && animation.property === property);
    }

    removeAnimation(deformer, property) {
        const animation = this.getAnimation(deformer, property);
        if (animation) {
            this._animations.splice(this._animations.indexOf(animation), 1);
        }
    }

    /**
     * The animation stack is dirty if any of its animations have unprocessed changes. Incrementer or timeline changes
     * are two examples of changes that need to be processed. In other words, the objects need to be (re)built.
     */
    get dirty() {
        return this._animations.some(animation => animation.dirty);
    }

    update() {
        VERBOSE && console.log('animationStack update');
        this.animations.forEach(animation => animation.update());
    }

    get time() {
        return this._time;
    }

    /**
     * Set the time for all animations in the stack. Setting the time for an animation will force the object to be
     * evaluated. This involves the evaluation of the incrementer and timeline which, in turn, sets the resulting value
     * to the target object's driven property.
     * @param value
     */
    set time(value) {
        this._time = value;
        this.animations.forEach(animation => animation.time = value);
    }
}