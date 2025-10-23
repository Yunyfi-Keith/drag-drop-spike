
import {ReactiveController, ReactiveControllerHost} from 'lit';
import * as uuid from 'uuid';

export interface DragDropHost extends ReactiveControllerHost {
    id: string;
    name?: string;
}

export class NativeDragDropController implements ReactiveController {
    private host: DragDropHost;
    private _isDragOver = false;

    constructor(host: DragDropHost) {
        this.host = host;
        host.addController(this);
    }

    get isDragOver(): boolean {
        return this._isDragOver;
    }

    hostConnected() {
        // Generate UUID if not already set
        if (!this.host.id) {
            this.host.id = uuid.v4();
        }

        const element = this.host as unknown as HTMLElement;
        element.setAttribute('draggable', 'true');

        // Add event listeners
        element.addEventListener('dragstart', this.onDragStart, {passive: false});
        element.addEventListener('drag', this.onDrag);
        element.addEventListener('dragend', this.onDragEnd);
        element.addEventListener('dragover', this.onDragOver);
        element.addEventListener('dragleave', this.onDragLeave);
        element.addEventListener('drop', this.onDrop);
    }

    hostDisconnected() {
        const element = this.host as unknown as HTMLElement;

        // Remove event listeners
        element.removeEventListener('dragstart', this.onDragStart);
        element.removeEventListener('drag', this.onDrag);
        element.removeEventListener('dragend', this.onDragEnd);
        element.removeEventListener('dragover', this.onDragOver);
        element.removeEventListener('dragleave', this.onDragLeave);
        element.removeEventListener('drop', this.onDrop);
    }

    private onDragStart = (evt: DragEvent) => {
        const element = this.host as unknown as HTMLElement;
        if (evt.target === element) {
            evt.dataTransfer.effectAllowed = 'move';
            evt.dataTransfer.setData('text/plain', this.host.id);
            console.log(evt.type, `${(evt.target as HTMLElement).localName} (${(evt.target as HTMLElement).textContent})`, evt);
        }
    };

    private onDrag = (evt: DragEvent) => {
        console.log(evt.type, `${(evt.target as HTMLElement).localName} (${(evt.target as HTMLElement).textContent})`, evt);
    };

    private onDragEnd = (evt: DragEvent) => {
        // Always fires, even for unsuccessful drops
    };

    private onDragOver = (e: DragEvent) => {
        e.preventDefault(); // Required to allow drop

        const element = this.host as unknown as HTMLElement;
        if (e.target === element) {
            e.stopPropagation();
            this._isDragOver = true;
            this.host.requestUpdate();
            console.log(`dragover - ${this.host.name || 'unnamed'}`);
        }
    };

    private onDragLeave = (e: DragEvent) => {
        this._isDragOver = false;
        this.host.requestUpdate();
    };

    private onDrop = (e: DragEvent) => {
        e.preventDefault();

        const element = this.host as unknown as HTMLElement;
        if (e.target === element) {
            this._isDragOver = false;
            this.host.requestUpdate();
            console.log(`DROPPED - ${this.host.name || 'unnamed'}`);

            const draggedItemId = e.dataTransfer.getData('text/plain');
            const draggedTask = document.getElementById(draggedItemId);

            if (draggedTask) {
                draggedTask.remove();
                element.appendChild(draggedTask);
            }


            // // Get the slot element from shadow DOM
            // const slot = this.shadowRoot.querySelector('slot');
            // const assignedElements = slot.assignedElements();
            //
            // // If there's a container element, append to it, otherwise append directly
            // if (assignedElements.length > 0 && assignedElements[0].nodeType === Node.ELEMENT_NODE) {
            //     assignedElements[0].appendChild(draggedTask);
            // } else {
            //     this.appendChild(draggedTask);
            // }
        }
    };
}