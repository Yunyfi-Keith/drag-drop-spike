import {ReactiveController, ReactiveControllerHost} from 'lit';
import * as uuid from 'uuid';

export interface DragDropHost extends ReactiveControllerHost, HTMLElement {
    id: string;
    name?: string;
}

const DataDesignElementDraggingAttribute = 'data-design-element-dragging';

export class NativeDragDropController implements ReactiveController {
    private _hostElement: DragDropHost;
    private _isDragOver = false;

    constructor(host: DragDropHost) {
        this._hostElement = host;
        host.addController(this);
    }

    get isDragOver(): boolean {
        return this._isDragOver;
    }

    hostConnected() {
        // Generate UUID if not already set
        // TODO this is a smell
        if (!this._hostElement.id) {
            this._hostElement.id = uuid.v4();
        }

        this._hostElement.setAttribute('draggable', 'true');

        // Add event listeners
        this._hostElement.addEventListener('dragstart', this._onDragStart, {passive: false});
        this._hostElement.addEventListener('drag', this._onDrag);
        this._hostElement.addEventListener('dragend', this._onDragEnd);
        this._hostElement.addEventListener('dragover', this._onDragOver);
        this._hostElement.addEventListener('dragleave', this._onDragLeave);
        this._hostElement.addEventListener('drop', this._onDrop);
    }

    hostDisconnected() {
        const element = this._hostElement as unknown as HTMLElement;

        // Remove event listeners
        element.removeEventListener('dragstart', this._onDragStart);
        element.removeEventListener('drag', this._onDrag);
        element.removeEventListener('dragend', this._onDragEnd);
        element.removeEventListener('dragover', this._onDragOver);
        element.removeEventListener('dragleave', this._onDragLeave);
        element.removeEventListener('drop', this._onDrop);
    }

    private _onDragStart = (evt: DragEvent) => {
        // This fires for all hosts using this controller.
        // ✅ Only kick off the logic for the instance that is being dragged
        if (this._hostElement === evt.target) {
            // Set a data attribute on the host so we can find the things being dragged during 'dropover' event handling.
            this._hostElement.setAttribute(DataDesignElementDraggingAttribute, 'true');
            evt.dataTransfer.effectAllowed = 'move';
            evt.dataTransfer.setData('text/plain', this._hostElement.id);
            console.log(evt.type, `${(evt.target as HTMLElement).localName}`, evt);
        }
    };

    private _onDrag = (evt: DragEvent) => {
        console.log(evt.type, `${(evt.target as HTMLElement).localName}`, evt);
    };

    private _onDragEnd = (evt: DragEvent) => {
        // Always fires, even for unsuccessful drops
        this._hostElement.removeAttribute('data-dragging');
    };

    private _onDragOver = (e: DragEvent) => {
        // Call event.preventDefault(), which enables this to receive drop events.
        // https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/dragover_event
        e.preventDefault(); // Required to allow drop

        // This fires for all hosts using this controller, this may include child elements of the initiating host (nested elements).

        // Get the dragged element using a query, the e.dataTransfer.getData('text/plain') is 'protected', thus empty, when handing the dragover event.
        // https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API/Drag_data_store#protected_mode
        const draggedElement = document.querySelector(`[${DataDesignElementDraggingAttribute}="true"]`);

        // We need to ignore some cases:

        // ✅ When dragging over a child, we don't want to enter 'isDragOver' because ultimately we can't drop a parent element into a child.
        if (draggedElement.contains(this._hostElement)) {
          //  e.stopPropagation();
            return
        }

        // These nested elements may or may
        // We need to process in both cases, so we can transition from parent to child during drag.
        // For example, as we transition from parent to child, we don't want the original parent to revert its drag status,
        // we want to carry on the drag while over the children.
        //
        // That said, when this callback starts firing for a child, we need to stopPropagation so both the child and the parent don't handle it.
        const elementRaisingDragoverEvent = e.target as HTMLElement;
        if (this._hostElement === elementRaisingDragoverEvent) { // } || this._hostElement.contains(elementRaisingEvent)) {
            e.stopPropagation();
            this._isDragOver = true;
            this.movePlaceholder(e)
            this._hostElement.requestUpdate();
            console.log(`dragover - ${this._hostElement.name || 'unnamed'}`);
        }
    };

    private _onDragLeave = (e: DragEvent) => {
        const element = this._hostElement as unknown as HTMLElement;
        const target = e.target as HTMLElement;
        const relatedTarget = e.relatedTarget as HTMLElement;

        // Only set isDragOver to false if we're leaving the host element entirely
        // (not just moving between child elements)
        if (target === element) { // } && (!relatedTarget || !element.contains(relatedTarget))) {
            this._isDragOver = false;
            const placeholder = element.querySelector(".placeholder");
            placeholder?.remove();
            this._hostElement.requestUpdate();
        }
    };

    private _onDrop = (e: DragEvent) => {
        e.preventDefault();

        const element = this._hostElement as unknown as HTMLElement;
        const target = e.target as HTMLElement;
        let dropIsOnHostOrChild = element === target || element.contains(target);

        console.log(`DROPPED BEFORE - ${this._hostElement.name || 'unnamed'}`);





        if (dropIsOnHostOrChild) {

            e.stopPropagation()

            this._isDragOver = false;
            this._hostElement.requestUpdate();
            console.log(`DROPPED - ${this._hostElement.name || 'unnamed'}`);


            const draggedElement = this._getDraggedElement(e);

            if (draggedElement) {
                // Check if the drop target is the dragged element itself or a descendant
                if (draggedElement === element || draggedElement.contains(element)) {
                    console.warn('Cannot drop a parent into its own child');
                    return;
                }
                draggedElement.remove();
                element.appendChild(draggedElement);
                const placeholder = element.querySelector(".placeholder");
                placeholder?.remove();
            }
        }
    };

    private _getDraggedElement(e: DragEvent) {
        // You can only read from the data transfer store during dragStart and drop events:
        // https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API/Drag_data_store#protected_mode
        const draggedItemId = e.dataTransfer.getData('text/plain');
        return document.getElementById(draggedItemId);
    }

    private makePlaceholder(draggedTask) {
        const placeholder = document.createElement("li");
        placeholder.classList.add("placeholder");
        placeholder.style.height = `${draggedTask.offsetHeight}px`;
        return placeholder;
    }
    private movePlaceholder(event) {

        return;


        const column = event.currentTarget;
        const draggedTask = document.getElementById("dragged-task");
        const tasks = column.children[1];
        const existingPlaceholder = column.querySelector(".placeholder");
        if (existingPlaceholder) {
            const placeholderRect = existingPlaceholder.getBoundingClientRect();
            if (
                placeholderRect.top <= event.clientY &&
                placeholderRect.bottom >= event.clientY
            ) {
                return;
            }
        }
        for (const task of tasks.children) {
            if (task.getBoundingClientRect().bottom >= event.clientY) {
                if (task === existingPlaceholder) return;
                existingPlaceholder?.remove();
                if (task === draggedTask || task.previousElementSibling === draggedTask)
                    return;
                tasks.insertBefore(
                    existingPlaceholder ?? this.makePlaceholder(draggedTask),
                    task,
                );
                return;
            }
        }
        existingPlaceholder?.remove();
        if (tasks.lastElementChild === draggedTask) return;
        tasks.append(existingPlaceholder ?? this.makePlaceholder(draggedTask));
    }
}