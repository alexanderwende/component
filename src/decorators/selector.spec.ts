import { html } from 'lit-html';
import { Component } from '../component';
import { component } from './component';
import { property } from './property';
import { selector } from './selector';

describe('@selector decorator', () => {

    it('selects view elements', (done) => {

        @component<TestElement>({
            selector: 'test-element-selectors',
            template: (element) => html`
            <h1>Heading</h1>
            <p>Content.</p>
            <p>More content.</p>
            <ul>
                ${ element.listData.map(data => html`<li>${ data }</li>`) }
            </ul>
            `,
        })
        class TestElement extends Component {

            @selector({ query: 'h1' })
            heading!: HTMLElement;

            @selector({ query: 'p' })
            content!: HTMLElement;

            @selector({ query: 'p', all: true })
            allContent!: NodeListOf<HTMLElement>;

            @selector({ query: 'li', all: true })
            listItems!: NodeListOf<HTMLElement>;

            @selector({ query: 'body', root: document })
            body!: HTMLBodyElement;

            @selector<TestElement>({ query: 'ul', root: function () { return this.shadowRoot!; } })
            list!: HTMLUListElement;

            @property({ attribute: false })
            listData = ['Item one', 'Item two', 'Item three'];
        }

        // the static selectors map should include all properties decorated as selectors
        expect([...TestElement.selectors.keys()]).toEqual(['heading', 'content', 'allContent', 'listItems', 'body', 'list']);

        const testElement = document.createElement(TestElement.selector) as TestElement;

        testElement.addEventListener('update', (event: Event) => {

            if ((event as CustomEvent).detail.firstUpdate) {

                expect(testElement.heading instanceof HTMLHeadingElement).toBeTruthy();
                expect(testElement.content instanceof HTMLParagraphElement).toBeTruthy();

                expect(testElement.allContent instanceof NodeList).toBeTruthy();
                expect(testElement.allContent.length).toBe(2);

                expect(testElement.listItems instanceof NodeList).toBeTruthy();
                expect(testElement.listItems.length).toBe(3);
                expect(Array.from(testElement.listItems).map(item => item.textContent)).toEqual(['Item one', 'Item two', 'Item three']);

                expect(testElement.body instanceof HTMLBodyElement).toBeTruthy();
                expect(testElement.body === document.body).toBeTruthy();

                expect(testElement.list instanceof HTMLUListElement).toBeTruthy();
                // there's a little gotcha when using nested templates in lit-html: it's inserting comment nodes where dynamic parts are
                // insterted, so when we traverse the shadow DOM, we need to use `firstElementChild` to skip comment nodes
                // here's what the list's template looks like in the DOM:
                // <ul>
                //     <!----><li><!---->Item one<!----></li><!----><li><!---->Item two<!----></li><!----><li><!---->Item three<!----></li><!---->
                // </ul>
                expect(testElement.list.firstElementChild).toBe(testElement.listItems.item(0));

                // we trigger another update by deferring a property update which should render new list items,
                // update the selectors and dispatch another update event
                Promise.resolve().then(() => testElement.listData = ['One', 'Two', 'Three', 'Four']);

            } else {

                expect(testElement.heading instanceof HTMLHeadingElement).toBeTruthy();
                expect(testElement.content instanceof HTMLParagraphElement).toBeTruthy();

                expect(testElement.allContent instanceof NodeList).toBeTruthy();
                expect(testElement.allContent.length).toBe(2);

                expect(testElement.listItems instanceof NodeList).toBeTruthy();
                expect(testElement.listItems.length).toBe(4);
                expect(Array.from(testElement.listItems).map(item => item.textContent)).toEqual(['One', 'Two', 'Three', 'Four']);

                expect(testElement.body instanceof HTMLBodyElement).toBeTruthy();
                expect(testElement.body === document.body).toBeTruthy();

                expect(testElement.list instanceof HTMLUListElement).toBeTruthy();
                expect(testElement.list.firstElementChild).toBe(testElement.listItems.item(0));

                done();
            }
        });

        document.body.appendChild(testElement);
    });
});
