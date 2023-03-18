import {BaseDeformer} from "../BaseDeformer";

export class TextGraphicDeformer extends BaseDeformer {
    get transformType() {
        return this.parent.graphicType;
    }

    _validateData(value: number[], coordinateCount = 2) {
        const expectedLength = this.parent.graphicCount * coordinateCount;
        if (value.length !== expectedLength) {
            throw Error(`Invalid number of values, expected ${expectedLength} but got ${value.length}`);
        }
    }
}