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
    `],
    template: () => html`<slot></slot>`
})
export class TabList extends Component {

    private _tabs: Tab[] | undefined;

    protected selectedTab: Tab | undefined;

    protected get tabs (): Tab[] {

        if (!this._tabs) {

            this._tabs = Array.from(this.querySelectorAll(Tab.selector));
        }

        return this._tabs;
    }

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

        // if no tab is provided, select the first tab
        if (!tab) tab = this.querySelector(Tab.selector)! as Tab;

        if (this.selectedTab && this.selectedTab !== tab) {

            this.selectedTab.deselect();
            if (this.selectedTab.panel) this.selectedTab.panel.hidden = true;
        }

        tab.select();
        tab.focus();
        if (tab.panel) tab.panel.hidden = false;

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

    protected getPreviousTab (): Tab {

        const selectedIndex = this.selectedTab ? this.tabs.indexOf(this.selectedTab) : 0;
        let previousIndex = selectedIndex - 1;

        while (previousIndex >= 0 && this.tabs[previousIndex].disabled) {

            previousIndex--;
        }

        return this.tabs[Math.max(previousIndex, 0)];
    }

    protected getNextTab (): Tab {

        const length = this.tabs.length;
        const selectedIndex = this.selectedTab ? this.tabs.indexOf(this.selectedTab) : 0;
        let nextIndex = selectedIndex + 1;

        while (nextIndex < length && this.tabs[nextIndex].disabled) {

            nextIndex++;
        }

        return this.tabs[Math.min(nextIndex, length - 1)];
    }
}
