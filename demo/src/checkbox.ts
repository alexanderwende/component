import { html, TemplateResult } from 'lit-html';
import { AttributeConverterBoolean, customElement, CustomElement, listener, property } from '../../src';

@customElement({
    selector: 'check-box'
})
export class Checkbox extends CustomElement {

    @property()
    customRole = 'checkbox';

    @property<Checkbox>({
        converter: AttributeConverterBoolean,
        reflectProperty: 'reflectChecked',
        // reflectProperty: function (propertyKey: string, oldValue: any, newValue: any) {
        //     if (this.customChecked) {
        //         this.setAttribute('custom-checked', 'true');
        //         this.setAttribute('aria-checked', 'true');
        //     } else {
        //         this.removeAttribute('custom-checked');
        //         this.removeAttribute('aria-checked');
        //     }
        // },
        // notify: true,
        notify: 'notifyChecked',
        // notify: function (propertyKey: string, oldValue: any, newValue: any) {
        //     console.log('custom notifier...');
        // }
    })
    customChecked = false;

    constructor () {

        super();
    }

    @listener({
        event: 'click'
    })
    onClick (event: MouseEvent) {

        this.watch(() => {

            this.customChecked = !this.customChecked;
        });

        // this.customChecked = !this.customChecked;

        // this.notify('customChecked');
    }

    reflectChecked () {

        if (this.customChecked) {

            this.setAttribute('custom-checked', '');
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
                :host([custom-checked]) {
                    background-color: #ccc;
                }
            </style>`;
    }
}
