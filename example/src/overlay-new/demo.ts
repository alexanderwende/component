import { Changes, Component, component, selector } from '@partkit/component';
import { html } from 'lit-html';
import { CONNECTED_POSITION_CONFIG } from '../position';
import './overlay';
import { Overlay } from './overlay';
import { DEFAULT_OVERLAY_CONFIG, OverlayConfig } from './overlay-config';
import { DIALOG_OVERLAY_TRIGGER_CONFIG } from './trigger';

const CONFIG: Partial<OverlayConfig> = {

};

const DIALOG_CONFIG = {
    ...DEFAULT_OVERLAY_CONFIG,
    ...DIALOG_OVERLAY_TRIGGER_CONFIG,
    ...CONNECTED_POSITION_CONFIG
}

@component<OverlayDemoComponent>({
    selector: 'overlay-demo',
    template: element => html`
    <h2>Overlay</h2>

    <button @click=${ element.changeRole }>Change Role</button>
    <button @click=${ element.toggle }>Toggle</button>

    <ui-overlay id="overlay">
        <h3>Overlay</h3>
        <p>This is some overlay content.</p>
        <p>
            <input type="text" placeholder="Search term..."/> <button>Search</button>
        </p>
    </ui-overlay>

    <button id="dialog-button">Dialog</button>

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
            <h3>Nested Dialog</h3>
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

    roles = ['dialog', 'menu', 'tooltip'];

    currentRole = 0;

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

    get dialogConfig (): Partial<OverlayConfig> {
        return {
            triggerType: 'dialog',
            positionType: 'connected',
            trigger: this.dialogButton,
            origin: this.dialogButton,
        };
    }

    updateCallback (changes: Changes, firstUpdate: boolean) {

        console.log('Demo.updateCallback()... firstUpdate: ', firstUpdate);

        if (firstUpdate) {

        }
    }

    changeRole () {

        this.currentRole = (this.currentRole + 1 < this.roles.length) ? this.currentRole + 1 : 0;

        this.overlay.role = this.roles[this.currentRole];

        this.requestUpdate();
    }

    toggle () {

        this.overlay.open = !this.overlay.open;
    }
}
