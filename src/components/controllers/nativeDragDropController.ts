import {ReactiveController, ReactiveControllerHost} from 'lit';
import * as uuid from 'uuid';

export interface DragDropHost extends ReactiveControllerHost, HTMLElement {
    id: string;
    name?: string;
}

const DataDesignElementDraggingAttribute = 'data-design-element-dragging';

export class NativeDragDropController implements ReactiveController {
    private readonly _hostElement: DragDropHost;
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
        this._hostElement.removeAttribute(DataDesignElementDraggingAttribute);
    };

    /**
     * This fires for all hosts using this controller, this may include child elements of the initiating host (nested elements).
     * @param e
     */
    private _onDragOver = (e: DragEvent) => {
        const elementRaisingDragoverEvent = e.target as HTMLElement;
        const draggedElement = this._getDraggedElement()

        // We need to ignore some cases:

        // ❌ If we're dragging over itself, we don't want to enter 'isDragOver' because we can't drop into itself.
        if (draggedElement === elementRaisingDragoverEvent) {
            console.log(`case 1 - ${this._hostElement.name }`);
            e.stopPropagation(); // stop parents reacting
            return
        }

        // ❌ When dragging over a child, we don't want to enter 'isDragOver' because ultimately we can't drop a parent element into a child.
        if (draggedElement.contains(this._hostElement)) {
            console.log(`case 2 - ${this._hostElement.name }`);
            e.stopPropagation(); // stop parents reacting
            return
        }

        // Call event.preventDefault(), which enables this to receive drop events.
        // https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/dragover_event
        e.preventDefault();
        // Stop parent nodes also handling this, don't want multiple elements in 'drag over' state.
        e.stopPropagation();
        this._isDragOver = true;
        this._onDragOverMoveDropPlaceholder(e)
        this._hostElement.requestUpdate();
        console.log(`dragover - ${this._hostElement.name || 'unnamed'}`);
    };


    private _onDragOverMoveDropPlaceholder(event: DragEvent) {
        const draggedElement = this._getDraggedElement();
        const hostsFirstChild = this._hostElement.children[1];
        const existingPlaceholder = this._hostElement.querySelector(".placeholder");
        if (existingPlaceholder) {
            const placeholderRect = existingPlaceholder.getBoundingClientRect();
            let stillWithinPlaceholderBounds = placeholderRect.top <= event.clientY && placeholderRect.bottom >= event.clientY;
            if (stillWithinPlaceholderBounds) {
                return;
            }
        }
        for (const element of hostsFirstChild.children) {
            if (element.getBoundingClientRect().bottom >= event.clientY) {
                if (element === existingPlaceholder){
                    return;
                }
                existingPlaceholder?.remove();
                if (element === draggedElement || element.previousElementSibling === draggedElement){
                    // I don't think is possible in my case as prior conditions excluded dragging over itself or a child.
                    debugger
                    return;
                }
                hostsFirstChild.insertBefore(
                    existingPlaceholder ?? this._makePlaceholder(draggedElement),
                    element,
                );
                return;
            }
        }
        existingPlaceholder?.remove();
        if (hostsFirstChild.lastElementChild === draggedElement) {
            return;
        }
        hostsFirstChild.append(existingPlaceholder ?? this._makePlaceholder(draggedElement));
    }

    private _makePlaceholder(draggedTask) {
        const placeholder = document.createElement("li");
        placeholder.classList.add("placeholder");
        placeholder.style.height = `${draggedTask.offsetHeight}px`;
        return placeholder;
    }

    private _onDragLeave = (e: DragEvent) => {
        const target = e.target as HTMLElement;
        const relatedTarget = e.relatedTarget as HTMLElement;

        this._tryEndDragState();

        // // Only set isDragOver to false if we're leaving the host element entirely
        // // (not just moving between child elements)
        // if (target === element) { // } && (!relatedTarget || !element.contains(relatedTarget))) {
        //     this._isDragOver = false;
        //     const placeholder = element.querySelector(".placeholder");
        //     placeholder?.remove();
        //     this._hostElement.requestUpdate();
        // }
    };

    private _onDrop = (e: DragEvent) => {
        e.preventDefault();

        const droppedOnElement = e.target as HTMLElement;
        let dropIsOnHostOrChild = this._hostElement === droppedOnElement || this._hostElement.contains(droppedOnElement);

        console.log(`DROPPED BEFORE - ${this._hostElement.name || 'unnamed'}`);

        if (dropIsOnHostOrChild) {

            e.stopPropagation()

            console.log(`DROPPED - ${this._hostElement.name || 'unnamed'}`);

            const draggedElement = this._getDraggedElement(e);

            // Check if the drop target is the dragged element itself or a descendant
            if (draggedElement === this._hostElement || draggedElement.contains(this._hostElement)) {
                console.warn('Cannot drop a parent into its own child');
                return;
            }
            draggedElement.remove();
            this._hostElement.appendChild(draggedElement);
        }
        this._tryEndDragState();
    };

    private _tryEndDragState() {
        if (this._isDragOver) {
            this._isDragOver = false;
            const placeholder = this._hostElement.querySelector(".placeholder");
            placeholder?.remove();
            this._hostElement.requestUpdate();
        }
    }

    private _getDraggedElement(): HTMLElement;
    private _getDraggedElement(e: DragEvent) : HTMLElement;
    private _getDraggedElement(...args: DragEvent[]): HTMLElement {
        if (args.length > 0) {
            const dragEvent = args[0];
            if (dragEvent.type !== 'drop') {
                throw new Error('This method is only supported during drop events');
            }
            // You can only read from the data transfer store during dragStart and drop events:
            // https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API/Drag_data_store#protected_mode
            const draggedItemId = dragEvent.dataTransfer.getData('text/plain');
            return document.getElementById(draggedItemId);
        }

        // Get the dragged element using a query, the e.dataTransfer.getData('text/plain') is 'protected', thus empty, when handing the dragover event.
        // https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API/Drag_data_store#protected_mode
        return document.querySelector(`[${DataDesignElementDraggingAttribute}="true"]`);
    }
}