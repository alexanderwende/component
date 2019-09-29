import {
    AttributeConverterARIABoolean,
    AttributeConverterNumber,
    AttributeConverterString,
    Changes, Component,
    component,
    css,
    listener,
    property
} from '@partkit/component';
import { html } from 'lit-html';
import { TabPanel } from './tab-panel';

@component({
    selector: 'ui-tab',
    styles: [css`
    :host {
        position: relative;
        display: inline-flex;
        flex-flow: row;
        padding: 0.5rem 0.5rem;
        cursor: pointer;
        border: var(--border);
        border-bottom: none;
        border-radius: var(--border-radius) var(--border-radius) 0 0;
        box-shadow: var(--box-shadow);
        background-color: var(--background-color);
    }
    :host([aria-selected=true]):after {
        content: '';
        display: block;
        position: absolute;
        z-index: 2;
        left: 0;
        bottom: calc(-1 * var(--border-width));
        width: 100%;
        height: calc(var(--border-width) + 0.5rem);
        background-color: var(--background-color);
    }
    `],
    template: () => html`<slot></slot>`
})
export class Tab extends Component {

    private _panel: TabPanel | null = null;

    private _selected = false;

    private _disabled = false;

    @property({
        converter: AttributeConverterString,
    })
    role!: string;

    @property({
        attribute: 'aria-controls',
        converter: AttributeConverterString,
    })
    controls!: string;

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
    get selected (): boolean {

        return this._selected;
    }

    set selected (value: boolean) {

        this._selected = value;

        this.tabindex = this.disabled ? null : (value ? 0 : -1);
    }

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

    get panel (): TabPanel | null {

        if (!this._panel) {

            this._panel = document.getElementById(this.controls) as TabPanel;
        }

        return this._panel;
    }

    connectedCallback () {

        super.connectedCallback();

        this.role = 'tab'
        this.tabindex = this.disabled ? null : -1;
    }

    updateCallback (changes: Changes, firstUpdate: boolean) {

        if (firstUpdate) {

            if (this.panel) this.panel.labelledBy = this.id;
        }
    }

    select () {

        if (this.disabled) return;

        this.watch(() => this.selected = true);
    }

    deselect () {

        if (this.disabled) return;

        this.watch(() => this.selected = false);
    }

    @listener({ event: 'click' })
    protected handleClick (event: MouseEvent) {

        event.preventDefault();

        if (this.disabled) {

            return;
        }

        this.select();
    }
}
