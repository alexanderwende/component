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

@component({
    selector: 'demo-app',
    shadow: false,
    styles: [styles],
    template: template
})
export class App extends Component {

    protected overlayService = new OverlayService();

    @property({
        attribute: false
    })
    counter = 0;

    protected timeout!: number;

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

        const content = html`
        <h3>Programmatic Overlay</h3>
        <p>This is the content of the popover: ${ this.counter }</p>
        `;

        const overlay = this.overlayService.createOverlay(content);

        this.overlayService.openOverlay(overlay);

        console.log(this.overlayService);
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
