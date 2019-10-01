import { AttributeConverterARIABoolean, AttributeConverterString, Changes, Component, component, css, property } from "@partkit/component";
import { html } from "lit-html";
import { ConnectedPositionStrategy, PositionManager } from "../position-manager";

export interface HiddenChangeEvent extends CustomEvent {
    type: 'hidden-change';
    detail: {
        hidden: boolean;
    }
}

@component<Popover>({
    selector: 'ui-popover',
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
export class Popover extends Component {

    protected templateObserver!: MutationObserver;

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

        this.positionManager = new PositionManager(new ConnectedPositionStrategy(this, document.getElementById(this.trigger)!));

        this.templateObserver = new MutationObserver((mutations: MutationRecord[], observer: MutationObserver) => this.updateTemplate());

        this.templateObserver.observe(
            // we can't observe a template directly, but the DocumentFragment stored in its content property
            (this.querySelector('template') as HTMLTemplateElement).content,
            {
                attributes: true,
                characterData: true,
                childList: true,
                subtree: true,
            }
        );

        this.role = 'dialog';

        this.hidden = true;
    }

    disconnectedCallback () {

        if (this.positionManager) this.positionManager.destroy();
        if (this.templateObserver) this.templateObserver.disconnect();
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

            this.triggerElement!.setAttribute('aria-expanded', 'true');
        }
    }

    close () {

        if (!this.hidden) {

            this.watch(() => this.hidden = true);

            this.triggerElement!.setAttribute('aria-expanded', 'false');
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

        const contentSlot = this.renderRoot.querySelector('slot[name=content]') as HTMLSlotElement;

        const template = this.querySelector('template') as HTMLTemplateElement;

        if (!this.hidden) {

            requestAnimationFrame(() => {

                contentSlot.innerHTML = '';

                contentSlot.appendChild(template.content.cloneNode(true));
            });
        }
    }
}
