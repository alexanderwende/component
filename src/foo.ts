export class Foo {

    constructor (public name: string = 'Foo') { }

    greet (): string {

        return `Hello ${ this.name }!`;
    }
}
