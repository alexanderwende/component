import { Changes, Component, component, css, listener, property } from '@partkit/component';
import { html } from 'lit-html';
import { ArrowDown } from '../keys';
import { ActiveItemChange, FocusKeyManager } from '../list-key-manager';
import { Tab } from './tab';

@component({
    selector: 'ui-tab-list',
    styles: [css`
    :host {
        display: flex;
        flex-flow: row nowrap;
    }
    ::slotted(ui-tab) {
        margin-right: 0.25rem;
    }
    `],
    template: () => html`<slot></slot>`
})
export class TabListNew extends Component {

    protected focusManager!: FocusKeyManager<Tab>;

    protected selectedTab!: Tab;

    @property()
    role!: string;

    connectedCallback () {

        super.connectedCallback();

        this.role = 'tablist';

        this.focusManager = new FocusKeyManager(this, this.querySelectorAll(Tab.selector), 'horizontal');
    }

    updateCallback (changes: Changes, firstUpdate: boolean) {

        if (firstUpdate) {

            // const slot = this.renderRoot.querySelector('slot') as HTMLSlotElement;

            // slot.addEventListener('slotchange', () => {

            //     console.log(`${slot.name} changed...`, slot.assignedNodes());
            // });

            const selectedTab = this.querySelector(`${ Tab.selector }[aria-selected=true]`) as Tab;

            selectedTab
                ? this.focusManager.setActiveItem(selectedTab)
                : this.focusManager.setFirstItemActive();

            // setting the active item via the focus manager's API will not trigger an event
            // so we have to manually select the initially active tab
            Promise.resolve().then(() => this.selectTab(this.focusManager.getActiveItem()));
        }
    }

    @listener({ event: 'keydown' })
    protected handleKeyDown (event: KeyboardEvent) {

        switch (event.key) {

            case ArrowDown:

                const selectedTab = this.focusManager.getActiveItem();
                if (selectedTab && selectedTab.panel) selectedTab.panel.focus();
                break;
        }
    }

    @listener<TabListNew>({
        event: 'active-item-change',
        target: function () { return this.focusManager; }
    })
    protected handleActiveTabChange (event: ActiveItemChange<Tab>) {

        const previousTab = event.detail.previous.item;
        const selectedTab = event.detail.current.item;

        if (previousTab !== selectedTab) {

            this.deselectTab(previousTab);
            this.selectTab(selectedTab);
        }
    }

    protected selectTab (tab?: Tab) {

        if (tab) {

            tab.select();

            if (tab.panel) tab.panel.hidden = false;
        }
    }

    protected deselectTab (tab?: Tab) {

        if (tab) {

            tab.deselect();

            if (tab.panel) tab.panel.hidden = true;
        }
    }
}
