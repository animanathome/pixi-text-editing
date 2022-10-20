import { expect } from 'chai';
import {createFontAtlasTextApp, roundBounds, writeDataUrlToDisk} from '../tests/utils'
import {FontAtlasTextManipulator} from "../src/fontAtlasTextManipulator";
import {CARET_POSITION} from "../src/fontAtlasTextCaret";

describe('FontAtlasTextManipulator', () => {
    describe('can display caret', () => {
        it('with no text', async() => {
            // |

            // Assemble
            const displayText = ''
            const {app, text} = await createFontAtlasTextApp(
                displayText, 64, 64);
            const manipulator = new FontAtlasTextManipulator(text);
            manipulator.caret.caretVisibleDuration = 0;
            app.stage.addChildAt(manipulator, 0);

            // Act
            manipulator.click(0, 0, false);
            expect(manipulator._activeGlyph()).to.eql([0, 0])
            app.ticker.update();

            // Assert
            expect(manipulator.caret.hasMesh).to.be.true;
            expect(manipulator.caret.getBounds().x).to.equal(0);
            expect(manipulator.caret.getBounds().y).to.equal(0);
        });

        describe('by moving left', () => {
            describe('a new line', () => {
                it('with only new lines', async() => {
                    // Assemble
                    const displayText = '\n\n'
                    const {app, text} = await createFontAtlasTextApp(
                        displayText, 64, 64);
                    const manipulator = new FontAtlasTextManipulator(text);
                    manipulator.caret.caretVisibleDuration = 0;
                    app.stage.addChildAt(manipulator, 0);

                    // Act
                    // \n
                    // \n
                    //|
                    manipulator.click(48, 48, false);
                    app.ticker.update();

                    // Assert
                    writeDataUrlToDisk(app.view.toDataURL(), 'test');
                    expect(manipulator.caret.hasMesh).to.be.true;
                    expect(manipulator.caret.getBounds().x).to.equal(0);
                    expect(manipulator.caret.getBounds().y).to.equal(24);

                    // Act
                    // \n
                    // |\n
                    manipulator.arrowLeft()
                    app.ticker.update();

                    // Assert
                    writeDataUrlToDisk(app.view.toDataURL(), 'test');
                    expect(manipulator.caret.hasMesh).to.be.true;
                    expect(manipulator.caret.getBounds().x).to.equal(0);
                    expect(manipulator.caret.getBounds().y).to.equal(12);

                    // Act
                    // |\n
                    // \n
                    manipulator.arrowLeft()
                    app.ticker.update();

                    // Assert
                    writeDataUrlToDisk(app.view.toDataURL(), 'test');
                    expect(manipulator.caret.hasMesh).to.be.true;
                    expect(manipulator.caret.getBounds().x).to.equal(0);
                    expect(manipulator.caret.getBounds().y).to.equal(0);

                    // Act
                    // |\n
                    // \n
                    manipulator.arrowLeft()
                    app.ticker.update();

                    // Assert
                    writeDataUrlToDisk(app.view.toDataURL(), 'test');
                    expect(manipulator.caret.hasMesh).to.be.true;
                    expect(manipulator.caret.getBounds().x).to.equal(0);
                    expect(manipulator.caret.getBounds().y).to.equal(0);
                });

                it('with single characters', async() => {
                    // Assemble
                    const displayText = 'a'
                    const {app, text} = await createFontAtlasTextApp(
                        displayText, 64, 64);
                    const manipulator = new FontAtlasTextManipulator(text);
                    manipulator.caret.caretVisibleDuration = 0;
                    app.stage.addChildAt(manipulator, 0);

                    // Act
                    // a|
                    manipulator.click(48, 48, false);
                    app.ticker.update();

                    // Assert
                    writeDataUrlToDisk(app.view.toDataURL(), 'test');
                    expect(manipulator.caret.hasMesh).to.be.true;
                    expect(Math.ceil(manipulator.caret.getBounds().x)).to.equal(6);
                    expect(manipulator.caret.getBounds().y).to.equal(0);

                    // Act
                    // |a
                    manipulator.arrowLeft()
                    app.ticker.update();

                    // Assert
                    writeDataUrlToDisk(app.view.toDataURL(), 'test');
                    expect(manipulator.caret.hasMesh).to.be.true;
                    expect(manipulator.caret.getBounds().x).to.equal(0);
                    expect(manipulator.caret.getBounds().y).to.equal(0);
                });

                it('with single characters and new lines', async() => {
                    // Assemble
                    const displayText = 'a\nb\n'
                    const {app, text} = await createFontAtlasTextApp(
                        displayText, 64, 64);
                    const manipulator = new FontAtlasTextManipulator(text);
                    manipulator.caret.caretVisibleDuration = 0;
                    app.stage.addChildAt(manipulator, 0);

                    // Act
                    // a\n
                    // b\n
                    // |
                    manipulator.click(48, 48, false);
                    app.ticker.update();

                    // Assert
                    writeDataUrlToDisk(app.view.toDataURL(), 'test');
                    expect(manipulator.caret.hasMesh).to.be.true;
                    expect(manipulator.caret.getBounds().x).to.equal(0);
                    expect(manipulator.caret.getBounds().y).to.equal(24);

                    // Act
                    // a\n
                    // b|\n
                    manipulator.arrowLeft();
                    app.ticker.update();

                    // Assert
                    writeDataUrlToDisk(app.view.toDataURL(), 'test');
                    expect(manipulator.caret.hasMesh).to.be.true;
                    expect(Math.ceil(manipulator.caret.getBounds().x)).to.equal(7);
                    expect(manipulator.caret.getBounds().y).to.equal(12);

                    // Act
                    // a\n
                    // |b\n
                    manipulator.arrowLeft();
                    app.ticker.update();

                    // Assert
                    writeDataUrlToDisk(app.view.toDataURL(), 'test');
                    expect(manipulator.caret.hasMesh).to.be.true;
                    expect(manipulator.caret.getBounds().x).to.equal(0);
                    expect(manipulator.caret.getBounds().y).to.equal(12);

                    // Act
                    // a|\n
                    // b\n
                    manipulator.arrowLeft();
                    app.ticker.update();

                    // Assert
                    writeDataUrlToDisk(app.view.toDataURL(), 'test');
                    expect(manipulator.caret.hasMesh).to.be.true;
                    expect(Math.ceil(manipulator.caret.getBounds().x)).to.equal(6);
                    expect(manipulator.caret.getBounds().y).to.equal(0);

                    // Act
                    // |a\n
                    // b\n
                    manipulator.arrowLeft();
                    app.ticker.update();

                    // Assert
                    writeDataUrlToDisk(app.view.toDataURL(), 'test');
                    expect(manipulator.caret.hasMesh).to.be.true;
                    expect(manipulator.caret.getBounds().x).to.equal(0);
                    expect(manipulator.caret.getBounds().y).to.equal(0);

                    // Act
                    // |a\n
                    // b\n
                    manipulator.arrowLeft();
                    app.ticker.update();

                    // Assert
                    writeDataUrlToDisk(app.view.toDataURL(), 'test');
                    expect(manipulator.caret.hasMesh).to.be.true;
                    expect(manipulator.caret.getBounds().x).to.equal(0);
                    expect(manipulator.caret.getBounds().y).to.equal(0);
                });
            });
        });

        describe('by moving right', () => {
            describe('a new line', () => {
                it('with only new lines', async() => {
                    // Assemble
                    const displayText = '\n\n'
                    const {app, text} = await createFontAtlasTextApp(
                        displayText, 64, 64);
                    const manipulator = new FontAtlasTextManipulator(text);
                    manipulator.caret.caretVisibleDuration = 0;
                    app.stage.addChildAt(manipulator, 0);

                    // Act
                    // |\n
                    // \n
                    manipulator.click(0, 0, false);
                    app.ticker.update();

                    // Assert
                    writeDataUrlToDisk(app.view.toDataURL(), 'test');
                    expect(manipulator.caret.hasMesh).to.be.true;
                    expect(manipulator.caret.getBounds().x).to.equal(0);
                    expect(manipulator.caret.getBounds().y).to.equal(0);

                    // Act
                    // \n
                    // |\n
                    manipulator.arrowRight()
                    app.ticker.update()

                    // Assert
                    writeDataUrlToDisk(app.view.toDataURL(), 'test');
                    expect(manipulator.caret.hasMesh).to.be.true;
                    expect(manipulator.caret.getBounds().x).to.equal(0);
                    expect(manipulator.caret.getBounds().y).to.equal(12);

                    // Act
                    // \n
                    // \n
                    // |
                    manipulator.arrowRight()
                    app.ticker.update()

                    // Assert
                    writeDataUrlToDisk(app.view.toDataURL(), 'test');
                    expect(manipulator.caret.hasMesh).to.be.true;
                    expect(manipulator.caret.getBounds().x).to.equal(0);
                    expect(manipulator.caret.getBounds().y).to.equal(24);

                    // Act
                    // \n
                    // \n
                    // |
                    manipulator.arrowRight()
                    app.ticker.update()

                    // Assert
                    writeDataUrlToDisk(app.view.toDataURL(), 'test');
                    expect(manipulator.caret.hasMesh).to.be.true;
                    expect(manipulator.caret.getBounds().x).to.equal(0);
                    expect(manipulator.caret.getBounds().y).to.equal(24);
                })

                it('with single characters', async() => {
                    // Assemble
                    const displayText = 'a'
                    const {app, text} = await createFontAtlasTextApp(
                        displayText, 64, 64);
                    const manipulator = new FontAtlasTextManipulator(text);
                    manipulator.caret.caretVisibleDuration = 0;
                    app.stage.addChildAt(manipulator, 0);

                    // Act
                    // |a
                    manipulator.click(0, 0, false);
                    app.ticker.update();

                    // Assert
                    writeDataUrlToDisk(app.view.toDataURL(), 'test');
                    expect(manipulator.caret.hasMesh).to.be.true;
                    expect(manipulator.caret.getBounds().x).to.equal(0);
                    expect(manipulator.caret.getBounds().y).to.equal(0);

                    // Act
                    // a|
                    manipulator.arrowRight();
                    app.ticker.update();

                    // Assert
                    writeDataUrlToDisk(app.view.toDataURL(), 'test');
                    expect(manipulator.caret.hasMesh).to.be.true;
                    expect(Math.ceil(manipulator.caret.getBounds().x)).to.equal(6);
                    expect(manipulator.caret.getBounds().y).to.equal(0);

                    // Act
                    // a|
                    manipulator.arrowRight();
                    app.ticker.update();

                    // Assert
                    writeDataUrlToDisk(app.view.toDataURL(), 'test');
                    expect(manipulator.caret.hasMesh).to.be.true;
                    expect(Math.ceil(manipulator.caret.getBounds().x)).to.equal(6);
                    expect(manipulator.caret.getBounds().y).to.equal(0);
                })

                it('with single characters and new lines', async() => {
                    // Assemble
                    const displayText = 'a\nb\n'
                    const {app, text} = await createFontAtlasTextApp(
                        displayText, 64, 64);
                    const manipulator = new FontAtlasTextManipulator(text);
                    manipulator.caret.caretVisibleDuration = 0;
                    app.stage.addChildAt(manipulator, 0);

                    // Act
                    // |a\n
                    // b\n
                    manipulator.click(0, 0, false);
                    app.ticker.update();

                    // Assert
                    writeDataUrlToDisk(app.view.toDataURL(), 'test');
                    expect(manipulator.caret.hasMesh).to.be.true;
                    expect(manipulator.caret.getBounds().x).to.equal(0);
                    expect(manipulator.caret.getBounds().y).to.equal(0);

                    // Act
                    // a|\n
                    // b\n
                    manipulator.arrowRight();
                    app.ticker.update();

                    // Assert
                    writeDataUrlToDisk(app.view.toDataURL(), 'test');
                    expect(manipulator.caret.hasMesh).to.be.true;
                    expect(Math.ceil(manipulator.caret.getBounds().x)).to.equal(6);
                    expect(manipulator.caret.getBounds().y).to.equal(0);

                    // Act
                    // a\n
                    // |b\n
                    manipulator.arrowRight();
                    app.ticker.update();

                    // Assert
                    writeDataUrlToDisk(app.view.toDataURL(), 'test');
                    expect(manipulator.caret.hasMesh).to.be.true;
                    expect(manipulator.caret.getBounds().x).to.equal(0);
                    expect(manipulator.caret.getBounds().y).to.equal(12);

                    // Act
                    // a\n
                    // b|\n
                    manipulator.arrowRight();
                    app.ticker.update();

                    // Assert
                    writeDataUrlToDisk(app.view.toDataURL(), 'test');
                    expect(manipulator.caret.hasMesh).to.be.true;
                    expect(Math.ceil(manipulator.caret.getBounds().x)).to.equal(7);
                    expect(manipulator.caret.getBounds().y).to.equal(12);

                    // Act
                    // a\n
                    // b\n
                    // |
                    manipulator.arrowRight();
                    app.ticker.update();

                    // Assert
                    writeDataUrlToDisk(app.view.toDataURL(), 'test');
                    expect(manipulator.caret.hasMesh).to.be.true;
                    expect(manipulator.caret.getBounds().x).to.equal(0);
                    expect(manipulator.caret.getBounds().y).to.equal(24);

                    // Act
                    // a\n
                    // b\n
                    // |
                    manipulator.arrowRight();
                    app.ticker.update();

                    // Assert
                    writeDataUrlToDisk(app.view.toDataURL(), 'test');
                    expect(manipulator.caret.hasMesh).to.be.true;
                    expect(manipulator.caret.getBounds().x).to.equal(0);
                    expect(manipulator.caret.getBounds().y).to.equal(24);
                })
            })
        })

        describe('when moving up', () => {
            describe('lines', () => {
                it('with only new lines', async() => {
                    // Assemble
                    const displayText = '\n\n'
                    const {app, text} = await createFontAtlasTextApp(
                        displayText, 64, 64);
                    const manipulator = new FontAtlasTextManipulator(text);
                    manipulator.caret.caretVisibleDuration = 0;
                    app.stage.addChildAt(manipulator, 0);

                    // Act
                    // \n
                    // \n
                    // |
                    manipulator.click(48, 48, false);
                    app.ticker.update();

                    // Assert
                    writeDataUrlToDisk(app.view.toDataURL(), 'test');
                    expect(manipulator.caret.hasMesh).to.be.true;
                    expect(manipulator.caret.getBounds().x).to.equal(0);
                    expect(manipulator.caret.getBounds().y).to.equal(24);

                    // Act
                    // \n
                    // |\n
                    manipulator.arrowUp();
                    app.ticker.update();

                    // Assert
                    writeDataUrlToDisk(app.view.toDataURL(), 'test');
                    expect(manipulator.caret.hasMesh).to.be.true;
                    expect(manipulator.caret.getBounds().x).to.equal(0);
                    expect(manipulator.caret.getBounds().y).to.equal(12);

                    // Act
                    // |\n
                    // \n
                    manipulator.arrowUp();
                    app.ticker.update();

                    // Assert
                    writeDataUrlToDisk(app.view.toDataURL(), 'test');
                    expect(manipulator.caret.hasMesh).to.be.true;
                    expect(manipulator.caret.getBounds().x).to.equal(0);
                    expect(manipulator.caret.getBounds().y).to.equal(0);
                });

                it('with single characters', async() => {
                    // Assemble
                    const displayText = 'a\nb\n'
                    const {app, text} = await createFontAtlasTextApp(
                        displayText, 64, 64);
                    const manipulator = new FontAtlasTextManipulator(text);
                    manipulator.caret.caretVisibleDuration = 0;
                    app.stage.addChildAt(manipulator, 0);

                    // Act
                    // a\n
                    // b\n
                    // |
                    manipulator.click(48, 48, false);
                    app.ticker.update();

                    // Assert
                    writeDataUrlToDisk(app.view.toDataURL(), 'test');
                    expect(manipulator.caret.hasMesh).to.be.true;
                    expect(manipulator.caret.getBounds().x).to.equal(0);
                    expect(manipulator.caret.getBounds().y).to.equal(24);

                    // Act
                    // a\n
                    // |b\n
                    manipulator.arrowUp();
                    app.ticker.update();

                    // Assert
                    writeDataUrlToDisk(app.view.toDataURL(), 'test');
                    expect(manipulator.caret.hasMesh).to.be.true;
                    expect(manipulator.caret.getBounds().x).to.equal(0);
                    expect(manipulator.caret.getBounds().y).to.equal(12);

                    // Act
                    // |a\n
                    // b\n
                    manipulator.arrowUp();
                    app.ticker.update();

                    // Assert
                    writeDataUrlToDisk(app.view.toDataURL(), 'test');
                    expect(manipulator.caret.hasMesh).to.be.true;
                    expect(manipulator.caret.getBounds().x).to.equal(0);
                    expect(manipulator.caret.getBounds().y).to.equal(0);

                })
            });
        })

        describe('when moving down', () => {
            describe('lines', () => {
                it('with only new lines', async() => {
                    // Assemble
                    const displayText = '\n\n'
                    const {app, text} = await createFontAtlasTextApp(
                        displayText, 64, 64);
                    const manipulator = new FontAtlasTextManipulator(text);
                    manipulator.caret.caretVisibleDuration = 0;
                    app.stage.addChildAt(manipulator, 0);

                    // Act
                    // |\n
                    // \n
                    manipulator.click(0, 0, false);
                    app.ticker.update();

                    // Assert
                    writeDataUrlToDisk(app.view.toDataURL(), 'test');
                    expect(manipulator.caret.hasMesh).to.be.true;
                    expect(manipulator.caret.getBounds().x).to.equal(0);
                    expect(manipulator.caret.getBounds().y).to.equal(0);

                    // Act
                    // \n
                    // |\n
                    manipulator.arrowDown();
                    app.ticker.update();

                    // Assert
                    writeDataUrlToDisk(app.view.toDataURL(), 'test');
                    expect(manipulator.caret.hasMesh).to.be.true;
                    expect(manipulator.caret.getBounds().x).to.equal(0);
                    expect(manipulator.caret.getBounds().y).to.equal(12);

                    // Act
                    // \n
                    // \n
                    // |
                    manipulator.arrowDown();
                    app.ticker.update();

                    // Assert
                    writeDataUrlToDisk(app.view.toDataURL(), 'test');
                    expect(manipulator.caret.hasMesh).to.be.true;
                    expect(manipulator.caret.getBounds().x).to.equal(0);
                    expect(manipulator.caret.getBounds().y).to.equal(24);

                    // Act
                    // \n
                    // \n
                    // |
                    manipulator.arrowDown();
                    app.ticker.update();

                    // Assert
                    writeDataUrlToDisk(app.view.toDataURL(), 'test');
                    expect(manipulator.caret.hasMesh).to.be.true;
                    expect(manipulator.caret.getBounds().x).to.equal(0);
                    expect(manipulator.caret.getBounds().y).to.equal(24);
                });

                it('with single characters', async() => {
                    // Assemble
                    const displayText = 'a\nb\n'
                    const {app, text} = await createFontAtlasTextApp(
                        displayText, 64, 64);
                    const manipulator = new FontAtlasTextManipulator(text);
                    manipulator.caret.caretVisibleDuration = 0;
                    app.stage.addChildAt(manipulator, 0);

                    // Act
                    // |a\n
                    // b\n
                    manipulator.click(0, 0, false);
                    app.ticker.update();

                    // Assert
                    writeDataUrlToDisk(app.view.toDataURL(), 'test');
                    expect(manipulator.caret.hasMesh).to.be.true;
                    expect(manipulator.caret.getBounds().x).to.equal(0);
                    expect(manipulator.caret.getBounds().y).to.equal(0);

                    // Act
                    // a\n
                    // |b\n
                    manipulator.arrowDown();
                    app.ticker.update();

                    // Assert
                    writeDataUrlToDisk(app.view.toDataURL(), 'test');
                    expect(manipulator.caret.hasMesh).to.be.true;
                    expect(manipulator.caret.getBounds().x).to.equal(0);
                    expect(manipulator.caret.getBounds().y).to.equal(12);

                    // Act
                    // a\n
                    // b\n
                    // |
                    manipulator.arrowDown();
                    app.ticker.update();

                    // Assert
                    writeDataUrlToDisk(app.view.toDataURL(), 'test');
                    expect(manipulator.caret.hasMesh).to.be.true;
                    expect(manipulator.caret.getBounds().x).to.equal(0);
                    expect(manipulator.caret.getBounds().y).to.equal(24);

                    // Act
                    // a\n
                    // b\n
                    // |
                    manipulator.arrowDown();
                    app.ticker.update();

                    // Assert
                    writeDataUrlToDisk(app.view.toDataURL(), 'test');
                    expect(manipulator.caret.hasMesh).to.be.true;
                    expect(manipulator.caret.getBounds().x).to.equal(0);
                    expect(manipulator.caret.getBounds().y).to.equal(24);
                });
            })
        })
    })

    describe('can display selection', () => {
        describe('forward', () => {
            it('a single word', async() => {
                // Assemble
                const displayText = 'What'
                const {app, text} = await createFontAtlasTextApp(
                    displayText, 64, 64);
                const manipulator = new FontAtlasTextManipulator(text);
                app.stage.addChildAt(manipulator, 0);

                // Act
                manipulator.click(0, 0, false);
                manipulator.arrowRight(true);
                manipulator.arrowRight(true);
                manipulator.arrowRight(true);
                manipulator.arrowRight(true);
                app.ticker.update();

                // Assert
                writeDataUrlToDisk(app.view.toDataURL(), 'test')
                expect(manipulator.drawSelection.hasMesh).to.be.true;
                const bounds = roundBounds(manipulator.drawSelection.getBounds());
                expect(bounds.x).to.equal(0);
                expect(bounds.y).to.equal(0);
                expect(bounds.width).to.equal(27);
                expect(bounds.height).to.equal(12);
            });

            it('multiple words on a single line', async() => {
                // Assemble
                const displayText = 'This is it'
                const {app, text} = await createFontAtlasTextApp(
                    displayText, 64, 64);
                const manipulator = new FontAtlasTextManipulator(text);
                app.stage.addChildAt(manipulator, 0);

                // Act
                manipulator.select(2, CARET_POSITION.START); // before i
                manipulator.arrowRight(true);
                manipulator.arrowRight(true);
                manipulator.arrowRight(true);
                manipulator.arrowRight(true);
                app.ticker.update();

                // Assert
                writeDataUrlToDisk(app.view.toDataURL(), 'test')
                expect(manipulator.drawSelection.hasMesh).to.be.true;
                const bounds = roundBounds(manipulator.drawSelection.getBounds());
                expect(bounds.x).to.equal(15);
                expect(bounds.y).to.equal(0);
                expect(bounds.width).to.equal(13);
                expect(bounds.height).to.equal(12);

                // Act
                manipulator.select(1, CARET_POSITION.END); // before i
                manipulator.arrowRight(true);
                manipulator.arrowRight(true);
                manipulator.arrowRight(true);
                manipulator.arrowRight(true);
                app.ticker.update();

                // Assert
                writeDataUrlToDisk(app.view.toDataURL(), 'test')
            });

            it('multiple words on two lines', async() => {

            });

            it('multiple words on several lines', async() => {

            });
        })
    })

    it('can add word at the start', async() => {
        // Assemble
        const displayText = 'world'
        const {app, text} = await createFontAtlasTextApp(
            displayText, 64, 64);
        const manipulator = new FontAtlasTextManipulator(text);

        // Act and assert
        manipulator.click(0, 0, false);
        expect(manipulator._activeGlyph()).to.eql([0, 0])

        manipulator.onInput('h')
        expect(manipulator._activeGlyph()).to.eql([1, 0])

        manipulator.onInput('e')
        expect(manipulator._activeGlyph()).to.eql([2, 0])

        manipulator.onInput('l')
        expect(manipulator._activeGlyph()).to.eql([3, 0])

        manipulator.onInput('l')
        expect(manipulator._activeGlyph()).to.eql([4, 0])

        manipulator.onInput('o')
        expect(manipulator._activeGlyph()).to.eql([5, 0])

        manipulator.onInput(' ')
        expect(manipulator._activeGlyph()).to.eql([6, 0])

        app.ticker.update();

        // Final assert - ensure we end up with hello world
        const url = app.view.toDataURL();
        const expectedUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAD/klEQVR4Xu2WWSitfRTGn2PKVISSC6EIkZREykzJUCRDLoQSLsxxIZQhFySUeYoiU8IVCckUkSKJkkREhiIiwmmtvu/E+fbZXzr74uzO+t/t3ftf71rPWuv5vd/e39/fDQwM8PDwgK8cDw8PrK2t8RUHBwfs7e195bpKn21ubsb29jZaW1v/EzcqKgpjY2O/fN83EeCfCbi7u8Pw8DAMDQ3h4+MDIyMjpV360yeguroaMTExyMnJwcTEhPIJ0NLSQkhICNzc3LC7u4uIiAgkJibi4uICWVlZuLy8hIaGBt7e3tDU1ARHR0coEmBrawvFxcX8PAn4+vrKCYSHh39KIDIyEhkZGfDy8gIlOjIywit0fX2NvLw89Pb2YmVlhe8aGxvj+fkZ+vr6KCsrg7u7OwIDA+Ht7Y3T01N0dHTg4wpMTk5yzhT79vYW1Ni5uTnlAlDww8NDmJmZ8csXFxfR09OD+vp6rK+vo7+/H+fn58jPz0dQUBCSk5MVCtDQ0ICDgwOkpqbCxcUFNTU1eHp6QklJyacE6DeJnpaWhtDQUBY+JSUFVlZWLNbm5iYKCgqgo6PDsaytrbkoJycnvkMC+Pv7s9h0PgpAAtra2nI8XV1dfMkDqMOzs7Oora3F1NQUoqOjcXNz8yN5TU1NODs7szCKJqCoqAja2trIzc3lztHoUUd+NqfBwUF0dXWhsrKSC0tPT8f+/j7HnJ6eRktLC+Lj47nQhIQEkEl3d3djdXUV7e3t/L+fn98PYT8KQPlRE11dXUH5/pYAhYWF3AXq+r9HT0+PE1UkQGdnJx4fHxEbGwtzc3Mez+XlZZ6mj4eKpQKTkpJ4tYKDg/kdtLP29vYsSEVFBWxsbHgiSEwafxr5/xOABKP7tAI0Zb8lwNDQEHeKXkoFbWxswMLCgkdMkQDz8/PccSqGCqGkSbDGxsZPAtBUZWZm4uXlBeXl5TA1NUVcXBw/U1VVBU9PT4yPj2NhYYG9iFY0Ozubi6L1UTYB5FE7OzvsLWdnZ7yu5Ce/Op8w+PMKnJycgPZ6dHQUV1dXMDExwdLSEiwtLRUKQKZZV1cHGnGK5evryyNOxvXx3N/fc9y2tjYcHx/zN0hfXx9/V5DY1Dl6d2lpKa8kTUlYWBibop2dnVIBqGgSYWBgAAEBATg6OsLMzIxyAVT6VaJmwXgC1CxnlaYrAsgEyAqIB4gJqtRW1SyYUEAoIBQQCggF1My4VZquUEAoIBQQCggFVGqrahZMKCAUEAoIBYQCambcKk1XKCAUEAoIBYQCKrVVNQsmFBAKCAWEAkIBNTNulaYrFBAKCAWEAkIBldqqmgUTCggFhAJCAaGAmhm3StMVCggFhAJCgb+aAt8BGy0GbnO//78AAAAASUVORK5CYII='
        expect(url).to.equal(expectedUrl);
    });

    it('can add word at end', async() => {
        // Assemble
        const displayText = 'hello'
        const {app, text} = await createFontAtlasTextApp(
            displayText, 64, 64);
        const manipulator = new FontAtlasTextManipulator(text);
        manipulator.caret.caretVisibleDuration = 0;
        app.stage.addChildAt(manipulator, 0);

        // Act
        manipulator.click(60, 0, false);
        manipulator.onInput(' ')
        manipulator.onInput('w')
        manipulator.onInput('o')
        manipulator.onInput('r')
        manipulator.onInput('l')
        manipulator.onInput('d')

        // Assert
        app.ticker.update();
        expect(text.text).to.equal('hello world')
        expect(manipulator._activeGlyph()).to.eql([10, 1])

        writeDataUrlToDisk(app.view.toDataURL(), 'can_add_word_at_end')
    });

    it('can add word inbetween', async() => {
        // Assemble
        const displayText = 'Who it?'
        const {app, text} = await createFontAtlasTextApp(
            displayText, 64, 64);
        const manipulator = new FontAtlasTextManipulator(text);
        manipulator.caret.caretVisibleDuration = 0;
        app.stage.addChildAt(manipulator, 0);

        // Act
        manipulator.click(25, 0, false);
        expect(manipulator._activeGlyph()).to.eql([4, 0])
        manipulator.onInput('i')
        manipulator.onInput('s')
        manipulator.onInput(' ')

        // Assert
        app.ticker.update();
        expect(text.text).to.equal('Who is it?')
        expect(manipulator._activeGlyph()).to.eql([7, 0])
        writeDataUrlToDisk(app.view.toDataURL(), 'can_add_word_inbetween')
    });

    it('can delete glyph inbetween', async() => {
        // Assemble
        const displayText = 'Whatdow'
        const {app, text} = await createFontAtlasTextApp(
            displayText, 64, 64);
        const manipulator = new FontAtlasTextManipulator(text);
        manipulator.caret.caretVisibleDuration = 0;
        app.stage.addChildAt(manipulator, 0);

        // Act - delete d
        manipulator.click(30, 0, false);
        manipulator.arrowRight();
        manipulator.onDelete();

        // Assert
        app.ticker.update();
        expect(manipulator._activeGlyph()).to.eql([4, 0])

        // Act - add " n"
        manipulator.onInput(' ')
        manipulator.onInput('n')
        app.ticker.update();

        // Assert
        expect(text.text).to.equal('What now');
        expect(manipulator._activeGlyph()).to.eql([6, 0])
        writeDataUrlToDisk(app.view.toDataURL(), 'can_delete_glyph_inbetween')
    });

    it('can delete glyph at the end', async() => {

    });

    it('can delete word inbetween', async() => {
        // Assemble
        const displayText = 'Whathis now'
        const {app, text} = await createFontAtlasTextApp(
            displayText, 64, 64);
        const manipulator = new FontAtlasTextManipulator(text);
        manipulator.caret.caretVisibleDuration = 0;
        app.stage.addChildAt(manipulator, 0);

        // Act - delete his
        manipulator.click(30, 0, false);
        manipulator.arrowRight(true);
        manipulator.arrowRight(true);
        manipulator.arrowRight(true);
        manipulator.onDelete();
        app.ticker.update();

        // Assert
        expect(text.text).is.equal('What now');
        expect(manipulator._activeGlyph()).to.eql([4, 0]);
        writeDataUrlToDisk(app.view.toDataURL(), 'can_delete_word_inbetween');
    });

    it('can continuously add and remove words', async() => {
        // Assemble
        const displayText = 'What'
        const {app, text} = await createFontAtlasTextApp(
            displayText, 64, 64);
        const manipulator = new FontAtlasTextManipulator(text);
        manipulator.caret.caretVisibleDuration = 0;
        app.stage.addChildAt(manipulator, 0);

        // Act - delete word
        manipulator.click(0, 0, false);
        manipulator.arrowRight(true);
        manipulator.arrowRight(true);
        manipulator.arrowRight(true);
        manipulator.arrowRight(true);
        manipulator.onDelete()
        app.ticker.update();

        // Assert
        expect(text.text).to.equal('');
        expect(manipulator._activeGlyph()).to.eql([0,0])
        expect(manipulator.caret.hasMesh).to.be.true;

        // Act - add word
        manipulator.onInput('W')
        manipulator.onInput('o')
        manipulator.onInput('r')
        manipulator.onInput('l')
        manipulator.onInput('d')
        app.ticker.update();

        // Assert
        expect(text.text).to.equal('World');
        expect(manipulator._activeGlyph()).to.eql([4, 1]);
        expect(manipulator.caret.hasMesh).to.be.true;

        // Act - replace character
        manipulator.click(0, 0, false);
        manipulator.arrowRight(true);
        manipulator.onDelete();
        manipulator.onInput('w');
        manipulator.arrowLeft(false);
        app.ticker.update();

        // Assert
        expect(text.text).to.equal('world');
        expect(manipulator._activeGlyph()).to.eql([0, 0]);
        expect(manipulator.caret.hasMesh).to.be.true;

        // Act - add word
        manipulator.onInput('a')
        manipulator.onInput(' ')

        // Assert
        app.ticker.update();
        expect(text.text).to.equal('a world');
        expect(manipulator._activeGlyph()).to.eql([2, 0]);
        expect(manipulator.caret.hasMesh).to.be.true;

        // Act - add word
        manipulator.arrowLeft(false);
        manipulator.arrowLeft(false);
        manipulator.onInput('W')
        manipulator.onInput('h')
        manipulator.onInput('a')
        manipulator.onInput('t')
        manipulator.onInput(' ')

        // Assert
        app.ticker.update();
        expect(text.text).to.equal("What a world");
        expect(manipulator._activeGlyph()).to.eql([5, 0]);
        expect(manipulator.caret.hasMesh).to.be.true;

        writeDataUrlToDisk(app.view.toDataURL(), 'can_continuously_add_and_remove_words')
    });

    it('can start from an empty element', async() => {
        // Assemble
        const displayText = ''
        const {app, text} = await createFontAtlasTextApp(
            displayText, 64, 64);
        const manipulator = new FontAtlasTextManipulator(text);
        manipulator.caret.caretVisibleDuration = 0;
        app.stage.addChildAt(manipulator, 0);

        // Act - empty
        manipulator.click(0, 0, false);
        app.ticker.update();

        // Assert
        expect(text.text).to.equal("");
        expect(manipulator._activeGlyph()).to.eql([0, 0]);
        expect(manipulator.caret.hasMesh).to.be.true;

        // Act - add word
        manipulator.onInput('H')
        manipulator.onInput('e')
        manipulator.onInput('l')
        manipulator.onInput('l')
        manipulator.onInput('o')

        // Assert
        app.ticker.update();
        expect(text.text).to.equal("Hello");
        expect(manipulator._activeGlyph()).to.eql([4, 1]);
        expect(manipulator.caret.hasMesh).to.be.true;

        writeDataUrlToDisk(app.view.toDataURL(), 'can_start_from_an_empty_element')
    });
})