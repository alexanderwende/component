import { AttributeConverterString, CustomElement, customElement, html, property, listener } from '../../../src';
import { ARIABooleanConverter } from '../aria-boolean-converter';
import { TabPanel } from './tab-panel';

@customElement({
    selector: 'ui-tab',
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

    updateCallback (changes: Map<PropertyKey, any>, firstUpdate: boolean) {

        super.updateCallback(changes, firstUpdate);

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
