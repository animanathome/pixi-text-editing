import { OneByOne } from "../../src/animation/oneByOne";
import { expect } from "chai";

describe("OneByOne", () => {
    it('properly calculates progress for even increments', () => {
        // Assemble
        const oneByOne = new OneByOne(10);

        // Act and Assert
        oneByOne.progress = 0;
        oneByOne.update();
        expect(oneByOne.array[0]).to.equal(1, '0');

        // Act and Assert
        oneByOne.progress = 0.5;
        oneByOne.update();
        expect(oneByOne.array[4]).to.equal(1, '0.5');

        // Act and Assert
        oneByOne.progress = 1.0;
        oneByOne.update();
        expect(oneByOne.array[9]).to.equal(1, '1.0');
    });

    it('properly calculates progress for uneven increments', () => {
        // Assemble
        const oneByOne = new OneByOne(5);

        // Act and Assert
        oneByOne.progress = 0;
        oneByOne.update();
        expect(oneByOne.array[0]).to.equal(1, '0');

        // Act and Assert
        oneByOne.progress = 0.2;
        oneByOne.update();
        expect(oneByOne.array[0]).to.equal(1, '0');

        // Act and Assert
        oneByOne.progress = 0.4;
        oneByOne.update();
        expect(oneByOne.array[1]).to.equal(1, '0');

        // Act and Assert
        oneByOne.progress = 0.6;
        oneByOne.update();
        expect(oneByOne.array[2]).to.equal(1, '0');

        // Act and Assert
        oneByOne.progress = 0.8;
        oneByOne.update();
        expect(oneByOne.array[3]).to.equal(1, '0');

        // Act and Assert
        oneByOne.progress = 1.0;
        oneByOne.update();
        expect(oneByOne.array[4]).to.equal(1, '0');
    });
});