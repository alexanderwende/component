import { Component, component, property, html } from '../../../src';
import { css } from '../../../src/css';

@component<Icon>({
    selector: 'ui-icon',
    styles: [css`
    :host {
        display: inline-flex;
        width: var(--line-height, 1.5em);
        height: var(--line-height, 1.5em);
        padding: calc((var(--line-height, 1.5em) - var(--font-size, 1em)) / 2);
        line-height: inherit;
        font-size: inherit;
        vertical-align: bottom;
        box-sizing: border-box;
    }
    svg {
        width: 100%;
        height: 100%;
        line-height: inherit;
        font-size: inherit;
        overflow: visible;
        fill: var(--icon-color, currentColor);
    }
    :host([data-set=uni]) {
        padding: 0em;
    }
    :host([data-set=mat]) {
        padding: 0;
    }
    :host([data-set=ei]) {
        padding: 0;
    }
    `],
    template: (element) => {
        const set = element.set;
        const icon = (set === 'mat')
            ? `ic_${ element.icon }_24px`
            : (set === 'ei')
                ? `ei-${ element.icon }-icon`
                : element.icon;

        return html`
        <svg focusable="false">
            <use href="${ (element.constructor as typeof Icon).getSprite(set) }#${ icon }"
            xlink:href="${ (element.constructor as typeof Icon).getSprite(set) }#${ icon }" />
        </svg>`;
    }
})
export class Icon extends Component {

    /**
     * A map for caching an icon set's sprite url
     */
    protected static _sprites: Map<string, string> = new Map();

    /**
     * Get the svg sprite url for the requested icon set
     *
     * @remarks
     * The sprite url for an icon set can be set through a `meta` tag in the html document. You can define
     * custom icon sets by chosing an identifier (such as `:myset` instead of `:fa`, `:mat` or `:ie`) and
     * configuring its location.
     *
     * ```html
     * <!doctype html>
     * <html>
     *    <head>
     *    <!-- supports multiple svg sprites -->
     *    <meta name="ui-icon:svg-sprite:fa" content="assets/icons/sprites/font-awesome/sprite.svg" />
     *    <meta name="ui-icon:svg-sprite:mat" content="assets/icons/sprites/material/sprite.svg" />
     *    <meta name="ui-icon:svg-sprite:ei" content="assets/icon/sprites/evil-icons/sprite.svg" />
     *    <!-- supports custom svg sprites -->
     *    <meta name="ui-icon:svg-sprite:myset" content="assets/icon/sprites/myset/my_sprite.svg" />
     *    </head>
     *    ...
     * </html>
     * ```
     *
     * When using the icon element, specify your custom icon set.
     *
     * ```html
     * <!-- use attributes -->
     * <ui-icon data-icon="my_icon_id" data-set="myset"></ui-icon>
     * <!-- or use property bindings within lit-html templates -->
     * <ui-icon .icon=${'my_icon_id'} .set=${'myset'}></ui-icon>
     * ```
     *
     * If no sprite url is specified for a set, the icon element will attempt to use an svg icon from
     * an inlined svg element in the current document.
     */
    protected static getSprite (set: string): string {

        if (!this._sprites.has(set)) {

            const meta = document.querySelector(`meta[name="ui-icon:sprite:${ set }"][content]`);

            if (meta) {

                this._sprites.set(set, meta.getAttribute('content')!);
            }
        }

        return this._sprites.get(set) || '';
    }

    @property({
        attribute: 'data-icon'
    })
    icon = 'info';

    @property({
        attribute: 'data-set'
    })
    set = 'fa'

    connectedCallback () {

        super.connectedCallback();

        this.setAttribute('role', 'img');
        this.setAttribute('aria-hidden', 'true');
    }
}
