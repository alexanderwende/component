import { Changes, Component } from '../component';
import { AttributeConverter } from './attribute-converter';
import { component } from './component';
import { property } from './property';

const ARIABooleanConverter: AttributeConverter<any, boolean> = {
    fromAttribute: (value) => value === 'true',
    toAttribute: (value) => (value == null) ? value : value.toString()
}

describe('@property decorator', () => {

    describe('@property decorator: attribute', () => {

        it('should generate correct attribute names', () => {

            // a symbol with invalid attribute characters in its description
            const symbol = Symbol('foo   bar >= baz/');

            @component({
                selector: 'test-element-generate-attributes'
            })
            class TestElement extends Component {

                @property()
                testPropertyOne = 'foo';

                @property()
                [1] = 'bar';

                @property()
                [1.4] = 'baz';

                @property()
                [symbol] = false;

                @property()
                [Symbol.iterator] = true;
            }

            expect([...TestElement.attributes.keys()]).toEqual([
                'test-property-one',
                'attr-1',
                'attr-1-4',
                'attr-symbol-foo-bar-baz',
                'attr-symbol-symbol-iterator'
            ]);
        });

        it('should set observed attributes for decorated properties', () => {

            @component({
                selector: 'test-element-property-attributes'
            })
            class TestElement extends Component {

                @property({
                    attribute: 'foo'
                })
                testPropertyOne = 'foo';

                @property()
                testPropertyTwo = 'bar';
            }

            // it should respect custom attribute names, otherwise create an attribute name by kebab-casing the property name
            expect(TestElement.observedAttributes).toEqual(['foo', 'test-property-two']);
            expect([...TestElement.attributes.keys()]).toEqual(['foo', 'test-property-two']);
        });

        it('should set observed attributes for decorated properties and respect user-defined observed attributes', () => {

            @component({
                selector: 'test-element-property-attributes-user-defined'
            })
            class TestElement extends Component {

                static get observedAttributes (): string[] {

                    return ['checked', 'test-property-two']
                }

                @property({
                    attribute: 'foo'
                })
                testPropertyOne = 'foo';

                @property()
                testPropertyTwo = 'bar';
            }

            // if generated observed attributes are already in the observed attributes, they should not be duplicated
            expect(TestElement.observedAttributes).toEqual(['checked', 'test-property-two', 'foo']);
            expect([...TestElement.attributes.keys()]).toEqual(['foo', 'test-property-two']);
        });

        it('should *not* set observed attributes for properties whose attribute option is set to false', () => {

            @component({
                selector: 'test-element-property-attributes-false'
            })
            class TestElement extends Component {

                static get observedAttributes (): string[] {

                    return ['checked']
                }

                @property({
                    attribute: 'foo'
                })
                testPropertyOne = 'foo';

                @property({
                    attribute: false
                })
                testPropertyTwo = 'bar';
            }

            expect(TestElement.observedAttributes).toEqual(['checked', 'foo']);
            expect([...TestElement.attributes.keys()]).toEqual(['foo']);
        });

        it('should correctly inherit observed attributes for components', () => {

            @component({
                selector: 'test-element-property-attributes-base'
            })
            class TestElement extends Component {

                static get observedAttributes (): string[] {

                    return ['user', 'checked', 'hidden']
                }

                @property()
                checked = false;

                @property()
                hidden = false;

                @property()
                selected = false;

                @property()
                active = false;
            }

            expect(TestElement.observedAttributes).toEqual(['user', 'checked', 'hidden', 'selected', 'active']);
            expect([...TestElement.attributes.keys()]).toEqual(['checked', 'hidden', 'selected', 'active']);

            @component({
                selector: 'test-element-property-attributes-extended'
            })
            class ExtendedTestElement extends TestElement {

                static get observedAttributes (): string[] {

                    return [...super.observedAttributes, 'extended-hidden'];
                }

                @property({
                    attribute: false
                })
                checked = true;

                @property({
                    attribute: 'extended-selected'
                })
                selected = true;

                @property({
                    attribute: false
                })
                active = true;
            }

            // 'checked', 'selected' and 'active' should be gone, 'extended-hidden' and 'extended=selected' should be there
            expect(ExtendedTestElement.observedAttributes).toEqual(['user', 'hidden', 'extended-hidden', 'extended-selected']);
            // 'selected' should be replaced by 'extended=selected', 'checked' and 'active' should be gone
            expect([...ExtendedTestElement.attributes.keys()]).toEqual(['hidden', 'extended-selected']);
        });
    });

    describe('@property decorator', () => {

        it('should respect property accessors', (done) => {

            let count = 0;

            @component({
                selector: 'test-element-propert-accessors'
            })
            class TestElement extends Component {

                private _selected = false;

                @property({
                    attribute: 'aria-selected',
                    converter: ARIABooleanConverter
                })
                set selected (value: boolean) {

                    this._selected = value;
                    count++;
                }

                get selected (): boolean {

                    return this._selected;
                }

                connectedCallback () {

                    super.connectedCallback();

                    expect(this.selected).toBe(false);
                }

                updateCallback (changes: Changes, firstUpdate: boolean) {

                    if (firstUpdate) {

                        expect(this.selected).toBe(true);
                        expect(count).toBe(1);

                        this.watch(() => this.selected = false);

                        // inside of the updateCallback, property changes won't cause another update
                        // we have to defer requesting an update with a Promise
                        Promise.resolve().then(() => this.requestUpdate());

                    } else {

                        expect(this.selected).toBe(false);
                        expect(count).toBe(2);

                        document.body.removeChild(this);

                        done();
                    }

                }
            }

            // properties won't update if element is not connected to DOM
            const element = document.createElement(TestElement.selector) as TestElement;
            document.body.appendChild(element);

            element.setAttribute('aria-selected', 'true');
        });
    });

});
