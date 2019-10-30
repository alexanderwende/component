import { CSSSelector } from '../../dom';
import { AlignmentPair, hasAlignmentPairChanged } from './alignment';
import { Position } from './position';
import { hasSizeChanged, Size } from './size';

/**
 * A PositionConfig contains the size and alignment of an Element and may include an origin, which references an origin Element
 */
export interface PositionConfig extends Size {
    origin: Position | HTMLElement | CSSSelector | 'viewport';
    alignment: AlignmentPair;
}

export const POSITION_CONFIG_FIELDS: (keyof PositionConfig)[] = [
    'width',
    'height',
    'maxWidth',
    'maxHeight',
    'origin',
    'alignment'
];

export const DEFAULT_POSITION_CONFIG: PositionConfig = {
    width: 'auto',
    maxWidth: '100vw',
    height: 'auto',
    maxHeight: '100vh',
    origin: 'viewport',
    // TODO: add option to match width of origin element
    // matchOriginWidth: false,
    alignment: {
        origin: {
            horizontal: 'center',
            vertical: 'center',
        },
        target: {
            horizontal: 'center',
            vertical: 'center',
        },
        offset: {
            horizontal: 0,
            vertical: 0,
        }
    }
};

export function hasPositionConfigChanged (positionConfig?: Partial<PositionConfig>, other?: Partial<PositionConfig>): boolean {

    if (positionConfig && other) {

        return positionConfig.origin !== other.origin
            || hasAlignmentPairChanged(positionConfig.alignment, other.alignment)
            || hasSizeChanged(positionConfig, other);
    }

    return positionConfig !== other;
}
