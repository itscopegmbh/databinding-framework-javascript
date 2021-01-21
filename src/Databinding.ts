import { encode } from 'base-64';
import { EventSourceState } from 'rn-eventsource-reborn';
import { get } from './fetch/fetch';
import { StateEvent, UpdateStream } from './UpdateStream';

export class Databinding<T> {
	private readonly path: string;
	private readonly updatePath: string;
	private readonly realtimeUpdates: boolean;
	private readonly userId: string;
	private readonly apiToken: string;
	private readonly updateStateCallback: (T) => void;
	private updateStream: UpdateStream;
	private updateStreamState: EventSourceState;

	constructor(path: string, updatePath: string, realtimeUpdates: boolean, userId: string, apiToken: string, updateStateCallback: (T) => void) {
		this.path = path;
		this.updatePath = updatePath;
		this.realtimeUpdates = realtimeUpdates;
		this.userId = userId;
		this.apiToken = apiToken;
		this.updateStateCallback = updateStateCallback;
	}

	getData(): void {
		get(this.path, {
			headers: { Authorization: 'Basic ' + encode(this.userId + ':' + this.apiToken) }
		}).then((data: T) => {
			this.updateStateCallback(data);
		}).then(() => {
			if (this.realtimeUpdates) {
				this.initUpdateStream();
			}
		});
	}

	close(): void {
		if (this.updateStream) {
			this.updateStream.close();
		}
	}

	reconnect(): void {
		if (this.updateStream) {
			this.updateStream.reconnect();
		}
	}

	private initUpdateStream() {
		this.updateStream = new UpdateStream(this.updatePath, { headers: { Authorization: 'Basic ' + encode(this.userId + ':' + this.apiToken) } });
		this.updateStreamState = this.updateStream.getState();

		this.updateStream.addMessageEventHandler((event: MessageEvent) => {
			console.log(event);

			const data: T = JSON.parse(event.data).newModel;
			this.updateStateCallback(data);
		});

		this.updateStream.addStateEventHandler((event: StateEvent) => {
			console.log(event);

			this.updateStreamState = event.data;
		});

		this.updateStream.addOpenEventHandler((event: Event) => {
			console.log(event);
		});

		this.updateStream.addErrorEventHandler((event: ErrorEvent) => {
			console.log(event);

			switch (this.updateStreamState) {
				case EventSourceState.CONNECTING:
					console.log('Reconnecting...');
					break;
				case EventSourceState.CLOSED:
					console.log('Connection failed, will not reconnect');
					break;
			}
		});
	}
}
