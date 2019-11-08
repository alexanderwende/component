import { PropertyChangeEvent } from '@partkit/component';
import { render } from 'lit-html';
import { insertAfter } from '../dom';
import { FocusTrap, FocusTrapConfig } from './focus-trap';
import { Overlay } from './overlay';
import { OverlayBackdrop } from './overlay-backdrop';
import { OverlayConfig } from './overlay-config';
import { OverlayTrigger } from './overlay-trigger';
import { OverlayTriggerFactory } from './overlay-trigger-factory';
import { hasPositionConfigChanged, PositionConfig, POSITION_CONFIG_FIELDS } from './position/position-config';
import { PositionStrategy } from './position/position-strategy';
import { PositionStrategyFactory } from './position/position-strategy-factory';
import { FocusChangeEvent } from './focus-monitor';
import { OverlayController } from './overlay-controller';

const OVERLAY_UNREGISTERED_ERROR = (overlay: typeof Overlay) => new Error(`Overlay is not registered: ${ overlay.selector }`);

let OVERLAY_SERVICE_INSTANCE: OverlayService | undefined;

export interface OverlayDefinition {
    config: Partial<OverlayConfig>;
    positionStrategy?: PositionStrategy;
    overlayTrigger?: OverlayTrigger;
    focusTrap?: FocusTrap;
    updateListener: (event: CustomEvent) => void;
    openChangeListener: (event: CustomEvent) => void;
    focusChangeListener: (event: FocusChangeEvent) => void;
    destroy: () => void;
}

export class OverlayService {

    protected registeredOverlays: Map<Overlay, OverlayDefinition> = new Map();

    protected activeOverlays: Overlay[] = [];

    protected backdrop!: OverlayBackdrop;

    constructor (
        protected positionStrategyFactory: PositionStrategyFactory = new PositionStrategyFactory(),
        protected overlayTriggerFactory: OverlayTriggerFactory = new OverlayTriggerFactory(),
        protected root: HTMLElement = document.body
    ) {

        if (!OVERLAY_SERVICE_INSTANCE) {

            OVERLAY_SERVICE_INSTANCE = this;

            this.createBackdrop();
        }

        return OVERLAY_SERVICE_INSTANCE;
    }

    hasOpenOverlays () {

        return this.activeOverlays.length > 0;
    }

    hasOverlay (overlay: Overlay): boolean {

        return this.registeredOverlays.has(overlay);
    }

    isOverlayOpen (overlay: Overlay) {

        this._throwUnregiseredOverlay(overlay);

        return this.activeOverlays.includes(overlay);
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

        let isFound = false;
        let isActive = false;

        for (let index = 0, length = this.activeOverlays.length; index < length && !isActive; index++) {

            if (!isFound && this.activeOverlays[index] === overlay) isFound = true;

            if (isFound) {

                isActive = this.isOverlayFocused(this.activeOverlays[index]);
            }
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

    getParentOverlay (overlay: Overlay): Overlay | undefined {

        if (this.isOverlayOpen(overlay)) {

            const index = this.activeOverlays.findIndex(current => current === overlay);

            if (index > 0) {

                return this.activeOverlays[index - 1];
            }
        }
    }

    getOverlayController (overlay: Overlay): OverlayController {

        this._throwUnregiseredOverlay(overlay);

        // TODO: fix typings once we switch fully to overlay-controller
        return this.registeredOverlays.get(overlay)!.overlayTrigger as OverlayController;
    }

    // openOverlay (overlay: Overlay, event?: Event) {

    //     this._throwUnregiseredOverlay(overlay);

    //     if (this.isOverlayOpen(overlay)) return;

    //     // we need to check if an event caused the overlay to open and if it originates from any active overlay in the stack
    //     let length = this.activeOverlays.length,
    //         index = length - 1;

    //     if (event && length && event.target instanceof Node) {

    //         for (index; index >= 0; index--) {

    //             let activeOverlay = this.activeOverlays[index];

    //             if (activeOverlay === event.target || activeOverlay.contains(event.target)) {

    //                 // we found the active overlay that caused the event, we keep the stack up to this overlay
    //                 break;

    //             } else {

    //                 // the active overlay didn't cause the event, so it should be closed and discarded from the stack
    //                 this.closeOverlay(overlay);
    //             }
    //         }
    //     }

    //     // push overlay on the stack to mark it as currently active overlay
    //     this.activeOverlays.push(overlay);

    //     overlay.show();
    // }

    async openOverlay (overlay: Overlay, event?: Event): Promise<boolean> {

        this._throwUnregiseredOverlay(overlay);

        return new Promise((resolve, reject) => {

            if (this.isOverlayOpen(overlay)) {

                reject(false);
                return;
            }

            overlay.addEventListener('open-changed', (event) => resolve(true), { once: true });

            // we need to check if an event caused the overlay to open and if it originates from any active overlay in the stack
            let length = this.activeOverlays.length,
                index = length - 1;

            if (event && length && event.target instanceof Node) {

                for (index; index >= 0; index--) {

                    let activeOverlay = this.activeOverlays[index];

                    if (activeOverlay === event.target || activeOverlay.contains(event.target)) {

                        // we found the active overlay that caused the event, we keep the stack up to this overlay
                        break;

                    } else {

                        // the active overlay didn't cause the event, so it should be closed and discarded from the stack
                        this.closeOverlay(overlay);
                    }
                }
            }

            // push overlay on the stack to mark it as currently active overlay
            this.activeOverlays.push(overlay);

            overlay.show();
        });
    }

    /**
     * Close an overlay
     *
     * @description
     * When closing an overlay, all its open descendant overlays have to be closed as well.
     *
     * @param overlay - The overlay to close
     * @param event - An optional event that was responsible for closing the overlay
     */
    async closeOverlay (overlay: Overlay, event?: Event): Promise<boolean> {

        this._throwUnregiseredOverlay(overlay);

        return new Promise((resolve, reject) => {

            if (!this.isOverlayOpen(overlay)) {

                reject(false);
                return;
            }

            overlay.addEventListener('open-changed', (event) => resolve(true), { once: true });

            let isFound = false;

            while (!isFound) {

                // activeOverlay is either a descendant of overlay or overlay itself
                let activeOverlay = this.activeOverlays.pop()!;

                // if we arrived at the overlay, we stop closing
                isFound = activeOverlay === overlay;

                activeOverlay.hide();
            }
        });
    }

    toggleOverlay (overlay: Overlay, event?: Event) {

        if (this.isOverlayOpen(overlay)) {

            this.closeOverlay(overlay, event);

        } else {

            this.openOverlay(overlay, event);
        }
    }

    destroyOverlay (overlay: Overlay, disconnect: boolean = true) {

        this._throwUnregiseredOverlay(overlay);

        // TODO: we need to also destroy descendant overlays?
        this.closeOverlay(overlay);

        const definition = this.registeredOverlays.get(overlay);

        if (definition && definition.destroy) {

            definition.destroy();
        }

        if (disconnect && overlay.parentElement) {

            overlay.parentElement.removeChild(overlay);
        }

        this.registeredOverlays.delete(overlay);
    }

    protected onOverlayOpen (overlay: Overlay) {

        if (this.hasOverlay(overlay)) {

            const { updateListener, positionStrategy, focusTrap, config } = this.registeredOverlays.get(overlay)!;

            if (config.template && config.context) {

                // to keep a template up-to-date with it's context, we have to render the template
                // everytime the context renders - that is, on every update which was triggered
                config.context.addEventListener('update', updateListener as EventListener);

                this.renderOverlay(overlay);
            }

            if (positionStrategy) {

                positionStrategy.update();
            }

            // if (focusTrap) {

            //     focusTrap.attach(overlay);
            // }

            // TODO: manage backdrop

            // if (config.backdrop) {

            //     this.backdrop.show();
            // }
        }
    }

    protected onOverlayClose (overlay: Overlay) {

        // TODO: this doesn't get called when programmatic overlays close...
        // the issue is the open-changed event being triggered in the overlay's update cycle
        // which is after the overlay was destroyed already...
        if (this.hasOverlay(overlay)) {

            const { updateListener, focusTrap, config } = this.registeredOverlays.get(overlay)!;

            if (config.template && config.context) {

                config.context.removeEventListener('update', updateListener as EventListener);
            }

            // if (focusTrap) {

            //     focusTrap.detach();
            // }

            // this.backdrop.hide();
        }
    }

    protected configureOverlay (overlay: Overlay, config: Partial<OverlayConfig> = {}): OverlayDefinition {

        console.log('configureOverlay()... ', overlay, config);

        const definition: OverlayDefinition = {
            config: config,
            positionStrategy: this.createPositionStrategy(overlay, config),
            overlayTrigger: this.createOverlayTrigger(overlay, config),
            // focusTrap: this.createFocusTrap(overlay, config),
            updateListener: () => this.renderOverlay(overlay),
            openChangeListener: (event: PropertyChangeEvent<boolean>) => this.handleOpenChange(overlay, event),
            focusChangeListener: (event: FocusChangeEvent) => this.handleFocusChange(overlay, event),
            destroy: () => {

                overlay.removeEventListener('open-changed', definition.openChangeListener as EventListener);
                // overlay.removeEventListener('focus-changed', definition.focusChangeListener as EventListener);

                this.disposePositionStrategy(overlay);
                this.disposeOverlayTrigger(overlay);
                // this.disposeFocusTrap(overlay);
            }

        } as OverlayDefinition;

        overlay.addEventListener('open-changed', definition.openChangeListener as EventListener);
        // overlay.addEventListener('focus-changed', definition.focusChangeListener as EventListener);

        return definition;
    }

    updateOverlayConfig (overlay: Overlay, config: Partial<OverlayConfig> = {}) {

        this._throwUnregiseredOverlay(overlay);

        const overlayDefinition = this.registeredOverlays.get(overlay)!;

        const overlayConfig: Partial<OverlayConfig> = { ...overlayDefinition.config, ...config };

        this.updatePositionStrategy(overlay, overlayConfig);

        this.updateOverlayTrigger(overlay, overlayConfig);

        // finally store the updated config in the OverlayDefinition
        overlayDefinition.config = overlayConfig;
    }

    protected updatePositionStrategy (overlay: Overlay, config: Partial<OverlayConfig>) {

        const definition = this.registeredOverlays.get(overlay)!;

        const hasTypeChanged = definition.config.positionType !== config.positionType;
        const hasConfigChanged = hasPositionConfigChanged(definition.config, config);

        console.log('updatePositionStrategy... type changed: %s, config changed: %s', hasTypeChanged, hasConfigChanged);

        if (hasTypeChanged || hasConfigChanged) {

            this.disposePositionStrategy(overlay);

            definition.positionStrategy = this.createPositionStrategy(overlay, config);
        }
    }

    protected createPositionStrategy (overlay: Overlay, config: Partial<OverlayConfig>): PositionStrategy | undefined {

        if (config.positionType) {

            const positionStrategy = this.positionStrategyFactory.createPositionStrategy(
                config.positionType,
                overlay,
                this._extractPositionConfig(config));

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

    /**
     * Updates the trigger element and trigger type of an Overlay
     *
     * If the trigger element changed, the OverlayTrigger instance will be detached from the old trigger element
     * and re-attached to the new trigger element. If the trigger type changed, the old OverlayTrigger will be detached,
     * a new one will be created and attached to the trigger element.
     */
    protected updateOverlayTrigger (overlay: Overlay, config: Partial<OverlayConfig>) {

        const definition = this.registeredOverlays.get(overlay)!;

        const hasTypeChanged = config.triggerType !== definition.config.triggerType;
        const hasTriggerChanged = config.trigger !== definition.config.trigger;

        console.log('updateOverlayTrigger... type changed: %s, trigger changed: %s', hasTypeChanged, hasTriggerChanged);

        if (hasTriggerChanged || hasTypeChanged) {

            this.disposeOverlayTrigger(overlay);

            definition.overlayTrigger = this.createOverlayTrigger(overlay, config);
        }
    }

    protected createOverlayTrigger (overlay: Overlay, config: Partial<OverlayConfig>): OverlayTrigger | undefined {

        if (config.trigger && config.triggerType) {

            // const overlayTrigger = this.overlayTriggerFactory.createOverlayTrigger(config.triggerType, overlay);
            const overlayTrigger = new OverlayController(overlay, config);

            overlayTrigger.attach(document.querySelector(config.trigger) as HTMLElement);

            return overlayTrigger;
        }
    }

    protected disposeOverlayTrigger (overlay: Overlay) {

        const definition = this.registeredOverlays.get(overlay)!;

        if (definition.overlayTrigger) {

            definition.overlayTrigger.detach();

            definition.overlayTrigger = undefined;
        }
    }

    protected updateFocusTrap () { }

    protected createFocusTrap (overlay: Overlay, config: Partial<OverlayConfig>): FocusTrap | undefined {

        if (config.trapFocus) {

            const focusTrapConfig = ['autoFocus', 'initialFocus', 'restoreFocus', 'wrapFocus'].reduce(
                (previous, current) => {

                    if (config[current as keyof FocusTrapConfig] !== undefined) {

                        previous[current as keyof FocusTrapConfig] = config[current as keyof FocusTrapConfig] as any;
                    }

                    return previous;
                },
                {} as Partial<FocusTrapConfig>
            )

            return new FocusTrap(focusTrapConfig);
        }
    }

    protected disposeFocusTrap (overlay: Overlay) {

        const definition = this.registeredOverlays.get(overlay)!;

        if (definition.focusTrap) {

            definition.focusTrap.detach();

            definition.focusTrap = undefined;
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

            // TODO: use template and context from definition.config
            const { template, context } = this.registeredOverlays.get(overlay)!.config;

            if (template) {

                // TODO: check if context is always available, otherwise use overlay as fallback-context
                render(template(context || overlay), overlay, { eventContext: context || overlay });
            }
        }
    }

    protected handleOpenChange (overlay: Overlay, event: PropertyChangeEvent<boolean>) {

        const open = event.detail.current;

        if (open) {

            this.onOverlayOpen(overlay);

        } else {

            this.onOverlayClose(overlay);
        }
    }

    protected handleFocusChange (overlay: Overlay, event: FocusChangeEvent) {

        const hasFocus = event.detail.type === 'focusin';

        if (!hasFocus) {

            // when loosing focus, we wait for potential focusin events on child overlays by delaying the active check with a promise
            Promise.resolve().then(() => {

                // then we check if the overlay is active and if not, we close it
                if (!this.isOverlayActive(overlay)) this.closeOverlay(overlay, event);
            })
        }
    }

    private _extractPositionConfig (overlayConfig: Partial<OverlayConfig>): Partial<PositionConfig> {

        const positionConfig: Partial<PositionConfig> = {};

        POSITION_CONFIG_FIELDS.forEach(key => {

            if (overlayConfig[key] !== undefined) {

                positionConfig[key] = overlayConfig[key] as any;
            }
        });

        return positionConfig;
    }

    private _throwUnregiseredOverlay (overlay: Overlay) {

        if (!this.hasOverlay(overlay)) {

            throw OVERLAY_UNREGISTERED_ERROR(overlay.constructor as typeof Overlay);
        }
    }
}
