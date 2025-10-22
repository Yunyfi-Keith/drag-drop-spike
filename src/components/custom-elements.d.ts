import {ContainerPage} from './container-page';
import {CountDisplay} from './count-display';
import { InputText } from './input-text';
import {DesignWrapper} from './design-wrapper';
import {SimpleGreeter} from './simple-greeter';
import {ContextBox} from './content-box';
import {ContainerDiv} from './container-div';

declare global {
    interface HTMLElementTagNameMap {
        'container-div': ContainerDiv;
        'container-page': ContainerPage;
        'count-display': CountDisplay;
        'design-wrapper': DesignWrapper;
        'input-text': InputText;
        'simple-greeter': SimpleGreeter;
        'content-box': ContextBox;
    }
}

export { };