import { Changes, CustomElement, customElement, html, listener, property } from '../../../src';
import { Tab } from './tab';
import { css } from '../../../src/css';

@customElement<TabList>({
    selector: 'ui-tab-list',
    styles: [css`
    :host {
        display: flex;
        flex-flow: row nowrap;
    }
    `],
    template: () => html`<slot></slot>`
})
export class TabList extends CustomElement {

    protected selectedTab: Tab | undefined;

    @property()
    role!: string;

    connectedCallback () {

        super.connectedCallback();

        this.role = 'tablist'
    }

    updateCallback (changedProperties: Changes, firstUpdate: boolean) {

        if (firstUpdate) {

            // const slot = this._renderRoot.querySelector('slot') as HTMLSlotElement;

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

        if (this.selectedTab && this.selectedTab !== tab) this.selectedTab.deselect();

        tab.select();

        this.selectedTab = tab;
    }

    @listener({ event: 'keydown' })
    protected handleKeyDown (event: KeyboardEvent) {

        console.log('keydown... ', event);
    }

    @listener({ event: 'selected-changed' })
    protected handleSelectedChange (event: CustomEvent) {

        console.log('selected-change... ', event);

        const tab = event.target as Tab;
        const selected = event.detail.current as boolean;

        if (selected) {

            this.setSelectedTab(tab);

        } else if (this.selectedTab === tab) {

            this.selectedTab = undefined;
        }
    }
}
