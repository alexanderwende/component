import { AlignmentPair, DEFAULT_ALIGNMENT_PAIR, hasAlignmentPairChanged } from './alignment';
import { Position } from './position';
import { hasSizeChanged, Size } from './size';

export const VIEWPORT = 'viewport';

export const ORIGIN = 'origin';

/**
 * A PositionConfig contains the size and alignment of an Element and may include an origin, which references an origin Element
 */
export interface PositionConfig extends Size {
    width: number | string | 'origin';
    height: number | string | 'origin';
    maxWidth: number | string | 'origin';
    maxHeight: number | string | 'origin';
    minWidth: number | string | 'origin';
    minHeight: number | string | 'origin';
    origin: Position | HTMLElement | 'viewport';
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
    minWidth: 'auto',
    minHeight: 'auto',
    origin: 'viewport',
    alignment: { ...DEFAULT_ALIGNMENT_PAIR }
};

export function hasPositionConfigChanged (positionConfig?: Partial<PositionConfig>, other?: Partial<PositionConfig>): boolean {

    if (positionConfig && other) {

        return positionConfig.origin !== other.origin
            || hasAlignmentPairChanged(positionConfig.alignment, other.alignment)
            || hasSizeChanged(positionConfig, other);
    }

    return positionConfig !== other;
}
