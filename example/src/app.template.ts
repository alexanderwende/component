import { html } from 'lit-html';
import { App } from './app';

export const template = (element: App) => html`
    <header>
        <h1>Examples</h1>
    </header>

    <main>

        <div>
            <h2>Icon</h2>

            <h3>Font Awesome</h3>

            <div class="icons">
                <ui-icon .icon=${ 'chevron-right' }></ui-icon>
                <ui-icon .icon=${ 'envelope' }></ui-icon>
                <ui-icon .icon=${ 'lock' }></ui-icon>
                <ui-icon .icon=${ 'lock-open' }></ui-icon>
                <ui-icon .icon=${ 'paint-brush' }></ui-icon>
                <ui-icon .icon=${ 'pen' }></ui-icon>
                <ui-icon .icon=${ 'check' }></ui-icon>
                <ui-icon .icon=${ 'times' }></ui-icon>
                <ui-icon .icon=${ 'trash-alt' }></ui-icon>
                <ui-icon .icon=${ 'exclamation-triangle' }></ui-icon>
                <ui-icon .icon=${ 'info-circle' }></ui-icon>
                <ui-icon .icon=${ 'question-circle' }></ui-icon>
                <ui-icon .icon=${ 'user-circle' }></ui-icon>
                <ui-icon .icon=${ 'user' }></ui-icon>
            </div>

            <ul>
                <li>
                    <span>Buy something<ui-icon .icon=${ 'check' }></ui-icon></span>
                </li>
                <li>
                    <span>Buy something else<ui-icon .icon=${ 'times' }></ui-icon></span>
                </li>
            </ul>

            <h3>Unicons</h3>

            <div class="icons">
                <ui-icon .icon=${ 'angle-right-b' } .set=${ 'uni' }></ui-icon>
                <ui-icon .icon=${ 'envelope-alt' } .set=${ 'uni' }></ui-icon>
                <ui-icon .icon=${ 'lock' } .set=${ 'uni' }></ui-icon>
                <ui-icon .icon=${ 'unlock' } .set=${ 'uni' }></ui-icon>
                <ui-icon .icon=${ 'brush-alt' } .set=${ 'uni' }></ui-icon>
                <ui-icon .icon=${ 'pen' } .set=${ 'uni' }></ui-icon>
                <ui-icon .icon=${ 'check' } .set=${ 'uni' }></ui-icon>
                <ui-icon .icon=${ 'times' } .set=${ 'uni' }></ui-icon>
                <ui-icon .icon=${ 'trash-alt' } .set=${ 'uni' }></ui-icon>
                <ui-icon .icon=${ 'user-circle' } .set=${ 'uni' }></ui-icon>
                <ui-icon .icon=${ 'user' } .set=${ 'uni' }></ui-icon>
            </div>

            <ul>
                <li>
                    <span>Buy something<ui-icon .icon=${ 'check' } .set=${ 'uni' }></ui-icon></span>
                </li>
                <li>
                    <span>Buy something else<ui-icon .icon=${ 'times' } .set=${ 'uni' }></ui-icon></span>
                </li>
            </ul>

            <h3>Material Icons</h3>

            <div class="icons">
                <ui-icon .icon=${ 'chevron_right' } .set=${ 'mat' }></ui-icon>
                <ui-icon .icon=${ 'mail' } .set=${ 'mat' }></ui-icon>
                <ui-icon .icon=${ 'lock' } .set=${ 'mat' }></ui-icon>
                <ui-icon .icon=${ 'lock_open' } .set=${ 'mat' }></ui-icon>
                <ui-icon .icon=${ 'brush' } .set=${ 'mat' }></ui-icon>
                <ui-icon .icon=${ 'edit' } .set=${ 'mat' }></ui-icon>
                <ui-icon .icon=${ 'check' } .set=${ 'mat' }></ui-icon>
                <ui-icon .icon=${ 'clear' } .set=${ 'mat' }></ui-icon>
                <ui-icon .icon=${ 'delete' } .set=${ 'mat' }></ui-icon>
                <ui-icon .icon=${ 'warning' } .set=${ 'mat' }></ui-icon>
                <ui-icon .icon=${ 'info' } .set=${ 'mat' }></ui-icon>
                <ui-icon .icon=${ 'help' } .set=${ 'mat' }></ui-icon>
                <ui-icon .icon=${ 'account_circle' } .set=${ 'mat' }></ui-icon>
                <ui-icon .icon=${ 'person' } .set=${ 'mat' }></ui-icon>
            </div>

            <ul>
                <li>
                    <span>Buy something<ui-icon .icon=${ 'check' } .set=${ 'mat' }></ui-icon></span>
                </li>
                <li>
                    <span>Buy something else<ui-icon .icon=${ 'clear' } .set=${ 'mat' }></ui-icon></span>
                </li>
            </ul>

            <h3>Evil Icons</h3>

            <div class="icons">
                <ui-icon .icon=${ 'chevron-right' } .set=${ 'ei' }></ui-icon>
                <ui-icon .icon=${ 'envelope' } .set=${ 'ei' }></ui-icon>
                <ui-icon .icon=${ 'lock' } .set=${ 'ei' }></ui-icon>
                <ui-icon .icon=${ 'unlock' } .set=${ 'ei' }></ui-icon>
                <ui-icon .icon=${ 'paperclip' } .set=${ 'ei' }></ui-icon>
                <ui-icon .icon=${ 'pencil' } .set=${ 'ei' }></ui-icon>
                <ui-icon .icon=${ 'check' } .set=${ 'ei' }></ui-icon>
                <ui-icon .icon=${ 'close' } .set=${ 'ei' }></ui-icon>
                <ui-icon .icon=${ 'trash' } .set=${ 'ei' }></ui-icon>
                <ui-icon .icon=${ 'exclamation' } .set=${ 'ei' }></ui-icon>
                <ui-icon .icon=${ 'question' } .set=${ 'ei' }></ui-icon>
                <ui-icon .icon=${ 'user' } .set=${ 'ei' }></ui-icon>
            </div>

            <ul>
                <li>
                    <span>Buy something<ui-icon .icon=${ 'check' } .set=${ 'ei' }></ui-icon></span>
                </li>
                <li>
                    <span>Buy something else<ui-icon .icon=${ 'close' } .set=${ 'ei' }></ui-icon></span>
                </li>
            </ul>

            <h2>Checkbox</h2>
            <ui-checkbox .checked=${ true }></ui-checkbox>

            <h2>Toggle</h2>
            <ul class="settings-list">
                <li>
                    <span id="notify-email">Notification email</span>
                    <ui-toggle label-on="yes" label-off="no" aria-labelledby="notify-email" aria-checked="true"></ui-toggle>
                </li>
                <li>
                    <span id="notify-sms">Notification sms</span>
                    <ui-toggle label-on="yes" label-off="no" aria-labelledby="notify-sms"></ui-toggle>
                </li>
            </ul>
            <ul class="settings-list">
                <li>
                    <span id="notify">Notifications</span>
                    <ui-toggle aria-labelledby="notify" aria-checked="true"></ui-toggle>
                </li>
            </ul>
        </div>

        <div>
            <h2>Card</h2>
            <ui-card>
                <h3 slot="ui-card-header">Card Title</h3>
                <p slot="ui-card-body">Card body text...</p>
                <p slot="ui-card-footer">Card footer</p>
            </ui-card>

            <h2>Action Card</h2>
            <ui-action-card>
                <h3 slot="ui-action-card-header">Card Title</h3>
                <p slot="ui-action-card-body">Card body text...</p>
                <button slot="ui-action-card-actions">More</button>
            </ui-action-card>

            <h2>Plain Card</h2>
            <ui-plain-card>
                <h3 slot="ui-card-header">Card Title</h3>
                <p slot="ui-card-body">Card body text...</p>
                <p slot="ui-card-footer">Card footer</p>
            </ui-plain-card>

            <h2>Tabs</h2>
            <ui-tab-list>
                <ui-tab id="tab-1" aria-controls="tab-panel-1"><span>First Tab</span></ui-tab>
                <ui-tab id="tab-2" aria-controls="tab-panel-2">Second Tab</ui-tab>
                <ui-tab id="tab-3" aria-controls="tab-panel-3" aria-disabled="true">Third Tab</ui-tab>
                <ui-tab id="tab-4" aria-controls="tab-panel-4">Fourth Tab</ui-tab>
            </ui-tab-list>
            <ui-tab-panel id="tab-panel-1">
                <h3>First Tab Panel</h3>
                <p>Lorem ipsum dolor sit amet, no prima qualisque euripidis est. Qualisque quaerendum at est. Laudem
                    constituam ea usu, virtute ponderum posidonium no eos. Dolores consetetur ex has. Nostro recusabo an
                    est, wisi summo necessitatibus cum ne.</p>
            </ui-tab-panel>
            <ui-tab-panel id="tab-panel-2">
                <h3>Second Tab Panel</h3>
                <p>In clita tollit minimum quo, an accusata volutpat euripidis vim. Ferri quidam deleniti quo ea, duo
                    animal accusamus eu, cibo erroribus et mea. Ex eam wisi admodum praesent, has cu oblique ceteros
                    eleifend. Ex mel platonem assentior persequeris, vix cibo libris ut. Ad timeam accumsan est, et autem
                    omnes civibus mel. Mel eu ubique equidem molestiae, choro docendi moderatius ei nam.</p>
            </ui-tab-panel>
            <ui-tab-panel id="tab-panel-3">
                <h3>Third Tab Panel</h3>
                <p>I'm disabled, you shouldn't see me.</p>
            </ui-tab-panel>
            <ui-tab-panel id="tab-panel-4">
                <h3>Fourth Tab Panel</h3>
                <p>Lorem ipsum dolor sit amet, no prima qualisque euripidis est. Qualisque quaerendum at est. Laudem
                    constituam ea usu, virtute ponderum posidonium no eos. Dolores consetetur ex has. Nostro recusabo an
                    est, wisi summo necessitatibus cum ne.</p>
            </ui-tab-panel>
        </div>

        <div>
            <h2>Accordion</h2>

            <ui-accordion>

                <ui-accordion-panel id="custom-panel-id" expanded level="3">

                    <ui-accordion-header>Panel One</ui-accordion-header>

                    <p>Lorem ipsum dolor sit amet, no prima qualisque euripidis est. Qualisque quaerendum at est.
                        Laudem constituam ea usu, virtute ponderum posidonium no eos. Dolores consetetur ex has. Nostro
                        recusabo an est, wisi summo necessitatibus cum ne.</p>
                    <p>At usu epicurei assentior, putent dissentiet repudiandae ea quo. Pro ne debitis placerat
                        signiferumque, in sonet volumus interpretaris cum. Dolorum appetere ne quo. Dicta qualisque eos
                        ea, eam at nulla tamquam.
                    </p>

                </ui-accordion-panel>

                <ui-accordion-panel level="3">

                    <ui-accordion-header>Panel Two</ui-accordion-header>

                    <p>In clita tollit minimum quo, an accusata volutpat euripidis vim. Ferri quidam deleniti quo ea,
                        duo animal accusamus eu, cibo erroribus et mea. Ex eam wisi admodum praesent, has cu oblique
                        ceteros eleifend. Ex mel platonem assentior persequeris, vix cibo libris ut. Ad timeam accumsan
                        est, et autem omnes civibus mel. Mel eu ubique equidem molestiae, choro docendi moderatius ei
                        nam.</p>
                    <p>Qui suas solet ceteros cu, pertinax vulputate deterruisset eos ne. Ne ius vide nullam, alienum
                        ancillae reformidans cum ad. Ea meliore sapientem interpretaris eam. Commune delicata
                        repudiandae in eos, placerat incorrupte definitiones nec ex. Cu elitr tantas instructior sit,
                        eu eum alia graece neglegentur.</p>

                </ui-accordion-panel>

            </ui-accordion>

            <h2>Popover</h2>

            <button id="popover">Show Popover</button>

            <ui-popover trigger="popover">
                <template slot="template">
                    <h3>Popover</h3>
                    <p>This is the content of the popover: ${ element.counter }</p>
                </template>
            </ui-popover>
        </div>

    </main>
    `;
