import {css, html, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import * as uuid from 'uuid';

@customElement('design-wrapper')
export class DesignWrapper extends LitElement {

    static styles =
        css`
            .design-wrapper {
                position: relative;

                padding: 10px;
                //background: #2c2c2c;
                border: 2px dashed transparent;
                transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
            }

            .design-wrapper:hover {
                border-color: #d3d3d3;
            }

            .design-wrapper.drag-over {
                background: #f0f0f0;
            }
            
            .design-wrapper::before {
                content: '';
                position: absolute;
                top: 0px;
                left: 0px;
                width: 16px;
                height: 16px;
                background-image: radial-gradient(circle, #999 1.5px, transparent 1.5px),
                radial-gradient(circle, #999 1.5px, transparent 1.5px),
                radial-gradient(circle, #999 1.5px, transparent 1.5px),
                radial-gradient(circle, #999 1.5px, transparent 1.5px),
                radial-gradient(circle, #999 1.5px, transparent 1.5px),
                radial-gradient(circle, #999 1.5px, transparent 1.5px);
                background-size: 6px 6px;
                background-position: 0 0, 6px 0, 0 6px, 6px 6px, 0 12px, 6px 12px;
                background-repeat: no-repeat;
                cursor: grab;
                opacity: 0.5;
            }

            .design-wrapper:hover::before {
                opacity: 1;
            }

            slot {

            }
        `;

    @property({attribute: true})
    accessor name: string = null;

    @property({type: Boolean})
    accessor isDragOver: boolean = false;

    connectedCallback() {
        super.connectedCallback();
        this.id = uuid.v4();
        this.setAttribute('draggable', 'true');
        this.addEventListener('dragstart', this.onDragStart, {passive: false});
        this.addEventListener('drag', this.onDrag);
        this.addEventListener('dragend', this.onDragEnd);
        this.addEventListener('dragover', this.onDragOver);
        this.addEventListener('dragleave', this.onDragLeave);
        this.addEventListener('drop', this.onDrop);
    }

    render() {
        return html`
            <div class="design-wrapper ${this.isDragOver ? 'drag-over' : ''}">
                <slot></slot>
            </div>
        `;
    }

    onDragStart(evt) {
        // evt.preventDefault()
        if (evt.target === this) {
            evt.dataTransfer.effectAllowed = 'move'
            evt.dataTransfer.setData('text/html', this.outerHTML)
           // evt.dataTransfer.setData('text/plain', evt.currentTarget.dataset.id);
            console.log(evt.type, `${evt.target.localName} (${evt.target.textContent})`, evt)
        }
    }

    // fires repeatedly while dragging
    onDrag(evt) {
        // evt.preventDefault()
        console.log(evt.type, `${evt.target.localName} (${evt.target.textContent})`, evt)
    }

    // always fires, even for unsuccessful drops
    onDragEnd(evt) {
        // console.log(evt.type, evt.target.localName, evt)
    }

    onDragOver(e) {
        e.preventDefault(); // Required to allow drop

        // e.target === this:
        // this stops the event bubbling and therefore all parent divs also firing their dragover event
        if (e.target === this) {
            e.stopPropagation();
            this.isDragOver = true;
            console.log(`dragover - ${this.name}`);
        }
    }

    onDragLeave(e) {
        this.isDragOver = false;
    }

    onDrop(e) {
        e.preventDefault();

        if (e.target === this) {
            this.isDragOver = false;
            console.log(`DROPPED - ${this.name}`);

            // document.querySelector(`[data-id="${e.dataTransfer.getData('text/plain')}"]`).remove();
            e.currentTarget.innerHTML = e.currentTarget.innerHTML + e.dataTransfer.getData('text/html');


            // const draggedTask = document.getElementById("dragged-task");
            // draggedTask.remove();
            // column.children[1].appendChild(draggedTask);
        }
    }
}


