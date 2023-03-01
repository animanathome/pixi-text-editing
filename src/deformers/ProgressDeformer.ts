import {BaseDeformer, DeformerType} from "./BaseDeformer";
import {TextDeformer, TRANSFORM_TYPE} from "./TextDeformer";

export enum TRANSFORM_DIRECTION {
    LEFT_TO_RIGHT,
    RIGHT_TO_LEFT,
    TOP_TO_BOTTOM,
    BOTTOM_TO_TOP
}

export class ProgressDeformer extends TextDeformer {
    _deformerType: DeformerType = DeformerType.VERTEX_AND_UV;
    _progresses: number[] = [];
    _direction: TRANSFORM_DIRECTION = TRANSFORM_DIRECTION.TOP_TO_BOTTOM;

    _indexArray: number[] = [];
    // convert to vec2 to reduce the number of uniforms
    _uMinXArray: number[] = [];
    _uMaxXArray: number[] = [];
    _uMinYArray: number[] = [];
    _uMaxYArray: number[] = [];
    _uMinUArray: number[] = [];
    _uMaxUArray: number[] = [];
    _uMinVArray: number[] = [];
    _uMaxVArray: number[] = [];

    _uniforms(): {} {
        // when we change a value, does it sync up one uniform or all of them?
        // we could just copy over the min/max values as that's what we're using
        return {
            uDirection: this.direction,
            uProgresses: this.progresses,
            uMinXArray: this._uMinXArray,
            uMaxXArray: this._uMaxXArray,
            uMinYArray: this._uMinYArray,
            uMaxYArray: this._uMaxYArray,
            uMinUArray: this._uMinUArray,
            uMaxUArray: this._uMaxUArray,
            uMinVArray: this._uMinVArray,
            uMaxVArray: this._uMaxVArray
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
    _vertHead(): string {
        // max 1024? or 128 glyphs
        // if only min/max we can render 512 characters
        const transformLength = this._progresses.length;
        const arrayLength = this._uMinXArray.length;

        return `
            attribute float aWeight; //[${this._weights.length}]
            attribute float aVertexIndex; //[${this._indexArray.length}]
            
            uniform float uDirection;
            uniform float uProgresses[${transformLength}];
            uniform float uMinXArray[${arrayLength}];
            uniform float uMaxXArray[${arrayLength}];
            uniform float uMinYArray[${arrayLength}];
            uniform float uMaxYArray[${arrayLength}];
            
            uniform float uMinUArray[${arrayLength}];
            uniform float uMaxUArray[${arrayLength}];
            uniform float uMinVArray[${arrayLength}];
            uniform float uMaxVArray[${arrayLength}];
            
            varying float vMinU;
            varying float vMaxU;
            varying float vMinV;
            varying float vMaxV;
            varying float vProgress;
            varying float vDirection;
        `
    }

    // functions
    _vertBody(): string {
        return `
            vec3 getVertexPosition${this.index}(vec3 inputPosition) {
                int direction = int(uDirection);
                int transformIndex = int(aWeight);
                int vertexIndex = int(aVertexIndex);
                
                float yPos = inputPosition.y;
                if (direction == 2) {
                    float yRange = uMaxXArray[vertexIndex] - uMinYArray[vertexIndex];
                    float yCoord = (inputPosition.y - uMinYArray[vertexIndex]) / yRange;
                    yPos = uMinYArray[vertexIndex] + ((yRange * yCoord) * uProgresses[transformIndex]);
                }
                else if (direction == 3) {
                    float yRange = uMaxXArray[vertexIndex] - uMinYArray[vertexIndex];
                    float yCoord = (uMaxYArray[vertexIndex] - inputPosition.y) / yRange;
                    yPos = uMaxYArray[vertexIndex] - ((yRange * yCoord) * uProgresses[transformIndex]);
                }
                vec3 outPosition = vec3(inputPosition.x, yPos, inputPosition.z);
                return outPosition;
            }
        `;
    }

    // main
    _vertMain(): string {
        return `
            int transformIndex = int(aWeight);
            int vertexIndex = int(aVertexIndex);
            vMinU = uMinUArray[vertexIndex];
            vMaxU = uMaxUArray[vertexIndex];
            vMinV = uMinVArray[vertexIndex];
            vMaxV = uMaxVArray[vertexIndex];
            vProgress = uProgresses[transformIndex];
            vDirection = uDirection;
        `
    }

    // header
    _fragHead(): string {
        return `
            varying float vMinU;
            varying float vMaxU;
            varying float vMinV;
            varying float vMaxV;
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
                    float vRange = vMaxV - vMinV;
                    float vCoord = (inputUV.y - vMinV) / vRange;
                    newV = vMinV + ((vRange * vCoord) * vProgress);
                }
                else if (direction == 3) {
                    float vRange = vMaxV - vMinV;
                    float vCoord = (vMaxV - inputUV.y) / vRange;
                    newV = vMaxV - ((vRange * vCoord) * vProgress);
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
        console.log(this.parent.geometry);
        const indices = [];
        for (let i = 0; i < this.parent.glyph.length; i++) {
            indices.push(i, i, i, i);
        }
        console.log('_generateIndexArray', indices);
        this._indexArray = indices;
    }

    _assignIndexArray() {
        const attribute = this.parent.geometry.getAttribute('aVertexIndex');
        if (!attribute) {
            console.log('adding aVertexIndex', this._indexArray);
            this.parent.geometry.addAttribute('aVertexIndex', this._indexArray, 1)
            return;
        }
        console.log('updating aVertexIndex', this._indexArray);
        const buffer = this.parent.geometry.getBuffer('aVertexIndex');
        buffer.data = new Float32Array(this._indexArray);
    }

    _generateMinMaxXYUVArrays() {
        console.log('_generateMinMaxXYUVArray')
        const vertexArray = this.parent._fontAtlasTextGeometry._vertexArray;
        const uvArray = this.parent._fontAtlasTextGeometry._uvArray;

        this._uMinXArray = [];
        this._uMaxXArray = [];
        this._uMinYArray = [];
        this._uMaxYArray = [];
        this._uMinUArray = [];
        this._uMaxUArray = [];
        this._uMinVArray = [];
        this._uMaxVArray = [];
        for(let i = 0; i < vertexArray.length; i += 8) {
            this._uMinXArray.push(vertexArray[i + 4]);
            this._uMaxXArray.push(vertexArray[i + 0]);
            this._uMinYArray.push(vertexArray[i + 5]);
            this._uMaxYArray.push(vertexArray[i + 1]);
            this._uMinUArray.push(uvArray[i + 4]);
            this._uMaxUArray.push(uvArray[i + 0]);
            this._uMinVArray.push(uvArray[i + 5]);
            this._uMaxVArray.push(uvArray[i + 1]);
        }
    }
}