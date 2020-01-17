import { Component } from '@partkit/component';
import { PositionConfig, POSITION_CONFIG_FIELDS } from '../position/position-config';
import { TemplateFunction } from '../template-function';
import { OverlayTriggerConfig, OVERLAY_TRIGGER_CONFIG_FIELDS } from './trigger/overlay-trigger-config';

export type OverlayConfig = PositionConfig & OverlayTriggerConfig & {
    positionType: string;
    triggerType: string;
    trigger?: HTMLElement;
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

export const DEFAULT_OVERLAY_CONFIG: Partial<OverlayConfig> = {
    positionType: 'default',
    triggerType: 'default',
    trigger: undefined,
    stacked: true,
    template: undefined,
    context: undefined,
    backdrop: true,
    closeOnBackdropClick: true,
};
