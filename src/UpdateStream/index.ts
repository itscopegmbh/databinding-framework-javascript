import {
	EventSourceEvent,
	EventSourceInitDict, EventSourceState,
	RNEventSource
} from 'rn-eventsource-reborn';

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

	addMessageEventHandler(callback: EventHandler): void {
		this.eventSource.addEventListener(EventSourceEvent.MESSAGE, callback, false);
	}

	addUpdateEventHandler(callback: EventHandler): void {
		this.eventSource.addEventListener('update', callback, false);
	}

	addHeartbeatEventHandler(callback: EventHandler): void {
		this.eventSource.addEventListener('heartbeat', callback, false);
	}

	addStateEventHandler(callback: EventHandler): void {
		this.eventSource.addEventListener(EventSourceEvent.STATE, callback, false);
	}

	addOpenEventHandler(callback: EventHandler): void {
		this.eventSource.addEventListener(EventSourceEvent.OPEN, callback, false);
	}

	addErrorEventHandler(callback: EventHandler): void {
		this.eventSource.addEventListener(EventSourceEvent.ERROR, callback, false);
	}
}
