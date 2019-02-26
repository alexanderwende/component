import { CustomElement, customElement, property, html } from '../../../src';
import { css } from '../../../src/css';

@customElement<FAIcon>({
    selector: 'ui-icon',
    styles: [css`
    :host {
        display: inline-flex;
        width: 1em;
        height: 1em;
        line-height: inherit;
        font-size: inherit;
        vertical-align: var(--icon-vertical-align, -0.1875em);
    }
    svg {
        width: 100%;
        line-height: inherit;
        font-size: inherit;
        overflow: visible;
        fill: var(--icon-color, currentColor);
    }
    `],
    template: icon => html`
    <svg>
        <use href="${ (icon.constructor as typeof FAIcon).iconSprite }#${ icon.icon }"
        xlink:href="${ (icon.constructor as typeof FAIcon).iconSprite }#${ icon.icon }" />
    </svg>`
})
export class FAIcon extends CustomElement {

    protected static _iconSprite: string;

    // TODO: Loading from CDN does not work!
    /**
     * The icon sprite url
     *
     * @remarks
     * Can be set through a meta tag in the html document to point to a custom location, otherwise
     * it will use the CDN location.
     *
     * ```html
     * <!doctype html>
     * <html>
     *    <head>
     *    <meta name="fa:icon-sprite" content="assets/icons/sprites/solid.svg" />
     *    </head>
     *    ...
     * </html>
     * ```
     */
    protected static get iconSprite (): string {

        if (!this._iconSprite) {

            const meta = document.querySelector('meta[name="fa:icon-sprite"][content]');

            this._iconSprite = meta
                ? meta.getAttribute('content')!
                : 'https://use.fontawesome.com/releases/v5.7.2/sprites/solid.svg';
        }

        return this._iconSprite;
    }

    @property({
        attribute: 'data-icon'
    })
    icon = 'info';

    connectedCallback () {

        super.connectedCallback();

        this.setAttribute('role', 'img');
        this.setAttribute('aria-hidden', 'true');
    }
}
