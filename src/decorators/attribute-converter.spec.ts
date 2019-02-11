import { AttributeConverterBoolean, AttributeConverterString } from './attribute-converter';

describe('AttributeConverter', () => {

    describe('AttributeConverterBoolean', () => {

        it('should correctly convert boolean attributes', () => {

            expect(AttributeConverterBoolean.fromAttribute('true')).toBe(true);
            expect(AttributeConverterBoolean.fromAttribute('foo')).toBe(true);
            expect(AttributeConverterBoolean.fromAttribute('')).toBe(true);
            expect(AttributeConverterBoolean.fromAttribute(null)).toBe(false);

            expect(AttributeConverterBoolean.toAttribute(true)).toBe('');
            expect(AttributeConverterBoolean.toAttribute(false)).toBe(null);
            expect(AttributeConverterBoolean.toAttribute(null)).toBe(null);
        });
    });

    describe('AttributeConverterString', () => {

        it('should correctly convert string attributes', () => {

            expect(AttributeConverterString.fromAttribute('true')).toBe('true');
            expect(AttributeConverterString.fromAttribute('foo')).toBe('foo');
            expect(AttributeConverterString.fromAttribute('')).toBe('');
            expect(AttributeConverterString.fromAttribute('0')).toBe('0');
            expect(AttributeConverterString.fromAttribute(null)).toBe(null);

            expect(AttributeConverterString.toAttribute('true')).toBe('true');
            expect(AttributeConverterString.toAttribute('foo')).toBe('foo');
            expect(AttributeConverterString.toAttribute('')).toBe('');
            expect(AttributeConverterString.toAttribute(null)).toBe(null);
        });
    });

    // TODO: Add more tests
});
