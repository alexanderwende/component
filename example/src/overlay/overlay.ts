import { AttributeConverterBoolean, AttributeConverterNumber, AttributeConverterString, Changes, Component, component, css, property } from '@partkit/component';
import { html } from 'lit-html';
import { TemplateFunction } from '../template-function';
import { DEFAULT_FOCUS_TRAP_CONFIG } from './focus-trap';
import { OverlayConfig, OVERLAY_CONFIG_FIELDS } from './overlay-config';
import { OverlayService } from './overlay-service';

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

    // TODO: clean this up
    private _config: Partial<OverlayConfig> = { ...DEFAULT_FOCUS_TRAP_CONFIG, trapFocus: true };

    protected isRegistered = false;

    protected overlayService = new OverlayService();

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
    positionType = 'default';

    @property()
    origin = 'viewport';

    set config (config: Partial<OverlayConfig>) {

        this._config = { ...this._config, ...config };
    }

    get config (): Partial<OverlayConfig> {

        const config: Partial<OverlayConfig> = { ...this._config };

        OVERLAY_CONFIG_FIELDS.forEach(key => {

            if (this[key as keyof Overlay] !== undefined) {

                config[key] = this[key as keyof Overlay] as any;
            }
        });

        return config;
    }

    connectedCallback () {

        if (!this.overlayService.hasOverlay(this)) {

            this.isRegistered = this.overlayService.registerOverlay(this, this.config);

            return;
        }

        this.id = this.id || nextOverlayId();

        this.role = 'dialog';

        super.connectedCallback();
    }

    disconnectedCallback () {

        // we remove the overlay from the overlay service when the overlay gets disconnected
        // however, during registration, the overlay will be moved to the document body, which
        // essentially removes and reattaches the overlay; during this time the overlay won't
        // be registered yet and we don't remove the overlay from the overlay service
        if (this.isRegistered) {

            this.overlayService.destroyOverlay(this, false);
        }

        super.disconnectedCallback();
    }

    updateCallback (changes: Changes, firstUpdate: boolean) {

        const config: Partial<OverlayConfig> = {};

        OVERLAY_CONFIG_FIELDS.forEach(key => {

            if (changes.has(key)) config[key] = (this as any)[key];
        });

        if (Object.keys(config).length > 0) {

            // TODO: when overlay gets created via overlay service, the config from outside should override overlay's defaults
            // this.overlayService.updateOverlayConfig(this, config);
        }
    }

    show () {

        if (!this.open) {

            this.watch(() => this.open = true);
        }
    }

    hide () {

        if (this.open) {

            this.watch(() => this.open = false);
        }
    }

    toggle () {

        if (!this.open) {

            this.show();

        } else {

            this.hide();
        }
    }

    reflectOpen () {

        if (this.open) {

            this.setAttribute('open', '');
            this.setAttribute('aria-hidden', 'false');

        } else {

            this.removeAttribute('open');
            this.setAttribute('aria-hidden', 'true');
        }
    }
}
