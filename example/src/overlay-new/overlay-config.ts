import { Component } from '@partkit/component';
import { DEFAULT_POSITION_CONFIG, PositionConfig, POSITION_CONFIG_FIELDS } from '../position/position-config';
import { TemplateFunction } from '../template-function';
import { DEFAULT_OVERLAY_TRIGGER_CONFIG, OverlayTriggerConfig, OVERLAY_TRIGGER_CONFIG_FIELDS } from './trigger/overlay-trigger-config';

export type OverlayConfig = PositionConfig & OverlayTriggerConfig & {
    positionType: string;
    trigger?: HTMLElement;
    triggerType: string;
    stacked: boolean;
    template?: TemplateFunction;
    context?: Component;
    backdrop: boolean;
    closeOnBackdropClick: boolean;
}

export const OVERLAY_CONFIG_FIELDS: (keyof OverlayConfig)[] = [
    ...POSITION_CONFIG_FIELDS,
    ...OVERLAY_TRIGGER_CONFIG_FIELDS,
    'positionType',
    'trigger',
    'triggerType',
    'stacked',
    'template',
    'context',
    'backdrop',
    'closeOnBackdropClick',
];

export const DEFAULT_OVERLAY_CONFIG: OverlayConfig = {
    ...DEFAULT_POSITION_CONFIG,
    ...DEFAULT_OVERLAY_TRIGGER_CONFIG,
    positionType: 'default',
    trigger: undefined,
    triggerType: 'default',
    stacked: true,
    template: undefined,
    context: undefined,
    backdrop: true,
    closeOnBackdropClick: true,
};
