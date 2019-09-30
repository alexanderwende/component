import { AttributeConverter, AttributeConverterARIABoolean, AttributeConverterString, Component, component, css, property, Changes } from "@partkit/component";
import { html } from "lit-html";

export interface HiddenChangeEvent extends CustomEvent {
    type: 'hidden-change';
    detail: {
        hidden: boolean;
    }
}

@component({
    selector: 'ui-popover',
    styles: [css`
    :host {
        display: block;
        position: absolute;
        box-sizing: border-box;
        border: 2px solid #bfbfbf;
        background-color: #fff;
        border-radius: 4px;
    }
    :host([aria-hidden=true]) {
        display: none;
    }
    `],
    template: () => html`<slot></slot>`
})
export class Popover extends Component {

    @property({
        converter: AttributeConverterString
    })
    role!: string;

    @property({
        attribute: 'aria-hidden',
        converter: AttributeConverterARIABoolean,
        reflectAttribute: false,
    })
    hidden!: boolean;

    @property({
        converter: AttributeConverterString
    })
    trigger!: string;

    protected triggerElement: HTMLElement | null = null;

    protected triggerListener: EventListener | null = null;

    connectedCallback () {

        if (this.parentElement !== document.body) {

            document.body.appendChild(this);

            return;
        }

        super.connectedCallback();

        this.role = 'dialog';

        this.hidden = true;
    }

    updateCallback (changes: Changes, firstUpdate: boolean) {

        if (changes.has('trigger')) {

            this.updateTrigger(document.getElementById(this.trigger)!);
        }
    }

    open () {

        if (this.hidden) {

            this.watch(() => this.hidden = false);
        }
    }

    close () {

        if (!this.hidden) {

            this.watch(() => this.hidden = true);
        }
    }

    toggle () {

        if (this.hidden) {

            this.open();

        } else {

            this.close();
        }
    }

    protected updateTrigger (triggerElement: HTMLElement) {

        if (this.triggerElement && this.triggerListener) {

            if (this.triggerListener) this.triggerElement.removeEventListener('click', this.triggerListener);
        }

        this.triggerElement = triggerElement;
        this.triggerListener = (event) => this.toggle();

        this.triggerElement.addEventListener('click', this.triggerListener);
    }
}
