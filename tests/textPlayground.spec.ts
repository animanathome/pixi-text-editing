import {TextPlayground} from "../src/TextPlayground";
import {expect} from "chai";
import {TEXT_OPACITY_DEFORMER} from "../src/deformers/constants";
import {PROGRESS_TIMELINE} from "../src/timeline";
import {ProgressTimeline} from "../src/timeline/ProgressTimeline";
import {TEXT_TRANSFORM_ENUM} from "../src/deformers/enums";
import {TextOpacityDeformer} from "../src/deformers/text/TextOpacityDeformer";

describe('TextPlayground', () => {
    it('can create a text playground', () => {
        // Assemble
        const playground = new TextPlayground();
        document.body.appendChild(playground.view);
        playground.addText();

        // Assert
        expect(playground).to.not.be.undefined;
        expect(playground.renderer).to.not.be.undefined;
        expect(playground.view).to.not.be.undefined;
        expect(playground.assets).to.not.be.undefined;
        expect(playground.assets.length).to.equal(1);

        // Cleanup
        playground.destroy();
    });

    it('can add deformer', () => {
        // Assemble
        const playground = new TextPlayground();
        document.body.appendChild(playground.view);
        const text = playground.addText();

        // Act
        text.deform.addDeformerOfType(TEXT_OPACITY_DEFORMER);

        // Assert
        expect(text.deform.deformers.length).to.equal(1);

        // Cleanup
        playground.destroy();
    });

    it('can remove deformer', async() => {
        // Assemble
        const playground = new TextPlayground();
        playground.ticker.stop();
        await playground.fontLoader.onLoaded();

        document.body.appendChild(playground.view);
        const text = playground.addText();
        text.deform.addDeformerOfType(TEXT_OPACITY_DEFORMER);
        playground.ticker.update();

        // Act
        text.deform.removeDeformer(text.deform.deformers[0]);
        playground.ticker.update();

        // Assert
        expect(text.deform.deformers.length).to.equal(0);

        // Cleanup
        playground.destroy();
    });

    it('can add animation to deformer ', async() => {
        // Assemble
        const playground = new TextPlayground();
        playground.ticker.stop();
        await playground.fontLoader.onLoaded();
        document.body.appendChild(playground.view);
        const text = playground.addText();

        // create deformer
        text.deform.addDeformerOfType(TEXT_OPACITY_DEFORMER);
        const deformer = text.deform.deformers[0] as TextOpacityDeformer;
        deformer.transformType = TEXT_TRANSFORM_ENUM.GLYPH;
        const property = deformer.animatableProperties[0];

        // Act
        // add animation to deformer
        text.anim.addAnimation(deformer, property);
        const animation = text.anim.animations[0];
        animation.incrementerType = PROGRESS_TIMELINE;
        (animation.timeline as ProgressTimeline).start = 0;
        (animation.timeline as ProgressTimeline).end = 1000;
        playground.currentTime = 500;
        playground.ticker.update();

        // Assert
        expect(text.anim.animations.length).to.equal(1);

        // Cleanup
        playground.destroy();
    })

    it('can remove animation from deformer', async() => {
        // Assemble
        const playground = new TextPlayground();
        playground.ticker.stop();
        await playground.fontLoader.onLoaded();
        document.body.appendChild(playground.view);
        const text = playground.addText();

        // create deformer
        text.deform.addDeformerOfType(TEXT_OPACITY_DEFORMER);
        const deformer = text.deform.deformers[0] as TextOpacityDeformer;
        deformer.transformType = TEXT_TRANSFORM_ENUM.GLYPH;
        const property = deformer.animatableProperties[0];

        // add animation to deformer
        text.anim.addAnimation(deformer, property);
        const animation = text.anim.animations[0];
        animation.incrementerType = PROGRESS_TIMELINE;
        (animation.timeline as ProgressTimeline).start = 0;
        (animation.timeline as ProgressTimeline).end = 1000;
        playground.currentTime = 500;
        playground.ticker.update();

        // Act
        // remove animation from deformer
        text.anim.removeAnimation(deformer, property);
        playground.ticker.update();

        // Assert
        expect(text.anim.animations.length).to.equal(0);

        // Cleanup
        playground.destroy();
    });
});