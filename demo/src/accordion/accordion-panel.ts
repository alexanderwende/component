import { AttributeConverterBoolean, Changes, CustomElement, customElement, html, property } from '../../../src';
import { copyright, CopyrightHelper } from '../helpers/copyright';

let nextAccordionPanelId = 0;

@customElement<AccordionPanel>({
    selector: 'ui-accordion-panel',
    template: (panel, copyright: CopyrightHelper) => html`
    <style>
        :host {
            display: flex;
            flex-direction: column;
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
        *:focus {
            outline: none;
            box-shadow: var(--focus-shadow);
        }
        .copyright {
            padding: 0 1rem 1rem;
            color: var(--disabled-color, '#ccc');
            font-size: 0.75rem;
        }
    </style>
    <div class="ui-accordion-header"
        id="${ panel.id }-header"
        tabindex="${ panel.disabled ? -1 : 0 }"
        role="button"
        aria-controls="${ panel.id }-body"
        aria-expanded="${ panel.expanded }"
        aria-disabled=${ panel.disabled }
        @keydown="${ (event: KeyboardEvent) => (event.key === 'Enter' || event.key === ' ') && panel.toggle() }"
        @click=${ panel.toggle }>
        <slot name="ui-accordion-panel-header"></slot>
    </div>
    <div class="ui-accordion-body"
        id="${ panel.id }-body"
        style="height: ${ panel.contentHeight };"
        role="region"
        aria-hidden="${ !panel.expanded }"
        aria-labelledby="${ panel.id }-header">
        <slot name="ui-accordion-panel-body"></slot>
        <span class="copyright">${ copyright(new Date(), 'Alexander Wende') }</span>
    </div>
    `
})
export class AccordionPanel extends CustomElement {

    protected _body: HTMLElement | null = null;

    protected get contentHeight (): string {

        return !this.expanded ?
            '0px' :
            this._body ?
                `${ this._body.scrollHeight }px` :
                'auto';
    }

    @property({
        converter: AttributeConverterBoolean
    })
    expanded = false;

    @property({
        converter: AttributeConverterBoolean
    })
    disabled = false;

    id = `ui-accordion-panel-${ nextAccordionPanelId++ }`;

    toggle () {

        if (this.disabled) return;

        // wrapping the property change in the watch method will dispatch a property change event
        this.watch(() => {

            this.expanded = !this.expanded;
        });
    }

    updateCallback (changedProperties: Changes, firstUpdate: boolean) {

        if (firstUpdate) {

            // in the first update, we query the accordion-panel-body
            this._body = this._renderRoot.querySelector(`#${ this.id }-body`);

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
}
