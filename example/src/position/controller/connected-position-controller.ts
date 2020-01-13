import { Position } from '../position';
import { DEFAULT_POSITION_CONFIG, PositionConfig } from '../position-config';
import { PositionController } from '../position-controller';

export const CONNECTED_POSITION_CONFIG: PositionConfig = {
    ...DEFAULT_POSITION_CONFIG,
    minWidth: 'origin',
    minHeight: 'origin',
    alignment: {
        origin: {
            horizontal: 'start',
            vertical: 'end'
        },
        target: {
            horizontal: 'start',
            vertical: 'start'
        },
        offset: {
            horizontal: 0,
            vertical: 0,
        },
    }
};

export class ConnectedPositionController extends PositionController {

    attach (element: HTMLElement): boolean {

        if (!super.attach(element)) return false;

        this.listen(window, 'resize', () => this.requestUpdate(), true);
        this.listen(document, 'scroll', () => this.requestUpdate(), true);

        // TODO: add contend-changed event to overlay via MutationObserver
        // and update position when content changes

        return true;
    }

    /**
     * We override the applyPosition method, so we can use a CSS transform to position the element.
     *
     * This can result in better performance.
     */
    // protected applyPosition (position: Position) {

    //     if (!this.hasAttached) return;

    //     this.element!.style.top = '';
    //     this.element!.style.left = '';
    //     this.element!.style.right = '';
    //     this.element!.style.bottom = '';

    //     // this.element!.style.transform = `translate(${ this.parseStyle(position.x) }, ${ this.parseStyle(position.y) })`;
    // }
}
