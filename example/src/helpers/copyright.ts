import { html, TemplateResult } from 'lit-html';

export type CopyrightHelper = (date: Date, author: string) => TemplateResult;

export const copyright: CopyrightHelper = (date: Date, author: string): TemplateResult => {

    return html`&copy; Copyright ${ date.getFullYear() } ${ author.trim() }`;
}
