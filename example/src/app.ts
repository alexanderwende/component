import { Component, component, property } from '@partkit/component';
import './accordion/accordion';
import { styles } from './app.styles';
import { template } from './app.template';
import './card';
import './checkbox';
import './icon/icon';
import './tabs/tab';
import './tabs/tab-list';
import './tabs/tab-panel';
import './toggle';
import './overlay/overlay';
import { OverlayService } from './overlay/overlay-service';
import { html } from 'lit-html';
import { Overlay } from './overlay/overlay';
import { ConnectedPositionStrategy } from "./position/position-strategy";

@component({
    selector: 'demo-app',
    shadow: false,
    styles: [styles],
    template: template
})
export class App extends Component {

    protected overlayService = new OverlayService();

    protected overlay?: Overlay;

    protected timeout!: number;

    @property({
        attribute: false
    })
    counter = 0;

    connectedCallback () {

        super.connectedCallback();

        this.count();
    }

    disconnectedCallback () {

        super.disconnectedCallback();

        this.stop();
    }

    confirm () {

        alert(`You confirmed at ${ this.counter }.`);
    }

    cancel () {

        alert(`You cancelled at ${ this.counter }.`);
    }

    showOverlay () {

        if (!this.overlay) {

            // create a template function in the app component's context
            const template = () => html`
                <h3>Programmatic Overlay</h3>
                <p>This is the content of the popover: ${ this.counter }</p>
                <p><button @click=${ this.closeOverlay }>Got it</button></p>
            `;

            // pass the template function and a reference to the template's context (the app component)
            // to the overlay service
            this.overlay = this.overlayService.createOverlay(template, this);
        }

        this.overlayService.openOverlay(this.overlay);
    }

    closeOverlay () {

        // if (this.overlay) this.overlayService.closeOverlay(this.overlay);

        if (this.overlay) {

            this.overlayService.destroyOverlay(this.overlay);

            this.overlay = undefined;
        }
    }

    protected count () {

        this.timeout = setTimeout(() => {

            this.counter++;

            this.count();

        }, 1000);
    }

    protected stop () {

        clearTimeout(this.timeout);

        this.counter = 0;
    }
}
