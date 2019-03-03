import { CustomElement } from '../custom-element';
import { customElement } from './custom-element';
import { listener } from './listener';
import { property } from './property';
import { html } from 'lit-html';

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

            const testElement = document.createElement(TestElement.selector);

            // listeners are bound after the first update to ensure DOM is created
            // and connectedCallback has been run
            testElement.addEventListener('update', (event: Event) => {

                if ((event as CustomEvent).detail.firstUpdate) {

                    testElement.click();
                    expect(clicks).toBe(1);
                    done();
                }
            });

            document.body.appendChild(testElement);
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

            const testElement = document.createElement(ExtendedTestElement.selector);

            testElement.addEventListener('update', (event: Event) => {

                if ((event as CustomEvent).detail.firstUpdate) {

                    testElement.click();
                    expect(clicks).toBe(1);
                    done();
                }
            });

            document.body.appendChild(testElement);
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

            const testElement = document.createElement(ExtendedTestElement.selector);

            testElement.addEventListener('update', (event: Event) => {

                if ((event as CustomEvent).detail.firstUpdate) {

                    testElement.click();
                    expect(clicks).toBe(0);
                    done();
                }
            });

            document.body.appendChild(testElement);
        });
    });

    describe('@listener decorator: target', () => {

        it('should allow binding to targets created during connectedCallback', (done) => {

            const workerCode = `
            let counter = 0;
            function sendCount () {
                postMessage(counter++);
                setTimeout(sendCount, 1000);
            }
            sendCount();
            `;

            const workerBlob = new Blob([workerCode], { type: 'application/javascript' });

            @customElement({
                selector: 'test-element-listener-target'
            })
            class TestElement extends CustomElement {

                workerUrl!: string;

                worker!: Worker;

                @property()
                message!: number;

                connectedCallback () {

                    super.connectedCallback();
                    this.workerUrl = URL.createObjectURL(workerBlob);
                    this.worker = new Worker(this.workerUrl);
                }

                disconnectedCallback () {

                    super.disconnectedCallback();
                    this.worker.terminate();
                    URL.revokeObjectURL(this.workerUrl);
                }

                @listener<TestElement>({
                    event: 'message',
                    target: function () { return this.worker; }
                })
                handleMessage (event: MessageEvent) {

                    this.watch(() => this.message = event.data);
                }
            }

            const testElement = document.createElement(TestElement.selector);

            testElement.addEventListener('message-changed', (event: Event) => {

                const message = (event as CustomEvent).detail as { property: string, previous: any, current: any };

                expect(message.property).toBe('message');
                expect(message.previous).toBe(undefined);
                expect(message.current).toBe(0);

                document.body.removeChild(testElement);

                done();
            });

            document.body.appendChild(testElement);
        });

        it('should allow binding to ShadowDOM children', (done) => {

            @customElement({
                selector: 'test-element-listener-target-shadow-dom',
                template: element => html`<button>Test Button</button>`
            })
            class TestElement extends CustomElement {

                @property()
                clicked = false;

                @listener<TestElement>({
                    event: 'click',
                    target: function () { return this.renderRoot.querySelector('button')!; }
                })
                handleClick (event: MouseEvent) {

                    this.watch(() => this.clicked = true);
                }
            }

            const testElement = document.createElement(TestElement.selector) as TestElement;

            testElement.addEventListener('clicked-changed', (event: Event) => {

                expect(testElement.clicked).toBe(true);

                document.body.removeChild(testElement);

                done();
            });

            testElement.addEventListener('update', () => {

                // when we want the custom element to react to state changes, we can't do that in the update loop
                // we need to defer code that changes the element state
                Promise.resolve().then(() => testElement.renderRoot.querySelector('button')!.click());
            });

            document.body.appendChild(testElement);
        });
    });
});
