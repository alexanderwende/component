export class VanillaCheckbox extends HTMLElement {

    template: HTMLTemplateElement;

    root: ShadowRoot;

    get checked (): boolean {

        return this.getAttribute('aria-checked') === 'true';
    }

    constructor () {

        super();

        this.template = document.getElementById("vanilla-checkbox") as HTMLTemplateElement;

        this.root = this.attachShadow({ mode: 'open' });
    }

    connectedCallback () {

        this.addEventListener('click', this.toggle.bind(this));

        this.update();
    }

    update () {

        this.root.appendChild(this.template.content.cloneNode(true));

        this.setAttribute('aria-checked', (this.checked).toString());
    }

    toggle () {

        this.setAttribute('aria-checked', (!this.checked).toString());
    }
}

customElements.define('vanilla-checkbox', VanillaCheckbox);
