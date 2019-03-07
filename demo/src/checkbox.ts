import { AttributeConverterBoolean, component, Component, html, listener, property } from '../../src';
import { css } from '../../src/css';
import { Enter, Space } from './keys';

@component<Checkbox>({
    selector: 'ui-checkbox',
    styles: [css`
    :host {
            position: relative;
            display: inline-flex;
            width: 1rem;
            height: 1rem;
            cursor: pointer;
            border: var(--border-width, 0.125rem) solid var(--border-color, #bfbfbf);
            border-radius: var(--border-radius, 0.25rem);
            box-sizing: content-box;
            transition: .1s ease-in;
        }
        :host([aria-checked="true"]) {
            border-color: var(--selected-color, #bfbfbf);
            background-color: var(--selected-color, #bfbfbf);
        }
        .check-mark {
            position: absolute;
            top: 0.25rem;
            left: 0.125rem;
            display: block;
            width: 0.625rem;
            height: 0.25rem;
            border: solid var(--background-color, #ffffff);
            border-width: 0 0 var(--border-width, 0.125rem) var(--border-width, 0.125rem);
            transform: rotate(-45deg);
            transition: .1s ease-in;
            opacity: 0;
        }
        :host([aria-checked="true"]) .check-mark {
            opacity: 1;
        }
    `],
    template: checkbox => html`
    <span class="check-mark"></span>
    `
})
export class Checkbox extends Component {

    // Chrome already reflects aria properties, but Firefox doesn't, so we need a property decorator
    // however, we cannot initialize role with a value here, as Chrome's reflection will cause an
    // attribute change in the constructor and that will throw an error
    // https://github.com/w3c/aria/issues/691
    @property()
    role!: string;

    @property<Checkbox>({
        // the converter will be used to reflect from the checked attribute to the property, but not
        // the other way around, as we define a custom {@link PropertyReflector}
        converter: AttributeConverterBoolean,
        // we can use a {@link PropertyReflector} to reflect to multiple attributes in different ways
        reflectProperty: function (propertyKey: PropertyKey, oldValue: any, newValue: any) {
            if (this.checked) {
                this.setAttribute('checked', '');
                this.setAttribute('aria-checked', 'true');
            } else {
                this.removeAttribute('checked');
                this.setAttribute('aria-checked', 'false');
            }
        }
    })
    checked = false;

    @listener({
        event: 'click'
    })
    toggle () {

        this.watch(() => this.checked = !this.checked);
    }

    @listener({
        event: 'keydown'
    })
    protected handeKeyDown (event: KeyboardEvent) {

        if (event.key === Enter || event.key === Space) {

            this.toggle();

            event.preventDefault();
        }
    }

    connectedCallback () {

        super.connectedCallback();

        // TODO: Document this use case!
        // https://html.spec.whatwg.org/multipage/custom-elements.html#custom-element-conformance
        // HTMLElement has a setter and getter for tabIndex, we don't need a property decorator to reflect it
        // we are not allowed to set it in the constructor though, as it creates a reflected attribute, which
        // causes an error
        this.tabIndex = 0;

        // we initialize role in the connectedCallback as well, to prevent Chrome from reflecting early
        this.role = 'checkbox';
    }
}
