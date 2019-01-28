import { Foo } from './foo';

describe('Foo', () => {

    it('creates', () => {

        const foo = new Foo();

        expect(foo).toBeDefined();

        expect(foo instanceof Foo).toBe(true);
    });

    it('has default name', () => {

        const foo = new Foo();

        expect(foo.name).toBe('Foo');
    });

    it('greets correctly', () => {

        const foo = new Foo();

        expect(foo.greet()).toBe('Hello Foo!');

        foo.name = 'Bar';

        expect(foo.greet()).toBe('Hello Bar!');
    });
});
