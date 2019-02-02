import { html, TemplateResult } from 'lit-html';
import { customElement, CustomElement, property } from '../../src';
import { listener } from '../../src/decorators/listener';

@customElement({
    selector: 'check-box'
})
export class Checkbox extends CustomElement {

    @property({
        observe: false,
        reflect: true
    })
    role = 'checkbox';

    // TODO: what if we want to bind multiple attributes to a property, e.g.: checked and aria-selected
    @property({
        attribute: 'aria-checked',
        reflect: true,
        notify: true,
        toAttribute: (value) => value ? 'true' : null,
        fromAttribute: (value) => value !== null
    })
    checked = false;

    constructor () {

        super();
    }

    @listener({
        event: 'click'
    })
    onClick (event: MouseEvent) {

        this.checked = !this.checked;
    }

    template (): TemplateResult {

        return html`
            <style>
                :host {
                    display: inline-block;
                    width: 1rem;
                    height: 1rem;
                    border: 1px solid #999;
                }
                :host([checked=true]) {
                    background-color: #ccc;
                }
            </style>`;
    }
}
