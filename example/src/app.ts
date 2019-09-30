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
import './popover/popover';

@component({
    selector: 'demo-app',
    shadow: false,
    styles: [styles],
    template: template
})
export class App extends Component {

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
