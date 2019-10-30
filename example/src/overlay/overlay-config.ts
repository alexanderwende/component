import { Component } from '@partkit/component';
import { TemplateFunction } from '../template-function';
import { DEFAULT_POSITION_CONFIG, PositionConfig } from './position/position-config';

export interface OverlayConfig extends PositionConfig {
    // TODO: maybe introduce a const for the 'viewport' value?
    positionType: string;
    trigger?: string;
    triggerType?: string;
    template?: TemplateFunction;
    context?: Component;
    backdrop: boolean;
    closeOnEscape: boolean;
    closeOnBackdropClick: boolean;
    autoFocus: boolean;
    trapFocus: boolean;
    restoreFocus: boolean;
}

export const OVERLAY_CONFIG_FIELDS: (keyof OverlayConfig)[] = [
    'width',
    'height',
    'maxWidth',
    'maxHeight',
    'origin',
    'alignment',
    'positionType',
    'trigger',
    'triggerType',
    'template',
    'context',
    'backdrop',
    'closeOnEscape',
    'closeOnBackdropClick',
    'autoFocus',
    'trapFocus',
    'restoreFocus',
];

export const DEFAULT_OVERLAY_CONFIG: OverlayConfig = {
    ...DEFAULT_POSITION_CONFIG,
    positionType: 'fixed',
    trigger: undefined,
    triggerType: undefined,
    template: undefined,
    context: undefined,
    backdrop: true,
    closeOnEscape: true,
    closeOnBackdropClick: true,
    autoFocus: true,
    trapFocus: true,
    restoreFocus: true,
};
