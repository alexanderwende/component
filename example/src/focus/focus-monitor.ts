import { macroTask } from '@partkit/component/tasks';
import { Behavior } from '../behavior/behavior';
import { activeElement } from '../dom';
import { cancel } from '../events';
import { FocusChangeEvent } from './focus-change-event';

export class FocusMonitor extends Behavior {

    /**
     * The previous focus state (when the last FocusChangeEvent was fired)
     */
    protected hadFocus?: boolean;

    /**
     * The current focus state
     */
    hasFocus = false;

    attach (element: HTMLElement): boolean {

        if (!super.attach(element)) return false;

        // check if we have focus
        this.hasFocus = this.element!.contains(activeElement());

        // attach event handlers
        this.listen(this.element!, 'focusin', event => this.handleFocusIn(event as FocusEvent));
        this.listen(this.element!, 'focusout', event => this.handleFocusOut(event as FocusEvent));

        return true;
    }

    protected handleFocusIn (event: FocusEvent) {

        if (!this.hasFocus) {

            this.hasFocus = true;

            // schedule to dispatch a focus-changed event in the next macro-task to make
            // sure it is dispatched after the focus has moved
            // we also check that focus state hasn't changed until the macro-task
            macroTask(() => this.hasFocus && this.notifyFocusChange(event));
        }

        // stop the original focusin event from bubbling up the DOM and ending up in a parent
        // component's focus monitor
        cancel(event);
    }

    protected handleFocusOut (event: FocusEvent) {

        if (this.hasFocus) {

            this.hasFocus = false;

            // schedule to dispatch a focus-changed event in the next macro-task to make
            // sure it is dispatched after the focus has moved
            // we also check that focus state hasn't changed until the macro-task
            macroTask(() => !this.hasFocus && this.notifyFocusChange(event));
        }

        // stop the original focusout event from bubbling up the DOM and ending up in a parent
        // component's focus monitor
        cancel(event);
    }

    protected notifyFocusChange (event: FocusEvent) {

        // we only need to dispatch an event if our current focus state is different
        // than the last time we dispatched an event - this filters out cases where
        // we have a consecutive focusout/focusin event when the focus moves within
        // the monitored element (we don't want to notify if focus changes within)
        if (this.hasFocus !== this.hadFocus) {

            this.hadFocus = this.hasFocus;

            this.dispatch(new FocusChangeEvent({
                hasFocus: this.hasFocus,
                target: this.element as HTMLElement,
                relatedTarget: event.relatedTarget as HTMLElement,
            }));
        }
    }
}
