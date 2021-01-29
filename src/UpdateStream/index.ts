import {
	EventSourceEvent,
	EventSourceInitDict, EventSourceState,
	RNEventSource
} from 'rn-eventsource-reborn';

export {EventSourceEvent as UpdateStreamEvent} from 'rn-eventsource-reborn';
export {EventSourceState as UpdateStreamState} from 'rn-eventsource-reborn';

interface EventHandler {
	(event: Event): void
}

export interface ErrorEvent extends Event {
	type: EventSourceEvent.ERROR,
	data: string,
}

export interface StateEvent extends Event {
	type: EventSourceEvent.STATE,
	data: EventSourceState,
}

export class UpdateStream {
	private eventSource: RNEventSource;

	constructor(path: string, config: EventSourceInitDict) {
		this.eventSource = new RNEventSource(path, config);
	}

	close(): void {
		this.eventSource.close();
	}

	reconnect(): void {
		this.eventSource.reconnect();
	}

	getState(): EventSourceState {
		return this.eventSource.readyState;
	}

	addEventListener(eventType: string | EventSourceEvent, callback: EventHandler): void {
		this.eventSource.addEventListener(eventType, callback, false);
	}
}
