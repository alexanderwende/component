export const enum AxisAlignment {
    Start = 'start',
    Center = 'center',
    End = 'end'
}

export interface AlignmentOffset {
    horizontal: string;
    vertical: string;
}

export interface Alignment {
    horizontal: AxisAlignment;
    vertical: AxisAlignment;
}

export interface AlignmentPair {
    target: Alignment;
    origin: Alignment;
    offset?: AlignmentOffset;
}

export const DEFAULT_ALIGNMENT_PAIR: AlignmentPair = {
    origin: {
        horizontal: AxisAlignment.Start,
        vertical: AxisAlignment.End
    },
    target: {
        horizontal: AxisAlignment.Start,
        vertical: AxisAlignment.Start
    }
};
