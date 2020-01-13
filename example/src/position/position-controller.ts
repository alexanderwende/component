import { Behavior } from '../behavior/behavior';
import { BoundingBox, getTargetPosition } from './alignment';
import { hasPositionChanged, isPosition, Position } from './position';
import { PositionConfig } from './position-config';
import { hasSizeChanged, Size } from './size';

export class PositionController extends Behavior {

    protected currentPosition: Position | undefined;

    protected currentSize: Size | undefined;

    constructor (protected config: PositionConfig) {

        super();
    }

    attach (element: HTMLElement): boolean {

        if (!super.attach(element)) return false;

        this.requestUpdate();

        return true;
    }

    requestUpdate (position?: Position, size?: Size): Promise<boolean> {

        return super.requestUpdate(position, size);
    }

    update (position?: Position, size?: Size): boolean {

        const nextPosition = position || this.getPosition();
        const nextSize = size || this.getSize();
        let updated = false;

        if (!this.currentPosition || this.hasPositionChanged(nextPosition, this.currentPosition)) {

            this.applyPosition(nextPosition);
            this.currentPosition = nextPosition;
            updated = true;
        }

        if (!this.currentSize || this.hasSizeChanged(nextSize, this.currentSize)) {

            this.applySize(nextSize);
            this.currentSize = nextSize;
            updated = true;
        }

        return updated;
    }

    /**
     * Calculate the position of the positioned element
     *
     * @description
     * The position will depend on the alignment and origin options of the {@link PositionConfig}.
     */
    protected getPosition (): Position {

        const originBox = this.getBoundingBox(this.config.origin);
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

        const originWidth = (this.config.origin === 'viewport')
            ? window.innerWidth
            : (this.config.origin instanceof HTMLElement)
                ? this.config.origin.clientWidth
                : 'auto';

        const originHeight = (this.config.origin === 'viewport')
            ? window.innerHeight
            : (this.config.origin instanceof HTMLElement)
                ? this.config.origin.clientHeight
                : 'auto';

        return {
            width: (this.config.width === 'origin') ? originWidth : this.config.width,
            height: (this.config.height === 'origin') ? originHeight : this.config.height,
            maxWidth: (this.config.maxWidth === 'origin') ? originWidth : this.config.maxWidth,
            maxHeight: (this.config.maxHeight === 'origin') ? originHeight : this.config.maxWidth,
            minWidth: (this.config.minWidth === 'origin') ? originWidth : this.config.minWidth,
            minHeight: (this.config.minHeight === 'origin') ? originHeight : this.config.minHeight,
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
        this.element!.style.minWidth = this.parseStyle(size.minWidth);
        this.element!.style.minHeight = this.parseStyle(size.minHeight);
    }

    // TODO: maybe name this better, huh?
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
