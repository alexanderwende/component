import { Component, component, css, html, property } from '../../../src';
import { FocusKeyManager } from '../list-key-manager';
import './accordion-header';
import { AccordionHeader } from './accordion-header';
import './accordion-panel';

@component({
    selector: 'ui-accordion',
    styles: [css`
    :host {
        display: flex;
        flex-direction: column;
        background: #fff;
        background-clip: border-box;
        box-sizing: border-box;
        border: var(--border-width, 0.125rem) solid var(--border-color, rgba(0,0,0,.25));
        border-radius: var(--border-radius, 0.25rem);
    }
    `],
    template: () => html`
    <slot></slot>
    `
})
export class Accordion extends Component {

    protected focusManager!: FocusKeyManager<AccordionHeader>;

    @property({
        reflectAttribute: false
    })
    role = 'presentation';

    connectedCallback () {

        super.connectedCallback();

        this.role = 'presentation';

        this.focusManager = new FocusKeyManager(this, this.querySelectorAll(AccordionHeader.selector));
    }
}
