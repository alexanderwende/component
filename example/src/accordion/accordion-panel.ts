import { AttributeConverterBoolean, AttributeConverterNumber, Changes, Component, component, css, property } from '@partkit/component';
import { html } from 'lit-html';
import { copyright, CopyrightHelper } from '../helpers/copyright';
import { AccordionHeader } from './accordion-header';

let nextAccordionPanelId = 0;

@component<AccordionPanel>({
    selector: 'ui-accordion-panel',
    styles: [css`
    :host {
        display: flex;
        flex-direction: column;
    }
    :host > .ui-accordion-header {
        display: flex;
        flex-flow: row;
    }
    :host > .ui-accordion-body {
        height: auto;
        overflow: auto;
        transition: height .2s ease-out;
    }
    :host > .ui-accordion-body[aria-hidden=true] {
        height: 0;
        overflow: hidden;
    }
    .copyright {
        padding: 0 1rem 1rem;
        color: var(--disabled-color, '#ccc');
        font-size: 0.75rem;
    }
    `],
    template: (panel, copyright: CopyrightHelper) => html`
    <div class="ui-accordion-header"
        role="heading"
        aria-level="${ panel.level }"
        @click=${ panel.toggle }>
        <slot name="header"></slot>
    </div>
    <div class="ui-accordion-body"
        id="${ panel.id }-body"
        style="height: ${ panel.contentHeight };"
        role="region"
        aria-hidden="${ !panel.expanded }"
        aria-labelledby="${ panel.id }-header">
        <slot></slot>
        <span class="copyright">${ copyright(new Date(), 'Alexander Wende') }</span>
    </div>
    `
})
export class AccordionPanel extends Component {

    protected _header: AccordionHeader | null = null;
    protected _body: HTMLElement | null = null;

    protected get contentHeight (): string {

        return !this.expanded ?
            '0px' :
            this._body ?
                `${ this._body.scrollHeight }px` :
                'auto';
    }

    @property({
        converter: AttributeConverterNumber
    })
    level = 1;

    @property({
        converter: AttributeConverterBoolean
    })
    expanded = false;

    @property({
        converter: AttributeConverterBoolean
    })
    disabled = false;

    constructor () {

        super();

        this.id = this.id || `ui-accordion-panel-${ nextAccordionPanelId++ }`;
    }

    toggle () {

        if (this.disabled) return;

        // wrapping the property change in the watch method will dispatch a property change event
        this.watch(() => {

            this.expanded = !this.expanded;
            if (this._header) this._header.expanded = this.expanded;
        });
    }

    connectedCallback () {

        super.connectedCallback();

        this.setHeader(this.querySelector(AccordionHeader.selector));
    }

    updateCallback (changes: Changes, firstUpdate: boolean) {

        if (firstUpdate) {

            // in the first update, we query the accordion-panel-body
            this._body = this.renderRoot.querySelector(`#${ this.id }-body`);

            // having queried the accordion-panel-body, {@link contentHeight} can now calculate the
            // correct height of the panel body for animation
            // in order to re-evaluate the template binding for {@link contentHeight} we need to
            // trigger another render (this is cheap, only contentHeight has changed and will be updated)
            // however we cannot request another update while we are still in the current update cycle
            // using a Promise, we can defer requesting the update until after the current update is done
            Promise.resolve(true).then(() => this.requestUpdate());
        }
    }

    /**
     * Override the render method to inject custom helpers into the template
     */
    protected render () {

        super.render(copyright);
    }

    protected setHeader (header: AccordionHeader | null) {

        this._header = header;

        if (!header) return;

        header.setAttribute('slot', 'header');

        header.id = header.id || `${ this.id }-header`;
        header.controls = `${ this.id }-body`;
        header.expanded = this.expanded;
        header.disabled = this.disabled;
    }
}
