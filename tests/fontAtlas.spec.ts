import {FontLoader} from "../src/fontLoader";
import {FontAtlas} from "../src/fontAtlas";
import { expect } from 'chai';
const abcdefAtlasDataURL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAC2ElEQVRoQ+3XT+hNaRgH8M+PQsmkRIoFmSIsiCibwYpJahZjoYSm/CvKv2TFrGYiEkkpNSwpMzZICgtW0ixmlPzNVsLCxkqP3lPXzz3/rnsuvzpvnc7p3ud93uf7fJ9/75ARvoZGuP1aAN+awZaBDgaWp+/bg2SlnwzcQoDop85SX/TzsO8OwHrEsxhv8DfO41GOWzIA+7EBo3EJv5e4cS72YC3+xx0cLnV9EihiYAt24TrikNWI+F5RAiD+DqNXYWn6zjMo9F7EWFzDzqT7TxysAqIshMZjNibgCJZgTg4LGQOb8RcW4T5eYUqOMQHsELbibJL5DeeqGB8yRQA24Q9MHaYsGOhWabrlQPZbnT1Vbf8kVwTgOd5jftJY1ZgIu1OpIsWeIga24UwHA7NSPpzGwypIigDcxbJE7ThMTIlW5s04NxjK+sI+HCswJnLgVzzFZPyQ8qxSPykCEAkWSRUxH5Uh1k8pKfNCKGSiUv2Md6lyXa3gyThnJV7gRkroCtsG3HQqWVRTqKwK1VQ3ePEWwOB9/vmJLQMdPSI+88aMXomKShglNkpyVKjo8p+tfjHQ1CR6IQ2GUbav4ES/AERjm4FRqWPWARDefIaXJbQsxIOOAXISXvcDQHTkMHhBUnYPHypcZo5iY+q2sTVG7XU5IAJknNG5uk4AvYTQcezG5TTzrMHedFKevpOpq8eYHRNoNoXGhHugC4gAEE9MqhE+MQnE+4sJoBcA/2EeZqbEivklLiLxztP3GD8Ou9yEcf/glxIWiu4gPd1f+wUgwm5Mwe0rC6O+A/jaEPoXb7GjIAeClMYADE/iOCwbn4tCMhubs4h5gu24OegQivOyMjr8tlY2w0/D9HTJiVJatLL7ROagrrK9JHGvXbWRfS2ARtxaQ2nLQA1nNSLaMtCIW2sobRmo4axGRFsGGnFrDaUtAzWc1Yhoy0Ajbq2htGWghrMaER3xDHwEyaCIMTu+BAQAAAAASUVORK5CYII=';

describe('fontAtlas', () => {
    it('can render latin text', async() => {
        // Arrange
        const fontLoader = new FontLoader();
        const url = 'http://localhost:8000/resources/MontserratBold.ttf'
        fontLoader.sourceUrl = url;
        await fontLoader.load();

        // Act
        const atlas = new FontAtlas({
            font: fontLoader.font,
            resolution: 48,
            fontSize: 12,
        })
        atlas.addGlyphsForString('abcd');
        atlas.addGlyphsForString('cdef');

        // Assert
        expect(atlas.canvas.toDataURL()).to.equal(abcdefAtlasDataURL);
        expect(atlas._cachedIds()).to.eql([ 'a', 'b', 'c', 'd', 'e', 'f' ]);
    });
})