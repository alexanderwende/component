import { Component } from './component.js';
import { createEventName } from './decorators/index.js';

/**
 * The default EventInit object
 *
 * @remarks
 * We usually want our CustomEvents to bubble, cross shadow DOM boundaries and be cancelable,
 * so we set up a default object with this configuration.
 */
export const DEFAULT_EVENT_INIT: EventInit = {
    bubbles: true,
    cancelable: true,
    composed: true,
};

/**
 * The {@link ComponentEvent} detail
 *
 * @remarks
 * CustomEvents that cross shadow DOM boundaries get re-targeted. This means, the event's `target` property
 * is set to the CustomElement which holds the shadow DOM. We want to provide the original target in each
 * ComponentEvent so global event listeners can easily access the event's original target.
 */
export interface ComponentEventDetail<C extends Component = Component> {
    target: C;
}

/**
 * The ComponentEvent class
 *
 * @remarks
 * The ComponentEvent class extends CustomEvent and simply provides the default EventInit object and its typing
 * ensures that the event detail contains a target value.
 */
export class ComponentEvent<T = any, C extends Component = Component> extends CustomEvent<T & ComponentEventDetail<C>> {

    constructor (type: string, detail: T & ComponentEventDetail<C>, init: EventInit = {}) {

        const eventInit: CustomEventInit<T & ComponentEventDetail<C>> = {
            ...DEFAULT_EVENT_INIT,
            ...init,
            detail,
        };

        super(type, eventInit);
    }
}

/**
 * A type for property change event details, as used by {@link PropertyChangeEvent}
 */
export interface PropertyChangeEventDetail<T = any, C extends Component = Component> extends ComponentEventDetail<C> {
    property: string;
    previous: T;
    current: T;
}

/**
 * The PropertyChangeEvent class
 *
 * @remarks
 * A custom event, as dispatched by the {@link Component._notifyProperty} method. The constructor
 * ensures a conventional event name is created for the property key and imposes the correct type
 * on the event detail.
 */
export class PropertyChangeEvent<T = any, C extends Component = Component> extends ComponentEvent<PropertyChangeEventDetail<T>, C> {

    constructor (propertyKey: PropertyKey, detail: PropertyChangeEventDetail<T, C>, init?: EventInit) {

        const type = createEventName(propertyKey, '', 'changed');

        super(type, detail, init);
    }
}

/**
 * The LifecycleEvent class
 *
 * @remarks
 * A custom event, as dispatched by the {@link Component._notifyLifecycle} method. The constructor
 * ensures the allowed lifecycles.
 */
export class LifecycleEvent<T = any, C extends Component = Component> extends ComponentEvent<T, C> {

    constructor (lifecycle: 'adopted' | 'connected' | 'disconnected' | 'update', detail: T & ComponentEventDetail<C>, init?: EventInit) {

        super(lifecycle, detail, init);
    }
}
