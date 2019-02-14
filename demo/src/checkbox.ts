import { AttributeConverterBoolean, customElement, CustomElement, html, listener, property, TemplateResult } from '../../src';

@customElement({
    selector: 'ui-checkbox'
})
export class Checkbox extends CustomElement {

    // this is a HTMLElement property, we don't need a property decorator to reflect it
    role = 'checkbox';

    // this is a HTMLElement property, we don't need a property decorator to reflect it
    tabIndex = 0;

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
                this.removeAttribute('aria-checked');
            }
        }
    })
    checked = false;

    @listener({
        event: 'click'
    })
    toggle () {

        this.watch(() => {

            this.checked = !this.checked;
        });
    }

    @listener({
        event: 'keydown'
    })
    protected handeKeyDown (event: KeyboardEvent) {

        const key = event.key;

        if (key === 'Enter' || key === ' ') {

            this.toggle();
        }
    }

    protected template (): TemplateResult {

        return html`
            <style>
                :host {
                    display: inline-block;
                    width: 1rem;
                    height: 1rem;
                    border: 1px solid rgba(0,0,0,.1);
                }
                :host([checked]) {
                    background-color: rgba(0,0,0,.1);
                }
            </style>`;
    }
}
