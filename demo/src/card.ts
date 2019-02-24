import { CustomElement, customElement, html, Changes } from '../../src';
import { kebabCase } from '../../src/decorators/utils/string-utils';
import * as CSS from 'csstype';

interface Style extends CSS.Properties, CSS.PropertiesHyphen {}

type Selector = CSS.Pseudos | CSS.AtRules | string;

type StyleRule = [Selector, Style];
type StyleRules = StyleRule[];

function declarationsText (declarations: Style): string {

    return `{ ${ Object.entries(declarations)
        .map(([property, value]) => `${ kebabCase(property) }: ${ value };`)
        .join(' ') } }`;
}

function ruleText (rule: StyleRule): string {

    const [selector, declarations] = rule;

    return `${ selector } ${ declarationsText(declarations) }`;
}

function css (rules: StyleRules) {

    return ({

        _rules: [] as string[],

        _text: '',

        rules () {

            if (!this._rules.length) {

                this._rules = rules.map(rule => ruleText(rule));
            }

            console.log(this._rules);

            return this._rules;
        },

        text () {

            if (!this._text) {

                this._text = this.rules().join('\n');
            }

            console.log(this._text);

            return this._text;
        },

        style (element: any) {

            // TODO: try constructable stylesheets
            const style = document.createElement('style');
            const sheet = style.sheet as CSSStyleSheet;

            this.rules().forEach((rule, index) => sheet.insertRule(rule, index));
        }
    });
};

// we can define mixins as
const mixinContainer: (background?: string) => Style = (background: string = '#fff') => ({
    background: background,
    backgroundClip: 'border-box',
    boxSizing: 'border-box',
    border: 'var(--border-width, 0.125rem) solid var(--border-color, rgba(0,0,0,.25))',
    borderRadius: 'var(--border-radius, 0.25rem)'
});

const style = css([
    [':host', {
        ['--max-width' as any]: '40ch',
        display: 'flex',
        flexFlow: 'column',
        maxWidth: 'var(--max-width)',
        padding: '1rem',
        // we can apply mixins with spread syntax
        ...mixinContainer()
    }],
    ['::slotted(*)', {
        margin: '0'
    }]
]);

@customElement<Card>({
    selector: 'ui-card',
    styles: style.rules(),
    template: card => html`
    <slot name="ui-card-header"></slot>
    <slot name="ui-card-body"></slot>
    <slot name="ui-card-footer"></slot>
    `
})
export class Card extends CustomElement { }

@customElement<ActionCard>({
    selector: 'ui-action-card',
    template: card => html`
    <slot name="ui-action-card-header"></slot>
    <slot name="ui-action-card-body"></slot>
    <slot name="ui-action-card-actions"></slot>
    `
})
export class ActionCard extends Card {

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
    ],
    template: card => html`
    <slot name="ui-plain-card-header"></slot>
    <slot name="ui-plain-card-body"></slot>
    <slot name="ui-plain-card-footer"></slot>
    `
})
export class PlainCard extends Card { }
