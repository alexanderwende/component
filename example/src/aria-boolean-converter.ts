import { AttributeConverter } from '@partkit/component';

export const ARIABooleanConverter: AttributeConverter<boolean> = {
    fromAttribute: (value) => value === 'true',
    toAttribute: (value) => (value == null) ? value : value.toString()
};
