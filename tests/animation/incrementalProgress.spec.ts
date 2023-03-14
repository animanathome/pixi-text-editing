import { ProgressIncrementer } from '../../src/animation/progressIncrementer';
import { expect } from 'chai';

describe('IncrementalProgress', () => {
    it('full overlap', () => {
        // Assemble
        const incrementer = new ProgressIncrementer(2);

        // Act and Assert
        incrementer.offset = 1.0;
        incrementer.duration = 1.0;
        incrementer.update();
        expect(incrementer.start[0]).to.equal(0.0);
        expect(incrementer.start[1]).to.equal(0.5);
        expect(incrementer.end[0]).to.equal(0.5);
        expect(incrementer.end[1]).to.equal(1.0);

        // Act and Assert
        incrementer.progress = 0.0;
        incrementer.update();
        expect(incrementer.array[0]).to.equal(0);
        expect(incrementer.array[1]).to.equal(0);

        // Act and Assert
        incrementer.progress = 0.5;
        incrementer.update();
        expect(incrementer.array[0]).to.equal(1);
        expect(incrementer.array[1]).to.equal(0);

        // Act and Assert
        incrementer.progress = 1.0;
        incrementer.update();
        expect(incrementer.array[0]).to.equal(1);
        expect(incrementer.array[1]).to.equal(1);
    });

    it('no overlap', () => {
        // Assemble
        const incrementer = new ProgressIncrementer(2);

        // Act and Assert
        incrementer.offset = 0.0;
        incrementer.duration = 1.0;
        incrementer.update();
        expect(incrementer.start[0]).to.equal(0.0);
        expect(incrementer.start[1]).to.equal(0.0);
        expect(incrementer.end[0]).to.equal(1.0);
        expect(incrementer.end[1]).to.equal(1.0);

        // Act and Assert
        incrementer.progress = 0.0;
        incrementer.update();
        expect(incrementer.array[0]).to.equal(0);
        expect(incrementer.array[1]).to.equal(0);

        // Act and Assert
        incrementer.progress = 0.5;
        incrementer.update();
        expect(incrementer.array[0]).to.equal(0.5);
        expect(incrementer.array[1]).to.equal(0.5);

        // Act and Assert
        incrementer.progress = 1.0;
        incrementer.update();
        expect(incrementer.array[0]).to.equal(1.0);
        expect(incrementer.array[1]).to.equal(1.0);
    });

    it('partial overlap', () => {
        // Assemble
        const incrementer = new ProgressIncrementer(2);

        // Act and Assert
        incrementer.offset = 0.5;
        incrementer.duration = 1.0;
        incrementer.update();
        expect(incrementer.start[0]).to.equal(0.0);
        expect(incrementer.start[1]).to.equal(0.3333333432674408);
        expect(incrementer.end[0]).to.equal(0.6666666865348816);
        expect(incrementer.end[1]).to.equal(1.0);

        // Act and Assert
        incrementer.progress = 0.0;
        incrementer.update();
        expect(incrementer.array[0]).to.equal(0);
        expect(incrementer.array[1]).to.equal(0);

        // Act and Assert
        incrementer.progress = 0.5;
        incrementer.update();
        expect(incrementer.array[0]).to.equal(0.75);
        expect(incrementer.array[1]).to.equal(0.2499999850988388);

        // Act and Assert
        incrementer.progress = 1.0;
        incrementer.update();
        expect(incrementer.array[0]).to.equal(1.0);
        expect(incrementer.array[1]).to.equal(1.0);
    });
});