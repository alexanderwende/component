export class IDGenerator {

    private _next = 0;

    constructor (public prefix: string = '', public suffix: string = '') { }

    getNextID (): string {

        const prefix = this.prefix ? `${ this.prefix }-` : '';
        const suffix = this.suffix ? `${ this.suffix }-` : '';

        return `${ prefix }${ this._next++ }${ suffix }`;
    }
}
