import { CustomElement, customElement, TemplateResult, html } from '../../src';

@customElement({
    selector: 'ui-card'
})
export class Card extends CustomElement {

    template (): TemplateResult {

        return html`
            <style>
                :host {
                    display: inline-flex;
                    flex-flow: column;
                    background: #fff;
                    border: 1px solid rgba(0,0,0,.1);
                }
                ::slotted(*) {
                    margin: 0;
                }
            </style>
            <slot name="ui-card-header"></slot>
            <slot name="ui-card-body"></slot>
            <slot name="ui-card-footer"></slot>
        `;
    }
}
