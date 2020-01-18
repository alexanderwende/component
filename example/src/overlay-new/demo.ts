import { Changes, Component, component, selector, css } from '@partkit/component';
import { html } from 'lit-html';
import './overlay';
import { Overlay } from './overlay';
import { OverlayConfig } from './overlay-config';

@component<OverlayDemoComponent>({
    selector: 'overlay-demo',
    styles: [css`
    :host {
        display: block;
        padding-bottom: 20rem;
    }
    `],
    template: element => html`
    <h2>Overlay</h2>

    <h3>Default Overlay</h3>

    <p>An overlay with its default configuration. The overlay is opened and closed programmatically.</p>

    <button @click=${ element.toggleOverlay }>Toggle Overlay</button>

    <ui-overlay id="overlay">
        <h3>Overlay</h3>
        <p>This is the overlay's content.</p>
        <p>Some interactive elements showcase the auto-focus and focus-trap behavior of the overlay.</p>
        <p>
            <label>Some text field <input type="text" placeholder=""/></label>
        </p>
        <p>
            <label>Some checkbox <input type="checkbox"/></label>
        </p>
        <p>
            <button>Some button</button>
        </p>
    </ui-overlay>

    <h3>Programmatic Overlay</h3>

    <p>An overlay which is created via the static Overlay.create() method.</p>

    <button @click=${ element.toggleProgrammaticOverlay }>Toggle Overlay</button>

    <h3>Tooltip</h3>

    <p>An overlay which is configured as a tooltip, with its <code>trigger-type</code> being <code>"tooltip"</code> and <code>position-type</code> being <code>"connected"</code>. Tooltips should not be stacked, as they are not considered active - meaning, they usually don't receive focus and are not interactive.</p>

    <p>This is some sample text with a <a href="#" id="tooltip-trigger">tooltip</a>.</p>

    <ui-overlay id="tooltip" .config=${ element.tooltipConfig }>
        <p>This is the tooltip content.</p>
    </ui-overlay>

    <h3>Dialog</h3>

    <p>An overlay which is configured as a dialog, with its <code>trigger-type</code> being <code>"dialog"</code> and <code>position-type</code> being <code>"connected"</code>.</p>
    <p>The dialog itself contains 2 nested dialogs to showcase overlay's stacking feature and focus management.</p>

    <button id="dialog-button">Toggle Dialog</button>

    <ui-overlay id="dialog" .config=${ element.dialogConfig }>
        <h3>Dialog</h3>
        <p>This is some dialog content.</p>
        <p>
            <button id="nested-dialog-button">Nested dialog 1</button>
            <button id="nested-dialog-button-2">Nested dialog 2</button>
        </p>
        <ui-overlay
            id="nested-dialog"
            trigger-type="dialog"
            position-type="connected"
            .trigger=${ element.nestedDialogButton }
            .origin=${ element.nestedDialogButton }>
            <h3>Nested Dialog 1</h3>
            <p>This is some dialog content.</p>
        </ui-overlay>
        <ui-overlay
            id="nested-dialog-2"
            trigger-type="dialog"
            position-type="connected"
            .trigger=${ element.nestedDialogButton2 }
            .origin=${ element.nestedDialogButton2 }>
            <h3>Nested Dialog 2</h3>
            <p>This is some dialog content.</p>
        </ui-overlay>
    </ui-overlay>
    `
})
export class OverlayDemoComponent extends Component {

    @selector({ query: '#overlay' })
    overlay!: Overlay;

    @selector({ query: '#dialog' })
    dialog!: Overlay;

    @selector({ query: '#dialog-button' })
    dialogButton!: HTMLButtonElement;

    @selector({ query: '#nested-dialog' })
    nestedDialog!: Overlay;

    @selector({ query: '#nested-dialog-button' })
    nestedDialogButton!: HTMLButtonElement;

    @selector({ query: '#nested-dialog-2' })
    nestedDialog2!: Overlay;

    @selector({ query: '#nested-dialog-button-2' })
    nestedDialogButton2!: HTMLButtonElement;

    @selector({ query: '#tooltip-trigger' })
    tooltipTrigger!: HTMLSpanElement;

    get dialogConfig (): Partial<OverlayConfig> {
        return {
            triggerType: 'dialog',
            positionType: 'connected',
            trigger: this.dialogButton,
            origin: this.dialogButton,
        };
    }

    get tooltipConfig (): Partial<OverlayConfig> {
        return {
            triggerType: 'tooltip',
            positionType: 'connected',
            alignment: {
                origin: {
                    horizontal: 'center',
                    vertical: 'start',
                },
                target: {
                    horizontal: 'center',
                    vertical: 'end',
                },
                offset: {
                    horizontal: 0,
                    vertical: '1rem'
                }
            },
            trigger: this.tooltipTrigger,
            origin: this.tooltipTrigger,
            stacked: false,
        }
    }

    updateCallback (changes: Changes, firstUpdate: boolean) {


    }

    toggleOverlay () {

        this.overlay.open = !this.overlay.open;
    }

    toggleProgrammaticOverlay () {


    }
}
