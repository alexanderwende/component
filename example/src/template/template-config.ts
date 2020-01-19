import { Component } from '@partkit/component';
import { TemplateFunction } from './template-function';

export interface TemplateConfig {
    template?: TemplateFunction;
    context?: Component;
}

export const DEFAULT_TEMPLATE_CONFIG: TemplateConfig = {};
