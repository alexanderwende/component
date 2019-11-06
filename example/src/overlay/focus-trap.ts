import { CSSSelector } from '../dom';
import { Tab } from '../keys';
import { FocusMonitor } from './focus-monitor';

export const TABBABLES = [
    'a[href]:not([disabled]):not([tabindex^="-"])',
    'area[href]:not([disabled]):not([tabindex^="-"])',
    'button:not([disabled]):not([tabindex^="-"])',
    'input:not([disabled]):not([tabindex^="-"])',
    'select:not([disabled]):not([tabindex^="-"])',
    'textarea:not([disabled]):not([tabindex^="-"])',
    'iframe:not([disabled]):not([tabindex^="-"])',
    '[contentEditable]:not([disabled]):not([tabindex^="-"])',
    '[tabindex]:not([tabindex^="-"])',
];

export interface FocusTrapConfig {
    tabbableSelector: CSSSelector;
    wrapFocus: boolean;
    autoFocus: boolean;
    restoreFocus: boolean;
    initialFocus?: CSSSelector;
}

export const DEFAULT_FOCUS_TRAP_CONFIG: FocusTrapConfig = {
    tabbableSelector: TABBABLES.join(','),
    wrapFocus: true,
    autoFocus: true,
    restoreFocus: true,
};

export class FocusTrap extends FocusMonitor {

    protected tabbables!: NodeListOf<HTMLElement>;

    protected start!: HTMLElement;

    protected end!: HTMLElement;

    protected config: FocusTrapConfig;

    constructor (config?: Partial<FocusTrapConfig>) {

        super();

        this.config = { ...DEFAULT_FOCUS_TRAP_CONFIG, ...config };
    }

    attach (element: HTMLElement) {

        super.attach(element);

        this.listen(this.element!, 'keydown', ((event: KeyboardEvent) => this.handleKeyDown(event)) as EventListener);

        this.update();

        if (this.config.autoFocus) {

            this.focusInitial();
        }
    }

    detach () {

        if (!this.hasAttached) return;

        super.detach();
    }

    focusInitial () {

        if (this.config.initialFocus) {

            const initialFocus = this.element!.querySelector<HTMLElement>(this.config.initialFocus);

            if (initialFocus) {

                initialFocus.focus();
                return;

            } else {

                console.warn(`FocusTrap could not find initialFocus element selector ${ this.config.initialFocus }. Possible error in FocusTrapConfig.`);
            }
        }

        this.focusFirst();
    }

    focusFirst () {

        this.start.focus();
    }

    focusLast () {

        this.end.focus();
    }

    update () {

        if (!this.hasAttached) return;

        this.tabbables = this.element!.querySelectorAll(this.config.tabbableSelector);

        const length = this.tabbables.length;

        this.start = length
            ? this.tabbables.item(0)
            : this.element!;

        this.end = length
            ? this.tabbables.item(length - 1)
            : this.element!;
    }

    protected handleKeyDown (event: KeyboardEvent) {

        switch (event.key) {

            case Tab:

                if (event.shiftKey && event.target === this.start) {

                    event.preventDefault();

                    if (this.config.wrapFocus) {
                        this.focusLast();
                    }

                } else if (!event.shiftKey && event.target === this.end) {

                    event.preventDefault();

                    if (this.config.wrapFocus) {
                        this.focusFirst();
                    }
                }
                break;
        }
    }
}
