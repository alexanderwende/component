import { DEFAULT_POSITION, Position } from '../position';
import { DEFAULT_POSITION_CONFIG, PositionConfig } from '../position-config';
import { PositionStrategy } from '../position-strategy';

export const DEFAULT_POSITION_CONFIG_CENTERED: PositionConfig = {
    ...DEFAULT_POSITION_CONFIG,
};

export class CenteredPositionStrategy extends PositionStrategy {

    constructor (public target: HTMLElement, config?: Partial<PositionConfig>) {

        super(target, { ...DEFAULT_POSITION_CONFIG_CENTERED, ...config });
    }

    /**
     * We override the getPosition method to always return the {@link DEFAULT_POSITION}
     *
     * We actually don't care about the position, because we are going to use viewport relative
     * CSS units to position the element. After the first calculation of the position, it's
     * never going to change and applyPosition will only be called once. This makes this
     * position strategy really cheap.
     */
    protected getPosition (): Position {

        return DEFAULT_POSITION;
    }

    /**
     * We override the applyPosition method to center the element relative to the viewport
     * dimensions and its own size. This style has to be applied only once and is responsive
     * by default.
     */
    protected applyPosition (position: Position) {

        this.target.style.top = '50vh';
        this.target.style.left = '50vw';
        this.target.style.right = '';
        this.target.style.bottom = '';

        this.target.style.transform = `translate(-50%, -50%)`;
    }
}
