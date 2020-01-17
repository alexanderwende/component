import { CSSSelector } from '../dom';
import { Tab } from '../keys';
import { FocusMonitor } from './focus-monitor';
import { applyDefaults } from '../utils/config';

/**
 * A CSS selector for matching elements which are not disabled or removed from the tab order
 *
 * @private
 * @internal
 */
const INTERACTIVE = ':not([disabled]):not([tabindex^="-"])';

/**
 * An array of CSS selectors to match generally tabbable elements
 *
 * @private
 * @internal
 */
const ELEMENTS = [
    'a[href]',
    'area[href]',
    'button',
    'input',
    'select',
    'textarea',
    'iframe',
    '[contentEditable]',
    '[tabindex]',
];

/**
 * An array of CSS selectors to match interactive, tabbable elements
 */
export const TABBABLES = ELEMENTS.map(ELEMENT => `${ ELEMENT }${ INTERACTIVE }`);

/**
 * The {@link FocusTrap} configuration interface
 */
export interface FocusTrapConfig {
    tabbableSelector: CSSSelector;
    wrapFocus: boolean;
    autoFocus: boolean;
    restoreFocus: boolean;
    initialFocus?: CSSSelector;
}

/**
 * The default {@link FocusTrap} configuration
 */
export const DEFAULT_FOCUS_TRAP_CONFIG: FocusTrapConfig = {
    tabbableSelector: TABBABLES.join(','),
    wrapFocus: true,
    autoFocus: true,
    restoreFocus: true,
};

/**
 * An array of {@link FocusTrapConfig} property names
 */
export const FOCUS_TRAP_CONFIG_FIELDS: (keyof FocusTrapConfig)[] = [
    'autoFocus',
    'wrapFocus',
    'initialFocus',
    'restoreFocus',
    'tabbableSelector',
];

/**
 * The FocusTrap behavior
 *
 * @remarks
 * The FocusTrap behavior extends the {@link FocusMonitor} behavior and adds additional
 * functionality to it, like trapping the focus in the monitored element, auto wrapping
 * the focus order, as well as auto-focus and restore-focus. The behavior of the
 * FocusTrap can be defined through a {@link FocusTrapConfig}.
 */
export class FocusTrap extends FocusMonitor {

    protected tabbables!: NodeListOf<HTMLElement>;

    protected start!: HTMLElement;

    protected end!: HTMLElement;

    protected config: FocusTrapConfig;

    constructor (config?: Partial<FocusTrapConfig>) {

        super();

        this.config = applyDefaults(config || {}, DEFAULT_FOCUS_TRAP_CONFIG);
    }

    attach (element: HTMLElement): boolean {

        if (!super.attach(element)) return false;

        this.update();

        this.listen(this.element!, 'keydown', ((event: KeyboardEvent) => this.handleKeyDown(event)) as EventListener);

        if (this.config.autoFocus) this.focusInitial();

        return true;
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

                    if (this.config.wrapFocus) this.focusLast();

                } else if (!event.shiftKey && event.target === this.end) {

                    event.preventDefault();

                    if (this.config.wrapFocus) this.focusFirst();
                }

                break;
        }
    }
}
