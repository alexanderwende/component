import { Behavior } from '../behavior';
import { TemplateConfig } from './template-config';
import { render } from 'lit-html';

export class TemplateController extends Behavior {

    constructor (protected config: TemplateConfig) {

        super();
    }

    attach (element: HTMLElement): boolean {

        if (!super.attach(element)) return false;

        if (this.config.template) {

            const context = this.config.context ?? this.element!;

            this.listen(context, 'update', () => this.update());
        }

        return true;
    }

    update () {

        if (!this.hasAttached) return;

        if (this.config.template) {

            const template = this.config.template;
            const context = this.config.context ?? this.element!;

            render(template(context), this.element!, { eventContext: context });
        }
    }
}
