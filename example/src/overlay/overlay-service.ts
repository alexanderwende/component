import { Component } from '@partkit/component';
import { html, render } from 'lit-html';
import { TemplateFunction } from '../template-function';
import { Overlay } from './overlay';
import { PositionStrategyFactory } from "../position/position-strategy-factory";
import { PositionStrategy } from "../position/position-strategy";
import { OverlayTriggerFactory } from './overlay-trigger-factory';
import { OverlayTrigger } from './overlay-trigger';
import { OverlayBackdrop } from './overlay-backdrop';

export interface OverlayConfig {
    position: 'fixed' | 'connected',
    backdrop: boolean;
    closeOnEscape: boolean;
    closeOnBackdropClick: boolean;
}

export const insertAfter = <T extends Node> (newChild: T, refChild: Node): T => {

    return refChild.parentNode!.insertBefore(newChild, refChild.nextSibling);
}

export class OverlayService {

    static instance: OverlayService | undefined;

    protected overlays = new Map<Overlay, () => void>();

    protected backdrop!: OverlayBackdrop;

    constructor (
        protected positionStrategyFactory: PositionStrategyFactory = new PositionStrategyFactory(),
        protected overlayTriggerFactory: OverlayTriggerFactory = new OverlayTriggerFactory(),
        protected root: HTMLElement = document.body
    ) {

        if (!OverlayService.instance) {

            OverlayService.instance = this;

            this.createBackdrop();
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

    createBackdrop () {

        this.backdrop = document.createElement(OverlayBackdrop.selector) as OverlayBackdrop;

        this.root.appendChild(this.backdrop);
    }

    createOverlay (template: TemplateFunction, context?: Component, positionStrategy?: PositionStrategy): Overlay {

        const overlay = document.createElement(Overlay.selector) as Overlay;

        overlay.positionStrategy = positionStrategy || this.positionStrategyFactory.createPositionStrategy('fixed', overlay);

        context = context || overlay;

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

        this.attachOverlay(overlay);

        this.renderOverlay(overlay, template, context);

        return overlay;
    }

    registerOverlay (overlay: Overlay): boolean {

        console.log('registerOverlay...', this.overlays.has(overlay));

        if (!this.overlays.has(overlay)) {

            this.overlays.set(overlay, () => { });

            this.attachOverlay(overlay);

            return true;

        } else {

            return false;
        }
    }

    showOverlay (overlay: Overlay) {

        overlay.show();
    }

    onShowOverlay (overlay: Overlay) {

        this.backdrop.show();
    }

    hideOverlay (overlay: Overlay) {

        overlay.hide();
    }

    onHideOverlay (overlay: Overlay) {

        if (!this.hasOpenOverlays()) this.backdrop.hide();
    }

    destroyOverlay (overlay: Overlay, disconnect: boolean = true) {

        this.hideOverlay(overlay);

        const teardown = this.overlays.get(overlay);

        if (teardown) teardown();

        if (disconnect && overlay.parentElement) {

            overlay.parentElement.removeChild(overlay);
        }

        this.overlays.delete(overlay);
    }

    /**
     * Attach an overlay to the {@link OverlayService}'s root element
     *
     * All overlays are attached to the root element in order, after the {@link OverlayBackdrop}.
     *
     * @param overlay - The overlay instance to attach
     */
    protected attachOverlay (overlay: Overlay) {

        if (overlay.parentElement === this.root) return;

        let lastOverlay: HTMLElement = this.backdrop;

        while (lastOverlay.nextSibling && lastOverlay.nextSibling instanceof Overlay) {

            lastOverlay = lastOverlay.nextSibling;
        }

        insertAfter(overlay, lastOverlay);
    }

    protected renderOverlay (overlay: Overlay, template: TemplateFunction, context?: Component) {

        const result = template(context || overlay) || html``;

        render(result, overlay, { eventContext: context || overlay });
    }
}
