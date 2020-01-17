import { createEventName } from '@partkit/component';

export interface FocusChangeEventDetail {
    hasFocus: boolean;
    target: HTMLElement;
    relatedTarget?: HTMLElement;
}

export const FOCUS_CHANGE_EVENT_INIT: EventInit = {
    bubbles: true,
    cancelable: true,
    composed: true,
};

/**
 * The FocusChangeEvent
 *
 * @remarks
 * The FocusChangeEvent is dispatched by the {@link FocusMonitor} *after* the focus state of the
 * monitored element has changed. This means, calling {@link activeElement} in an event handler
 * attached to this event will return the active element after the focus change. This is different
 * to focusin/focusout. Additionally, FocusChangeEvent is only triggered, when the focus moves into
 * the monitored element or out of the monitored element, but not when the focus moves within the
 * monitored element. FocusChangeEvent bubbles up the DOM.
 */
export class FocusChangeEvent extends CustomEvent<FocusChangeEventDetail> {

    constructor (detail: FocusChangeEventDetail, init: EventInit = {}) {

        const type = createEventName('focus', '', 'changed');

        const eventInit: CustomEventInit<FocusChangeEventDetail> = {
            ...FOCUS_CHANGE_EVENT_INIT,
            ...init,
            detail,
        };

        super(type, eventInit);
    }
}
