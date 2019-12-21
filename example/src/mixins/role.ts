import { Component, property, AttributeConverterString, component } from '@partkit/component';
import { Constructor } from './constructor';

export interface HasRole {
    role: string;
}

export function MixinRole<T extends typeof Component> (Base: T, role: string = ''): T & Constructor<HasRole> {

    @component({ define: false })
    class BaseHasRole extends Base implements HasRole {

        @property({ converter: AttributeConverterString })
        role!: string;

        connectedCallback () {

            this.role = this.getAttribute('role') || role;

            super.connectedCallback();
        }
    };

    return BaseHasRole;
}
