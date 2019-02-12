import { getPropertyDescriptor } from './get-property-descriptor';

describe('getPropertyDescriptor', () => {

    it('should retrieve the closest property descriptor from the prototype chain', () => {

        class Base {

            constructor () {}

            get property (): boolean {
                return false;
            }
        }

        class Foo extends Base {}

        class Bar extends Foo {}

        expect(getPropertyDescriptor(Base.prototype, 'property')).toBeDefined();
        expect(getPropertyDescriptor(Foo.prototype, 'property')).toBeDefined();
        expect(getPropertyDescriptor(Bar.prototype, 'property')).toBeDefined();
    });
});
