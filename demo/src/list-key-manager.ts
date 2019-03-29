import { ArrowUp, ArrowLeft, ArrowDown, ArrowRight } from './keys';

export interface ListItem extends HTMLElement {
    disabled?: boolean;
}

type ListEntry<T extends ListItem> = [number | undefined, T | undefined];

export interface ActiveItemChange<T extends ListItem> extends CustomEvent {
    type: 'active-item-change';
    detail: {
        index: number | undefined;
        item: T | undefined;
    }
}

export abstract class ListKeyManager<T extends ListItem> extends EventTarget {

    protected activeIndex: number | undefined;
    protected activeItem: T | undefined;

    // TODO: Use a map?
    public items: T[];

    constructor (items: NodeListOf<T>, public direction: 'horizontal' | 'vertical' = 'vertical') {

        super();

        this.items = Array.from(items);
    }

    getActiveItem (): T | undefined {

        return this.activeItem;
    };

    setActiveItem (item: T) {

        const index = this.items.indexOf(item);
        const entry: ListEntry<T> = [
            index > -1 ? index : undefined,
            index > -1 ? item : undefined
        ];

        this.setEntryActive(entry);
    }

    setNextItemActive () {

        this.setEntryActive(this.getNextEntry());
    }

    setPreviousItemActive () {

        this.setEntryActive(this.getPreviousEntry());
    }

    setFirstItemActive () {

        this.setEntryActive(this.getFirstEntry());
    }

    setLastItemActive () {

        this.setEntryActive(this.getLastEntry());
    }

    handleKeydown (event: KeyboardEvent) {

        const [prev, next] = (this.direction === 'horizontal') ? [ArrowLeft, ArrowRight] : [ArrowUp, ArrowDown];
        const prevIndex = this.activeIndex;
        let handled = false;

        switch (event.key) {

            case prev:

                this.setPreviousItemActive();
                handled = true;
                break;

            case next:

                this.setNextItemActive();
                handled = true;
                break;
        }

        if (handled) {

            event.preventDefault();

            if (prevIndex !== this.activeIndex) this.dispatchActiveItemChange();
        }
    }

    protected dispatchActiveItemChange () {

        const event: ActiveItemChange<T> = new CustomEvent('active-item-change', {
            bubbles: true,
            cancelable: true,
            composed: true,
            detail: {
                index: this.activeIndex,
                item: this.activeItem
            }
        }) as ActiveItemChange<T>;

        this.dispatchEvent(event);
    }

    protected setEntryActive (entry: ListEntry<T>) {

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
}

export class FocusKeyManager<T extends ListItem> extends ListKeyManager<T> {

    protected setEntryActive (entry: ListEntry<T>) {

        super.setEntryActive(entry);

        if (this.activeItem) this.activeItem.focus();
    }
}
