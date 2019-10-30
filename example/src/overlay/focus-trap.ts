import { Behavior } from '../behavior';
import { Tab } from '../keys';
import { CSSSelector } from '../dom';

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
    selector: CSSSelector;
    wrap: boolean;
    autoFocus: boolean;
    restoreFocus: boolean;
    initialFocus?: CSSSelector;
}

export const DEFAULT_FOCUS_TRAP_CONFIG: FocusTrapConfig = {
    selector: TABBABLES.join(','),
    wrap: true,
    autoFocus: true,
    restoreFocus: true,
};

export class FocusTrap extends Behavior {

    protected tabbables!: NodeListOf<HTMLElement>;

    protected start!: HTMLElement;

    protected end!: HTMLElement;

    protected config: FocusTrapConfig;

    protected previousFocus!: HTMLElement;

    constructor (config?: Partial<FocusTrapConfig>) {

        super();

        this.config = { ...DEFAULT_FOCUS_TRAP_CONFIG, ...config };
    }

    attach (element: HTMLElement) {

        super.attach(element);

        this.previousFocus = document.activeElement as HTMLElement;

        this.listen(this.element!, 'keydown', ((event: KeyboardEvent) => this.handleKeyDown(event)) as EventListener);

        this.update();

        if (this.config.autoFocus) {

            this.focusInitial();
        }
    }

    detach () {

        if (!this.hasAttached) return;

        if (this.config.restoreFocus) {

            this.previousFocus.focus();
        }

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

        console.log('focusFirst()... ', this.start);
        this.start.focus();
    }

    focusLast () {

        console.log('focusLast()... ', this.end);
        this.end.focus();
    }

    update () {

        if (!this.hasAttached) return;

        this.tabbables = this.element!.querySelectorAll(this.config.selector);

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
                console.log('FocusTrap.handleKeyDown...', event);
                if (event.shiftKey && event.target === this.start) {
                    event.preventDefault();
                    if (this.config.wrap) {
                        this.focusLast();
                    }
                }
                else if (!event.shiftKey && event.target === this.end) {
                    event.preventDefault();
                    if (this.config.wrap) {
                        this.focusFirst();
                    }
                }
                break;
        }
    }
}
