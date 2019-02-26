import { AttributeConverterBoolean, customElement, CustomElement, html, listener, property } from '../../src';
import { css } from '../../src/css';
import { Enter, Space } from './keys';
import './icon/icon';

@customElement<Checkbox>({
    selector: 'ui-checkbox',
    styles: [css`
    :host {
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
        }
        ui-icon {
            color: var(--border-color, #bfbfbf);
            opacity: 0;
            transition: .1s ease-in;
        }
        :host([aria-checked="true"]) ui-icon {
            color: var(--selected-color, #bfbfbf);
            opacity: 1;
        }
    `],
    template: checkbox => html`
    <ui-icon .icon=${ 'check' }></ui-icon>
    `
})
export class Checkbox extends CustomElement {

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
