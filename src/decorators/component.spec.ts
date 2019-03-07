import { Component } from '../component';
import { component } from './component';
import { property } from './property';

describe('@component decorator', () => {

    it('decorates a component class', (done) => {

        @component({
            selector: 'test-element-decorator'
        })
        class TestElement extends Component { }

        // assert the correct selector
        expect(TestElement.selector).toBe('test-element-decorator');

        // assert shadow mode to be true by default
        expect(TestElement.shadow).toBe(true, 'shadow mode should be true by default');

        // assert component is defined by default
        expect(window.customElements.get('test-element-decorator')).toBe(TestElement, 'decorated component is not registered');

        // assert whenDefined promise resolves
        window.customElements
            .whenDefined('test-element-decorator')
            .then(() => {
                done();
            }).catch(() => done.fail('decorated component not registered'));
    });

    it('allows turning off shadow mode for component class', () => {

        @component({
            selector: 'test-element-noshadow',
            shadow: false
        })
        class TestElement extends Component { }

        expect(TestElement.shadow).toBe(false);
    });

    it('allows turning off automatic custom element definition', () => {

        @component({
            selector: 'test-element-undefined',
            define: false
        })
        class TestElement extends Component { }

        expect(window.customElements.get('test-element-undefined')).toBe(undefined);
    });

    it('allows using the static selector property of the decorated component class', () => {

        @component()
        class TestElement extends Component {

            static selector = 'test-element-static-selector'
        }

        expect(TestElement.selector).toBe('test-element-static-selector');

        expect(window.customElements.get('test-element-static-selector')).toBe(TestElement);
    });

    it(`uses the decorator's selector property over the static class property`, () => {

        @component({
            selector: 'test-element-decorator-over-static'
        })
        class TestElement extends Component {

            static selector = 'test-element-static-selector'
        }

        expect(TestElement.selector).toBe('test-element-decorator-over-static');

        expect(window.customElements.get('test-element-decorator-over-static')).toBe(TestElement);
    });

    it('throws on empty selector', () => {

        expect(() => {

            @component()
            class TestElement extends Component { }

        }).toThrow();
    });

    it('throws on invalid selector', () => {

        // selectors need to use a hyphen in the selector name, e.g.: 'my-element'
        expect(() => {

            @component({
                selector: 'foo'
            })
            class TestElement extends Component { }

        }).toThrow();

        // selectors cennot be already existing hyphen-containing element names
        expect(() => {

            @component({
                selector: 'font-face'
            })
            class TestElement extends Component { }

        }).toThrow();
    });

    it('stores observed attributes correctly', () => {

        @component({
            selector: 'test-element-observed-attributes'
        })
        class TestElement extends Component {

            static get observedAttributes (): string[] {

                return ['test-attribute-one', 'test-attribute-two', 'test-property-one'];
            }

            @property()
            testPropertyOne = false;

            @property()
            testPropertyTwo = 'foo';
        }

        expect(TestElement.observedAttributes).toEqual(['test-attribute-one', 'test-attribute-two', 'test-property-one', 'test-property-two']);

        @component({
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
