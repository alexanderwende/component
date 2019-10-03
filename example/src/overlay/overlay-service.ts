import { Component } from '@partkit/component';
import { html, render } from 'lit-html';
import { TemplateFunction } from '../template-function';
import { Overlay } from './overlay';
import { PositionStrategyFactory } from "../position/position-strategy-factory";
import { PositionStrategy } from "../position/position-strategy";
import { OverlayTriggerFactory } from './overlay-trigger-factory';
import { OverlayTrigger } from './overlay-trigger';

export interface OverlayConfig {
    position: 'fixed' | 'connected',
    backdrop: boolean;
    closeOnEscape: boolean;
    closeOnBackdropClick: boolean;
}

export class OverlayService {

    static instance: OverlayService | undefined;

    protected overlays = new Map<Overlay, () => void>();

    constructor (
        protected positionStrategyFactory: PositionStrategyFactory = new PositionStrategyFactory(),
        protected overlayTriggerFactory: OverlayTriggerFactory = new OverlayTriggerFactory()
    ) {

        if (!OverlayService.instance) {

            OverlayService.instance = this;
        }

        return OverlayService.instance;
    }

    createPositionStrategy (type: string, ...args: any[]): PositionStrategy {

        return this.positionStrategyFactory.createPositionStrategy(type, ...args);
    }

    createOverlayTrigger (type: string, ...args: any[]): OverlayTrigger {

        return this.overlayTriggerFactory.createOverlayTrigger(type, ...args);
    }

    hasOpenOverlays () {

        return [...this.overlays].find(([overlay]) => !overlay.hidden);
    }

    createOverlay (template: TemplateFunction, context?: Component, positionStrategy?: PositionStrategy): Overlay {

        const overlay = document.createElement(Overlay.selector) as Overlay;

        overlay.positionStrategy = positionStrategy || this.positionStrategyFactory.createPositionStrategy('fixed', overlay);

        document.body.appendChild(overlay);

        context = context || overlay;

        this.renderOverlay(overlay, template, context);

        // to keep a template up-to-date with it's context, we have to render the template
        // everytime the context renders - that is, on every update which was triggered
        const updateListener = () => {

            // check the overlay hasn't been destroyed yet
            if (this.overlays.has(overlay)) {

                this.renderOverlay(overlay, template, context);
            }
        }

        // we can use a component's 'update' event to re-render the template on every context update
        // lit-html will take care of efficiently updating the DOM
        context.addEventListener('update', updateListener);

        this.overlays.set(overlay, () => context!.removeEventListener('update', updateListener));

        return overlay;
    }

    registerOverlay (overlay: Overlay) {

        this.overlays.set(overlay, () => { });
    }

    openOverlay (overlay: Overlay) {

        overlay.open();
    }

    closeOverlay (overlay: Overlay) {

        overlay.close();
    }

    destroyOverlay (overlay: Overlay, disconnect: boolean = true) {

        this.closeOverlay(overlay);

        const teardown = this.overlays.get(overlay);

        if (teardown) teardown();

        if (disconnect && overlay.parentElement) {

            overlay.parentElement.removeChild(overlay);
        }

        this.overlays.delete(overlay);
    }

    protected renderOverlay (overlay: Overlay, template: TemplateFunction, context?: Component) {

        const result = template(context || overlay) || html``;

        render(result, overlay, { eventContext: context || overlay });
    }
}
