import { Component } from '@partkit/component';
import { TemplateFunction } from '../template-function';
import { DEFAULT_OVERLAY_CONTROLLER_CONFIG, OverlayControllerConfig } from './controller/overlay-controller-config';
import { DEFAULT_POSITION_CONFIG, PositionConfig } from './position/position-config';

export type OverlayConfig = PositionConfig & OverlayControllerConfig & {
    // TODO: maybe introduce a const for the 'viewport' value?
    positionType: string;
    controller?: string;
    controllerType: string;
    stacked: boolean;
    template?: TemplateFunction;
    context?: Component;
    backdrop: boolean;
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
    'controller',
    'controllerType',
    'stacked',
    'template',
    'context',
    'backdrop',
    'closeOnEscape',
    'closeOnFocusLoss',
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
    ...DEFAULT_OVERLAY_CONTROLLER_CONFIG,
    positionType: 'default',
    controller: undefined,
    controllerType: 'default',
    stacked: true,
    template: undefined,
    context: undefined,
    backdrop: true,
    closeOnBackdropClick: true,
};
