import {ContainerRow} from './container-row';
import {CountDisplay} from './count-display';
import { InputText } from './input-text';
import {DesignWrapper} from './design-wrapper';
import {SimpleGreeter} from './simple-greeter';

declare global {
    interface HTMLElementTagNameMap {
        'container-row': ContainerRow;
        'count-display': CountDisplay;
        'design-wrapper': DesignWrapper;
        'input-text': InputText;
        'simple-greeter': SimpleGreeter;
    }
}

export { };