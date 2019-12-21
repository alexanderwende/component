import { AttributeConverterARIABoolean, AttributeConverterNumber, Component, component, css, property } from "@partkit/component";
import { html } from "lit-html";

@component({
    selector: 'ui-option',
    styles: [css`
    :host {
        display: block;
    }
    :host([aria-selected=true]) {}
    `],
    template: (option: Option) => html`<slot></slot>`
})
export class Option extends Component {

    private _disabled = false;

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
        attribute: 'aria-selected',
        converter: AttributeConverterARIABoolean
    })
    selected = false;

    @property({
        attribute: 'aria-disabled',
        converter: AttributeConverterARIABoolean,
    })
    get disabled (): boolean {

        return this._disabled;
    }

    set disabled (value: boolean) {

        this._disabled = value;

        this.tabindex = value ? null : (this.selected ? 0 : -1);
    }

    @property()
    role!: string;

    connectedCallback () {

        super.connectedCallback();

        this.role = 'option';
        this.tabindex = this.disabled ? null : -1;
    }
}
