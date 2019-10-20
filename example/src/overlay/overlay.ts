import { AttributeConverterBoolean, AttributeConverterString, Changes, Component, component, css, property, AttributeConverterNumber } from "@partkit/component";
import { html } from "lit-html";
import { PositionManager } from "../position/position-manager";
import { PositionStrategy } from "../position/position-strategy";
import { FixedPositionStrategy } from "../position/strategies/fixed-position-strategy";
import { OverlayService } from "./overlay-service";
import { OverlayTrigger } from "./overlay-trigger";
import { TemplateFunction } from "../template-function";

let OVERLAY_COUNTER = 0;

function nextOverlayId (): string {

    return `partkit-overlay-${ OVERLAY_COUNTER++ }`;
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

    protected overlayService = new OverlayService();

    protected triggerInstance: OverlayTrigger | null = null;

    // protected triggerElement: HTMLElement | null = null;

    // protected positionManager!: PositionManager;

    @property<Overlay>({
        converter: AttributeConverterBoolean,
        reflectProperty: 'reflectOpen'
    })
    open = false;

    @property({
        converter: AttributeConverterNumber
    })
    tabindex = -1;

    @property({
        converter: AttributeConverterString
    })
    role!: string;

    template: TemplateFunction | undefined;

    context: Component | undefined;

    @property()
    trigger!: string;

    @property()
    triggerType = 'default';

    @property()
    positionType = 'fixed';

    positionStrategy: PositionStrategy = new FixedPositionStrategy(this);

    connectedCallback () {

        if (!this.overlayService.hasOverlay(this)) {

            this.overlayService.registerOverlay(this);

            return;
        }

        // if (this.overlayService.registerOverlay(this)) return;

        super.connectedCallback();

        this.id = this.id || nextOverlayId();

        this.role = 'dialog';

        // this.positionManager = new PositionManager(new ConnectedPositionStrategy(this, document.getElementById(this.trigger)!));
        // this.positionManager = new PositionManager(this.positionStrategy);

        // this.initTemplate();
    }

    disconnectedCallback () {

        // if (this.positionManager) this.positionManager.destroy();
        // if (this.templateObserver) this.templateObserver.disconnect();

        this.overlayService.destroyOverlay(this, false);
    }

    updateCallback (changes: Changes, firstUpdate: boolean) {

        if (changes.has('trigger')) {

            this.updateTrigger(document.querySelector(this.trigger)! as HTMLElement);
        }
    }

    hasFocus () {

        // TODO: should query overlay service to check for descendants with focus

    }

    show () {

        if (!this.open) {

            this.watch(() => this.open = true);

            // this.updateTemplate();

            // this.reposition();

            // this.overlayService.onShowOverlay(this);
        }
    }

    hide () {

        if (this.open) {

            this.watch(() => this.open = false);

            // this.overlayService.onHideOverlay(this);
        }
    }

    toggle () {

        if (!this.open) {

            this.show();

        } else {

            this.hide();
        }
    }

    // reposition () {

    //     if (this.positionManager) {

    //         this.positionManager.updatePosition();
    //     }
    // }

    reflectOpen () {

        if (this.open) {

            this.setAttribute('open', '');
            this.setAttribute('aria-hidden', 'false');

        } else {

            this.removeAttribute('open');
            this.setAttribute('aria-hidden', 'true');
        }
    }

    protected updateTrigger (triggerElement: HTMLElement) {

        if (this.triggerInstance) {

            this.triggerInstance.detach();
        }

        this.triggerInstance = new OverlayTrigger(this);
        this.triggerInstance.attach(triggerElement);
    }

    // protected initTemplate () {

    //     this.template = this.querySelector('template');

    //     if (this.template) {

    //         this.templateObserver = new MutationObserver((mutations: MutationRecord[], observer: MutationObserver) => this.updateTemplate());

    //         this.templateObserver.observe(
    //             // we can't observe a template directly, but the DocumentFragment stored in its content property
    //             this.template.content,
    //             {
    //                 attributes: true,
    //                 characterData: true,
    //                 childList: true,
    //                 subtree: true,
    //             }
    //         );
    //     }
    // }

    // protected updateTemplate () {

    //     this.template = this.querySelector('template');

    //     if (this.template && !this.hidden) {

    //         const contentSlot = this.renderRoot.querySelector('slot') as HTMLSlotElement;

    //         requestAnimationFrame(() => {

    //             contentSlot.innerHTML = '';

    //             contentSlot.appendChild(document.importNode(this.template!.content, true));
    //         });
    //     }
    // }
}
