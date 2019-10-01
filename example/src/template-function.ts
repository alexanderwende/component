import { TemplateResult } from 'lit-html';

export type TemplateFunction = (context: HTMLElement, ...helpers: any[]) => TemplateResult | void;
