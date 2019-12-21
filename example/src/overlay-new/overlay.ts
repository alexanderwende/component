import { AttributeConverterBoolean, Component, component, css, property, Changes, listener, PropertyChangeEvent } from '@partkit/component';
import { html } from 'lit-html';
import { IDGenerator } from '../id-generator';
import { MixinRole } from '../mixins/role';

const ID_GENERATOR = new IDGenerator('partkit-overlay-');

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

    protected marker?: Comment;

    protected isReattaching = false;

    @property({ converter: AttributeConverterBoolean })
    open = false;

    connectedCallback () {

        if (this.isReattaching) return;

        this.id = this.id || ID_GENERATOR.getNextID();

        super.connectedCallback();
    }

    disconnectedCallback () {

        if (this.isReattaching) return;

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

        this.isReattaching = true;

        if (event.detail.current === true) {

            this.marker = document.createComment(this.id);

            this.parentNode?.replaceChild(this.marker, this);

            document.body.appendChild(this);

        } else {

            this.marker?.parentNode?.replaceChild(this, this.marker);

            this.marker = undefined;
        }

        this.isReattaching = false;
    }
}
