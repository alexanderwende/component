interface Position {
    top: string;
    right: string;
    bottom: string;
    left: string;
    width: string;
    height: string;
    maxWidth: string;
    maxHeight: string;
}

export const DEFAULT_POSITION: Position = {
    top: '0',
    left: '0',
    bottom: '',
    right: '',
    width: 'auto',
    height: 'auto',
    maxWidth: 'auto',
    maxHeight: 'auto',
}

export abstract class PositionManager {

    protected isUpdating = false;

    protected lastPosition: Position = DEFAULT_POSITION;

    constructor (public target: HTMLElement, public origin: HTMLElement = document.body) {

        window.addEventListener('resize', (event) => {

            this.reposition();

        });

        document.addEventListener('scroll', (event) => {

            this.reposition();

        }, true);
    }

    reposition () { }

    protected apply (position: Position) {

        this.target.style.top = this.lastPosition.top;
        this.target.style.left = this.lastPosition.left;
        this.target.style.bottom = this.lastPosition.bottom;
        this.target.style.right = this.lastPosition.right;
        this.target.style.width = this.lastPosition.width;
        this.target.style.height = this.lastPosition.height;
        this.target.style.maxWidth = this.lastPosition.maxWidth;
        this.target.style.maxHeight = this.lastPosition.maxHeight;
    }

    protected update (position: Position) {

        this.lastPosition = { ...DEFAULT_POSITION, ...position };

        if (!this.isUpdating) {

            requestAnimationFrame(() => {

                this.apply(position);

                this.isUpdating = false;
            });
        }

        this.isUpdating = true;
    }
}

export class ConnectedPositionManager extends PositionManager {

    constructor (public target: HTMLElement, public origin: HTMLElement) {

        super(target, origin);
    }

    reposition () {

        const position: Position = { ...DEFAULT_POSITION };
        const origin: ClientRect = this.origin.getBoundingClientRect();

        position.top = `${ origin.bottom }px`;
        position.left = `${ origin.left }px`;

        this.update(position);
    }

    protected apply (position: Position) {

        this.target.style.transform = `translate(${this.lastPosition.left}, ${this.lastPosition.top})`;
        this.target.style.width = this.lastPosition.width;
        this.target.style.height = this.lastPosition.height;
        this.target.style.maxWidth = this.lastPosition.maxWidth;
        this.target.style.maxHeight = this.lastPosition.maxHeight;
    }
}

interface FixedPositionConfig {
    top?: string;
    left?: string;
    bottom?: string;
    right?: string;
    offsetHorizontal?: string;
    offsetVertical?: string;
    width?: string;
    height?: string;
    maxWidth?: string;
    maxHeight?: string;
}

export class FixedPositionManager extends PositionManager {

    constructor (public target: HTMLElement, public origin: HTMLElement, config: FixedPositionConfig) {

        super(target, origin);
    }

    reposition () {


    }
}
