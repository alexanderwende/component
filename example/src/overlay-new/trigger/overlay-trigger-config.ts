import { FocusTrapConfig, DEFAULT_FOCUS_TRAP_CONFIG, FOCUS_TRAP_CONFIG_FIELDS } from '../../focus/focus-trap';

export type OverlayTriggerConfig = FocusTrapConfig & {
    trapFocus: boolean;
    closeOnEscape: boolean;
    closeOnFocusLoss: boolean;
};

export const DEFAULT_OVERLAY_TRIGGER_CONFIG: OverlayTriggerConfig = {
    ...DEFAULT_FOCUS_TRAP_CONFIG,
    autoFocus: true,
    trapFocus: true,
    restoreFocus: true,
    closeOnEscape: true,
    closeOnFocusLoss: true,
};

export const OVERLAY_TRIGGER_CONFIG_FIELDS: (keyof OverlayTriggerConfig)[] = [
    ...FOCUS_TRAP_CONFIG_FIELDS,
    'trapFocus',
    'closeOnEscape',
    'closeOnFocusLoss',
];
