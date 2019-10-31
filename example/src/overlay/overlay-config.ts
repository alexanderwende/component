import { Component } from '@partkit/component';
import { TemplateFunction } from '../template-function';
import { DEFAULT_FOCUS_TRAP_CONFIG, FocusTrapConfig } from './focus-trap';
import { DEFAULT_POSITION_CONFIG, PositionConfig } from './position/position-config';

export type OverlayConfig = PositionConfig & FocusTrapConfig & {
    // TODO: maybe introduce a const for the 'viewport' value?
    positionType: string;
    trigger?: string;
    triggerType?: string;
    template?: TemplateFunction;
    context?: Component;
    backdrop: boolean;
    trapFocus: boolean;
    closeOnEscape: boolean;
    closeOnBackdropClick: boolean;
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
    'trapFocus',
    'autoFocus',
    'initialFocus',
    'restoreFocus',
    'wrapFocus',
    'tabbableSelector'
];

export const DEFAULT_OVERLAY_CONFIG: OverlayConfig = {
    ...DEFAULT_POSITION_CONFIG,
    ...DEFAULT_FOCUS_TRAP_CONFIG,
    positionType: 'fixed',
    trigger: undefined,
    triggerType: undefined,
    template: undefined,
    context: undefined,
    backdrop: true,
    trapFocus: true,
    closeOnEscape: true,
    closeOnBackdropClick: true,
};
