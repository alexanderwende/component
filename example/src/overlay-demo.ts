import { Component, component, property } from '@partkit/component';
import { html } from 'lit-html';
import './overlay/overlay';
import { Overlay } from './overlay/overlay';
import { OverlayConfig } from './overlay/overlay-config';
import { OverlayService } from './overlay/overlay-service';

const customOverlayConfig: Partial<OverlayConfig> = {
    alignment: {
        origin: {
            horizontal: 'start',
            vertical: 'start',
        },
        target: {
            horizontal: 'start',
            vertical: 'end',
        },
        offset: {
            horizontal: 0,
            vertical: 0,
        }
    }
};

const tooltipOverlayConfig: Partial<OverlayConfig> = {
    backdrop: false,
    trapFocus: false,
    stacked: false,
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
            vertical: 10,
        }
    }
};

@component<OverlayDemoComponent>({
    selector: 'overlay-demo',
    shadow: false,
    template: (element) => html`
    <button id="overlay">Show Overlay</button>

    <ui-overlay controller="#overlay" controller-type="dialog" position-type="connected" origin="#overlay" .config=${ customOverlayConfig }>
        <h3>Overlay</h3>
        <p>This is the content of the overlay: ${ element.counter }</p>
        <p>
            This is an input: <input type="text"/>
        </p>
        <p>
            This button opens another overlay:

            <button id="another-overlay">Another Overlay</button>
        </p>
    </ui-overlay>

    <ui-overlay controller="#another-overlay" controller-type="dialog" position-type="connected" origin="#another-overlay">
        <h3>Another Overlay</h3>
        <p>Just some static content...</p>
    </ui-overlay>

    <button id="overlay-programmatic" @click=${ element.showOverlay }>Show programmatic overlay</button>

    <p>We have <a href="#" id="tooltip">tooltips</a> too...</p>

    <ui-overlay controller="#tooltip" controller-type="tooltip" position-type="connected" origin="#tooltip" .config=${ tooltipOverlayConfig }>
        <p>I am the tooltip content.</p>
    </ui-overlay>

    <ui-overlay controller="#tooltip" controller-type="dialog" position-type="connected" origin="#tooltip">
        <p>I'm another overlay on the tooltip trigger.</p>
    </ui-overlay>
    `
})
export class OverlayDemoComponent extends Component {

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

    showOverlay (event: Event) {

        if (!this.overlay) {

            // create a template function in the app component's context
            const template = () => html`
                <h3>Programmatic Overlay</h3>
                <p>This is the content of the popover: ${ this.counter }</p>
                <p><button @click=${ this.closeOverlay }>Got it</button></p>
            `;

            const trigger = event.target as HTMLElement;

            // pass the template function and a reference to the template's context (the app component)
            // to the overlay service
            this.overlay = this.overlayService.createOverlay({ positionType: 'centered', controllerType: 'default', template: template, context: this, stacked: true, trapFocus: true, autoFocus: true });
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
