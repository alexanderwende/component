import { Overlay } from '../overlay';
import { OverlayService } from '../overlay-service';
import { DefaultOverlayController } from './default-overlay-controller';
import { DialogOverlayController, DIALOG_OVERLAY_CONTROLLER_CONFIG } from './dialog-overlay-controller';
import { OverlayController } from './overlay-controller';
import { DEFAULT_OVERLAY_CONTROLLER_CONFIG, OverlayControllerConfig } from './overlay-controller-config';
import { TooltipOverlayController, TOOLTIP_OVERLAY_CONTROLLER_CONFIG } from './tooltip-overlay-controller';

export interface OverlayControllerMap {
    [key: string]: { new(overlay: Overlay, overlayService: OverlayService, config: OverlayControllerConfig): OverlayController };
}

export interface OverlayControllerConfigMap {
    [key: string]: OverlayControllerConfig;
}

export const DEFAULT_OVERLAY_CONTROLLERS: OverlayControllerMap = {
    default: DefaultOverlayController,
    dialog: DialogOverlayController,
    tooltip: TooltipOverlayController,
};

export const DEFAULT_OVERLAY_CONTROLLER_CONFIGS: OverlayControllerConfigMap = {
    default: DEFAULT_OVERLAY_CONTROLLER_CONFIG,
    dialog: DIALOG_OVERLAY_CONTROLLER_CONFIG,
    tooltip: TOOLTIP_OVERLAY_CONTROLLER_CONFIG,
};

export class OverlayControllerFactory {

    constructor (
        protected controllers: OverlayControllerMap = DEFAULT_OVERLAY_CONTROLLERS,
        protected configs: OverlayControllerConfigMap = DEFAULT_OVERLAY_CONTROLLER_CONFIGS
    ) { }

    createOverlayController (type: string, overlay: Overlay, overlayService: OverlayService, config?: Partial<OverlayControllerConfig>): OverlayController {

        const controller = this.controllers[type] || DefaultOverlayController;
        const configuration = { ...(this.configs[type] || DEFAULT_OVERLAY_CONTROLLER_CONFIG), ...config };

        return new controller(overlay, overlayService, configuration);
    }
}
