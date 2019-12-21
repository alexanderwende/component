import { render } from 'lit-html';
import { insertAfter } from '../dom';
import { dispatch, EventManager } from '../event-manager';
import { OverlayController, OverlayControllerFactory } from './controller';
import { Overlay } from './overlay';
import { OverlayBackdrop } from './overlay-backdrop';
import { OverlayConfig } from './overlay-config';
import { PositionStrategy, PositionController } from './position/position-strategy';
import { PositionStrategyFactory, PositionControllerFactory } from './position/position-strategy-factory';

// TODO: overlay.selector is probably not very useful in context of this error...
const OVERLAY_UNREGISTERED_ERROR = (overlay: typeof Overlay) => new Error(`Overlay is not registered: ${ overlay.selector }`);

let OVERLAY_SERVICE_INSTANCE: OverlayService | undefined;

export interface OverlaySettings {
    events: EventManager;
    config: Partial<OverlayConfig>;
    positionStrategy?: PositionStrategy;
    positionController?: PositionController;
    overlayController?: OverlayController;
}

export class OverlayService {

    registeredOverlays = new Map<Overlay, OverlaySettings>();

    activeOverlays = new Set<Overlay>();

    protected backdrop!: OverlayBackdrop;

    protected registeringOverlay?: Overlay;

    constructor (
        protected positionStrategyFactory: PositionStrategyFactory = new PositionStrategyFactory(),
        protected positionControllerFactory: PositionControllerFactory = new PositionControllerFactory(),
        protected overlayControllerFactory: OverlayControllerFactory = new OverlayControllerFactory(),
        protected root: HTMLElement = document.body
    ) {

        if (!OVERLAY_SERVICE_INSTANCE) {

            OVERLAY_SERVICE_INSTANCE = this;

            this.createBackdrop();

            document.body.addEventListener(
                'connected',
                event => ((event as CustomEvent).detail?.component instanceof Overlay) && this.handleOverlayConnected(event as CustomEvent),
                // { capture: true }
            );

            document.body.addEventListener(
                'disconnected',
                event => ((event as CustomEvent).detail?.component instanceof Overlay) && this.handleOverlayDisconnected(event as CustomEvent),
                // { capture: true }
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

        this._throwUnregiseredOverlay(overlay);

        const activeElement = document.activeElement;

        return overlay === activeElement || overlay.contains(activeElement);
    }

    /**
     * An overlay is considered active if it is either focused or has a descendant overlay which is focused.
     */
    isOverlayActive (overlay: Overlay): boolean {

        this._throwUnregiseredOverlay(overlay);

        const { config } = this.registeredOverlays.get(overlay)!;

        let isFound = false;
        let isActive = false;

        if (config.stacked && overlay.open) {

            for (let current of this.activeOverlays) {

                isFound = isFound || current === overlay;

                isActive = isFound && this.isOverlayFocused(current);

                if (isActive) break;
            }
        }

        return isActive;
    }

    /**
     * Get the parent overlay of an active overlay
     *
     * @description
     * If an overlay is stacked, its parent overlay is the one from which it was opened.
     * This parent overlay will be in the activeOverlays stack just before this one.
     */
    getParentOverlay (overlay: Overlay): Overlay | undefined {

        this._throwUnregiseredOverlay(overlay);

        const { config } = this.registeredOverlays.get(overlay)!;

        if (config.stacked && overlay.open) {

            // we start with parent being undefined
            // if the first active overlay in the set matches the specified overlay
            // then indeed the overlay has no parent (the first active overlay is the root)
            let parent: Overlay | undefined = undefined;

            // go through the active overlays
            for (let current of this.activeOverlays) {

                // if we have reached the specified active overlay
                // we can return the parent of that overlay (it's the active overlay in the set just before this one)
                if (current === overlay) return parent;

                // if we haven't found the specified overlay yet, we set
                // the current overlay as potential parent and move on
                parent = current;
            }
        }
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

        this._throwUnregiseredOverlay(overlay);

        // TODO: we need to also destroy descendant overlays?
        this.closeOverlay(overlay);

        const definition = this.registeredOverlays.get(overlay)!;

        definition.events.unlistenAll();

        this.disposePositionStrategy(overlay);
        this.disposePositionController(overlay);
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

        open = (typeof open === 'boolean') ? open : !overlay.open;

        if (open) {
            this.openOverlay(overlay, event);
        } else {
            this.closeOverlay(overlay, event);
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

        console.log('renderOverlay()...');

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
            // positionStrategy: this.createPositionStrategy(overlay, config),
            positionController: this.createPositionController(overlay, config),
            overlayController: this.createOverlayController(overlay, config),
        };

        settings.events.listen(overlay, 'open-changed', event => this.handleOverlayOpenChanged(event as CustomEvent));
        settings.events.listen(overlay, 'command-open', event => this.handleCommandOpen(event as CustomEvent));
        settings.events.listen(overlay, 'command-close', event => this.handleCommandClose(event as CustomEvent));

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

    protected createPositionController (overlay: Overlay, config: Partial<OverlayConfig>): PositionController | undefined {

        if (config.positionType) {

            const positionController = this.positionControllerFactory.createPositionController(config.positionType, config);

            return positionController;
        }
    }

    protected disposePositionController (overlay: Overlay) {

        const definition = this.registeredOverlays.get(overlay)!;

        if (definition.positionController) {

            definition.positionController.detach();

            definition.positionController = undefined;
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

    protected handleOverlayConnected (event: CustomEvent) {

        const overlay = event.detail.component as Overlay;

        if (this.registeringOverlay === overlay) return;

        this.registeringOverlay = overlay;

        console.log('OverlayService.handleOverlayConnected()...', event.composedPath()[0]);

        this.registerOverlay(overlay, overlay.config);

        this.registeringOverlay = undefined;
    }

    protected handleOverlayDisconnected (event: CustomEvent) {

        const overlay = event.detail.component as Overlay;

        if (this.registeringOverlay === overlay) return;

        console.log('OverlayService.handleOverlayDisconnected()...', event);

        this.destroyOverlay(overlay, false);
    }

    protected handleOverlayOpenChanged (event: CustomEvent) {

        console.log('overlay open-changed...', event);

        const overlay = event.target as Overlay;

        const { positionStrategy, positionController } = this.registeredOverlays.get(overlay)!;

        if (overlay.open) {

            if (positionStrategy) {

                positionStrategy.update();
            }

            if (positionController) {

                positionController.attach(overlay);
            }

        } else {

            if (positionController) {

                positionController.detach();
            }
        }
    }

    protected handleCommandOpen (event: CustomEvent) {

        const overlay = event.detail.target;
        const source = event.detail.source;

        const { config, events, positionStrategy } = this.registeredOverlays.get(overlay)!;

        if (config.stacked) {

            if (source && source.target instanceof Node && this.activeOverlays.size) {

                const activeOverlays = [...this.activeOverlays];

                for (let index = activeOverlays.length - 1; index >= 0; index--) {

                    const lastOverlay = activeOverlays[index];

                    if (lastOverlay === source.target || lastOverlay.contains(source.target)) {

                        // we found the active overlay that caused the event, we keep the stack up to this overlay
                        break;

                    } else {

                        // the active overlay didn't cause the event, so it should be closed and discarded from the stack
                        this.closeOverlay(overlay);
                    }
                }
            }

            this.activeOverlays.add(overlay);
        }

        if (config.template && config.context) {

            // to keep a template up-to-date with it's context, we have to render the template
            // everytime the context renders - that is, on every update which was triggered

            // TODO: fix context's update listener
            // config.context.addEventListener('update', updateListener as EventListener);

            this.renderOverlay(overlay);
        }

        // if (positionStrategy) {

        //     positionStrategy.update();
        // }

        // TODO: manage backdrop

        // if (config.backdrop) {

        //     this.backdrop.show();
        // }
    }

    protected handleCommandClose (event: CustomEvent) {

        const overlay = event.detail.target;
        const source = event.detail.source;

        const config = this.registeredOverlays.get(overlay)!.config;

        if (config.stacked) {

            if (this.activeOverlays.size) {

                const activeOverlays = [...this.activeOverlays];

                for (let index = activeOverlays.length - 1; index >= 0; index--) {

                    const lastOverlay = activeOverlays[index];

                    if (lastOverlay === overlay) {

                        // we found the active overlay that caused the event, we keep the stack up to this overlay
                        break;

                    } else {

                        // the active overlay is a descendant of the one that's closed, so it should be closed and discarded from the stack
                        this.closeOverlay(lastOverlay);
                    }
                }
            }

            this.activeOverlays.delete(overlay);
        }

        if (config.template && config.context) {

            // config.context.removeEventListener('update', updateListener as EventListener);ƒ
        }

        // TODO: manage backdrop

        // if (config.backdrop) {

        //     this.backdrop.hide();
        // }
    }

    private _throwUnregiseredOverlay (overlay: Overlay) {

        if (!this.hasOverlay(overlay)) {

            throw OVERLAY_UNREGISTERED_ERROR(overlay.constructor as typeof Overlay);
        }
    }
}
