import { AttributeConverterBoolean, Changes, Component, component, css, listener, property, PropertyChangeEvent } from '@partkit/component';
import { html } from 'lit-html';
import { BehaviorFactory } from '../behavior-factory';
import { EventManager } from '../event-manager';
import { IDGenerator } from '../id-generator';
import { MixinRole } from '../mixins/role';
import { PositionConfig, PositionController } from '../position';
import { PositionControllerFactory } from '../position/position-controller-factory';
import { DEFAULT_OVERLAY_CONFIG, OverlayConfig } from './overlay-config';
import { OverlayTrigger, OverlayTriggerConfig, OverlayTriggerFactory } from './trigger';
import { replaceWith, insertAfter } from '../dom';

const ALREADY_INITIALIZED_ERROR = () => new Error('Cannot initialize Overlay. Overlay has already been initialized.');

const ALREADY_REGISTERED_ERROR = (overlay: Overlay) => new Error(`Overlay has already been registered: ${ overlay.id }.`);

const NOT_REGISTERED_ERROR = (overlay: Overlay) => new Error(`Overlay is not registered: ${ overlay.id }.`);

const THROW_UNREGISTERED_OVERLAY = (overlay: Overlay) => {

    if (!(overlay.constructor as typeof Overlay).isOverlayRegistered(overlay)) {

        throw NOT_REGISTERED_ERROR(overlay);
    }
}

const ID_GENERATOR = new IDGenerator('partkit-overlay-');

export interface OverlayInit {
    overlayTriggerFactory: BehaviorFactory<OverlayTrigger, OverlayTriggerConfig>;
    positionControllerFactory: BehaviorFactory<PositionController, PositionConfig>;
    overlayRoot: HTMLElement;
}

export interface OverlaySettings {
    // TODO: check if we need to store config...
    config: Partial<OverlayConfig>;
    events: EventManager;
    positionController?: PositionController;
    overlayTrigger?: OverlayTrigger;
}

@component({
    selector: 'ui-overlay',
    styles: [css`
    :host {
        display: block;
        position: fixed;
        box-sizing: border-box;
        border: 2px solid #bfbfbf;
        background-color: #fff;
        border-radius: 4px;
    }
    :host([aria-hidden=true]) {
        display: none;
    }
    `],
    template: () => html`
    <slot></slot>
    `,
})
export class Overlay extends MixinRole(Component, 'dialog') {

    /** @internal */
    protected static _initialized = false;

    /** @internal */
    protected static _overlayTriggerFactory: BehaviorFactory<OverlayTrigger, OverlayTriggerConfig> = new OverlayTriggerFactory();

    /** @internal */
    protected static _positionControllerFactory: BehaviorFactory<PositionController, PositionConfig> = new PositionControllerFactory();

    /** @internal */
    protected static _overlayRoot: HTMLElement = document.body;

    protected static registeredOverlays = new Map<Overlay, OverlaySettings>();

    protected static activeOverlays = new Set<Overlay>();

    static get overlayTriggerFactory (): BehaviorFactory<OverlayTrigger, OverlayTriggerConfig> {

        return this._overlayTriggerFactory;
    }

    static get positionControllerFactory (): BehaviorFactory<PositionController, PositionConfig> {

        return this._positionControllerFactory;
    }

    static get overlayRoot (): HTMLElement {

        return this._overlayRoot;
    }

    static get isInitialized (): boolean {

        return this._initialized;
    }

    static initialize (config: Partial<OverlayInit>) {

        if (this.isInitialized) throw ALREADY_INITIALIZED_ERROR();

        this._overlayTriggerFactory = config.overlayTriggerFactory || this._overlayTriggerFactory;
        this._positionControllerFactory = config.positionControllerFactory || this._positionControllerFactory;
        this._overlayRoot = config.overlayRoot || this._overlayRoot;

        this._initialized = true;
    }

    static isOverlayRegistered (overlay: Overlay): boolean {

        return this.registeredOverlays.has(overlay);
    }

    /**
    * An overlay is considered focused, if either itself or any of its descendant nodes has focus.
    */
    static isOverlayFocused (overlay: Overlay): boolean {

        THROW_UNREGISTERED_OVERLAY(overlay);

        const activeElement = document.activeElement;

        return overlay === activeElement || overlay.contains(activeElement);
    }

    /**
     * An overlay is considered active if it is either focused or has a descendant overlay which is focused.
     */
    static isOverlayActive (overlay: Overlay): boolean {

        THROW_UNREGISTERED_OVERLAY(overlay);

        let isFound = false;
        let isActive = false;

        if (overlay.config.stacked && overlay.open) {

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
    static getParentOverlay (overlay: Overlay): Overlay | undefined {

        THROW_UNREGISTERED_OVERLAY(overlay);

        if (overlay.config.stacked && overlay.open) {

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

    /**
    * Create a new overlay
    */
    static createOverlay (config: Partial<OverlayConfig>): Overlay {

        const overlay = document.createElement(Overlay.selector) as Overlay;

        overlay.config = { ...DEFAULT_OVERLAY_CONFIG, ...config };

        return overlay;
    }

    static disposeOverlay (overlay: Overlay) {

        overlay.parentElement?.removeChild(overlay);
    }

    /** @internal */
    protected _config = DEFAULT_OVERLAY_CONFIG;

    protected marker?: Comment;

    protected isReattaching = false;

    @property({ converter: AttributeConverterBoolean })
    open = false;

    @property({ attribute: false })
    set config (value: OverlayConfig) {

        this._config = Object.assign(this._config, value);
    }

    get config (): OverlayConfig {

        return this._config;
    }

    connectedCallback () {

        if (this.isReattaching) return;

        this.id = this.id || ID_GENERATOR.getNextID();

        this.register();

        super.connectedCallback();
    }

    disconnectedCallback () {

        if (this.isReattaching) return;

        this.unregister();

        super.disconnectedCallback();
    }

    updateCallback (changes: Changes, firstUpdate: boolean) {

        if (firstUpdate) {

            this.setAttribute('aria-hidden', `${ !this.open }`);
        }

        if (changes.has('open')) {

            this.setAttribute('aria-hidden', `${ !this.open }`);

            this.notifyProperty('open', changes.get('open'), this.open);
        }
    }

    @listener({ event: 'open-changed' })
    protected handleOpenChanged (event: PropertyChangeEvent<boolean>) {

        const overlayRoot = this.getConstructor().overlayRoot;

        this.isReattaching = true;

        if (event.detail.current === true) {

            this.marker = document.createComment(this.id);

            replaceWith(this.marker, this);
            // this.parentNode?.replaceChild(this.marker, this);

            overlayRoot.appendChild(this);

        } else {

            replaceWith(this, this.marker!);
            // this.marker?.parentNode?.replaceChild(this, this.marker);

            this.marker = undefined;
        }

        this.isReattaching = false;
    }

    protected register () {

        const constructor = this.getConstructor();

        if (constructor.isOverlayRegistered(this)) throw ALREADY_REGISTERED_ERROR(this);

        const settings: OverlaySettings = {
            config: this.config,
            events: new EventManager(),
            overlayTrigger: constructor.overlayTriggerFactory.create(this.config.triggerType, this.config, this),
            positionController: constructor.positionControllerFactory.create(this.config.positionType, this.config),
        };

        constructor.registeredOverlays.set(this, settings);
    }

    protected unregister () {

        const constructor = this.getConstructor();

        if (!constructor.isOverlayRegistered(this)) throw NOT_REGISTERED_ERROR(this);

        const settings = constructor.registeredOverlays.get(this)!;

        settings.overlayTrigger?.detach();
        settings.positionController?.detach();

        settings.overlayTrigger = undefined;
        settings.positionController = undefined;

        constructor.registeredOverlays.delete(this);
    }

    protected getConstructor (): typeof Overlay {

        return this.constructor as typeof Overlay;
    }
}
