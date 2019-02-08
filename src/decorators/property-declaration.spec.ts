import {
    DEFAULT_PROPERTY_CHANGE_DETECTOR,
    isAttributeReflector,
    isPropertyKey,
    isPropertyNotifier,
    isPropertyReflector,
    createAttributeName
} from './property-declaration';

describe('PropertyDeclaration', () => {

    describe('PropertyChangeDetector', () => {

        it('should detect property changes', () => {

            // numbers
            expect(DEFAULT_PROPERTY_CHANGE_DETECTOR(1, 1)).toBe(false);
            expect(DEFAULT_PROPERTY_CHANGE_DETECTOR(1, 1.0)).toBe(false);
            expect(DEFAULT_PROPERTY_CHANGE_DETECTOR(1, 2)).toBe(true);

            // strings
            expect(DEFAULT_PROPERTY_CHANGE_DETECTOR("foo", "foo")).toBe(false);
            expect(DEFAULT_PROPERTY_CHANGE_DETECTOR("foo", "Foo")).toBe(true);

            // booleans
            expect(DEFAULT_PROPERTY_CHANGE_DETECTOR(false, false)).toBe(false);
            expect(DEFAULT_PROPERTY_CHANGE_DETECTOR(false, true)).toBe(true);

            // objects
            const o = {}, a = [{}];
            expect(DEFAULT_PROPERTY_CHANGE_DETECTOR({}, {})).toBe(true);
            expect(DEFAULT_PROPERTY_CHANGE_DETECTOR([], [])).toBe(true);
            expect(DEFAULT_PROPERTY_CHANGE_DETECTOR(o, o)).toBe(false);
            expect(DEFAULT_PROPERTY_CHANGE_DETECTOR(a, a)).toBe(false);

            // null/undefined
            expect(DEFAULT_PROPERTY_CHANGE_DETECTOR(null, null)).toBe(false);
            expect(DEFAULT_PROPERTY_CHANGE_DETECTOR(undefined, undefined)).toBe(false);
            expect(DEFAULT_PROPERTY_CHANGE_DETECTOR(null, undefined)).toBe(true);

            // NaN
            expect(DEFAULT_PROPERTY_CHANGE_DETECTOR(NaN, NaN)).toBe(false);
        });
    });

    describe('isAttributeReflector', () => {

        it('should detect attribute reflectors', () => {

            expect(isAttributeReflector(() => { })).toBe(true);
            expect(isAttributeReflector('foo')).toBe(false);
            expect(isAttributeReflector({})).toBe(false);
        });
    });

    describe('isPropertyReflector', () => {

        it('should detect property reflectors', () => {

            expect(isPropertyReflector(() => { })).toBe(true);
            expect(isPropertyReflector('foo')).toBe(false);
            expect(isPropertyReflector({})).toBe(false);
        });
    });

    describe('isPropertyNotifier', () => {

        it('should detect property notifiers', () => {

            expect(isPropertyNotifier(() => { })).toBe(true);
            expect(isPropertyNotifier('foo')).toBe(false);
            expect(isPropertyNotifier({})).toBe(false);
        });
    });

    describe('isPropertyKey', () => {

        it('should detect property keys', () => {

            expect(isPropertyKey('foo')).toBe(true);
            expect(isPropertyKey(Symbol())).toBe(true);
            expect(isPropertyKey(1)).toBe(true);
            expect(isPropertyKey(() => { })).toBe(false);
            expect(isPropertyKey({})).toBe(false);
        });
    });

    describe('createAttributeName', () => {

        it('should create valid attribute names', () => {

            expect(createAttributeName('myTestProperty')).toBe('my-test-property');
            expect(createAttributeName('TestProperty')).toBe('test-property');

            expect(createAttributeName(1)).toBe('attr-1');
            expect(createAttributeName(1.4)).toBe('attr-1-4');
            expect(createAttributeName(1e+21)).toBe('attr-1e-21');

            expect(createAttributeName(Symbol())).toBe('attr-symbol');
            expect(createAttributeName(Symbol('myTestSymbol'))).toBe('attr-symbol-my-test-symbol');
            expect(createAttributeName(Symbol('foo   bar <=> baz/.(+)'))).toBe('attr-symbol-foo-bar-baz');
            expect(createAttributeName(Symbol.iterator)).toBe('attr-symbol-symbol-iterator');
            expect(createAttributeName(Symbol.hasInstance)).toBe('attr-symbol-symbol-has-instance');
        });
    });
});
