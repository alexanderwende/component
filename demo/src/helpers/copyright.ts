import { html, TemplateResult } from 'lit-html';
import { capitalize } from '../../../src/decorators/utils/string-utils';

export type CopyrightHelper = (date: Date, author: string) => TemplateResult;

export const copyright: CopyrightHelper = (date: Date, author: string): TemplateResult => {

    return html`&copy; Copyright ${ date.getFullYear() } ${ author.trim() }`;
}
