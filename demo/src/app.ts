import { CustomElement, customElement } from '../../src';
import './accordion/accordion';
import { template } from './app.template';
import './card';
import './checkbox';
import './tabs/tab';
import './tabs/tab-list';
import './tabs/tab-panel';
import './toggle';

@customElement({
    selector: 'demo-app',
    shadow: false,
    template: template
})
export class App extends CustomElement { }
