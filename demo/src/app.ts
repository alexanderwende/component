import { Component, component } from '../../src';
import './accordion/accordion';
import { template } from './app.template';
import './card';
import './checkbox';
import './icon/icon';
import './tabs/tab';
import './tabs/tab-list';
import './tabs/tab-panel';
import './toggle';
import { styles } from './app.styles';

@component({
    selector: 'demo-app',
    shadow: false,
    styles: [styles],
    template: template
})
export class App extends Component { }
