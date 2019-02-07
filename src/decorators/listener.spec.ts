import { CustomElement } from '../custom-element';
import { customElement } from './custom-element';
import { listener } from './listener';
import { doesNotReject } from 'assert';

describe('@listener decorator', () => {

    describe('@listener decorator: event', () => {

        it('should bind events', (done) => {

            let clicks = 0;

            @customElement({
                selector: 'test-element-listener'
            })
            class TestElement extends CustomElement {

                @listener({
                    event: 'click'
                })
                handleClick (event: MouseEvent) {

                    clicks++;
                }
            }

            expect([...TestElement.listeners.keys()]).toEqual(['handleClick']);

            const testElement = document.createElement('test-element-listener');
            document.body.append(testElement);
            testElement.click();

            Promise.resolve().then(() => {

                expect(clicks).toBe(1);
                done();
            });
        });

        it('should bind inherited event bindings', (done) => {

            let clicks = 0;

            @customElement({
                selector: 'test-element-listener-base'
            })
            class TestElement extends CustomElement {

                @listener({
                    event: 'click'
                })
                handleClick (event: MouseEvent) {

                    clicks++;
                }
            }

            @customElement({
                selector: 'test-element-listener-extended'
            })
            class ExtendedTestElement extends TestElement {}

            expect([...ExtendedTestElement.listeners.keys()]).toEqual(['handleClick']);

            const testElement = document.createElement('test-element-listener-extended');
            document.body.append(testElement);
            testElement.click();

            Promise.resolve().then(() => {

                expect(clicks).toBe(1);
                done();
            });
        });

        it('should allow unbinding events when extending a custom element', (done) => {

            let clicks = 0;

            @customElement({
                selector: 'test-element-listener-unbind-base'
            })
            class TestElement extends CustomElement {

                @listener({
                    event: 'click'
                })
                handleClick (event: MouseEvent) {

                    clicks++;
                }
            }

            @customElement({
                selector: 'test-element-listener-unbind-extended'
            })
            class ExtendedTestElement extends TestElement {

                @listener({
                    event: null
                })
                handleClick (event: MouseEvent) {

                    throw Error('I should not be invoked.');
                }
            }

            expect([...ExtendedTestElement.listeners.keys()]).toEqual([]);

            const testElement = document.createElement('test-element-listener-unbind-extended');
            document.body.append(testElement);
            testElement.click();

            Promise.resolve().then(() => {

                expect(clicks).toBe(0);
                done();
            });
        });
    });
});
