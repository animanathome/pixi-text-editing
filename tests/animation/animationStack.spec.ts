import {createFontAtlasTextApp} from "../utils";
import {TEXT_TRANSFORM_ENUM} from "../../src/deformers/enums";
import {TextOpacityDeformer} from "../../src/deformers/text/TextOpacityDeformer";
import { expect } from 'chai';
import {PING_PONG_TIMELINE, PROGRESS_TIMELINE} from "../../src/timeline";
import {ONE_BY_ONE_INCREMENTER, PROGRESS_INCREMENTER} from "../../src/incrementer";

describe('AnimationStack', () => {
    it('can add animation', async() => {
        // Assemble
        const displayText = 'AB WA KE';
        const {text, app} = await createFontAtlasTextApp({displayText});
        const deformer = new TextOpacityDeformer();
        text.deform.addDeformer(deformer);
        deformer.transformType = TEXT_TRANSFORM_ENUM.WORD;

        // Act
        text.anim.addAnimation(deformer, 'opacities');

        // Assert
        expect(text.anim.animations.length).to.be.equal(1);

        // Cleanup
        app.destroy(true, true);
    });

    it('can get all animations', async() => {
        // Assemble
        const displayText = 'AB WA KE';
        const {text, app} = await createFontAtlasTextApp({displayText});
        const deformer = new TextOpacityDeformer();
        text.deform.addDeformer(deformer);
        deformer.transformType = TEXT_TRANSFORM_ENUM.WORD;

        // Act
        text.anim.addAnimation(deformer, 'opacities');

        // Assert
        expect(text.anim.animations.length).to.be.equal(1);
        expect(text.anim.animations[0]).to.not.be.undefined;

        // Cleanup
        app.destroy(true, true);
    });

    it('can set time', async() => {
        // Assemble
        const displayText = 'AB WA KE';
        const {text, app} = await createFontAtlasTextApp({displayText});
        const deformer = new TextOpacityDeformer();
        text.deform.addDeformer(deformer);
        deformer.transformType = TEXT_TRANSFORM_ENUM.WORD;
        app.ticker.update();

        text.anim.addAnimation(deformer, 'opacities');
        app.ticker.update();

        // Act
        text.time = 10;
        app.ticker.update();

        // Expect
        expect(deformer.opacities[0]).to.be.closeTo(0.2, 0.01);
        expect(deformer.opacities[1]).to.equal(0);
        expect(deformer.opacities[2]).to.equal(0);

        // Cleanup
        app.destroy(true, true);
    });

    describe('can change animation', () => {
        it('timeline', async() => {
            // Assemble
            const displayText = 'AB WA KE';
            const {text, app} = await createFontAtlasTextApp({displayText});
            const deformer = new TextOpacityDeformer();
            text.deform.addDeformer(deformer);
            deformer.transformType = TEXT_TRANSFORM_ENUM.WORD;
            const animation = text.anim.addAnimation(deformer, 'opacities');
            app.ticker.update();

            // Verify assemble
            expect(animation.timelineType).to.be.equal(PROGRESS_TIMELINE);
            expect(animation._timeline).to.not.be.undefined;

            // Act
            animation.timelineType = PING_PONG_TIMELINE;
            app.ticker.update();

            // Assert
            expect(animation.dirty).to.be.false;
            expect(animation.timelineType).to.be.equal(PING_PONG_TIMELINE);
            expect(animation._timeline).to.not.be.undefined;

            // Cleanup
            app.destroy(true, true);
        });

      it('incrementer', async() => {
            // Assemble
            const displayText = 'AB WA KE';
            const {text, app} = await createFontAtlasTextApp({displayText});
            const deformer = new TextOpacityDeformer();
            text.deform.addDeformer(deformer);
            deformer.transformType = TEXT_TRANSFORM_ENUM.WORD;
            const animation = text.anim.addAnimation(deformer, 'opacities');
            app.ticker.update();

            // Verify assemble
            expect(animation.incrementerType).to.be.equal(PROGRESS_INCREMENTER);
            expect(animation._incrementer).to.not.be.undefined;

            // Act
            animation.incrementerType = ONE_BY_ONE_INCREMENTER;
            app.ticker.update();

            // Assert
            expect(animation.dirty).to.be.false;
            expect(animation.incrementerType).to.be.equal(ONE_BY_ONE_INCREMENTER);
            expect(animation._incrementer).to.not.be.undefined;

            // Cleanup
            app.destroy(true, true);
      });
    })

    it('can remove animation', async() => {
        // Assemble
        const displayText = 'AB WA KE';
        const {text, app} = await createFontAtlasTextApp({displayText});
        const deformer = new TextOpacityDeformer();
        text.deform.addDeformer(deformer);
        deformer.transformType = TEXT_TRANSFORM_ENUM.WORD;

        // Act
        text.anim.addAnimation(deformer, 'opacities');
        text.anim.removeAnimation(deformer, 'opacities');

        // Assert
        expect(text.anim.animations.length).to.be.equal(0);

        // Cleanup
        app.destroy(true, true);
    });
});