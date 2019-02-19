import { CustomElement, customElement, html } from '../../src';
import './accordion/accordion';
import './card';
import './checkbox';
import './toggle';

@customElement({
    selector: 'demo-app',
    shadow: false
})
export class App extends CustomElement {

    protected template () {

        return html`
            <header>
                <h1>Examples</h1>
            </header>

            <main>

                <div>
                    <h2>Checkbox</h2>
                    <ui-checkbox></ui-checkbox>

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
                </div>

                <div>
                    <h2>Accordion</h2>

                    <ui-accordion>

                        <ui-accordion-panel expanded>
                            <h3 slot="ui-accordion-panel-header">Panel One</h3>
                            <div slot="ui-accordion-panel-body">
                                <p>Lorem ipsum dolor sit amet, no prima qualisque euripidis est. Qualisque quaerendum at est.
                                    Laudem
                                    constituam
                                    ea usu, virtute ponderum posidonium no eos. Dolores consetetur ex has. Nostro recusabo an est,
                                    wisi summo
                                    necessitatibus cum ne.</p>
                                <p>At usu epicurei assentior, putent dissentiet repudiandae ea quo. Pro ne debitis placerat
                                    signiferumque,
                                    in
                                    sonet volumus interpretaris cum. Dolorum appetere ne quo. Dicta qualisque eos ea, eam at nulla
                                    tamquam.
                                </p>
                            </div>
                        </ui-accordion-panel>

                        <ui-accordion-panel>
                            <h3 slot="ui-accordion-panel-header">Panel Two</h3>
                            <div slot="ui-accordion-panel-body">
                                <p>In clita tollit minimum quo, an accusata volutpat euripidis vim. Ferri quidam deleniti quo ea,
                                    duo animal
                                    accusamus eu, cibo erroribus et mea. Ex eam wisi admodum praesent, has cu oblique ceteros
                                    eleifend. Ex mel
                                    platonem assentior persequeris, vix cibo libris ut. Ad timeam accumsan est, et autem omnes
                                    civibus mel.
                                    Mel eu
                                    ubique equidem molestiae, choro docendi moderatius ei nam.</p>
                                <p>Qui suas solet ceteros cu, pertinax vulputate deterruisset eos ne. Ne ius vide nullam, alienum
                                    ancillae
                                    reformidans cum ad. Ea meliore sapientem interpretaris eam. Commune delicata repudiandae in
                                    eos, placerat
                                    incorrupte definitiones nec ex. Cu elitr tantas instructior sit, eu eum alia graece
                                    neglegentur.</p>
                            </div>
                        </ui-accordion-panel>

                    </ui-accordion>
                </div>

            </main>
        `;
    }
}
