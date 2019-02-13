import { getPropertyDescriptor } from './get-property-descriptor';

describe('getPropertyDescriptor', () => {

    it('should retrieve the closest property descriptor from the prototype chain', () => {

        class Base {

            constructor () {}

            get property (): boolean {
                return false;
            }

            get anotherProperty (): string {
                return 'base';
            }
        }

        class Foo extends Base {}

        class Bar extends Foo {

            // class field does not override accessor in base class
            property: boolean = true;

            get anotherProperty (): string {
                return 'bar';
            }
        }

        const propertyDescriptor = Object.getOwnPropertyDescriptor(Base.prototype, 'property')!;
        const anotherPropertyDescriptor = Object.getOwnPropertyDescriptor(Base.prototype, 'anotherProperty')!;
        const anotherPropertyDescriptorBar = Object.getOwnPropertyDescriptor(Bar.prototype, 'anotherProperty')!;

        // getOwnPropertyDescriptor always returns a new object, but the reference to the getter can be testes
        expect(getPropertyDescriptor(Base.prototype, 'property')!.get).toBe(propertyDescriptor.get);
        expect(getPropertyDescriptor(Foo.prototype, 'property')!.get).toBe(propertyDescriptor.get);
        expect(getPropertyDescriptor(Bar.prototype, 'property')!.get).toBe(propertyDescriptor.get);

        expect(getPropertyDescriptor(Base.prototype, 'anotherProperty')!.get).toBe(anotherPropertyDescriptor.get);
        expect(getPropertyDescriptor(Foo.prototype, 'anotherProperty')!.get).toBe(anotherPropertyDescriptor.get);
        expect(getPropertyDescriptor(Bar.prototype, 'anotherProperty')!.get).not.toBe(anotherPropertyDescriptor.get);
        expect(getPropertyDescriptor(Bar.prototype, 'anotherProperty')!.get).toBe(anotherPropertyDescriptorBar.get);
    });

    it('should return undefined if property descriptor does not exist or only on Object', () => {

        class Foo {}

        expect(getPropertyDescriptor(Foo.prototype, 'property')).toBeUndefined();
        expect(Object.getOwnPropertyDescriptor(Object.prototype, 'valueOf')).toBeDefined();
        expect(getPropertyDescriptor(Foo.prototype, 'valueOf')).toBeUndefined();
    });
});
