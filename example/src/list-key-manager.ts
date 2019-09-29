import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp } from './keys';

export interface ListItem extends HTMLElement {
    disabled?: boolean;
}

export interface ActiveItemChange<T extends ListItem> extends CustomEvent {
    type: 'active-item-change';
    detail: {
        previous: {
            index: number | undefined;
            item: T | undefined;
        },
        current: {
            index: number | undefined;
            item: T | undefined;
        }
    }
}

type ListEntry<T extends ListItem> = [number | undefined, T | undefined];

export abstract class ListKeyManager<T extends ListItem> extends EventTarget {

    protected activeIndex: number | undefined;

    protected activeItem: T | undefined;

    protected listeners: Map<string, EventListener> = new Map();

    protected itemType: any;

    public items: T[];

    constructor (
        public host: HTMLElement,
        items: NodeListOf<T>,
        public direction: 'horizontal' | 'vertical' = 'vertical') {

        super();

        this.items = Array.from(items);
        this.itemType = this.items[0] && this.items[0].constructor;

        this.bindHost();
    }

    getActiveItem (): T | undefined {

        return this.activeItem;
    };

    setActiveItem (item: T, interactive = false) {

        const index = this.items.indexOf(item);
        const entry: ListEntry<T> = [
            index > -1 ? index : undefined,
            index > -1 ? item : undefined
        ];

        this.setEntryActive(entry, interactive);
    }

    setNextItemActive (interactive = false) {

        this.setEntryActive(this.getNextEntry(), interactive);
    }

    setPreviousItemActive (interactive = false) {

        this.setEntryActive(this.getPreviousEntry(), interactive);
    }

    setFirstItemActive (interactive = false) {

        this.setEntryActive(this.getFirstEntry(), interactive);
    }

    setLastItemActive (interactive = false) {

        this.setEntryActive(this.getLastEntry(), interactive);
    }

    handleKeydown (event: KeyboardEvent) {

        const [prev, next] = (this.direction === 'horizontal') ? [ArrowLeft, ArrowRight] : [ArrowUp, ArrowDown];
        const prevIndex = this.activeIndex;
        let handled = false;

        switch (event.key) {

            case prev:

                this.setPreviousItemActive(true);
                handled = true;
                break;

            case next:

                this.setNextItemActive(true);
                handled = true;
                break;
        }

        if (handled) {

            event.preventDefault();

            if (prevIndex !== this.activeIndex) this.dispatchActiveItemChange(prevIndex);
        }
    }

    handleMousedown (event: MouseEvent) {

        if (this.itemType && event.target instanceof this.itemType) {

            const prevIndex = this.activeIndex;

            this.setActiveItem(event.target as T, true);

            if (prevIndex !== this.activeIndex) this.dispatchActiveItemChange(prevIndex);
        }
    }

    handleFocus (event: FocusEvent) {

        if (this.itemType && event.target instanceof this.itemType) {

            const prevIndex = this.activeIndex;

            this.setActiveItem(event.target as T, true);

            if (prevIndex !== this.activeIndex) this.dispatchActiveItemChange(prevIndex);
        }
    }

    protected dispatchActiveItemChange (previousIndex: number | undefined) {

        const event: ActiveItemChange<T> = new CustomEvent('active-item-change', {
            bubbles: true,
            cancelable: true,
            composed: true,
            detail: {
                previous: {
                    index: previousIndex,
                    item: (typeof previousIndex === 'number') ? this.items[previousIndex] : undefined
                },
                current: {
                    index: this.activeIndex,
                    item: this.activeItem
                }
            }
        }) as ActiveItemChange<T>;

        this.dispatchEvent(event);
    }

    protected setEntryActive (entry: ListEntry<T>, interactive = false) {

        [this.activeIndex, this.activeItem] = entry;
    }

    protected getNextEntry (fromIndex?: number): ListEntry<T> {

        fromIndex = (typeof fromIndex === 'number')
            ? fromIndex
            : (typeof this.activeIndex === 'number')
                ? this.activeIndex
                : -1;

        const lastIndex = this.items.length - 1;
        let nextIndex = fromIndex + 1;
        let nextItem = this.items[nextIndex];

        while (nextIndex < lastIndex && nextItem && nextItem.disabled) {

            nextItem = this.items[++nextIndex];
        }

        return (nextItem && !nextItem.disabled) ? [nextIndex, nextItem] : [this.activeIndex, this.activeItem];
    }

    protected getPreviousEntry (fromIndex?: number): ListEntry<T> {

        fromIndex = (typeof fromIndex === 'number')
            ? fromIndex
            : (typeof this.activeIndex === 'number')
                ? this.activeIndex
                : 0;

        let prevIndex = fromIndex - 1;
        let prevItem = this.items[prevIndex];

        while (prevIndex > 0 && prevItem && prevItem.disabled) {

            prevItem = this.items[--prevIndex];
        }

        return (prevItem && !prevItem.disabled) ? [prevIndex, prevItem] : [this.activeIndex, this.activeItem];
    }

    protected getFirstEntry (): ListEntry<T> {

        return this.getNextEntry(-1);
    }

    protected getLastEntry (): ListEntry<T> {

        return this.getPreviousEntry(this.items.length);
    }

    protected bindHost () {

        // TODO: enable reconnecting the host element? no need if FocusManager is created in connectedCallback
        this.listeners = new Map([
            ['focusin', this.handleFocus.bind(this) as EventListener],
            ['keydown', this.handleKeydown.bind(this) as EventListener],
            ['mousedown', this.handleMousedown.bind(this) as EventListener],
            ['disconnected', this.unbindHost.bind(this)]
        ]);

        this.listeners.forEach((listener, event) => this.host.addEventListener(event, listener));
    }

    protected unbindHost () {

        this.listeners.forEach((listener, event) => this.host.removeEventListener(event, listener));
    }
}

export class FocusKeyManager<T extends ListItem> extends ListKeyManager<T> {

    protected setEntryActive (entry: ListEntry<T>, interactive = false) {

        super.setEntryActive(entry, interactive);

        if (this.activeItem && interactive) this.activeItem.focus();
    }
}
