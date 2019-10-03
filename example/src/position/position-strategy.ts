import { Position } from "./position";

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

    protected currentPosition: Position | undefined;

    protected nextPosition: Position | undefined;

    constructor (public target: HTMLElement, defaultPosition: Position = DEFAULT_POSITION) {

        this.defaultPosition = { ...DEFAULT_POSITION, ...defaultPosition };
    }

    updatePosition (position?: Partial<Position>) {

        this.nextPosition = position ? { ...(this.currentPosition || this.defaultPosition), ...position } : undefined;

        if (!this.animationFrame) {

            this.animationFrame = requestAnimationFrame(() => {

                const nextPosition = this.nextPosition || this.getPosition();

                if (!this.currentPosition || !this.comparePositions(this.currentPosition, nextPosition)) {

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

