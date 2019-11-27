import { render } from 'lit-html';
import { insertAfter } from '../dom';
import { dispatch, EventManager } from '../event-manager';
import { OverlayController, OverlayControllerFactory } from './controller';
import { Overlay } from './overlay';
import { OverlayBackdrop } from './overlay-backdrop';
import { OverlayConfig } from './overlay-config';
import { PositionStrategy } from './position/position-strategy';
import { PositionStrategyFactory } from './position/position-strategy-factory';

let OVERLAY_SERVICE_INSTANCE: OverlayService | undefined;

export interface OverlaySettings {
    events: EventManager;
    config: Partial<OverlayConfig>;
    positionStrategy?: PositionStrategy;
    overlayController?: OverlayController;
}

export class OverlayService {

    registeredOverlays = new Map<Overlay, OverlaySettings>();

    activeOverlays = new Set<Overlay>();

    protected backdrop!: OverlayBackdrop;

    constructor (
        protected positionStrategyFactory: PositionStrategyFactory = new PositionStrategyFactory(),
        protected overlayControllerFactory: OverlayControllerFactory = new OverlayControllerFactory(),
        protected root: HTMLElement = document.body
    ) {

        if (!OVERLAY_SERVICE_INSTANCE) {

            OVERLAY_SERVICE_INSTANCE = this;

            this.createBackdrop();

            document.body.addEventListener(
                'connected',
                event => (event.target instanceof Overlay) && this.handleOverlayConnected(event as CustomEvent),
                { capture: true }
            );

            document.body.addEventListener(
                'disconnected',
                event => (event.target instanceof Overlay) && this.handleOverlayDisconnected(event as CustomEvent),
                { capture: true }
            );
        }

        return OVERLAY_SERVICE_INSTANCE;
    }

    hasOverlay (overlay: Overlay): boolean {

        return this.registeredOverlays.has(overlay);
    }

    /**
     * An overlay is considered focused, if either itself or any of its descendant nodes has focus.
     */
    isOverlayFocused (overlay: Overlay): boolean {

        // this._throwUnregiseredOverlay(overlay);

        const activeElement = document.activeElement;

        return overlay === activeElement || overlay.contains(activeElement);
    }

    /**
     * An overlay is considered active if it is either focused or has a descendant overlay which is focused.
     */
    isOverlayActive (overlay: Overlay): boolean {

        // this._throwUnregiseredOverlay(overlay);

        let isFound = false;
        let isActive = false;

        for (let activeOverlay of this.activeOverlays) {

            isFound = isFound || activeOverlay === overlay;

            isActive = isFound && this.isOverlayFocused(activeOverlay);

            if (isActive) break;
        }

        return isActive;
    }

    createBackdrop () {

        this.backdrop = document.createElement(OverlayBackdrop.selector) as OverlayBackdrop;

        this.root.appendChild(this.backdrop);
    }

    /**
     * Create a new overlay
     *
     * @description
     * Creates a new overlay instances and registers it with the service.
     */
    createOverlay (config: Partial<OverlayConfig>): Overlay {

        const overlay = document.createElement(Overlay.selector) as Overlay;

        this.registerOverlay(overlay, config);

        return overlay;
    }

    /**
     * Register an overlay with the overlay service
     *
     * @description
     * Adds the overlay instance to the overlay service's registry, extracts the overlay's configuration and
     * attaches the overlay to the overlay service's root location in the document body.
     *
     * @returns True if the overlay was registered successfully, false if the overlay has been registered already
     */
    registerOverlay (overlay: Overlay, config: Partial<OverlayConfig> = {}): boolean {

        if (this.hasOverlay(overlay)) return false;

        this.registeredOverlays.set(overlay, this.configureOverlay(overlay, config));

        this.attachOverlay(overlay);

        this.renderOverlay(overlay);

        return true;
    }

    destroyOverlay (overlay: Overlay, disconnect: boolean = true) {

        // this._throwUnregiseredOverlay(overlay);

        // TODO: we need to also destroy descendant overlays?
        this.closeOverlay(overlay);

        const definition = this.registeredOverlays.get(overlay)!;

        definition.events.unlistenAll();

        this.disposePositionStrategy(overlay);
        this.disposeOverlayController(overlay);

        if (disconnect && overlay.parentElement) {

            overlay.parentElement.removeChild(overlay);
        }

        this.registeredOverlays.delete(overlay);
    }





    openOverlay (overlay: Overlay, event?: Event) {

        console.log('opening overlay...', overlay);

        dispatch(overlay, 'command-open', {
            target: overlay,
            source: event,
        });
    }

    closeOverlay (overlay: Overlay, event?: Event) {

        console.log('closing overlay...', overlay);

        dispatch(overlay, 'command-close', {
            target: overlay,
            source: event,
        });
    }

    toggleOverlay (overlay: Overlay, event?: Event, open?: boolean) {

        if (typeof open === 'boolean') {

            if (open) {
                this.openOverlay(overlay, event);
            } else {
                this.closeOverlay(overlay, event);
            }
        } else {
            if (overlay.open) {
                this.closeOverlay(overlay, event);
            } else {
                this.openOverlay(overlay, event);
            }
        }
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

    protected renderOverlay (overlay: Overlay) {

        if (this.hasOverlay(overlay)) {

            const { template, context } = this.registeredOverlays.get(overlay)!.config;

            if (template) {

                // TODO: check if context is always available, otherwise use overlay as fallback-context
                render(template(context || overlay), overlay, { eventContext: context || overlay });
            }
        }
    }

    protected configureOverlay (overlay: Overlay, config: Partial<OverlayConfig> = {}): OverlaySettings {

        console.log('configureOverlay()... ', overlay, config);

        const settings: OverlaySettings = {
            config: config,
            events: new EventManager(),
            positionStrategy: this.createPositionStrategy(overlay, config),
            overlayController: this.createOverlayController(overlay, config),
        };

        settings.events.listen(overlay, 'open-changed', event => this.handleOverlayOpenChanged(event as CustomEvent), { capture: true });
        settings.events.listen(overlay, 'command-open', event => this.handleCommandOpen(event as CustomEvent), { capture: true });
        settings.events.listen(overlay, 'command-close', event => this.handleCommandClose(event as CustomEvent), { capture: true });
        settings.events.listen(overlay, 'command-toggle', event => this.handleCommandToggle(event as CustomEvent), { capture: true });

        return settings;
    }

    protected createPositionStrategy (overlay: Overlay, config: Partial<OverlayConfig>): PositionStrategy | undefined {

        if (config.positionType) {

            const positionStrategy = this.positionStrategyFactory.createPositionStrategy(config.positionType, overlay, config);

            // the position strategy builds its own config based on the positionType setting, we need to reflect this back
            // TODO: this seems a tad hacky...
            Object.assign(config, positionStrategy.config);

            return positionStrategy;
        }
    }

    protected disposePositionStrategy (overlay: Overlay) {

        const definition = this.registeredOverlays.get(overlay)!;

        if (definition.positionStrategy) {

            definition.positionStrategy.destroy();

            definition.positionStrategy = undefined;
        }
    }

    protected createOverlayController (overlay: Overlay, config: Partial<OverlayConfig>): OverlayController | undefined {

        if (config.controllerType) {

            const overlayController = this.overlayControllerFactory.createOverlayController(config.controllerType, overlay, this, config);
            const controllerElement = config.controller ? document.querySelector(config.controller) as HTMLElement || undefined : undefined;

            overlayController.attach(controllerElement);

            return overlayController;
        }
    }

    protected disposeOverlayController (overlay: Overlay) {

        const definition = this.registeredOverlays.get(overlay)!;

        if (definition.overlayController) {

            definition.overlayController.detach();

            definition.overlayController = undefined;
        }
    }

    handleOverlayConnected (event: CustomEvent<Overlay>) {

        const overlay = event.detail;

        this.registerOverlay(overlay, overlay.config);
    }

    handleOverlayDisconnected (event: CustomEvent<Overlay>) {

        const overlay = event.detail;

        this.destroyOverlay(overlay, false);
    }

    handleOverlayOpenChanged (event: CustomEvent) {

        console.log('overlay open-changed...', event);
    }

    handleCommandOpen (event: CustomEvent) {

        const overlay = event.detail.target;
        const source = event.detail.source;

        this.activeOverlays.add(overlay);
    }

    handleCommandClose (event: CustomEvent) {

        const overlay = event.detail.target;
        const source = event.detail.source;

        this.activeOverlays.delete(overlay);
    }

    handleCommandToggle (event: CustomEvent) {

        const overlay = event.detail.target;
        const source = event.detail.source;

        if (this.activeOverlays.has(overlay)) {

            this.handleCommandClose(event);

        } else {

            this.handleCommandOpen(event);
        }
    }
}
