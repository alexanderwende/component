import { Overlay } from './overlay';
import { OverlayTrigger, TooltipOverlayTrigger, DefaultOverlayTrigger } from './overlay-trigger';

export interface OverlayTriggerMap {
    [key: string]: { new(overlay: Overlay): OverlayTrigger };
}

export const DEFAULT_OVERLAY_TRIGGERS: OverlayTriggerMap = {
    default: DefaultOverlayTrigger,
    tooltip: TooltipOverlayTrigger,
};

export class OverlayTriggerFactory {

    constructor (protected triggers: OverlayTriggerMap = DEFAULT_OVERLAY_TRIGGERS) { }

    createOverlayTrigger (type: string, overlay: Overlay): OverlayTrigger {

        return this.triggers[type]
            ? new this.triggers[type](overlay)
            : new DefaultOverlayTrigger(overlay);
    }
}
