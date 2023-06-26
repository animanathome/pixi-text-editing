import('./resources.spec');

// font tests
import('./fontAtlas.spec');
import('./fontLoader.spec');
import('./fontAtlasText.spec');

// selection and editing tests
import('./fontAtlasTextCaret.spec');
import('./fontAtlasTextSelection.spec');
import('./fontAtlasTextManipulator.spec');
import('./fontAtlasTextGraphic.spec');

// deformer tests
import('./curveData.spec');
import('./deformerStack.spec')
import('./deformers/CurveDeformer.spec')
import('./deformers/TransformDeformer.spec')
import('./deformers/CenterScaleTransformDeformer.spec')
import('./deformers/VertexTransformDeformer.spec')

// text deformer tests
import('./deformers/text/TextTransformDeformer.spec')
import('./deformers/text/TextProgressDeformer.spec')
import('./deformers/text/TextOpacityDeformer.spec')
import('./deformers/text/TextColorDeformer.spec');
import('./deformers/text/textDeformer.spec');

// text graphic deformer tests
// import('./deformers/text_graphic/textGraphicDeformer.spec');
// if a filename is to long, it won't be picked up by the watcher
// import('./deformers/text_graphic/bla.spec');

// animation tests
import('./timeline.spec');
import('./incrementer/oneByOneIncrementer.spec');
import('./incrementer/progressIncrementer.spec');
import('./interpolationCache.spec');
import('./animation/animationStack.spec');

import('./textPlayground.spec');