import { Component, component, css, property, AttributeConverterBoolean } from "@partkit/component";

@component({
    selector: 'ui-overlay-backdrop',
    styles: [css`
    :host {
        display: block;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: var(--overlay-backdrop-background);
    }
    :host([hidden]) {
        display: none;
    }
    :host([transparent]) {
        background: transparent;
    }
    `]
})
export class OverlayBackdrop extends Component {

    @property({
        converter: AttributeConverterBoolean
    })
    hidden!: boolean;

    @property({
        converter: AttributeConverterBoolean
    })
    transparent = false;

    connectedCallback () {

        super.connectedCallback();

        this.hidden = true;
    }

    show () {

        this.watch(() => this.hidden = false);
    }

    hide () {

        this.watch(() => this.hidden = true);
    }
}
