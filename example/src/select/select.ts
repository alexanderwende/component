import { AttributeConverterNumber, AttributeConverterString, Component, component, css, property, AttributeConverterBoolean } from "@partkit/component";
import { html } from 'lit-html';
import { IDGenerator } from '../id-generator';

const ID_GENERATOR = new IDGenerator('partikit-select-');

@component<Select>({
    selector: 'ui-select',
    // shadow: false,
    styles: [css`
    :host {
        display: inline-block;
        border: 1px solid #ddd;
    }
    :host([aria-expanded=true]) {}
    `],
    template: select => html`
    <slot name="ui-select-trigger">
    <button id="${ select.id }-button">Select</button>
    </slot>
    <ui-overlay role="listbox" controller="#${ select.id }-button" controller-type="dialog" position-type="connected" origin="#${ select.id }-button">
        <slot name="ui-select-options"></slot>
    </ui-overlay>
    `
})
export class Select extends Component {

    private _disabled = false;

    private _id = ID_GENERATOR.getNextID();

    /**
     * We provide our own tabindex property, so we can set it to `null`
     * to remove the tabindex-attribute.
     */
    @property({
        attribute: 'tabindex',
        converter: AttributeConverterNumber
    })
    tabindex!: number | null;

    @property({
        converter: AttributeConverterString
    })
    role!: string;

    @property({
        converter: AttributeConverterBoolean
    })
    get disabled (): boolean {

        return this._disabled;
    }

    set disabled (value: boolean) {

        this._disabled = value;

        this.tabindex = value ? null : 0;
    }

    @property({
        converter: AttributeConverterString
    })
    get id (): string {

        return this._id;
    }

    set id (value: string) {

        this._id = value;
    }

    connectedCallback () {

        this.role = this.getAttribute('role') || 'button';

        super.connectedCallback();
    }
}
