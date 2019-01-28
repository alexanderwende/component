import { Foo } from './foo';

export class FooBar extends Foo {

    constructor (public name: string = 'FooBar') {

        super(name);
    }

    greet (): string {

        return `Hey ${ this.name }!`
    }
}
