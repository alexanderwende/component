import { CSSSelector } from '../dom';
import { AlignmentPair, hasAlignmentPairChanged } from './alignment';
import { Position } from './position';
import { hasSizeChanged, Size } from './size';

export const VIEWPORT = 'viewport';

export const ORIGIN = 'origin';

/**
 * A PositionConfig contains the size and alignment of an Element and may include an origin, which references an origin Element
 */
export interface PositionConfig extends Size {
    // TODO: handle 'origin' case in PositionStrategy
    width: number | string | 'origin';
    height: number | string | 'origin';
    maxWidth: number | string | 'origin';
    maxHeight: number | string | 'origin';
    minWidth: number | string | 'origin';
    minHeight: number | string | 'origin';
    origin: Position | HTMLElement | CSSSelector | 'viewport';
    alignment: AlignmentPair;
}

export const POSITION_CONFIG_FIELDS: (keyof PositionConfig)[] = [
    'width',
    'height',
    'maxWidth',
    'maxHeight',
    'minWidth',
    'minHeight',
    'origin',
    'alignment',
];

export const DEFAULT_POSITION_CONFIG: PositionConfig = {
    width: 'auto',
    height: 'auto',
    maxWidth: '100vw',
    maxHeight: '100vh',
    minWidth: 'origin',
    minHeight: 'origin',
    origin: 'viewport',
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
