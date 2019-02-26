import { CustomElement, customElement, html, listener } from '../../src';
import { css } from '../../src/css';

// we can define mixins as
const mixinContainer: (background?: string) => string = (background: string = '#fff') => css`
    background: ${ background };
    background-clip: border-box;
    box-sizing: border-box;
    border: var(--border-width, 0.125rem) solid var(--border-color, rgba(0,0,0,.25));
    border-radius: var(--border-radius, 0.25rem);
`;

const style = css`
:host {
    --max-width: 40ch;
    display: flex;
    flex-flow: column;
    max-width: var(--max-width);
    padding: 1rem;
    /* we can apply mixins with spread syntax */
    ${ mixinContainer() }
}
::slotted(*) {
    margin: 0;
}
`;

@customElement<Card>({
    selector: 'ui-card',
    styles: [style],
    template: card => html`
    <slot name="ui-card-header"></slot>
    <slot name="ui-card-body"></slot>
    <slot name="ui-card-footer"></slot>
    `
})
export class Card extends CustomElement {

    @listener({event: 'click'})
    handleClick (event: MouseEvent) {

        console.log(event);
    }
}

@customElement<ActionCard>({
    selector: 'ui-action-card',
    template: card => html`
    <slot name="ui-action-card-header"></slot>
    <slot name="ui-action-card-body"></slot>
    <slot name="ui-action-card-actions"></slot>
    `
})
export class ActionCard extends Card {

    // we can inherit styles explicitly
    static get styles () {
        return [
            ...super.styles,
            'slot[name=ui-action-card-actions] { display: block; text-align: right; }'
        ]
    }
}

@customElement<PlainCard>({
    selector: 'ui-plain-card',
    styles: [
        `:host {
            display: block;
            max-width: 40ch;
        }`
    ]
    // if we don't specify a template, it will be inherited
})
export class PlainCard extends Card { }
