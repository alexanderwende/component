import { FooBar } from './foo-bar';
import { Foo } from './foo';

describe('FooBar', () => {

    it('creates', () => {

        const fooBar = new FooBar();

        expect(fooBar).toBeDefined();

        expect(fooBar instanceof FooBar).toBe(true);

        expect(fooBar instanceof Foo).toBe(true);
    });

    it('has default name', () => {

        const fooBar = new FooBar();

        expect(fooBar.name).toBe('FooBar');
    });

    it('greets correctly', () => {

        const fooBar = new FooBar();

        expect(fooBar.greet()).toBe('Hey FooBar!');

        fooBar.name = 'Bar';

        expect(fooBar.greet()).toBe('Hey Bar!');
    });
});
