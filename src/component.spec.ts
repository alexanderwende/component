import { Component, Changes } from './component';
import { AttributeConverterBoolean, component, listener, property } from './decorators';

function addElement (element: Component) {

    document.body.appendChild(element);
}

function removeElement (element: Component) {

    document.body.removeChild(element);
}

@component({
    selector: 'test-element'
})
class TestElement extends Component {

    @property({
        converter: AttributeConverterBoolean
    })
    myProperty = false;

    @listener({
        event: 'click'
    })
    handleClick (event: MouseEvent) {

        this.watch(() => this.myProperty = !this.myProperty);
    }
}

describe('Component', () => {

    describe('Component lifecycle', () => {

        // TODO: add adopted callback test
        it('should call lifecycle hooks in correct order', (done) => {

            const expectedOrder = ['CONSTRUCTED', 'CONNECTED', 'ATTRIBUTE', 'UPDATE', 'DISCONNECTED'];
            const recordedOrder: string[] = [];

            @component({
                selector: 'test-element-lifecycle'
            })
            class TestElementLifecycle extends Component {

                static get observedAttributes (): string[] {

                    return ['test-attribute'];
                }

                constructor () {

                    super();

                    recordedOrder.push('CONSTRUCTED');
                }

                adoptedCallback () {

                    super.adoptedCallback();

                    recordedOrder.push('ADOPTED');
                }

                connectedCallback () {

                    super.connectedCallback();

                    recordedOrder.push('CONNECTED');
                }

                disconnectedCallback () {

                    super.disconnectedCallback();

                    recordedOrder.push('DISCONNECTED');

                    assertOrder();
                }

                attributeChangedCallback (attribute: string, oldValue: any, newValue: any) {

                    super.attributeChangedCallback(attribute, oldValue, newValue);

                    expect(attribute).toBe('test-attribute');
                    expect(oldValue).toBe(null);
                    expect(newValue).toBe('foo');

                    recordedOrder.push('ATTRIBUTE');
                }

                updateCallback (changedProperties: Changes, firtsUpdate: boolean) {

                    recordedOrder.push('UPDATE');

                    removeElement(this);
                }
            }

            function assertOrder () {

                expect(recordedOrder).toEqual(expectedOrder);

                done();
            }

            const testElement = document.createElement('test-element-lifecycle') as Component;

            addElement(testElement);

            // adding the element and setting the attribute are synchronous, so setting the attribute
            // should happen before the update gets scheduled and we should see this lifecycle happen before
            // render and update
            testElement.setAttribute('test-attribute', 'foo');
        });

        it('can be detached and reattached', () => {

        });
    });

    describe('Component events', () => {

        let expectedOrder: string[] = [];
        let recordedOrder: string[] = [];
        let testElement: TestElement;

        function assertOrder () {

            expect(recordedOrder).toEqual(expectedOrder);
        }

        beforeEach(() => {

            expectedOrder = [];
            recordedOrder = [];
            testElement = document.createElement('test-element') as TestElement;
        });

        it('should dispatch lifecycle events', (done) => {

            expectedOrder = ['CONNECTED', 'UPDATE', 'PROPERTY', 'UPDATE', 'DISCONNECTED'];

            testElement.addEventListener('connected', () => {
                recordedOrder.push('CONNECTED');
            });

            // TODO: test event paylpoad
            testElement.addEventListener('update', (event: Event) => {
                if ((event as CustomEvent).detail.firstUpdate) {
                    recordedOrder.push('UPDATE');
                    // on the first update, after listeners are bound, we click the element
                    // the click handler will be invoked synchronously, and as we are still in the
                    // update loop, any changes to the element's state won't trigger another update
                    // in order for the click handler to trigger another update, we have to defer the click
                    Promise.resolve().then(() => testElement.click());
                } else {
                    recordedOrder.push('UPDATE');
                    // on the second update, which should follow after the click, we remove the element
                    removeElement(testElement);
                }
            });

            testElement.addEventListener('disconnected', () => {
                recordedOrder.push('DISCONNECTED');
                assertOrder();
                done();
            });

            // TODO: test event payload
            testElement.addEventListener('my-property-changed', () => {
                recordedOrder.push('PROPERTY');
            });

            addElement(testElement);
        });

        it('should dispatch property change events only when properties change internally', (done) => {

            expectedOrder = ['UPDATE', 'DISCONNECTED'];

            testElement.addEventListener('update', () => {
                recordedOrder.push('UPDATE');
                removeElement(testElement);
            });

            testElement.addEventListener('my-property-changed', () => {
                recordedOrder.push('PROPERTY');
            });

            testElement.addEventListener('disconnected', () => {
                recordedOrder.push('DISCONNECTED');
                assertOrder();
                done();
            });

            addElement(testElement);

            // should trigger an update, but no property
            testElement.myProperty = true;
        });
    });
});

// TODO: test Component.shadow
// TODO: test Component.styles
// TODO: test Component.template
// TODO: test renderRoot
// TODO: test notify
// TODO: test watch
// TODO: test watch
// TODO: test requestUpdate
// TODO: test render
// TODO: test update
// TODO: test hasChanged
// TODO: test getPropertyDeclaration
