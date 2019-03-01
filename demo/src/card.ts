import { CustomElement, customElement, html, listener, property } from '../../src';
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
    <div>Worker counter: ${ card.counter }</div>
    <button>Stop worker</button>
    `
})
export class Card extends CustomElement {

    @property({
        attribute: false
    })
    counter!: number;

    worker!: Worker;

    connectedCallback () {

        super.connectedCallback();

        this.worker = new Worker('worker.js');
    }

    disconnectedCallback () {

        super.disconnectedCallback();

        this.worker.terminate();
    }

    @listener<Card>({
        event: 'click',
        target: function () { return this._renderRoot.querySelector('button')!; }
    })
    handleClick (event: MouseEvent) {

        this.worker.terminate();
    }

    @listener<Card>({
        event: 'message',
        target: function () { return this.worker; }
    })
    handleMessage (event: MessageEvent) {

        this.watch(() => this.counter = event.data);
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

    @listener({ event: null })
    handleClick () { }

    @listener({ event: null })
    handleMessage () { }
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
