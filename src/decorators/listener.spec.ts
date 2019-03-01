import { CustomElement } from '../custom-element';
import { customElement } from './custom-element';
import { listener } from './listener';

// TODO: Add tests for returning DOM children as listener targets
// TODO: Add tests for worker instance as listener target

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

            // listeners are bound after the first update to ensure DOM is created
            // and connectedCallback has been run
            testElement.addEventListener('on-update', (event: Event) => {

                if ((event as CustomEvent).detail.firstUpdate) {

                    testElement.click();
                    expect(clicks).toBe(1);
                    done();
                }
            });

            document.body.append(testElement);
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
            class ExtendedTestElement extends TestElement { }

            expect([...ExtendedTestElement.listeners.keys()]).toEqual(['handleClick']);

            const testElement = document.createElement('test-element-listener-extended');

            testElement.addEventListener('on-update', (event: Event) => {

                if ((event as CustomEvent).detail.firstUpdate) {

                    testElement.click();
                    expect(clicks).toBe(1);
                    done();
                }
            });

            document.body.append(testElement);
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

            testElement.addEventListener('on-update', (event: Event) => {

                if ((event as CustomEvent).detail.firstUpdate) {

                    testElement.click();
                    expect(clicks).toBe(0);
                    done();
                }
            });

            document.body.append(testElement);
        });
    });
});
