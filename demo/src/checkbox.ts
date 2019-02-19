import { AttributeConverterBoolean, customElement, CustomElement, html, listener, property } from '../../src';
import { Enter, Space } from './keys';

const styleSheet = `
:host {
    display: inline-flex;
    contain: content;
    width: 1rem;
    height: 1rem;
    cursor: pointer;
    border: 0.125rem solid #bfbfbf;
    border-radius: 0.25rem;
    box-sizing: border-box;
}
:host([aria-checked="true"]) {
    background-color: green;
    border-color: green;
}
:host([aria-checked="false"]) {
    border-color: #bfbfbf;
}
`;

@customElement({
    selector: 'ui-checkbox'
})
export class Checkbox extends CustomElement {

    private _addedTransition = false;

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

    updateCallback (changedProperties: Map<PropertyKey, any>, firstUpdate: boolean) {

        // TODO: Use this for modeling static styles
        // if (firstUpdate) {

        //     Promise.resolve().then(() => {
        //         const style = document.createElement('style');
        //         style.textContent = styleSheet;
        //         this._renderRoot.appendChild(style);
        //     });

        // } else {

        //     if (!this._addedTransition) {

        //         const stylesheet: CSSStyleSheet = (this._renderRoot.querySelector('style') as HTMLStyleElement).sheet! as CSSStyleSheet;

        //         stylesheet.insertRule(':host { transition: 1s ease-in; }', stylesheet.cssRules.length);

        //         this._addedTransition = true;
        //     }
        // }
    }

    protected template () {

        return html`
            <style>
                :host {
                    display: inline-flex;
                    contain: content;
                    width: 1rem;
                    height: 1rem;
                    cursor: pointer;
                    border: 0.125rem solid #bfbfbf;
                    border-radius: 0.25rem;
                    box-sizing: border-box;
                    transition: .1s ease-in;
                }
                :host([aria-checked="true"]) {
                    background-color: green;
                    border-color: green;
                }
                :host([aria-checked="false"]) {
                    border-color: #bfbfbf;
                }
            </style>
            `;
    }
}
