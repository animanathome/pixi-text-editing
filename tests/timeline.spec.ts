import * as PIXI from 'pixi.js'
import { expect } from 'chai';
import {TickerTimeline, ProgressTimeline, PingPongTimeline} from "../src/timeline";

async function waitFor(time = 100) {
    await new Promise(resolve => setTimeout(resolve, time));
}

describe.only('timeline', () => {
    describe('TickerTimeline', () => {
        it('advances time when playing', async() => {
            // Assemble
            const ticker = new PIXI.Ticker();
            ticker.start();
            const timeline = new TickerTimeline(ticker);
            timeline.duration = 1000;
            timeline.play();

            // Act
            await waitFor(50);

            // Assert
            expect(timeline.time).to.be.above(0);

            // Cleanup
            timeline.destroy();
        });

        it('loops when playing', async() => {
            // Assemble
            const ticker = new PIXI.Ticker();
            ticker.start();
            const timeline = new TickerTimeline(ticker);
            timeline.duration = 100;
            timeline.play();

            // Act and assert
            await waitFor(50);
            expect(timeline.time).to.be.above(0);
            expect(timeline.time).to.be.below(100);

            // Act and assert
            await waitFor(100);
            expect(timeline.time).to.be.above(0);
            expect(timeline.time).to.be.below(100);

            // Cleanup
            timeline.destroy();
        })

        it('resets time after stop', async() => {
            // Assemble
            const ticker = new PIXI.Ticker();
            ticker.start();
            const timeline = new TickerTimeline(ticker);
            timeline.duration = 100;
            timeline.play();
            await waitFor(50);

            // Act
            timeline.stop();

            // Assert
            expect(timeline.time).to.be.equal(0);

            // Cleanup
            timeline.destroy();
        });
    });

    describe('ProgressTimeline', () => {
        it('can get value (1)', () => {
            const timeline = new ProgressTimeline()
            timeline.start = 0;
            timeline.end = 100;

            // Act and assert
            expect(timeline.value(0)).to.equal(0);
            expect(timeline.value(50)).to.equal(0.5);
            expect(timeline.value(100)).to.equal(1.0);
        })

        it('can get value (2)', () => {
            const timeline = new ProgressTimeline()
            timeline.start = 100;
            timeline.end = 200;

            // Act and assert
            expect(timeline.value(0)).to.equal(0);
            expect(timeline.value(100)).to.equal(0);
            expect(timeline.value(150)).to.equal(0.5);
            expect(timeline.value(200)).to.equal(1.0);
        })
    });

    describe.only('PingPongTimeline', () => {
        it('can get intro value', () => {
            // Assemble
            const timeline = new PingPongTimeline()
            timeline.start = 0;
            timeline.duration = 100;
            timeline.effect = 20;

            // Act and assert
            expect(timeline.value(0)).to.equal(0);
            expect(timeline.value(10)).to.equal(0.5);
            expect(timeline.value(20)).to.equal(1.0);
        })

        it('can get inbetween value', () => {
            // Assemble
            const timeline = new PingPongTimeline()
            timeline.start = 0;
            timeline.duration = 100;
            timeline.effect = 20;

            // Act and assert
            expect(timeline.value(20)).to.equal(1.0);
            expect(timeline.value(50)).to.equal(1.0);
            expect(timeline.value(80)).to.equal(1.0);
        })

        it('can get outro value', () => {
            // Assemble
            const timeline = new PingPongTimeline()
            timeline.start = 0;
            timeline.duration = 100;
            timeline.effect = 20;

            // Act and assert
            expect(timeline.value(80)).to.equal(1);
            expect(timeline.value(90)).to.equal(0.5);
            expect(timeline.value(100)).to.equal(0.0);
        })
    })
})