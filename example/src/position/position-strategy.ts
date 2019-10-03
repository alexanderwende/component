import { Position } from "./position";
import { AlignmentPair, DEFAULT_ALIGNMENT_PAIR, AxisAlignment } from "./alignment";

export const DEFAULT_POSITION: Position = {
    top: '',
    left: '',
    bottom: '',
    right: '',
    width: 'auto',
    height: 'auto',
    maxWidth: 'auto',
    maxHeight: 'auto',
    offsetHorizontal: '',
    offsetVertical: '',
};

export abstract class PositionStrategy {
    protected animationFrame: number | undefined;
    protected defaultPosition: Position;
    protected currentPosition: Position;
    protected nextPosition: Position | undefined;
    constructor (public target: HTMLElement, defaultPosition: Position = DEFAULT_POSITION) {
        this.defaultPosition = { ...DEFAULT_POSITION, ...defaultPosition };
        this.currentPosition = this.defaultPosition;
    }
    updatePosition (position?: Partial<Position>) {
        this.nextPosition = position ? { ...this.currentPosition, ...position } : undefined;
        if (!this.animationFrame) {
            this.animationFrame = requestAnimationFrame(() => {
                const nextPosition = this.nextPosition || this.getPosition();
                if (!this.comparePositions(this.currentPosition, nextPosition)) {
                    this.applyPosition(nextPosition);
                    this.currentPosition = nextPosition;
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
    protected getPosition (): Position {
        return this.defaultPosition;
    }
    protected applyPosition (position: Position) {
        this.target.style.top = this.parseStyle(position.top);
        this.target.style.left = this.parseStyle(position.left);
        this.target.style.bottom = this.parseStyle(position.bottom);
        this.target.style.right = this.parseStyle(position.right);
        this.target.style.width = this.parseStyle(position.width);
        this.target.style.height = this.parseStyle(position.height);
        this.target.style.maxWidth = this.parseStyle(position.maxWidth);
        this.target.style.maxHeight = this.parseStyle(position.maxHeight);
    }
    protected parseStyle (value: string | number | null): string | null {
        return (typeof value === 'number') ? `${ value }px` : value;
    }
    protected comparePositions (position: Position, otherPosition: Position): boolean {
        const keys = Object.keys(position);
        return !keys.find((key => position[key as keyof Position] !== otherPosition[key as keyof Position]));
    }
}
export class ConnectedPositionStrategy extends PositionStrategy {
    protected updateListener!: EventListener;
    protected alignment: AlignmentPair;
    constructor (public target: HTMLElement, public origin: HTMLElement, defaultPosition: Position = DEFAULT_POSITION, alignment: AlignmentPair = DEFAULT_ALIGNMENT_PAIR) {
        super(target, defaultPosition);
        this.alignment = alignment;
        this.updateListener = () => this.updatePosition();
        window.addEventListener('resize', this.updateListener);
        document.addEventListener('scroll', this.updateListener, true);
    }
    destroy () {
        super.destroy();
        window.removeEventListener('resize', this.updateListener);
        document.removeEventListener('scroll', this.updateListener, true);
    }
    protected getPosition (): Position {
        const origin: ClientRect = this.origin.getBoundingClientRect();
        const target: ClientRect = this.target.getBoundingClientRect();
        const position = { ...this.defaultPosition };
        switch (this.alignment.origin.horizontal) {
            case AxisAlignment.Center:
                position.left = origin.left + origin.width / 2;
                break;
            case AxisAlignment.Start:
                position.left = origin.left;
                break;
            case AxisAlignment.End:
                position.left = origin.right;
                break;
        }
        switch (this.alignment.origin.vertical) {
            case AxisAlignment.Center:
                position.top = origin.top + origin.height / 2;
                break;
            case AxisAlignment.Start:
                position.top = origin.top;
                break;
            case AxisAlignment.End:
                position.top = origin.bottom;
                break;
        }
        switch (this.alignment.target.horizontal) {
            case AxisAlignment.Center:
                position.left = (position.left as number) - target.width / 2;
                break;
            case AxisAlignment.End:
                position.left = (position.left as number) - target.width;
                break;
            case AxisAlignment.Start:
                break;
        }
        switch (this.alignment.target.vertical) {
            case AxisAlignment.Center:
                position.top = (position.top as number) - target.height / 2;
                break;
            case AxisAlignment.End:
                position.top = (position.top as number) - target.height;
                break;
            case AxisAlignment.Start:
                break;
        }
        // TODO: include offset
        return position;
    }
    protected applyPosition (position: Position) {
        super.applyPosition({ ...position, top: '', left: '', bottom: '', right: '' });
        this.target.style.transform = `translate(${ position.left }, ${ position.top })`;
    }
}
export const DEFAULT_POSITION_FIXED: Position = {
    ...DEFAULT_POSITION,
    top: '50vh',
    left: '50vw',
    offsetHorizontal: '-50%',
    offsetVertical: '-50%',
};
export class FixedPositionStrategy extends PositionStrategy {
    constructor (public target: HTMLElement, defaultPosition: Position = DEFAULT_POSITION_FIXED) {
        super(target, defaultPosition);
    }
    protected getPosition (): Position {
        return this.defaultPosition;
    }
    protected applyPosition (position: Position) {
        super.applyPosition(position);
        this.target.style.transform = `translate(${ position.offsetHorizontal, position.offsetVertical })`;
    }
}
