import { Component, component } from '@partkit/component';
import './accordion/accordion';
import { styles } from './app.styles';
import { template } from './app.template';
import './card';
import './checkbox';
import './icon/icon';
import './overlay-new/demo';
import './tabs/tab';
import './tabs/tab-list';
import './tabs/tab-panel';
import './toggle';

@component({
    selector: 'demo-app',
    shadow: false,
    styles: [styles],
    template: template
})
export class App extends Component { }
