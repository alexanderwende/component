import { CustomElement, property, html, customElement, AttributeConverterString } from '../../../src';
import { ARIABooleanConverter } from '../aria-boolean-converter';

@customElement({
    selector: 'ui-tab-panel',
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
