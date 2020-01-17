import { Component, component, selector, listener, Changes, property, AttributeConverterNumber, css } from '@partkit/component';
import { html } from 'lit-html';
import { EventManager } from './events';
import { activeElement } from './dom';
import { FocusMonitor, FocusChangeEvent } from './focus';

@component({
    selector: 'focus-container',
    template: element => html`
    <input type="text"/> <button>OK</button>
    `,
    styles: [css`
    :host {
        display: block;
    }
    `],
})
export class FocusContainer extends Component {

    protected focusMonitor = new FocusMonitor();

    @property({ converter: AttributeConverterNumber })
    tabindex = 0;

    connectedCallback () {

        this.focusMonitor.attach(this);

        super.connectedCallback();
    }

    disconnectedCallback () {

        this.focusMonitor.detach();

        super.disconnectedCallback();
    }
}

@component({
    selector: 'event-order-demo',
    template: element => html`
    <focus-container id="one"></focus-container>
    <focus-container id="two"></focus-container>
    `,
    styles: [css`
    :host {
        display: block;
    }
    `],
})
export class EventOrderDemo extends Component {

    protected eventManager = new EventManager();

    @selector({ query: '#one' })
    containerOne!: HTMLElement;

    @selector({ query: '#two' })
    containerTwo!: HTMLElement;

    updateCallback (changes: Changes, firstChange: boolean) {

        if (firstChange) {

            // this.eventManager.listen(this.inputOne, 'focusin', event => this.handleFocusIn(event as FocusEvent));
            // this.eventManager.listen(this.inputOne, 'focusout', event => this.handleFocusOut(event as FocusEvent));
            // this.eventManager.listen(this.inputOne, 'focus', event => this.handleFocus(event as FocusEvent));
            // this.eventManager.listen(this.inputOne, 'blur', event => this.handleBlur(event as FocusEvent));
            this.eventManager.listen(this.containerOne, 'focus-changed', event => this.handleFocusChange(event as FocusChangeEvent));

            // this.eventManager.listen(this.inputTwo, 'focusin', event => this.handleFocusIn(event as FocusEvent));
            // this.eventManager.listen(this.inputTwo, 'focusout', event => this.handleFocusOut(event as FocusEvent));
            // this.eventManager.listen(this.inputTwo, 'focus', event => this.handleFocus(event as FocusEvent));
            // this.eventManager.listen(this.inputTwo, 'blur', event => this.handleBlur(event as FocusEvent));
            this.eventManager.listen(this.containerTwo, 'focus-changed', event => this.handleFocusChange(event as FocusChangeEvent));
        }
    }

    disconnectedCallback () {

        this.eventManager.unlistenAll();

        super.disconnectedCallback();
    }

    @listener({ event: 'focusin', target: document })
    protected handleFocusIn (event: FocusEvent) {

        console.log('@focusin: ', (event.target as HTMLInputElement).id, activeElement());
    }

    @listener({ event: 'focusout', target: document })
    protected handleFocusOut (event: FocusEvent) {

        console.log('@focusout: ', (event.target as HTMLInputElement).id, activeElement());
    }

    protected handleFocus (event: FocusEvent) {

        console.log('@focus: ', (event.target as HTMLInputElement).id, activeElement());
    }

    protected handleBlur (event: FocusEvent) {

        console.log('@blur: ', (event.target as HTMLInputElement).id, activeElement());
    }

    protected handleFocusChange (event: FocusChangeEvent) {

        console.log(`@focus-changed[${ event.detail.hasFocus }]: `, (event.target as HTMLInputElement).id, activeElement(), document.activeElement);
    }
}
