import { CustomElement } from './custom-element';
import { customElement } from './decorators/custom-element';

function addElement (element: CustomElement) {

    document.body.appendChild(element);
}

function removeElement (element: CustomElement) {

    document.body.removeChild(element);
}

describe('CustomElement', () => {

    describe('CustomElement lifecycle', () => {

        // TODO: add attribute change, property change and adopted callbacks
        it('should call lifecycle hooks in correct order', (done) => {

            const expectedOrder = ['CONSTRUCTED', 'CONNECTED', 'RENDERED', 'DISCONNECTED'];
            const recordedOrder: string[] = [];

            @customElement({
                selector: 'test-element-lifecycle'
            })
            class TestElement extends CustomElement {

                constructor () {

                    super();

                    recordedOrder.push('CONSTRUCTED');
                }

                connectedCallback () {

                    super.connectedCallback();

                    recordedOrder.push('CONNECTED');
                }

                renderCallback () {

                    super.renderCallback();

                    recordedOrder.push('RENDERED');

                    removeElement(this);
                }

                disconnectedCallback () {

                    super.disconnectedCallback();

                    recordedOrder.push('DISCONNECTED');

                    assertOrder();
                }
            }

            function assertOrder () {

                expect(recordedOrder).toEqual(expectedOrder);

                done();
            }

            const testElement = document.createElement('test-element-lifecycle') as CustomElement;

            addElement(testElement);
        });

        it('can be dateched and reattached', () => {

        });
    });

    describe('CustomElement events', () => {

        it('should dispatch property change events only when properties change internally', () => {

        });
    });
});
