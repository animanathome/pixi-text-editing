import {FontAtlasText} from "./fontAtlasText";
import {FontAtlasTextManipulator} from "./fontAtlasTextManipulator";
import {drawRectangle} from "./drawRectangle";
import {dist} from "./utils";
import * as PIXI from 'pixi.js';

export class EditingEvents extends PIXI.utils.EventEmitter {
    element;
    stage;
    activeObject;
    activeManipulator;
    boundsPreview;

    constructor(element: HTMLElement, stage) {
        super()
        this.element = element;
        this.stage = stage;

        this._hookupEvents();
    }

    _hookupEvents() {
        console.log('_hookupEvents')
        window.addEventListener('keydown', this.onKeyDown.bind(this));
        window.addEventListener('click', this.onClick.bind(this), false);
        // this.element.addEventListener('mouseup', this.onMouseUp, false);
        // this.element.addEventListener('mousedown', this.onMouseDown, false);
        // this.element.addEventListener('mousemove', this.onMouseMove.bind(this), false);
        // this.element.addEventListener('mouseenter', this.onMouseEnter, false);
        // this.element.addEventListener('mouseleave', this.onMouseLeave, false);
    }

    _getClosestContainer(x: number, y: number) : PIXI.Container | null {
        let minDist = Infinity;
        let closestChild = undefined;
        let curDist = Infinity;
        for (const child of this.stage.children) {
            if(!('center' in child)) {
                continue;
            }
            curDist = dist({x, y}, child.center())
            if (curDist < minDist) {
                minDist = curDist;
                closestChild = child;
            }
        }
        return closestChild
    }

    _getContainerBelow(x: number, y: number) : PIXI.Container | null {
        for (const child of this.stage.children) {
            const bounds = child.getBounds()
            if (bounds.contains(x, y)) {
                return child
            }
        }
    }

    onKeyDown(e) {
        switch (e.key) {
            case 'ArrowLeft': this.onArrowLeft(e.shiftKey); break;
            case 'ArrowRight': this.onArrowRight(e.shiftKey); break;
            case 'ArrowUp': this.onArrowUp(e.shiftKey); break;
            case 'ArrowDown': this.onArrowDown(e.shiftKey); break;
            case 'Backspace': this.onDelete(); break;
            case 'Control': case 'Shift': case 'Meta': break;
            default: this.onInput(e.key); break;
        }
    }

    onArrowUp(shiftKey = false) {
        if (!this.activeManipulator) {
            return;
        }
        this.activeManipulator.arrowUp(shiftKey);
    }

    onArrowDown(shiftKey = false) {
        if (!this.activeManipulator) {
            return;
        }
        this.activeManipulator.arrowDown(shiftKey);
    }

    onArrowLeft(shiftKey = false) {
        if (!this.activeManipulator) {
            return;
        }
        this.activeManipulator.arrowLeft(shiftKey);
    }

    onArrowRight(shiftKey = false) {
        if (!this.activeManipulator) {
            return;
        }
        this.activeManipulator.arrowRight(shiftKey);
    }

    onInput(glyph) {
        if (!this.activeManipulator) {
            return;
        }
        this.activeManipulator.onInput(glyph);

        // @ts-ignore
        this.emit('change')
    }

    onDelete() {
        if (!this.activeManipulator) {
            return;
        }
        this.activeManipulator.onDelete();

        // @ts-ignore
        this.emit('change')
    }

    onClick(e) {
        const x = e.clientX;
        const y = e.clientY;
        const shiftKey = e.shiftKey;
        // get display objects closest to the given position
        const object = this._getClosestContainer(x, y);

        // nothing selected - reset selection
        if (!object) {
            if (this.activeManipulator) {
                this.stage.removeChild(this.activeManipulator);
                this.activeManipulator.destroy();
                this.activeManipulator = null;
            }
            this.activeObject = null;
            return;
        }

        // re-use existing manipulator
        if (this.activeObject && this.activeManipulator) {
            this.activeManipulator.click(x, y, shiftKey);
            return;
        }

        this.activeObject = object

        // create a text manipulator
        if (this.activeObject instanceof FontAtlasText) {
            this.activeManipulator = new FontAtlasTextManipulator(this.activeObject);
            this.stage.addChildAt(this.activeManipulator, 0);
            this.activeManipulator.x = this.activeObject.x;
            this.activeManipulator.y = this.activeObject.y;
            this.activeManipulator.click(x, y, shiftKey);
        }
    }

    onMouseUp(e) {
        console.log('mouseUp', e);
    }

    onMouseDown(e) {
        console.log('mouseDown', e);
    }

    onMouseMove(e) {
        const x = e.clientX;
        const y = e.clientY;
        const object = this._getContainerBelow(x, y);
        if (this.boundsPreview) {
            this.boundsPreview.destroy(true);
            this.boundsPreview = null;
        }
        if (!object) {
            return;
        }
        if (typeof object.getBounds !== 'function') {
            console.log('object does not have getBounds() function', object);
            return;
        }
        const bounds = object.getBounds();
        this.boundsPreview = drawRectangle(bounds)
        this.stage.addChild(this.boundsPreview);
    }

    onMouseOut(e) {
        console.log('mouseOut', e);
    }

    onMouseEnter(e) {
        console.log('mouseEnter', e);
    }

    onMouseLeave(e) {
        console.log('mouseLeave', e);
    }
}