import { html, TemplateResult } from 'lit-html';
import { ATTRIBUTE_CONVERTERS, customElement, CustomElement, listener, property } from '../../src';

@customElement({
    selector: 'check-box'
})
export class Checkbox extends CustomElement {

    @property()
    customRole = 'checkbox';

    @property<Checkbox>({
        converter: ATTRIBUTE_CONVERTERS.boolean,
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

        this.notifyChanges(() => {

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
                :host([checked=true]),
                :host([aria-checked=true]) {
                    background-color: #ccc;
                }
            </style>`;
    }
}
