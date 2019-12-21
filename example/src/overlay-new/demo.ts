import { Component, component, Changes } from '@partkit/component';
import { html } from 'lit-html';
import { Overlay } from './overlay';
import './overlay';

@component<OverlayDemoComponent>({
    selector: 'overlay-demo',
    template: element => html`
    <h2>Overlay</h2>

    <button @click=${ element.changeRole }>Change Role</button>
    <button @click=${ element.toggle }>Toggle</button>

    <ui-overlay role="listbox">
        <h3>Overlay</h3>
        <p>This is some overlay content.</p>
    </ui-overlay>
    `
})
export class OverlayDemoComponent extends Component {

    roles = ['dialog', 'menu', 'tooltip'];

    currentRole = 0;

    overlay!: Overlay;

    updateCallback (changes: Changes, firstUpdate: boolean) {

        if (firstUpdate) {

            this.overlay = this.renderRoot.querySelector('ui-overlay') as Overlay;
        }
    }

    changeRole () {

        this.currentRole = (this.currentRole + 1 < this.roles.length) ? this.currentRole + 1 : 0;

        this.overlay.role = this.roles[this.currentRole];
    }

    toggle () {

        this.overlay.open = !this.overlay.open;
    }
}
