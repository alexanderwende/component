interface Position {
    top: string;
    right: string;
    bottom: string;
    left: string;
    width: string;
    height: string;
    maxWidth: string;
    maxHeight: string;
    offsetHorizontal: string;
    offsetVertical: string;
}

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
}

export abstract class PositionStrategy {

    protected animationFrame: number | undefined;

    protected currentPosition: Position = DEFAULT_POSITION;

    protected nextPosition: Position | undefined;

    constructor (public target: HTMLElement) { }

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

        return DEFAULT_POSITION;
    }

    protected applyPosition (position: Position) {

        this.target.style.top = position.top;
        this.target.style.left = position.left;
        this.target.style.bottom = position.bottom;
        this.target.style.right = position.right;
        this.target.style.width = position.width;
        this.target.style.height = position.height;
        this.target.style.maxWidth = position.maxWidth;
        this.target.style.maxHeight = position.maxHeight;
    }

    protected comparePositions (position: Position, otherPosition: Position): boolean {

        const keys = Object.keys(position);

        return !keys.find((key => position[key as keyof Position] !== otherPosition[key as keyof Position]));
    }
}

export class ConnectedPositionStrategy extends PositionStrategy {

    protected updateListener!: EventListener;

    constructor (public target: HTMLElement, public origin: HTMLElement) {

        super(target);

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

        return {
            ...DEFAULT_POSITION,
            top: `${ origin.bottom }px`,
            left: `${ origin.left }px`,
        };
    }

    protected applyPosition (position: Position) {

        super.applyPosition({ ...position, top: '', left: '', bottom: '', right: '' });

        this.target.style.transform = `translate(${ position.left }, ${ position.top })`;
    }
}

export class FixedPositionStrategy extends PositionStrategy {

    defaultPosition: Position = {
        ...DEFAULT_POSITION,
        top: '50vh',
        left: '50vw',
        offsetHorizontal: '-50%',
        offsetVertical: '-50%'
    };

    protected getPosition (): Position {

        return this.defaultPosition;
    }

    protected applyPosition (position: Position) {

        super.applyPosition(position);

        this.target.style.transform = `translate(${ position.offsetHorizontal, position.offsetVertical })`;
    }
}

export class PositionManager {

    constructor (public strategy: PositionStrategy) { }

    updatePosition (position?: Partial<Position>) {

        this.strategy.updatePosition(position);
    }

    destroy () {

        this.strategy.destroy();
    }
}
