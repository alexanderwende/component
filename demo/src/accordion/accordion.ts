import { CustomElement, customElement, property, html } from '../../../src';
import './accordion-panel';

@customElement({
    selector: 'ui-accordion'
})
export class Accordion extends CustomElement {

    // role is a HTMLElement property and will automatically reflect - no need to reflect
    readonly role = 'presentation';

    template () {

        return html`
            <style>
                :host {
                    display: inline-flex;
                    flex-direction: column;
                }
            </style>
            <slot></slot>
        `;
    }
}
