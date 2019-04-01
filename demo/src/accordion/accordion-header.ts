import { AttributeConverterNumber, AttributeConverterString, Component, component, html, listener, property } from '../../../src';
import { css } from '../../../src/css';
import { ARIABooleanConverter } from '../aria-boolean-converter';
import '../icon/icon';
import { Enter, Space } from '../keys';

@component<AccordionHeader>({
    selector: 'ui-accordion-header',
    styles: [css`
    :host {
        all: inherit;
        display: flex;
        flex-flow: row;
        flex: 1 1 100%;
        justify-content: space-between;
        padding: 1rem;
        font-weight: bold;
        cursor: pointer;
    }
    :host([aria-disabled=true]) {
        cursor: default;
    }
    :host([aria-expanded=true]) > ui-icon.expand,
    :host([aria-expanded=false]) > ui-icon.collapse {
        display: none;
    }
    `],
    template: element => html`
    <slot></slot>
    <ui-icon class="collapse" data-icon="minus" data-set="uni" aria-hidden="true"></ui-icon>
    <ui-icon class="expand" data-icon="plus" data-set="uni" aria-hidden="true"></ui-icon>
    `
})
export class AccordionHeader extends Component {

    protected _disabled = false;

    @property({
        attribute: 'aria-disabled',
        converter: ARIABooleanConverter
    })
    get disabled (): boolean {

        return this._disabled;
    }

    set disabled (value: boolean) {

        this._disabled = value;
        this.tabindex = value ? null : 0;
    }

    @property({
        attribute: 'aria-expanded',
        converter: ARIABooleanConverter
    })
    expanded = false;

    @property({
        attribute: 'aria-controls',
        converter: AttributeConverterString
    })
    controls!: string;

    @property({
        converter: AttributeConverterString
    })
    role!: string;

    @property({
        converter: AttributeConverterNumber
    })
    tabindex!: number | null;

    connectedCallback () {

        super.connectedCallback();

        this.role = 'button';
        this.tabindex = this.disabled ? null : 0;
    }

    @listener({
        event: 'keydown'
    })
    protected handleKeydown (event: KeyboardEvent) {

        if (event.key === Enter || event.key === Space) {

            event.preventDefault();
            event.stopPropagation();

            this.dispatchEvent(new MouseEvent('click', {
                bubbles: true,
                cancelable: true
            }));
        }
    }
}
