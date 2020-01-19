import { AttributeConverterString, Component, component, property, PropertyChangeDetectorObject } from '@partkit/component';
import { Constructor } from '../mixins/constructor';
import { AlignmentPair, Position, PositionConfig, POSITION_CONFIG_FIELDS } from '../position';
import { TemplateConfig, TemplateFunction } from '../template';
import { OverlayTriggerConfig, OVERLAY_TRIGGER_CONFIG_FIELDS } from './trigger';

export type OverlayConfig = PositionConfig & OverlayTriggerConfig & TemplateConfig & {
    positionType: string;
    triggerType: string;
    trigger?: HTMLElement;
    stacked: boolean;
    backdrop: boolean;
    closeOnBackdropClick: boolean;
}

// TODO: check if we need this
export const OVERLAY_CONFIG_FIELDS: (keyof OverlayConfig)[] = [
    ...POSITION_CONFIG_FIELDS,
    ...OVERLAY_TRIGGER_CONFIG_FIELDS,
    'positionType',
    'trigger',
    'triggerType',
    'stacked',
    'template',
    'context',
    'backdrop',
    'closeOnBackdropClick',
];

export const DEFAULT_OVERLAY_CONFIG: Partial<OverlayConfig> = {
    positionType: 'default',
    triggerType: 'default',
    trigger: undefined,
    stacked: true,
    template: undefined,
    context: undefined,
    backdrop: true,
    closeOnBackdropClick: true,
};

export interface HasOverlayConfig extends OverlayConfig {

    config: Partial<OverlayConfig>;
}

export function MixinOverlayConfig<T extends typeof Component> (Base: T, config: Partial<OverlayConfig> = {}): T & Constructor<HasOverlayConfig> {

    @component({ define: false })
    class BaseHasOverlayConfig extends Base implements OverlayConfig {

        /**
         * The overlay's configuration
         *
         * @remarks
         * Initially _config only contains a partial OverlayConfig, but once the overlay instance has been
         * registered, _config will be a full OverlayConfig. This is to allow the BehaviorFactories for
         * position and trigger to apply their default configuration, based on the behavior type which is
         * created by the factories.
         *
         * @internal
         */
        protected _config: OverlayConfig = { ...DEFAULT_OVERLAY_CONFIG, ...config } as OverlayConfig;

        @property({
            attribute: false,
            observe: PropertyChangeDetectorObject,
        })
        set config (value: Partial<OverlayConfig>) {

            // TODO: setting config creates a new object each time ==> need to sync with behaviors
            this._config = { ...this._config, ...value };
        }
        get config (): Partial<OverlayConfig> {

            return this._config;
        }

        //=================================
        // {@link OverlayConfig} properties
        //=================================

        @property({ converter: AttributeConverterString })
        set triggerType (value: string) {

            this.config = { triggerType: value };
        }
        get triggerType (): string {

            return this._config.triggerType;
        }

        @property({ converter: AttributeConverterString })
        set positionType (value: string) {

            this.config = { positionType: value };
        }
        get positionType (): string {

            return this._config.positionType;
        }

        @property({ attribute: false })
        set trigger (value: HTMLElement | undefined) {

            this.config = { trigger: value };
        }
        get trigger (): HTMLElement | undefined {

            return this._config.trigger;
        }

        @property({ attribute: false })
        set template (value: TemplateFunction | undefined) {

            this.config = { template: value };
        }
        get template (): TemplateFunction | undefined {

            return this._config.template;
        }

        @property({ attribute: false })
        set context (value: Component | undefined) {

            this.config = { context: value };
        }
        get context (): Component | undefined {

            return this._config.context;
        }

        @property({ attribute: false })
        set stacked (value: boolean) {

            this.config = { stacked: value };
        }
        get stacked (): boolean {

            return this._config.stacked;
        }

        @property({ attribute: false })
        set backdrop (value: boolean) {

            this.config = { backdrop: value };
        }
        get backdrop (): boolean {

            return this._config.backdrop;
        }

        @property({ attribute: false })
        set closeOnBackdropClick (value: boolean) {

            this.config = { closeOnBackdropClick: value };
        }
        get closeOnBackdropClick (): boolean {

            return this._config.closeOnBackdropClick;
        }

        //==================================
        // {@link PositionConfig} properties
        //==================================

        @property({ attribute: false })
        set origin (value: Position | HTMLElement | 'viewport') {

            this.config = { origin: value };
        }
        get origin (): Position | HTMLElement | 'viewport' {

            return this._config.origin;
        }

        @property({ attribute: false })
        set width (value: string | number) {

            this.config = { width: value };
        };
        get width (): string | number {

            return this._config.width;
        }

        @property({ attribute: false })
        set height (value: string | number) {

            this.config = { height: value };
        };
        get height (): string | number {

            return this._config.height;
        }

        @property({ attribute: false })
        set maxWidth (value: string | number) {

            this.config = { maxWidth: value };
        };
        get maxWidth (): string | number {

            return this._config.maxWidth;
        }

        @property({ attribute: false })
        set maxHeight (value: string | number) {

            this.config = { maxHeight: value };
        };
        get maxHeight (): string | number {

            return this._config.maxHeight;
        }

        @property({ attribute: false })
        set minWidth (value: string | number) {

            this.config = { minWidth: value };
        };
        get minWidth (): string | number {

            return this._config.minWidth;

        }

        @property({ attribute: false })
        set minHeight (value: string | number) {

            this.config = { minHeight: value };
        };
        get minHeight (): string | number {

            return this._config.minHeight;
        }

        @property({
            attribute: false,
            observe: PropertyChangeDetectorObject
        })
        set alignment (value: AlignmentPair) {

            this.config = { alignment: { ...this._config.alignment, ...value } };
        };
        get alignment (): AlignmentPair {

            return this._config.alignment;
        }

        //========================================
        // {@link OverlayTriggerConfig} properties
        //========================================

        @property({ attribute: false })
        set autoFocus (value: boolean) {

            this.config = { autoFocus: value };
        }
        get autoFocus (): boolean {

            return this._config.autoFocus;
        }

        @property({ attribute: false })
        set trapFocus (value: boolean) {

            this.config = { trapFocus: value };
        }
        get trapFocus (): boolean {

            return this._config.trapFocus;
        }

        @property({ attribute: false })
        set wrapFocus (value: boolean) {

            this.config = { wrapFocus: value };
        }
        get wrapFocus (): boolean {

            return this._config.wrapFocus;
        }

        @property({ attribute: false })
        set restoreFocus (value: boolean) {

            this.config = { restoreFocus: value };
        }
        get restoreFocus (): boolean {

            return this._config.restoreFocus;
        }

        @property({ attribute: false })
        set closeOnEscape (value: boolean) {

            this.config = { closeOnEscape: value };
        }
        get closeOnEscape (): boolean {

            return this._config.closeOnEscape;
        }

        @property({ attribute: false })
        set closeOnFocusLoss (value: boolean) {

            this.config = { closeOnFocusLoss: value };
        }
        get closeOnFocusLoss (): boolean {

            return this._config.closeOnFocusLoss;
        }

        @property({ attribute: false })
        set initialFocus (value: string | undefined) {

            this.config = { initialFocus: value };
        }
        get initialFocus (): string | undefined {

            return this._config.initialFocus;
        }

        @property({ attribute: false })
        set tabbableSelector (value: string) {

            this.config = { tabbableSelector: value };
        }
        get tabbableSelector (): string {

            return this._config.tabbableSelector;
        }
    }

    return BaseHasOverlayConfig;
}
