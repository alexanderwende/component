import { AttributeConverterARIABoolean, AttributeConverterString, Changes, Component, component, css, property } from "@partkit/component";
import { html } from "lit-html";
import { ConnectedPositionManager, PositionManager } from '../position-manager';

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
    <slot name="template"></slot>
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

    content!: DocumentFragment;

    protected triggerElement: HTMLElement | null = null;

    protected triggerListener: EventListener | null = null;

    protected positionManager!: PositionManager;

    connectedCallback () {

        if (this.parentElement !== document.body) {

            document.body.appendChild(this);

            return;
        }

        super.connectedCallback();

        this.positionManager = new ConnectedPositionManager(this, document.getElementById(this.trigger)!);

        this.templateObserver = new MutationObserver((mutations: MutationRecord[], observer: MutationObserver) => this.updateTemplate());

        this.role = 'dialog';

        this.hidden = true;
    }

    disconnectedCallback () {

        if (this.templateObserver) this.templateObserver.disconnect();
    }

    updateCallback (changes: Changes, firstUpdate: boolean) {

        if (firstUpdate) {

            // slotchange only emits, if distributed nodes in the slot change, we need to update on every change
            // this.renderRoot.querySelector('slot[name=template]')!.addEventListener('slotchange', (event) => {

            //     console.log(event);
            //     this.updateTemplate();
            // });

            this.templateObserver.observe(
                // we can't observe a template directly, but the DocumentFragment stored in its content property
                // (this.querySelector('template[slot=template') as HTMLTemplateElement).content,
                ((this.renderRoot.querySelector('slot[name=template]') as HTMLSlotElement).assignedNodes()[0] as HTMLTemplateElement).content,
                {
                    attributes: true,
                    characterData: true,
                    childList: true,
                    subtree: true,
                }
            );
        }

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

            this.positionManager.reposition();
        }
    }

    protected updateTrigger (triggerElement: HTMLElement) {

        if (this.triggerElement && this.triggerListener) {

            if (this.triggerListener) this.triggerElement.removeEventListener('click', this.triggerListener);
        }

        this.triggerElement = triggerElement;
        this.triggerListener = (event) => this.toggle();

        this.triggerElement.addEventListener('click', this.triggerListener);
    }

    protected updateTemplate () {

        const templateSlot = this.renderRoot.querySelector('slot[name=template]') as HTMLSlotElement;
        const contentSlot = this.renderRoot.querySelector('slot[name=content]') as HTMLSlotElement;

        const template = templateSlot.assignedNodes()[0] as HTMLTemplateElement;

        if (!this.hidden) {

            requestAnimationFrame(() => {

                contentSlot.innerHTML = '';

                contentSlot.appendChild(template.content.cloneNode(true));
            });
        }
    }
}
