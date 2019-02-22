import { CustomElement, customElement, html } from '../../src';

@customElement<Card>({
    selector: 'ui-card',
    template: card => html`
    <style>
        :host {
            display: flex;
            flex-flow: column;
            max-width: 40ch;
            padding: 1rem;
            background: #fff;
            background-clip: border-box;
            box-sizing: border-box;
            border: var(--border-width, 0.125rem) solid var(--border-color, rgba(0,0,0,.25));
            border-radius: var(--border-radius, 0.25rem);
        }
        ::slotted(*) {
            margin: 0;
        }
    </style>
    <slot name="ui-card-header"></slot>
    <slot name="ui-card-body"></slot>
    <slot name="ui-card-footer"></slot>
    `
})
export class Card extends CustomElement { }
