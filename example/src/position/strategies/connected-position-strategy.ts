import { AlignmentPair, AxisAlignment, DEFAULT_ALIGNMENT_PAIR } from "../alignment";
import { Position } from "../position";
import { DEFAULT_POSITION, PositionStrategy } from "../position-strategy";

export class ConnectedPositionStrategy extends PositionStrategy {

    protected updateListener!: EventListener;

    protected alignment: AlignmentPair;

    constructor (
        public target: HTMLElement,
        public origin: HTMLElement,
        defaultPosition: Position = DEFAULT_POSITION,
        alignment: AlignmentPair = DEFAULT_ALIGNMENT_PAIR
    ) {

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
