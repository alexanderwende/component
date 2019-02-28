import { AttributeConverterString, Changes, CustomElement, customElement, html, listener, property } from '../../../src';
import { ARIABooleanConverter } from '../aria-boolean-converter';
import { TabPanel } from './tab-panel';
import { css } from '../../../src/css';

@customElement({
    selector: 'ui-tab',
    styles: [css`
    :host {
        position: relative;
        display: inline-flex;
        flex-flow: row;
        margin-right: 0.25rem;
        padding: 0 0.5rem;
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
        height: var(--border-width);
        background-color: var(--background-color);
    }
    `],
    template: () => html`<slot></slot>`
})
export class Tab extends CustomElement {

    private _panel: TabPanel | null = null;

    private _selected = false;

    @property({
        converter: AttributeConverterString,
    })
    role!: string;

    @property({
        attribute: 'aria-controls',
        converter: AttributeConverterString,
    })
    controls!: string;

    @property({
        attribute: 'aria-selected',
        converter: ARIABooleanConverter
    })
    get selected (): boolean {

        return this._selected;
    }

    set selected (value: boolean) {

        this._selected = value;
        this.tabIndex = value ? 0 : -1;
    }

    @property({
        attribute: 'aria-disabled',
        converter: ARIABooleanConverter,
    })
    disabled!: boolean;

    get panel (): TabPanel | null {

        if (!this._panel) {

            this._panel = document.getElementById(this.controls) as TabPanel;
        }

        return this._panel;
    }

    connectedCallback () {

        super.connectedCallback();

        this.role = 'tab'
        this.tabIndex = -1;
    }

    updateCallback (changes: Changes, firstUpdate: boolean) {

        if (firstUpdate) {

            if (this.panel) this.panel.labelledBy = this.id;
        }

        if (this.panel) this.panel.hidden = !this.selected;
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

        if (this.disabled) {

            event.preventDefault();
            return;
        }

        this.select();
    }
}
