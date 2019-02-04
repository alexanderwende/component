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
        // notify: 'notifyChecked',
        // notify: function (propertyKey: string, oldValue: any, newValue: any) {
        //     console.log('custom notifier...');
        // },
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

        this.notifyChanges(() => {

            this.customChecked = !this.customChecked;
        });

        // this.customChecked = !this.customChecked;

        // this.notify('customChecked');
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
    notifyChecked () {

        console.log(`notifyChecked...`);
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
