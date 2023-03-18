import {BaseDeformer, DeformerType} from "../BaseDeformer";
import {TextDeformer, TRANSFORM_TYPE} from "./TextDeformer";

export enum TRANSFORM_DIRECTION {
    LEFT_TO_RIGHT,
    RIGHT_TO_LEFT,
    TOP_TO_BOTTOM,
    BOTTOM_TO_TOP
}

export class TextProgressDeformer extends TextDeformer {
    _deformerType: DeformerType[] = [DeformerType.VERTEX, DeformerType.UV];
    _progresses: number[] = [];
    _direction: TRANSFORM_DIRECTION = TRANSFORM_DIRECTION.TOP_TO_BOTTOM;

    _indexArray: number[] = [];
    _uMinMaxXArray: number[] = [];
    _uMinMaxYArray: number[] = [];
    _uMinMaxUArray: number[] = [];
    _uMinMaxVArray: number[] = [];

    _uniforms(): {} {
        // when we change a value, does it sync up one uniform or all of them?
        // we could just copy over the min/max values as that's what we're using
        return {
            uDirection: this.direction,
            uProgresses: this.progresses,
            uMinMaxXArray: this._uMinMaxXArray,
            uMinMaxYArray: this._uMinMaxYArray,
            uMinMaxUArray: this._uMinMaxUArray,
            uMinMaxVArray: this._uMinMaxVArray,
        }
    }

    get progresses() {
        return this._progresses;
    }

    set progresses(value: number[]) {
        this._validateData(value, 1);
        this._progresses = value;
    }

    get direction() {
        return this._direction;
    }

    set direction(value: TRANSFORM_DIRECTION) {
        this._direction = value;
    }

    // TODO: rename aWeight to aVertexWeight
    // header
    _vertexHeader(): string {
        const transformLength = this._progresses.length;
        const arrayLength = this._uMinMaxXArray.length;
        const totalUniformCount = (arrayLength * 4) + transformLength;
        // maybe we should use a data texture instead of uniforms?
        // or just attributes?
        if (totalUniformCount > 1024) {
            // see https://alteredqualia.com/tools/webgl-features/
            throw Error("Too many uniforms! " + totalUniformCount);
        }
        return `
            attribute float aWeight; //[${this._weights.length}]
            attribute float aVertexIndex; //[${this._indexArray.length}]
            
            uniform float uDirection;
            uniform float uProgresses[${transformLength}];
            uniform vec2 uMinMaxXArray[${arrayLength}];
            uniform vec2 uMinMaxYArray[${arrayLength}];
            uniform vec2 uMinMaxUArray[${arrayLength}];
            uniform vec2 uMinMaxVArray[${arrayLength}];
            
            varying vec2 vMinMaxU;
            varying vec2 vMinMaxV;
            varying float vProgress;
            varying float vDirection;
        `
    }

    // functions
    _vertBody(): string {
        return `
            vec3 getVertexPosition${this.index}(vec3 inputPosition) {
                int direction = int(uDirection);
                int progressTransformIndex = int(aWeight);
                int vertexIndex = int(aVertexIndex);
                float progress = clamp(uProgresses[progressTransformIndex], 0.0, 1.0);
                float minX = uMinMaxXArray[vertexIndex].x;
                float maxX = uMinMaxXArray[vertexIndex].y;
                float minY = uMinMaxYArray[vertexIndex].x;
                float maxY = uMinMaxYArray[vertexIndex].y;
                
                float yPos = inputPosition.y;
                if (direction == 2) { // top to bottom
                    float yRange = maxY - minY;
                    float yCoord = (inputPosition.y - minY) / yRange;
                    float yOffset = yRange * (1.0 - progress);
                    yPos = minY + ((yRange * yCoord) * progress) + yOffset;
                }
                else if (direction == 3) { // bottom to top
                    float yRange = maxY - minY;
                    float yCoord = (yRange - (inputPosition.y - minY)) / yRange;
                    float yOffset = yRange * (1.0 - progress);
                    yPos = minY + (maxY - ((yRange * yCoord) * progress)) - yOffset;
                }
                vec3 outPosition = vec3(inputPosition.x, yPos, inputPosition.z);
                return outPosition;
            }
        `;
    }

    // main
    _vertexMain(): string {
        return `
            int progressTransformIndex = int(aWeight);
            int vertexIndex = int(aVertexIndex);
            
            vMinMaxU = uMinMaxUArray[vertexIndex];
            vMinMaxV = uMinMaxVArray[vertexIndex];
            
            vProgress = clamp(uProgresses[progressTransformIndex], 0.0, 1.0);
            vDirection = uDirection;
        `
    }

    // header
    _fragmentHeader(): string {
        return `
            varying float vMinU;
            varying float vMaxU;
            varying float vMinV;
            varying float vMaxV;
            
            varying vec2 vMinMaxU;
            varying vec2 vMinMaxV;
            
            varying float vProgress;
            varying float vDirection;
        `;
    }

    // functions
    _fragBody(): string {
        return `
            vec2 getUV${this.index}(vec2 inputUV) {
                int direction = int(vDirection);
                
                float newV = inputUV.y;
                if (direction == 2) {
                    float vRange = vMinMaxV.y - vMinMaxV.x;
                    float vCoord = (inputUV.y - vMinMaxV.x) / vRange;
                    newV = vMinMaxV.x + ((vRange * vCoord) * vProgress);
                }
                else if (direction == 3) {
                    float vRange = vMinMaxV.y - vMinMaxV.x;
                    float vCoord = (vMinMaxV.y - inputUV.y) / vRange;
                    newV = vMinMaxV.y - ((vRange * vCoord) * vProgress);
                }
                vec2 outputUV = vec2(inputUV.x, newV);
                return outputUV;
            }       
        `;
    }

    _updateProperties() {
        super._updateProperties();
        this._generateIndexArray();
        this._assignIndexArray();
        this._generateMinMaxXYUVArrays();
    }

    _resetStateOnProperties(length: number) {
        this._progresses = new Array(length).fill(1.0);
    }

    // we could move this to the geometry build step
    // or maybe we don't actually need this? maybe we can count
    // vertices in the shader?
    _generateIndexArray() {
        const indices = [];
        for (let i = 0; i < this.parent.glyph.length; i++) {
            indices.push(i, i, i, i);
        }
        this._indexArray = indices;
    }

    _assignIndexArray() {
        const attribute = this.parent.geometry.getAttribute('aVertexIndex');
        if (!attribute) {
            this.parent.geometry.addAttribute('aVertexIndex', this._indexArray, 1)
            return;
        }
        const buffer = this.parent.geometry.getBuffer('aVertexIndex');
        buffer.data = new Float32Array(this._indexArray);
        // console.log('vertexIndex', this._indexArray)
    }

    _generateMinMaxXYUVArrays() {
        // get the x,y, u and v min max for each glyph
        const vertexArray = this.parent._fontAtlasTextGeometry._vertexArray;
        const uvArray = this.parent._fontAtlasTextGeometry._uvArray;

        this._uMinMaxXArray = [];
        this._uMinMaxYArray = [];
        this._uMinMaxUArray = [];
        this._uMinMaxVArray = [];
        for(let i = 0; i < vertexArray.length; i += 8) {
            this._uMinMaxXArray.push(vertexArray[i + 4], vertexArray[i + 0]);
            this._uMinMaxYArray.push(vertexArray[i + 5], vertexArray[i + 1]);
            this._uMinMaxUArray.push(uvArray[i + 4], uvArray[i + 0]);
            this._uMinMaxVArray.push(uvArray[i + 5], uvArray[i + 1]);
        }
        // console.log('minMaxY', this._uMinMaxYArray);
    }
}