import { CustomElement, property, html, customElement, AttributeConverterString } from '../../../src';
import { ARIABooleanConverter } from '../aria-boolean-converter';
import { css } from '../../../src/css';

@customElement({
    selector: 'ui-tab-panel',
    styles: [css`
    :host {
        display: block;
        position: relative;
        z-index: 1;
        padding: 0 1rem;
        background-color: var(--background-color);
        border: var(--border);
        border-radius: 0 var(--border-radius) var(--border-radius) var(--border-radius);
        box-shadow: var(--box-shadow);
    }
    :host([aria-hidden=true]) {
        display: none;
    }
    `],
    template: () => html`<slot></slot>`
})
export class TabPanel extends CustomElement {

    @property({
        converter: AttributeConverterString,
    })
    role!: string;

    @property({
        attribute: 'aria-hidden',
        converter: ARIABooleanConverter,
    })
    hidden!: boolean;

    @property({
        attribute: 'aria-labelledby',
        converter: AttributeConverterString,
    })
    labelledBy!: string;

    connectedCallback () {

        super.connectedCallback();

        this.role = 'tabpanel'
        this.hidden = true;
        this.tabIndex = -1;
    }
}
