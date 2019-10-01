import { AttributeConverterARIABoolean, AttributeConverterString, Changes, Component, component, css, property } from "@partkit/component";
import { html } from "lit-html";
import { ConnectedPositionStrategy, PositionManager } from "../position-manager";
import { OverlayService } from "./overlay-service";

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
    <slot name="content"></slot>
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

    protected triggerElement: HTMLElement | null = null;

    protected triggerListener: EventListener | null = null;

    protected positionManager!: PositionManager;

    connectedCallback () {

        if (this.parentElement !== document.body) {

            document.body.appendChild(this);

            return;
        }

        super.connectedCallback();

        this.role = 'dialog';

        this.hidden = true;

        this.positionManager = new PositionManager(new ConnectedPositionStrategy(this, document.getElementById(this.trigger)!));

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

        this.overlayService.destroyOverlay(this);
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

            if (this.triggerElement) this.triggerElement!.setAttribute('aria-expanded', 'true');
        }
    }

    close () {

        if (!this.hidden) {

            this.watch(() => this.hidden = true);

            if (this.triggerElement) this.triggerElement!.setAttribute('aria-expanded', 'false');
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

        if (this.triggerElement && this.triggerListener) {

            if (this.triggerListener) this.triggerElement.removeEventListener('click', this.triggerListener);
        }

        this.triggerElement = triggerElement;
        this.triggerListener = (event) => this.toggle();

        this.triggerElement.addEventListener('click', this.triggerListener);

        this.triggerElement.setAttribute('aria-haspopup', 'dialog');
        this.triggerElement.setAttribute('aria-expanded', this.hidden ? 'false' : 'true');
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
