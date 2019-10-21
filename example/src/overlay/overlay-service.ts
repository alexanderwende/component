import { Component, PropertyChangeEvent } from '@partkit/component';
import { html, render } from 'lit-html';
import { TemplateFunction } from '../template-function';
import { Overlay } from './overlay';
import { PositionStrategyFactory } from "../position/position-strategy-factory";
import { PositionStrategy } from "../position/position-strategy";
import { OverlayTriggerFactory } from './overlay-trigger-factory';
import { OverlayTrigger } from './overlay-trigger';
import { OverlayBackdrop } from './overlay-backdrop';
import { insertAfter } from '../dom';

const OVERLAY_UNREGISTERED_ERROR = (overlay: typeof Overlay) => new Error(`Overlay is not registered: ${ overlay.selector }`);

export interface OverlayConfig {
    positionType: string;
    trigger?: string;
    triggerType?: string;
    template?: TemplateFunction;
    context?: Component;
    backdrop: boolean;
    closeOnEscape: boolean;
    closeOnBackdropClick: boolean;
    autoFocus: boolean;
    trapFocus: boolean;
    restoreFocus: boolean;
}

export const DEAFULT_OVERLAY_CONFIG: OverlayConfig = {
    positionType: 'fixed',
    trigger: undefined,
    triggerType: undefined,
    template: undefined,
    context: undefined,
    backdrop: true,
    closeOnEscape: true,
    closeOnBackdropClick: true,
    autoFocus: true,
    trapFocus: true,
    restoreFocus: true,
}

// export interface OverlayState {
//     config: OverlayConfig;
//     positionStrategy: PositionStrategy;
//     overlayTrigger: OverlayTrigger;
//     template: TemplateFunction;
//     context: Component;
//     destroy: () => void;
// }

let OVERLAY_SERVICE_INSTANCE: OverlayService | undefined;

// export class OverlayServiceOld {

//     protected _overlays = new Map<Overlay, OverlayState>();

//     // a stack of currently active overlays
//     protected _activeOverlays: Overlay[] = [];

//     protected overlays = new Map<Overlay, () => void>();

//     protected backdrop!: OverlayBackdrop;

//     constructor (
//         protected positionStrategyFactory: PositionStrategyFactory = new PositionStrategyFactory(),
//         protected overlayTriggerFactory: OverlayTriggerFactory = new OverlayTriggerFactory(),
//         protected root: HTMLElement = document.body
//     ) {

//         if (!OVERLAY_SERVICE_INSTANCE) {

//             OVERLAY_SERVICE_INSTANCE = this;

//             this.createBackdrop();
//         }

//         return OVERLAY_SERVICE_INSTANCE;
//     }

//     // createPositionStrategy (type: string, ...args: any[]): PositionStrategy {

//     //     return this.positionStrategyFactory.createPositionStrategy(type, ...args);
//     // }

//     // createOverlayTrigger (type: string, ...args: any[]): OverlayTrigger {

//     //     return this.overlayTriggerFactory.createOverlayTrigger(type, ...args);
//     // }

//     hasOpenOverlays () {

//         return this._activeOverlays.length > 0;
//     }

//     isOverlayOpen (overlay: Overlay) {

//         return this._activeOverlays.includes(overlay);
//     }

//     createBackdrop () {

//         this.backdrop = document.createElement(OverlayBackdrop.selector) as OverlayBackdrop;

//         this.root.appendChild(this.backdrop);
//     }

//     createOverlay (template: TemplateFunction, context?: Component, positionStrategy?: PositionStrategy): Overlay {

//         const overlay = document.createElement(Overlay.selector) as Overlay;

//         overlay.positionStrategy = positionStrategy || this.positionStrategyFactory.createPositionStrategy('fixed', overlay);

//         context = context || overlay;

//         // to keep a template up-to-date with it's context, we have to render the template
//         // everytime the context renders - that is, on every update which was triggered
//         const updateListener = () => {

//             // check the overlay hasn't been destroyed yet
//             if (this.overlays.has(overlay)) {

//                 this.renderOverlay(overlay, template, context);
//             }
//         }

//         // we can use a component's 'update' event to re-render the template on every context update
//         // lit-html will take care of efficiently updating the DOM
//         context.addEventListener('update', updateListener);

//         this.overlays.set(overlay, () => context!.removeEventListener('update', updateListener));

//         this.attachOverlay(overlay);

//         this.renderOverlay(overlay, template, context);

//         return overlay;
//     }

//     registerOverlay (overlay: Overlay): boolean {

//         console.log('registerOverlay...', this.overlays.has(overlay));

//         if (!this.overlays.has(overlay)) {

//             this.overlays.set(overlay, () => { });

//             this.attachOverlay(overlay);

//             return true;

//         } else {

//             return false;
//         }
//     }

//     openOverlay (overlay: Overlay, event?: Event) {

//         if (!this.isOverlayOpen(overlay)) {

//             overlay.show();

//             this._activeOverlays.push(overlay);
//         }
//     }

//     onShowOverlay (overlay: Overlay) {

//         this.backdrop.show();
//     }

//     closeOverlay (overlay: Overlay) {

//         if (this.isOverlayOpen(overlay)) {

//             // close all descendant overlays by emptying the stack until we reach the current overlay
//             let descandant = this._activeOverlays.pop()!;

//             while (descandant !== overlay) {

//                 descandant.hide();

//                 descandant = this._activeOverlays.pop()!;
//             }

//             overlay.hide();
//         }
//     }

//     onHideOverlay (overlay: Overlay) {

//         if (!this.hasOpenOverlays()) this.backdrop.hide();
//     }

//     destroyOverlay (overlay: Overlay, disconnect: boolean = true) {

//         // TODO: we need to also destroy descendant overlays
//         this.closeOverlay(overlay);

//         const teardown = this.overlays.get(overlay);

//         if (teardown) teardown();

//         if (disconnect && overlay.parentElement) {

//             overlay.parentElement.removeChild(overlay);
//         }

//         this.overlays.delete(overlay);
//     }

//     protected configureOverlay (overlay: Overlay, config: Partial<OverlayConfig> = {}, context?: Component): OverlayState {

//         const overlayState = { ...this._overlays.get(overlay) } || {} as Partial<OverlayState>;



//         const positionType = config.positionType || 'fixed';

//         overlayState.positionStrategy = this.positionStrategyFactory.createPositionStrategy(positionType, overlay);



//         const triggerType = config.triggerType;

//         if (triggerType) {

//             overlayState.overlayTrigger = this.overlayTriggerFactory.createOverlayTrigger(triggerType);
//         }



//         const template = config.template || overlay.template;

//         if (template) {

//             context = context || overlay.context || overlay;

//             // to keep a template up-to-date with it's context, we have to render the template
//             // everytime the context renders - that is, on every update which was triggered
//             const updateListener = () => {

//                 // check the overlay hasn't been destroyed yet
//                 if (this.overlays.has(overlay)) {

//                     this.renderOverlay(overlay, template, context);
//                 }
//             }

//             // we can use a component's 'update' event to re-render the template on every context update
//             // lit-html will take care of efficiently updating the DOM
//             context.addEventListener('update', updateListener);

//             overlayState.template = template;
//             overlayState.context = context;
//             overlayState.destroy = () => context!.removeEventListener('update', updateListener);
//         }

//         return overlayState as OverlayState;
//     }

//     /**
//      * Attach an overlay to the {@link OverlayService}'s root element
//      *
//      * All overlays are attached to the root element in order, after the {@link OverlayBackdrop}.
//      *
//      * @param overlay - The overlay instance to attach
//      */
//     protected attachOverlay (overlay: Overlay) {

//         if (overlay.parentElement === this.root) return;

//         let lastOverlay: HTMLElement = this.backdrop;

//         while (lastOverlay.nextSibling && lastOverlay.nextSibling instanceof Overlay) {

//             lastOverlay = lastOverlay.nextSibling;
//         }

//         insertAfter(overlay, lastOverlay);
//     }

//     protected renderOverlay (overlay: Overlay, template: TemplateFunction, context?: Component) {

//         const result = template(context || overlay) || html``;

//         render(result, overlay, { eventContext: context || overlay });
//     }
// }

export interface OverlayDefinition {
    config: OverlayConfig;
    positionStrategy: PositionStrategy;
    overlayTrigger?: OverlayTrigger;
    template: TemplateFunction;
    context: Component;
    updateListener: (event: CustomEvent) => void;
    openChangeListener: (event: CustomEvent) => void;
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

                isActive = this.isOverlayActive(this.activeOverlays[index]);
            }
        }

        return isActive;
    }

    createBackdrop () {

        this.backdrop = document.createElement(OverlayBackdrop.selector) as OverlayBackdrop;

        this.root.appendChild(this.backdrop);
    }

    createOverlay (config: Partial<OverlayConfig>): Overlay {

        const overlay = document.createElement(Overlay.selector) as Overlay;

        const definition = this.configureOverlay(overlay, config);

        this.registerOverlay(overlay, definition);

        if (definition.template) {

            this.renderOverlay(overlay);
        }

        return overlay;
    }

    /**
     * Register on overlay with the overlay service
     *
     * @description
     * Adds the overlay instance to the overlay service's registry, extracts the overlay's configuration and
     * attaches the overlay to the overlay service's root location in the document body.
     *
     * @returns True if the overlay was registered successfully, false if the overlay has been registered already
     */
    registerOverlay (overlay: Overlay, definition?: OverlayDefinition): boolean {

        console.log('registerOverlay...', definition);

        if (!this.hasOverlay(overlay)) {

            if (!definition) {

                // if no definition is provided with the register call, we extract it from the overlay properties
                definition = this.configureOverlay(overlay, {
                    triggerType: overlay.triggerType,
                    positionType: overlay.positionType,
                    template: overlay.template,
                    context: overlay.context || overlay
                });

                console.log('registerOverlay...', definition);
            }

            this.registeredOverlays.set(overlay, definition);

            this.attachOverlay(overlay);

            return true;

        } else {

            return false;
        }
    }

    openOverlay (overlay: Overlay, event?: Event) {

        this._throwUnregiseredOverlay(overlay);

        if (!overlay.open) {

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
        }
    }

    closeOverlay (overlay: Overlay, event?: Event) {

        this._throwUnregiseredOverlay(overlay);

        if (this.isOverlayOpen(overlay)) {

            let isFound = false;

            while (!isFound) {

                // activeOverlay is either a descendant of overlay or overlay itself
                let activeOverlay = this.activeOverlays.pop()!;

                // if we arrived at the overlay, we stop closing
                isFound = activeOverlay === overlay;

                activeOverlay.hide();
            }
        }
    }

    toggleOverlay (overlay: Overlay, event?: Event) {

        if (overlay.open) {

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

            const { updateListener, context, positionStrategy } = this.registeredOverlays.get(overlay)!;

            context.addEventListener('update', updateListener as EventListener);

            this.renderOverlay(overlay);

            positionStrategy.updatePosition();
        }
    }

    protected onOverlayClose (overlay: Overlay) {

        if (this.hasOverlay(overlay)) {

            const { updateListener, context } = this.registeredOverlays.get(overlay)!;

            context.removeEventListener('update', updateListener as EventListener);
        }
    }

    protected configureOverlay (overlay: Overlay, config: Partial<OverlayConfig> = {}): OverlayDefinition {

        const overlayConfig = { ...DEAFULT_OVERLAY_CONFIG, ...config };
        const overlayDefinition = { ...this.registeredOverlays.get(overlay) } || {} as Partial<OverlayDefinition>;



        overlayDefinition.positionStrategy = this.positionStrategyFactory.createPositionStrategy(overlayConfig.positionType, overlay);



        if (overlayConfig.triggerType) {

            overlayDefinition.overlayTrigger = this.overlayTriggerFactory.createOverlayTrigger(overlayConfig.triggerType, overlay);
        }

        const openChangeListener = ((event: PropertyChangeEvent<boolean>) => {

            const open = event.detail.current;

            if (open) {

                this.onOverlayOpen(overlay);

            } else {

                this.onOverlayClose(overlay);
            }
        }) as EventListener;

        overlay.addEventListener('open-changed', openChangeListener);

        overlayDefinition.updateListener = () => {

            this.renderOverlay(overlay);
        }




        // to keep a template up-to-date with it's context, we have to render the template
        // everytime the context renders - that is, on every update which was triggered


        // we can use a component's 'update' event to re-render the template on every context update
        // lit-html will take care of efficiently updating the DOM
        // context.addEventListener('update', updateListener);

        overlayDefinition.template = overlayConfig.template;
        overlayDefinition.context = overlayConfig.context || overlay;


        overlayDefinition.destroy = () => {

            overlay.removeEventListener('open-changed', openChangeListener);
            // context!.removeEventListener('update', updateListener);
        };

        overlayDefinition.config = overlayConfig;

        return overlayDefinition as OverlayDefinition;
    }

    updateOverlayConfig (overlay: Overlay, config: Partial<OverlayConfig> = {}) {

        this._throwUnregiseredOverlay(overlay);

        const overlayDefinition = this.registeredOverlays.get(overlay)!;

        const overlayConfig: OverlayConfig = { ...overlayDefinition.config, ...config };

        this.updateOverlayTrigger(overlay, overlayConfig);

        // finally store the updated config in the OverlayDefinition
        overlayDefinition.config = overlayConfig;
    }

    /**
     * Updates the trigger element and trigger type of an Overlay
     *
     * If the trigger element changed, the OverlayTrigger instance will be detached from the old trigger element
     * and re-attached to the new trigger element. If the trigger type changed, the old OverlayTrigger will be detached,
     * a new one will be created and attached to the trigger element.
     */
    protected updateOverlayTrigger (overlay: Overlay, config: OverlayConfig) {

        console.log('updateOverlayTrigger... ', config);

        const definition = this.registeredOverlays.get(overlay)!;

        const hasTriggerChanged = config.trigger !== definition.config.trigger;
        const hasTriggerTypeChanged = config.triggerType !== definition.config.triggerType;

        // if the trigger element or trigger type have changed, we need to detach an existing OverlayTrigger
        if (hasTriggerChanged || hasTriggerTypeChanged) {

            if (definition.overlayTrigger) {

                definition.overlayTrigger.detach();
            }
        }

        // if we have a new trigger type, we create a new OverlayTrigger
        if (hasTriggerTypeChanged) {

            definition.overlayTrigger = config.triggerType
                ? this.overlayTriggerFactory.createOverlayTrigger(config.triggerType, overlay)
                : undefined;
        }

        // if the trigger element or trigger type have changed, we need to re-attach the OverlayTrigger to the trigger element
        if (hasTriggerChanged || hasTriggerTypeChanged) {

            if (config.trigger && definition.overlayTrigger) {

                definition.overlayTrigger.attach(document.querySelector(config.trigger) as HTMLElement);
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

            const { template, context } = this.registeredOverlays.get(overlay)!;

            if (template) {

                render(template(context), overlay, { eventContext: context });
            }
        }

        // const result = template(context || overlay) || html``;

        // render(result, overlay, { eventContext: context || overlay });
    }

    private _throwUnregiseredOverlay (overlay: Overlay) {

        if (!this.hasOverlay(overlay)) {

            throw OVERLAY_UNREGISTERED_ERROR(overlay.constructor as typeof Overlay);
        }
    }
}
