import { CustomElement, customElement, html, property } from '../../../src';
import './accordion-panel';

@customElement({
    selector: 'ui-accordion'
})
export class Accordion extends CustomElement {

    @property({
        reflectAttribute: false
    })
    role = 'presentation';

    connectedCallback () {

        super.connectedCallback();

        this.role = 'presentation';
    }

    protected template () {

        return html`
            <style>
                :host {
                    display: flex;
                    flex-direction: column;
                    background: #fff;
                    background-clip: border-box;
                    box-sizing: border-box;
                    border: var(--border-width, 0.125rem) solid var(--border-color, rgba(0,0,0,.25));
                    border-radius: var(--border-radius, 0.25rem);
                }
            </style>
            <slot></slot>
        `;
    }
}
