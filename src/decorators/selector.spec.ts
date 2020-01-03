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

            @property({ attribute: false })
            listData = ['Item one', 'Item two', 'Item three'];
        }

        // the static selectors map should include all properties decorated as selectors
        expect([...TestElement.selectors.keys()]).toEqual(['heading', 'content', 'allContent', 'listItems']);

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

                done();
            }
        });

        document.body.appendChild(testElement);
    });
});
