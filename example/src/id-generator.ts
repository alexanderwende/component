export class IDGenerator {

    private _next = 0;

    /**
     *
     * @param prefix - An optional prefix for the generated ID including an optional separator, e.g.: `'my-prefix-' or 'prefix--' or 'prefix_' or 'prefix`
     * @param suffix - An optional suffix for the generated ID including an optional separator, e.g.: `'-my-suffix' or '--suffix' or '_suffix' or 'suffix`
     */
    constructor (public prefix: string = '', public suffix: string = '') { }

    getNextID (): string {

        return `${ this.prefix }${ this._next++ }${ this.suffix }`;
    }
}
