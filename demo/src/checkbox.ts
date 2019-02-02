import { html, TemplateResult } from 'lit-html';
import { customElement, CustomElement, property, PropertyReflector } from '../../src';
import { listener } from '../../src/decorators/listener';

@customElement({
    selector: 'check-box'
})
export class Checkbox extends CustomElement {

    @property({
        observe: true,
        reflect: true
    })
    customRole = 'checkbox';

    @property<Checkbox>({
        reflect: 'reflectChecked',
        // reflect: function (propertyKey: string, oldValue: any, newValue: any) {
        //     if (this.customChecked) {
        //         this.setAttribute('custom-checked', 'true');
        //         this.setAttribute('aria-checked', 'true');
        //     } else {
        //         this.removeAttribute('custom-checked');
        //         this.removeAttribute('aria-checked');
        //     }
        // },
        notify: true,
        toAttribute: (value) => value ? 'true' : null,
        fromAttribute: (value) => value !== null
    })
    customChecked = false;

    constructor () {

        super();
    }

    @listener({
        event: 'click'
    })
    onClick (event: MouseEvent) {

        this.customChecked = !this.customChecked;
    }

    reflectChecked () {

        if (this.customChecked) {

            this.setAttribute('custom-checked', 'true');
            this.setAttribute('aria-checked', 'true');

        } else {

            this.removeAttribute('custom-checked');
            this.removeAttribute('aria-checked');
        }
    }

    template (): TemplateResult {

        return html`
            <style>
                :host {
                    display: inline-block;
                    width: 1rem;
                    height: 1rem;
                    border: 1px solid #999;
                }
                :host([checked=true]),
                :host([aria-checked=true]) {
                    background-color: #ccc;
                }
            </style>`;
    }
}
