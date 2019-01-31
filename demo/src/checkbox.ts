import { html, TemplateResult } from 'lit-html';
import { customElement, CustomElement, property } from '../../src';

@customElement({
    selector: 'check-box'
})
export class Checkbox extends CustomElement {

    @property({
        reflect: true,
        notify: true
    })
    checked = false;

    constructor () {

        super();

        this.addEventListener('click', this.onClick.bind(this));
    }

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
