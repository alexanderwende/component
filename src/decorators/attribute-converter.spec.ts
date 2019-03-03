import { AttributeConverterBoolean, AttributeConverterString, AttributeConverterNumber, AttributeConverterObject, AttributeConverterArray, AttributeConverterDate, AttributeConverterDefault } from './attribute-converter';

describe('AttributeConverter', () => {

    describe('AttributeConverterDefault', () => {

        it('should correctly convert attributes', () => {

            // empty strings and null simply return a null value
            expect(AttributeConverterDefault.fromAttribute('')).toBeNull();
            expect(AttributeConverterDefault.fromAttribute(null)).toBeNull();

            // JSON.parse will attempt to parse any string first
            expect(AttributeConverterDefault.fromAttribute('1')).toBe(1);
            expect(AttributeConverterDefault.fromAttribute('-1')).toBe(-1);
            expect(AttributeConverterDefault.fromAttribute('null')).toBe(null);
            expect(AttributeConverterDefault.fromAttribute('true')).toBe(true);
            expect(AttributeConverterDefault.fromAttribute('false')).toBe(false);
            expect(AttributeConverterDefault.fromAttribute('"false"')).toBe('false');
            expect(AttributeConverterDefault.fromAttribute('{"foo": "bar"}')).toEqual({ foo: 'bar' });
            expect(AttributeConverterDefault.fromAttribute('["foo", 1, true]')).toEqual(['foo', 1, true]);

            // if JSON.parse fails, the converter will return the plain string value
            expect(AttributeConverterDefault.fromAttribute('foo')).toBe('foo');
            // 'undefined' is not JSON parsable, so the string will be returned
            expect(AttributeConverterDefault.fromAttribute('undefined')).toBe('undefined');
            // invalid JSON strings will not be parsed and return a string instead
            expect(AttributeConverterDefault.fromAttribute('{foo: "bar"}')).toEqual('{foo: "bar"}');


            expect(AttributeConverterDefault.toAttribute(null)).toBeNull();
            expect(AttributeConverterDefault.toAttribute(undefined)).toBeUndefined();
            expect(AttributeConverterDefault.toAttribute('')).toBe('');
            expect(AttributeConverterDefault.toAttribute(1)).toBe('1');
            // by default booleans will be converted to boolean attributes ('' and null)
            expect(AttributeConverterDefault.toAttribute(true)).toBe('');
            expect(AttributeConverterDefault.toAttribute(false)).toBe(null);
            expect(AttributeConverterDefault.toAttribute({ foo: true })).toEqual('{"foo":true}');
            expect(AttributeConverterDefault.toAttribute([1, 2, false])).toEqual('[1,2,false]');
        });
    });

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

    describe('AttributeConverterNumber', () => {

        it('should correctly convert number attributes', () => {

            expect(AttributeConverterNumber.fromAttribute('1')).toBe(1);
            expect(AttributeConverterNumber.fromAttribute('0')).toBe(0);
            expect(AttributeConverterNumber.fromAttribute('-1')).toBe(-1);
            // empty Number constructor returns 0
            expect(AttributeConverterNumber.fromAttribute('')).toBe(0);
            expect(AttributeConverterNumber.fromAttribute(null)).toBe(null);
            expect(AttributeConverterNumber.fromAttribute('foo')).toBeNaN();

            expect(AttributeConverterNumber.toAttribute(1)).toBe('1');
            expect(AttributeConverterNumber.toAttribute(0)).toBe('0');
            expect(AttributeConverterNumber.toAttribute(-1)).toBe('-1');
            expect(AttributeConverterNumber.toAttribute(.1234)).toBe('0.1234');
            expect(AttributeConverterNumber.toAttribute(NaN)).toBe('NaN');
            expect(AttributeConverterNumber.toAttribute(null)).toBe(null);
        });
    });

    describe('AttributeConverterObject', () => {

        it('should correctly convert object attributes', () => {

            const testObject = {
                a: 'foo',
                b: 1,
                c: true,
                d: ['foo', 1, true, { b: 'bar' }]
            }

            const testString = JSON.stringify(testObject);

            expect(AttributeConverterObject.fromAttribute(testString)).toEqual(testObject);
            // empty string are considered null
            expect(AttributeConverterObject.fromAttribute('')).toBe(null);
            expect(AttributeConverterObject.fromAttribute(null)).toBe(null);

            expect(AttributeConverterObject.toAttribute(testObject)).toBe(testString);
            expect(AttributeConverterObject.toAttribute(null)).toBe(null);
        });
    });

    describe('AttributeConverterArray', () => {

        it('should correctly convert array attributes', () => {

            const testArray = [
                'foo',
                1,
                true,
                { b: 'bar' }
            ];

            const testString = JSON.stringify(testArray);

            expect(AttributeConverterArray.fromAttribute(testString)).toEqual(testArray);
            // empty string are considered null
            expect(AttributeConverterArray.fromAttribute('')).toBe(null);
            expect(AttributeConverterArray.fromAttribute(null)).toBe(null);

            expect(AttributeConverterArray.toAttribute(testArray)).toBe(testString);
            expect(AttributeConverterArray.toAttribute(null)).toBe(null);
        });
    });

    describe('AttributeConverterDate', () => {

        it('should correctly convert date attributes', () => {

            const testDate = new Date('2019/02/01');

            const testString = testDate.toString();

            expect(AttributeConverterDate.fromAttribute(testString)).toEqual(testDate);
            // non-parsable date string return an Invalid Date instance
            expect(AttributeConverterDate.fromAttribute('foo') instanceof Date).toBeTruthy();
            expect(AttributeConverterDate.fromAttribute('foo')!.getTime()).toBeNaN();
            // empty string are considered null
            expect(AttributeConverterDate.fromAttribute('')).toBe(null);
            expect(AttributeConverterDate.fromAttribute(null)).toBe(null);

            expect(AttributeConverterDate.toAttribute(testDate)).toBe(testString);
            expect(AttributeConverterDate.toAttribute(null)).toBe(null);
        });
    });
});
