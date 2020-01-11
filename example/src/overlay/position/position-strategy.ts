import { BoundingBox, getTargetPosition } from './alignment';
import { hasPositionChanged, isPosition, Position } from './position';
import { DEFAULT_POSITION_CONFIG, PositionConfig } from './position-config';
import { hasSizeChanged, Size } from './size';
import { Behavior } from 'example/src/behavior/behavior';
import { applyDefaults } from '../../utils/config';

export class PositionStrategy {

    private _config: PositionConfig = DEFAULT_POSITION_CONFIG;

    private _origin: Position | HTMLElement | string | undefined;

    protected animationFrame: number | undefined;

    protected currentPosition: Position | undefined;

    protected currentSize: Size | undefined;

    protected set origin (origin: Position | HTMLElement | string | undefined) {

        // cache the origin element if it is a CSS selector
        if (typeof origin === 'string' && origin !== 'viewport') {

            origin = document.querySelector(origin) as HTMLElement || undefined;
        }

        this._origin = origin;
    }

    protected get origin (): Position | HTMLElement | string | undefined {

        return this._origin;
    }

    set config (config: PositionConfig) {

        this._config = { ...this._config, ...config };

        this.origin = this.config.origin;
    }

    get config (): PositionConfig {

        return this._config;
    }

    constructor (public target: HTMLElement, config?: Partial<PositionConfig>) {

        this.config = config as PositionConfig;
    }

    update (position?: Position, size?: Size) {

        if (!this.animationFrame) {

            this.animationFrame = requestAnimationFrame(() => {

                const nextPosition = position || this.getPosition();
                const nextSize = size || this.getSize();

                if (!this.currentPosition || this.hasPositionChanged(nextPosition, this.currentPosition)) {

                    this.applyPosition(nextPosition);
                    this.currentPosition = nextPosition;
                }

                if (!this.currentSize || this.hasSizeChanged(nextSize, this.currentSize)) {

                    this.applySize(nextSize);
                    this.currentSize = nextSize;
                }

                this.animationFrame = undefined;
            });
        }
    }

    destroy () {

        if (this.animationFrame) {

            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = undefined;
        }
    }

    /**
     * Calculate the position of the positioned element
     *
     * @description
     * The position will depend on the alignment and origin options of the {@link PositionConfig}.
     */
    protected getPosition (): Position {

        const originBox = this.getBoundingBox(this.origin);
        const targetBox = this.getBoundingBox(this.target);

        // TODO: include alignment offset

        return getTargetPosition(originBox, this.config.alignment.origin, targetBox, this.config.alignment.target);
    }

    /**
     * Calculate the size of the positioned element
     *
     * @description
     * We take the settings from the {@link PositionConfig} so we are always up-to-date if the configuration was updated.
     *
     * This hook also allows us to do things like matching the origin's width, or looking at the available viewport dimensions.
     */
    protected getSize (): Size {

        return {
            width: this.config.width,
            height: this.config.height,
            maxWidth: this.config.maxWidth,
            maxHeight: this.config.maxHeight,
        };
    }

    protected getBoundingBox (reference: Position | HTMLElement | string | undefined): BoundingBox {

        const boundingBox: BoundingBox = {
            x: 0,
            y: 0,
            width: 0,
            height: 0,
        };

        if (isPosition(reference)) {

            boundingBox.x = reference.x;
            boundingBox.y = reference.y;

        } else if (reference === 'viewport') {

            boundingBox.width = window.innerWidth;
            boundingBox.height = window.innerHeight;

        } else if (reference instanceof HTMLElement) {

            const originRect = reference.getBoundingClientRect();

            boundingBox.x = originRect.left;
            boundingBox.y = originRect.top;
            boundingBox.width = originRect.width;
            boundingBox.height = originRect.height;
        }

        return boundingBox;
    }

    protected applyPosition (position: Position) {

        this.target.style.top = this.parseStyle(position.y);
        this.target.style.left = this.parseStyle(position.x);
        this.target.style.right = '';
        this.target.style.bottom = '';

    }

    protected applySize (size: Size) {

        this.target.style.width = this.parseStyle(size.width);
        this.target.style.height = this.parseStyle(size.height);
        this.target.style.maxWidth = this.parseStyle(size.maxWidth);
        this.target.style.maxHeight = this.parseStyle(size.maxHeight);
    }

    protected parseStyle (value: string | number | null): string {

        return (typeof value === 'number') ? `${ value || 0 }px` : value || '';
    }

    protected hasPositionChanged (position?: Position, other?: Position): boolean {

        return hasPositionChanged(position, other);
    }

    protected hasSizeChanged (size?: Size, other?: Size): boolean {

        return hasSizeChanged(size, other);
    }
}

export class PositionController extends Behavior {

    private _origin: Position | HTMLElement | string | undefined;

    protected animationFrame: number | undefined;

    protected currentPosition: Position | undefined;

    protected currentSize: Size | undefined;

    protected config: PositionConfig;

    protected set origin (origin: Position | HTMLElement | string | undefined) {

        // cache the origin element if it is a CSS selector
        if (typeof origin === 'string' && origin !== 'viewport') {

            origin = document.querySelector(origin) as HTMLElement || undefined;
        }

        this._origin = origin;
    }

    protected get origin (): Position | HTMLElement | string | undefined {

        return this._origin;
    }

    constructor (config?: Partial<PositionConfig>) {

        super();

        this.config = applyDefaults(config || {}, DEFAULT_POSITION_CONFIG);

        this.origin = this.config.origin;
    }

    update (position?: Position, size?: Size) {

        if (!this.hasAttached) return;

        if (!this.animationFrame) {

            this.animationFrame = requestAnimationFrame(() => {

                const nextPosition = position || this.getPosition();
                const nextSize = size || this.getSize();

                if (!this.currentPosition || this.hasPositionChanged(nextPosition, this.currentPosition)) {

                    this.applyPosition(nextPosition);
                    this.currentPosition = nextPosition;
                }

                if (!this.currentSize || this.hasSizeChanged(nextSize, this.currentSize)) {

                    this.applySize(nextSize);
                    this.currentSize = nextSize;
                }

                this.animationFrame = undefined;
            });
        }
    }

    attach (element: HTMLElement): boolean {

        if (!super.attach(element)) return false;

        this.update();

        return true;
    }

    detach (): boolean {

        if (!this.hasAttached) return false;

        return super.detach();
    }

    /**
     * Calculate the position of the positioned element
     *
     * @description
     * The position will depend on the alignment and origin options of the {@link PositionConfig}.
     */
    protected getPosition (): Position {

        const originBox = this.getBoundingBox(this.origin);
        const targetBox = this.getBoundingBox(this.element);

        // TODO: include alignment offset

        return getTargetPosition(originBox, this.config.alignment.origin, targetBox, this.config.alignment.target);
    }

    /**
     * Calculate the size of the positioned element
     *
     * @description
     * We take the settings from the {@link PositionConfig} so we are always up-to-date if the configuration was updated.
     *
     * This hook also allows us to do things like matching the origin's width, or looking at the available viewport dimensions.
     */
    protected getSize (): Size {

        return {
            width: this.config.width,
            height: this.config.height,
            maxWidth: this.config.maxWidth,
            maxHeight: this.config.maxHeight,
        };
    }

    protected getBoundingBox (reference: Position | HTMLElement | string | undefined): BoundingBox {

        const boundingBox: BoundingBox = {
            x: 0,
            y: 0,
            width: 0,
            height: 0,
        };

        if (isPosition(reference)) {

            boundingBox.x = reference.x;
            boundingBox.y = reference.y;

        } else if (reference === 'viewport') {

            boundingBox.width = window.innerWidth;
            boundingBox.height = window.innerHeight;

        } else if (reference instanceof HTMLElement) {

            const originRect = reference.getBoundingClientRect();

            boundingBox.x = originRect.left;
            boundingBox.y = originRect.top;
            boundingBox.width = originRect.width;
            boundingBox.height = originRect.height;
        }

        return boundingBox;
    }

    protected applyPosition (position: Position) {

        if (!this.hasAttached) return;

        this.element!.style.top = this.parseStyle(position.y);
        this.element!.style.left = this.parseStyle(position.x);
        this.element!.style.right = '';
        this.element!.style.bottom = '';

    }

    protected applySize (size: Size) {

        if (!this.hasAttached) return;

        this.element!.style.width = this.parseStyle(size.width);
        this.element!.style.height = this.parseStyle(size.height);
        this.element!.style.maxWidth = this.parseStyle(size.maxWidth);
        this.element!.style.maxHeight = this.parseStyle(size.maxHeight);
    }

    protected parseStyle (value: string | number | null): string {

        return (typeof value === 'number') ? `${ value || 0 }px` : value || '';
    }

    protected hasPositionChanged (position?: Position, other?: Position): boolean {

        return hasPositionChanged(position, other);
    }

    protected hasSizeChanged (size?: Size, other?: Size): boolean {

        return hasSizeChanged(size, other);
    }
}
