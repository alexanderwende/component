import { AttributeConverterBoolean, AttributeConverterNumber, Changes, Component, component, css, listener, property, PropertyChangeEvent } from '@partkit/component';
import { html } from 'lit-html';
import { BehaviorFactory } from '../behavior/behavior-factory';
import { activeElement, replaceWith } from '../dom';
import { EventManager } from '../events';
import { IDGenerator } from '../id-generator';
import { MixinRole } from '../mixins/role';
import { PositionConfig, PositionController, PositionControllerFactory } from '../position';
import { DEFAULT_OVERLAY_CONFIG, MixinOverlayConfig, OverlayConfig } from './overlay-config';
import { OverlayTrigger, OverlayTriggerConfig, OverlayTriggerFactory } from './trigger';

const ALREADY_INITIALIZED_ERROR = () => new Error('Cannot initialize Overlay. Overlay has already been initialized.');

const ALREADY_REGISTERED_ERROR = (overlay: Overlay) => new Error(`Overlay has already been registered: ${ overlay.id }.`);

const NOT_REGISTERED_ERROR = (overlay: Overlay) => new Error(`Overlay is not registered: ${ overlay.id }.`);

const THROW_UNREGISTERED_OVERLAY = (overlay: Overlay) => {

    if (!overlay.isRegistered) throw NOT_REGISTERED_ERROR(overlay);
}

const ID_GENERATOR = new IDGenerator('partkit-overlay-');

export interface OverlayInit {
    overlayTriggerFactory: BehaviorFactory<OverlayTrigger, OverlayTriggerConfig>;
    positionControllerFactory: BehaviorFactory<PositionController, PositionConfig>;
    overlayRoot?: HTMLElement;
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
export class Overlay extends MixinOverlayConfig(MixinRole(Component, 'dialog'), { ...DEFAULT_OVERLAY_CONFIG }) {

    /** @internal */
    protected static _initialized = false;

    /** @internal */
    protected static _overlayTriggerFactory: BehaviorFactory<OverlayTrigger, OverlayTriggerConfig> = new OverlayTriggerFactory();

    /** @internal */
    protected static _positionControllerFactory: BehaviorFactory<PositionController, PositionConfig> = new PositionControllerFactory();

    /** @internal */
    protected static _overlayRoot?: HTMLElement;

    protected static registeredOverlays = new Map<Overlay, OverlaySettings>();

    protected static activeOverlays = new Set<Overlay>();

    static get overlayTriggerFactory (): BehaviorFactory<OverlayTrigger, OverlayTriggerConfig> {

        return this._overlayTriggerFactory;
    }

    static get positionControllerFactory (): BehaviorFactory<PositionController, PositionConfig> {

        return this._positionControllerFactory;
    }

    static get overlayRoot (): HTMLElement | undefined {

        return this._overlayRoot;
    }

    static get isInitialized (): boolean {

        return this._initialized;
    }

    static initialize (config: Partial<OverlayInit>) {

        // TODO: maybe we can allow changing OverlayInit...
        if (this.isInitialized) throw ALREADY_INITIALIZED_ERROR();

        this._overlayTriggerFactory = config.overlayTriggerFactory || this._overlayTriggerFactory;
        this._positionControllerFactory = config.positionControllerFactory || this._positionControllerFactory;
        this._overlayRoot = config.overlayRoot || this._overlayRoot;

        this._initialized = true;
    }

    protected _open = false;

    protected marker!: Comment;

    protected isReattaching = false;

    @property({ converter: AttributeConverterNumber })
    tabindex = -1;

    @property({ converter: AttributeConverterBoolean })
    set open (value: boolean) {
        // if open has changed we update the active overlay stack synchronously
        if (this._open !== value) {
            this._open = value;
            this.updateStack(value);
        }
    }
    get open (): boolean {
        return this._open;
    }


    get static (): typeof Overlay {

        return this.constructor as typeof Overlay;
    }

    get isRegistered (): boolean {

        return this.static.registeredOverlays.has(this);
    }

    /**
    * An overlay is considered focused, if either itself or any of its descendant nodes has focus.
    */
    get isFocused (): boolean {

        THROW_UNREGISTERED_OVERLAY(this);

        return this.contains(activeElement());
    }

    /**
     * An overlay is considered active if it is either focused or has a descendant overlay which is focused.
     */
    get isActive (): boolean {

        THROW_UNREGISTERED_OVERLAY(this);

        let isFound = false;
        let isActive = false;

        if (this.config.stacked && this.open) {

            for (let current of this.static.activeOverlays) {

                isFound = isFound || current === this;

                isActive = isFound && current.isFocused;

                if (isActive) break;
            }
        }

        console.log('Overlay.isActive()... ', this.id, isActive);

        return isActive;
    }

    connectedCallback () {

        if (this.isReattaching) return;

        super.connectedCallback();

        this.id = this.id || ID_GENERATOR.getNextID();

        this.marker = document.createComment(this.id);

        this.register();
    }

    disconnectedCallback () {

        if (this.isReattaching) return;

        this.unregister();

        super.disconnectedCallback();
    }

    updateCallback (changes: Changes, firstUpdate: boolean) {

        if (firstUpdate) {

            this.setAttribute('aria-hidden', `${ !this.open }`);

            this.configure();

        } else {

            if (changes.has('config')) {

                console.log('Overlay.updateCallback()... config: ', this.config);

                this.configure();
            }
        }

        if (changes.has('open')) {

            this.setAttribute('aria-hidden', `${ !this.open }`);

            this.notifyProperty('open', changes.get('open'), this.open);
        }
    }

    show () {

        this.open = true;
    }

    hide () {

        this.open = false;
    }

    toggle (open?: boolean) {

        this.open = open ?? !this.open;
    }

    dispose () {

        this.hide();

        this.parentElement?.removeChild(this);
    }

    /**
     * Get the parent overlay of an active overlay
     *
     * @description
     * If an overlay is stacked, its parent overlay is the one from which it was opened.
     * The parent overlay will be in the activeOverlays stack just before this one.
     */
    getParentOverlay (): Overlay | undefined {

        THROW_UNREGISTERED_OVERLAY(this);

        if (this.config.stacked && this.open) {

            // we start with parent being undefined
            // if the first active overlay in the set matches the specified overlay
            // then indeed the overlay has no parent (the first active overlay is the root)
            let parent: Overlay | undefined = undefined;

            // go through the active overlays
            for (let current of this.static.activeOverlays) {

                // if we have reached the specified active overlay
                // we can return the parent of that overlay (it's the active overlay in the stack just before this one)
                if (current === this) return parent;

                // if we haven't found the specified overlay yet, we set
                // the current overlay as potential parent and move on
                parent = current;
            }
        }
    }

    /**
     * Update the {@link Overlay.(activeOverlays:static)} stack
     *
     * @remarks
     * {@link Overlay} is a stacked overlay system. This means, that at any given time, there is at
     * maximum one overlay considered the active overlay. This is usually the focused overlay and
     * it is always the last overlay in the {@link Overlay.(activeOverlays:static)} stack.
     * When a stacked overlay is opened or closed, we need to update the {@link Overlay.(activeOverlays:static)}
     * stack to reflect the new stack order. The rules for updating the stack are as follows:
     *
     * * when opening a stacked overlay, it is added to the stack
     * * when closing a stacked overlay, all overlays higher in the stack have to be closed too
     * * when opening a stacked overlay with a trigger, we look for an overlay in the stack which
     *   contains the opening overlay's trigger - all overlays higher in the stack have to be closed
     *
     * This method is invoked from the {@link Overlay.open} setter and is executed immediately and
     * synchronously to guarantee the order in which overlays are opened/closed and the stability of
     * the stack as opposed to being scheduled in the update cycle.
     *
     * @param open  `true` if the overlay is opening, `false` otherwise
     */
    protected updateStack (open: boolean) {

        // only stacked overlays participate in the stack management
        if (!this.config.stacked) return;

        // turn stack into array and reverse it, as we want to start with the currently active overlay
        const activeOverlays = [...this.static.activeOverlays].reverse();

        // then iterate over the reverse stack and close each currently active overlay one by one
        // until we find an active overlay which fulfills the rules and can stay open
        activeOverlays.some(activeOverlay => {

            // we are done in the following cases:
            const done = open
                // [this overlay is opening]:
                // the currently active overlay contains the trigger of this overlay and can be
                // considered the parent of this overlay in the stack - or  this overlay doesn't
                // have a trigger and we consider the currently active overlay the parent
                ? this.trigger && activeOverlay.contains(this.trigger) || !this.trigger
                // [this overlay is closing]:
                // the currently active overlay is this overlay which we are about to close;
                // if the currently active overlay is not this overlay, then it is an active
                // overlay higher in the stack which has to be closed
                : activeOverlay === this;

            if (!done) {

                activeOverlay.open = false;
            }

            return done;
        });

        // finally we add/remove this overlay to/from the stack
        open ? this.static.activeOverlays.add(this) : this.static.activeOverlays.delete(this);
    }


    /**
     * Handle the overlay's open-changed event
     *
     * @remarks
     * Property changes are dispatched during the update cycle of the component, so they run in
     * an animationFrame callback. We can therefore run code in these handlers, which runs inside
     * an animationFrame, like updating the position of the overlay without scheduling it.
     *
     * @param event
     */
    @listener({ event: 'open-changed', options: { capture: true } })
    protected handleOpenChanged (event: PropertyChangeEvent<boolean>) {

        // overlays can be nested, which means that 'open-changed'-events can bubble from
        // a nested overlay to its parent - we only want to handle events from this overlay
        // instance, so we check the {@link ComponentEvent}'s detail.target property
        if (event.detail.target !== this) return;

        console.log('Overlay.handleOpenChange()...', event.detail.current);

        if (event.detail.current === true) {

            this.handleOpen();

        } else {

            this.handleClose();
        }

        console.log('activeOverlays: ', this.static.activeOverlays);
    }

    protected handleOpen () {

        this.moveToRoot();

        const positionController = this.static.registeredOverlays.get(this)?.positionController;

        positionController?.attach(this);
        positionController?.update();
    }

    protected handleClose () {

        this.static.registeredOverlays.get(this)?.positionController?.detach();

        this.moveFromRoot();
    }

    protected register () {

        if (this.isRegistered) throw ALREADY_REGISTERED_ERROR(this);

        const settings: OverlaySettings = {
            config: this.config,
            events: new EventManager(),
        };

        this.static.registeredOverlays.set(this, settings);
    }

    protected unregister () {

        if (!this.isRegistered) throw NOT_REGISTERED_ERROR(this);

        const settings = this.static.registeredOverlays.get(this)!;

        settings.overlayTrigger?.detach();
        settings.positionController?.detach();

        settings.overlayTrigger = undefined;
        settings.positionController = undefined;

        this.static.registeredOverlays.delete(this);
    }

    protected configure () {

        console.log('Overlay.configure()... config: ', this.config);

        const settings = this.static.registeredOverlays.get(this)!;

        // dispose of the overlay trigger and position controller
        settings.overlayTrigger?.detach();
        settings.positionController?.detach();

        // recreate the overlay trigger and position controller from the config
        settings.overlayTrigger = this.static.overlayTriggerFactory.create(this.config.triggerType!, this.config, this);
        settings.positionController = this.static.positionControllerFactory.create(this.config.positionType!, this.config);

        // attach the overlay trigger
        settings.overlayTrigger.attach(this.config.trigger);

        // attach the position controller, if the overlay is open
        if (this.open) {

            settings.positionController?.attach(this);
            settings.positionController?.update();
        }
    }

    protected moveToRoot () {

        if (!this.static.overlayRoot) return;

        this.isReattaching = true;

        replaceWith(this.marker, this);

        // TODO: think about this: if we move overlays in the DOM, then a component's selectors might
        // get lost if an update happens in that component while the overlay is open
        // maybe it's better to select dialogs instances only once after 1st render?
        // maybe have a selector option to disable re-querying?
        this.static.overlayRoot.appendChild(this);

        this.isReattaching = false;
    }

    protected moveFromRoot () {

        if (!this.static.overlayRoot) return;

        this.isReattaching = true;

        replaceWith(this, this.marker);

        this.isReattaching = false;
    }
}

// TODO: figure out how to add web component types to html language server
declare global {

    interface HTMLElementTagNameMap {
        'ui-overlay': Overlay
    }
}
