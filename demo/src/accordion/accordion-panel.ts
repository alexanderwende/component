import { CustomElement, customElement, html, property, AttributeConverterBoolean } from '../../../src';

let nextAccordionPanelId = 0;

@customElement({
    selector: 'ui-accordion-panel'
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

    updateCallback (changedProperties: Map<PropertyKey, any>, firstUpdate: boolean) {

        super.updateCallback(changedProperties, firstUpdate);

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

    protected template () {

        return html`
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
            </style>
            <div class="ui-accordion-header"
                id="${ this.id }-header"
                tabindex="${ this.disabled ? -1 : 0 }"
                role="button"
                aria-controls="${ this.id }-body"
                aria-expanded="${ this.expanded }"
                aria-disabled=${ this.disabled }
                @keydown="${ (event: KeyboardEvent) => (event.key === 'Enter' || event.key === ' ') && this.toggle() }"
                @click=${ this.toggle }>
                <slot name="ui-accordion-panel-header"></slot>
            </div>
            <div class="ui-accordion-body"
                id="${ this.id }-body"
                style="height: ${ this.contentHeight };"
                role="region"
                aria-hidden="${ !this.expanded }"
                aria-labelledby="${ this.id }-header">
                <slot name="ui-accordion-panel-body"></slot>
            </div>
        `;
    }
}
