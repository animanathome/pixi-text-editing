import {BaseDeformer} from "../base/BaseDeformer";

export class TextGraphicDeformer extends BaseDeformer {
    get transformType() {
        return this.parent.graphicType;
    }

    /**
     * Ensures the number of values is correct based on the property type. This should be called in each setter.
     */
    _validateData(value: number[], coordinateCount = 2) {
        const expectedLength = this.parent.graphicCount * coordinateCount;
        if (value.length !== expectedLength) {
            throw Error(`Invalid number of values, expected ${expectedLength} but got ${value.length}`);
        }
    }
}