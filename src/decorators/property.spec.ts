import { CustomElement } from '../custom-element';
import { customElement } from './custom-element';
import { property } from './property';

describe('@property decorator', () => {

    describe('@property decorator: attribute', () => {

        it('should set observed attributes for decorated properties', () => {

            @customElement({
                selector: 'test-element-property-attributes'
            })
            class TestElement extends CustomElement {

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

            @customElement({
                selector: 'test-element-property-attributes-user-defined'
            })
            class TestElement extends CustomElement {

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

            @customElement({
                selector: 'test-element-property-attributes-false'
            })
            class TestElement extends CustomElement {

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

        it('should correctly inherit observed attributes for custom elements', () => {

            @customElement({
                selector: 'test-element-property-attributes-base'
            })
            class TestElement extends CustomElement {

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

            @customElement({
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

});
