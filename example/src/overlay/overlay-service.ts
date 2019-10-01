import { Overlay } from './overlay';
import { TemplateResult, render } from 'lit-html';

export interface OverlayConfig {
    position: 'fixed' | 'connected',
    backdrop: boolean;
    closeOnEscape: boolean;
    closeOnBackdropClick: boolean;
}

export class OverlayService {

    static instance: OverlayService | undefined;

    protected overlays = new Map<Overlay, boolean>();

    constructor () {

        if (!OverlayService.instance) {

            OverlayService.instance = this;
        }

        return OverlayService.instance;
    }

    hasOpenOverlays () {

        return [...this.overlays].find(([overlay, open]) => open);
    }

    createOverlay (content: TemplateResult): Overlay {

        const overlay = document.createElement(Overlay.selector) as Overlay;

        document.body.appendChild(overlay);

        render(content, overlay.renderRoot);

        return overlay;
    }

    registerOverlay (overlay: Overlay) {

        this.overlays.set(overlay, !overlay.hidden);
    }

    openOverlay (overlay: Overlay) {

        overlay.open();

        this.overlays.set(overlay, true);
    }

    closeOverlay (overlay: Overlay) {

        overlay.close();

        this.overlays.set(overlay, false);
    }

    destroyOverlay (overlay: Overlay) {

        this.closeOverlay(overlay);

        // if (overlay.parentElement) {

        //     overlay.parentElement.removeChild(overlay);
        // }

        this.overlays.delete(overlay);
    }
}
