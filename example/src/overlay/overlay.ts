import { AttributeConverterARIABoolean, AttributeConverterString, Changes, Component, component, css, property } from "@partkit/component";
import { html } from "lit-html";
import { PositionManager } from "../position/position-manager";
import { FixedPositionStrategy, PositionStrategy } from "../position/position-strategy";
import { OverlayService } from "./overlay-service";
import { OverlayTrigger } from "./overlay-trigger";

export interface HiddenChangeEvent extends CustomEvent {
    type: 'hidden-change';
    detail: {
        hidden: boolean;
    }
}

@component<Overlay>({
    selector: 'ui-overlay',
    styles: [css`
    :host {
        display: block;
        position: absolute;
        box-sizing: border-box;
        border: 2px solid #bfbfbf;
        background-color: #fff;
        border-radius: 4px;
        will-change: transform;
    }
    :host([aria-hidden=true]) {
        display: none;
        will-change: auto;
    }
    `],
    template: () => html`
    <slot></slot>
    `,
})
export class Overlay extends Component {

    protected templateObserver!: MutationObserver;

    protected template: HTMLTemplateElement | null = null;

    protected overlayService = new OverlayService();

    @property({
        converter: AttributeConverterString
    })
    role!: string;

    @property({
        attribute: 'aria-hidden',
        converter: AttributeConverterARIABoolean,
        reflectAttribute: false,
    })
    hidden!: boolean;

    @property({
        converter: AttributeConverterString
    })
    trigger!: string;

    positionStrategy: PositionStrategy = new FixedPositionStrategy(this);

    protected triggerInstance: OverlayTrigger | null = null;

    protected triggerElement: HTMLElement | null = null;

    protected positionManager!: PositionManager;

    connectedCallback () {

        if (this.parentElement !== document.body) {

            document.body.appendChild(this);

            return;
        }

        super.connectedCallback();

        this.role = 'dialog';

        this.hidden = true;

        // this.positionManager = new PositionManager(new ConnectedPositionStrategy(this, document.getElementById(this.trigger)!));
        this.positionManager = new PositionManager(this.positionStrategy);

        this.template = this.querySelector('template');

        if (this.template) {

            this.templateObserver = new MutationObserver((mutations: MutationRecord[], observer: MutationObserver) => this.updateTemplate());

            this.templateObserver.observe(
                // we can't observe a template directly, but the DocumentFragment stored in its content property
                this.template.content,
                {
                    attributes: true,
                    characterData: true,
                    childList: true,
                    subtree: true,
                }
            );
        }

        this.overlayService.registerOverlay(this);
    }

    disconnectedCallback () {

        if (this.positionManager) this.positionManager.destroy();
        if (this.templateObserver) this.templateObserver.disconnect();

        this.overlayService.destroyOverlay(this, false);
    }

    updateCallback (changes: Changes, firstUpdate: boolean) {

        if (changes.has('trigger')) {

            this.updateTrigger(document.getElementById(this.trigger)!);
        }
    }

    open () {

        if (this.hidden) {

            this.watch(() => this.hidden = false);

            this.updateTemplate();

            this.reposition();
        }
    }

    close () {

        if (!this.hidden) {

            this.watch(() => this.hidden = true);
        }
    }

    toggle () {

        if (this.hidden) {

            this.open();

        } else {

            this.close();
        }
    }

    reposition () {

        if (this.positionManager) {

            this.positionManager.updatePosition();
        }
    }

    protected updateTrigger (triggerElement: HTMLElement) {

        if (this.triggerInstance) {

            this.triggerInstance.destroy();
        }

        this.triggerInstance = new OverlayTrigger(triggerElement, this);
    }

    protected updateTemplate () {

        this.template = this.querySelector('template');

        if (this.template && !this.hidden) {

            const contentSlot = this.renderRoot.querySelector('slot') as HTMLSlotElement;

            requestAnimationFrame(() => {

                contentSlot.innerHTML = '';

                // contentSlot.appendChild(this.template!.content.cloneNode(true));
                contentSlot.appendChild(document.importNode(this.template!.content, true));
            });
        }
    }
}
