import { CustomElement } from '../custom-element';
import { customElement } from './custom-element';
import { property } from './property';

describe('@customElement decorator', () => {

    it('decorates a custom element class', (done) => {

        @customElement({
            selector: 'test-element'
        })
        class TestElement extends CustomElement { }

        // assert the correct selector
        expect(TestElement.selector).toBe('test-element');

        // assert shadow mode to be true by default
        expect(TestElement.shadow).toBe(true, 'shadow mode should be true by default');

        // assert custom element is defined by default
        expect(window.customElements.get('test-element')).toBe(TestElement, 'decorated cusom element is not registered');

        // assert whenDefined promise resolves
        window.customElements
            .whenDefined('test-element')
            .then(() => {
                done();
            }).catch(() => done.fail('decorated custom element not registered'));
    });

    it('allows turning off shadow mode for custom element class', () => {

        @customElement({
            selector: 'test-element-noshadow',
            shadow: false
        })
        class TestElement extends CustomElement { }

        expect(TestElement.shadow).toBe(false);
    });

    it('allows turning off automatic custom element definition', () => {

        @customElement({
            selector: 'test-element-undefined',
            define: false
        })
        class TestElement extends CustomElement { }

        expect(window.customElements.get('test-element-undefined')).toBe(undefined);
    });

    it('allows using the static selector property of the decorated custom element class', () => {

        @customElement()
        class TestElement extends CustomElement {

            static selector = 'test-element-static-selector'
        }

        expect(TestElement.selector).toBe('test-element-static-selector');

        expect(window.customElements.get('test-element-static-selector')).toBe(TestElement);
    });

    it(`uses the decorator's selector property over the static class property`, () => {

        @customElement({
            selector: 'test-element-decorator-over-static'
        })
        class TestElement extends CustomElement {

            static selector = 'test-element-static-selector'
        }

        expect(TestElement.selector).toBe('test-element-decorator-over-static');

        expect(window.customElements.get('test-element-decorator-over-static')).toBe(TestElement);
    });

    it('throws on empty selector', () => {

        expect(() => {

            @customElement()
            class TestElement extends CustomElement { }

        }).toThrow();
    });

    it('throws on invalid selector', () => {

        // selectors need to use a hyphen in the selector name, e.g.: 'my-element'
        expect(() => {

            @customElement({
                selector: 'foo'
            })
            class TestElement extends CustomElement { }

        }).toThrow();

        // selectors cennot be already existing hyphen-containing element names
        expect(() => {

            @customElement({
                selector: 'font-face'
            })
            class TestElement extends CustomElement { }

        }).toThrow();
    });

    it('stores observed attributes correctly', () => {

        @customElement({
            selector: 'test-element-observed-attributes'
        })
        class TestElement extends CustomElement {

            static get observedAttributes (): string[] {

                return ['test-attribute-one', 'test-attribute-two', 'test-property-one'];
            }

            @property()
            testPropertyOne = false;

            @property()
            testPropertyTwo = 'foo';
        }

        expect(TestElement.observedAttributes).toEqual(['test-attribute-one', 'test-attribute-two', 'test-property-one', 'test-property-two']);

        @customElement({
            selector: 'child-test-element-observed-attributes'
        })
        class ChildTestElement extends TestElement {

            @property({
                attribute: 'test-property-two-extended'
            })
            testPropertyTwo = 'bar';
        }

        expect(ChildTestElement.observedAttributes).toEqual(['test-attribute-one', 'test-attribute-two', 'test-property-one', 'test-property-two-extended']);
    });
});
