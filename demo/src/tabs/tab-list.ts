import { Changes, Component, component, html, listener, property } from '../../../src';
import { Tab } from './tab';
import { css } from '../../../src/css';
import { ArrowLeft, ArrowRight, ArrowDown } from '../keys';

@component<TabList>({
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
export class TabList extends Component {

    private _tabs: Tab[] | undefined;

    protected get tabs (): Tab[] {

        if (!this._tabs) {

            this._tabs = Array.from(this.querySelectorAll(Tab.selector));
        }

        return this._tabs;
    }

    protected selectedTab: Tab | undefined;

    @property()
    role!: string;

    connectedCallback () {

        super.connectedCallback();

        this.role = 'tablist'
    }

    updateCallback (changes: Changes, firstUpdate: boolean) {

        if (firstUpdate) {

            // const slot = this.renderRoot.querySelector('slot') as HTMLSlotElement;

            // slot.addEventListener('slotchange', () => {

            //     console.log(`${slot.name} changed...`, slot.assignedNodes());
            // });

            // if the selector matches, the tab will already be selected, if not, the first tab
            // will be selected
            this.setSelectedTab(this.querySelector(`${ Tab.selector }[aria-selected=true]`) as Tab);
        }
    }

    setSelectedTab (tab?: Tab) {

        // if no tab is provided, select the first, non-disabled tab
        if (!tab) tab = this.getNextTab();

        if (this.selectedTab && this.selectedTab !== tab) {

            this.deselectTab(this.selectedTab);
        }

        this.selectTab(tab);

        this.selectedTab = tab;
    }

    @listener({ event: 'keydown' })
    protected handleKeyDown (event: KeyboardEvent) {

        switch (event.key) {

            case ArrowLeft:

                this.setSelectedTab(this.getPreviousTab());
                break;

            case ArrowRight:

                this.setSelectedTab(this.getNextTab());
                break;

            case ArrowDown:

                if (this.selectedTab && this.selectedTab.panel) this.selectedTab.panel.focus();
                break;
        }
    }

    @listener({ event: 'selected-changed' })
    protected handleSelectedChange (event: CustomEvent) {

        const tab = event.target as Tab;
        const selected = event.detail.current as boolean;

        if (selected) {

            this.setSelectedTab(tab);

        } else if (this.selectedTab === tab) {

            this.selectedTab = undefined;
        }
    }

    protected getPreviousTab (): Tab | undefined {

        const selectedIndex = this.selectedTab ? this.tabs.indexOf(this.selectedTab) : 0;
        let previousIndex = selectedIndex - 1;
        let previousTab = this.tabs[previousIndex];

        while (previousIndex > 0 && previousTab && previousTab.disabled) {

            previousTab = this.tabs[--previousIndex];
        }

        return (previousTab && !previousTab.disabled) ? previousTab : this.selectedTab;
    }

    protected getNextTab (): Tab | undefined {

        const selectedIndex = this.selectedTab ? this.tabs.indexOf(this.selectedTab) : -1;
        const lastIndex = this.tabs.length - 1;
        let nextIndex = selectedIndex + 1;
        let nextTab = this.tabs[nextIndex];

        while (nextIndex < lastIndex && nextTab && nextTab.disabled) {

            nextTab = this.tabs[++nextIndex];
        }

        return (nextTab && !nextTab.disabled) ? nextTab : this.selectedTab;
    }

    protected selectTab (tab?: Tab) {

        if (tab) {

            tab.select();
            tab.focus();

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
