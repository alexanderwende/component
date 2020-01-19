import { DEFAULT_FOCUS_TRAP_CONFIG, FocusTrapConfig } from '../../focus';

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
