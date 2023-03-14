import { InterpolationCache } from '../../src/animation/interpolationCache';
import { expect } from 'chai';

describe('InterpolationCache', () => {
    it('caches step', () => {
        // Assemble
        const cache = new InterpolationCache(10, 'step');

        // Act and Assert
        expect(cache.cache.length).to.equal(10);
        expect(cache.cache[0]).to.equal(0.0);
        expect(cache.cache[9]).to.equal(1.0);
    });

    it('caches sigmoid', () => {
        // Assemble
        const cache = new InterpolationCache(10, 'sigmoid');

        // Act and Assert
        expect(cache.cache.length).to.equal(10);
        expect(cache.cache[0]).to.equal(0.006692850962281227);
        expect(cache.cache[9]).to.equal(0.9933071732521057);
    });

    it('caches tan', () => {
        // Assemble
        const cache = new InterpolationCache(10, 'tan');

        // Act and Assert
        expect(cache.cache.length).to.equal(10);
        expect(cache.cache[0]).to.equal(0.0);
        expect(cache.cache[9]).to.equal(0.9999750256538391);
    });

    it('can get value from cache', () => {
        // Assemble
        const cache = new InterpolationCache(100, 'step');

        // Assert
        expect(cache.getCachedValue(0.0)).to.equal(0.0);
        expect(cache.getCachedValue(0.50)).to.equal(0.0);
        expect(cache.getCachedValue(0.51)).to.equal(1.0);
        expect(cache.getCachedValue(1.0)).to.equal(1.0);
    });

    // TODO: Add tests for other interpolation types
    it.skip('cashes bezier', () => {

    });

    it.skip('caches bezier - ease in', () => {

    });

    it.skip('caches bezier - ease out', () => {

    });
});