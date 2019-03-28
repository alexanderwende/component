import { Component, component, html, property } from '../../../src';
import './accordion-header';
import './accordion-panel';

@component({
    selector: 'ui-accordion',
    template: () => html`
    <style>
        :host {
            display: flex;
            flex-direction: column;
            background: #fff;
            background-clip: border-box;
            box-sizing: border-box;
            border: var(--border-width, 0.125rem) solid var(--border-color, rgba(0,0,0,.25));
            border-radius: var(--border-radius, 0.25rem);
        }
    </style>
    <slot></slot>
    `
})
export class Accordion extends Component {

    @property({
        reflectAttribute: false
    })
    role = 'presentation';

    connectedCallback () {

        super.connectedCallback();

        this.role = 'presentation';
    }
}
