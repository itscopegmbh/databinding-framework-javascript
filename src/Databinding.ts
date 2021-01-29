import { encode } from 'base-64';
import { Observable, of, Subscription, throwError } from 'rxjs';
import { mergeMap, retryWhen, timeout } from 'rxjs/operators';
import { get } from './fetch/fetch';
import {
	ErrorEvent,
	StateEvent,
	UpdateStream,
	UpdateStreamEvent,
	UpdateStreamState
} from './UpdateStream';

const MAX_HEARTBEATS_MISSING = 1;
const TIMEOUT = 16000;

export class Databinding<T> {
	private readonly path: string;
	private readonly updatePath: string;
	private readonly realtimeUpdates: boolean;
	private readonly userId: string;
	private readonly apiToken: string;
	private readonly updateStateCallback: (t: T) => void;
	private readonly updateConnectionStateCallback: (state: UpdateStreamState) => void;
	private updateStream: UpdateStream;
	private heartbeatSubscriber: Subscription;
	private retries: number;

	constructor(path: string, updatePath: string, realtimeUpdates: boolean,
				userId: string, apiToken: string, updateStateCallback: (T) => void,
				updateConnectionStateCallback: (EventSourceState) => void) {
		this.path = path;
		this.updatePath = updatePath;
		this.realtimeUpdates = realtimeUpdates;
		this.userId = userId;
		this.apiToken = apiToken;
		this.updateStateCallback = updateStateCallback;
		this.updateConnectionStateCallback = updateConnectionStateCallback;
		this.retries = MAX_HEARTBEATS_MISSING;
	}

	getData(): void {
		this.getStaticData().then((data: T) => {
			this.updateStateCallback(data);
		}).then(() => {
			if (this.realtimeUpdates) {
				this.initUpdateStream();
				this.listenForHeartBeat();
			}
		}).catch((error: Error) => {
			console.log(error);
		});
	}

	close(): void {
		if (this.updateStream) {
			this.updateStream.close();
			this.heartbeatSubscriber.unsubscribe();
		}
	}

	reload(): void {
		// fetch actual data
		this.getStaticData().then((data: T) => {
			this.updateStateCallback(data);
		}).then(() => {
			// reconnect update stream when using realtime updates
			if (this.realtimeUpdates) {
				this.updateStream.reconnect();
				this.listenForHeartBeat();
			}
		}).catch((error: Error) => {
			console.log(error);
		});
	}

	getConnectionState(): UpdateStreamState {
		return this.updateStream.getState();
	}

	private getStaticData(): Promise<T> {
		return get(this.path, {
			headers: { Authorization: 'Basic ' + encode(this.userId + ':' + this.apiToken) }
		});
	}

	private initUpdateStream() {
		this.updateStream = new UpdateStream(this.updatePath,
			{ headers: { Authorization: 'Basic ' + encode(this.userId + ':' + this.apiToken) } });

		this.updateStream.addEventListener('update', (event: MessageEvent) => {
			console.log('EventSource: New update event');

			const data: T = JSON.parse(event.data).newModel;
			this.updateStateCallback(data);
		});

		this.updateStream.addEventListener(UpdateStreamEvent.STATE, (event: StateEvent) => {
			console.log('EventSource: State changed to ' + event.data);

			this.updateConnectionStateCallback(this.updateStream.getState());
		});

		this.updateStream.addEventListener(UpdateStreamEvent.OPEN, () => {
			console.log('EventSource: Connection opened');
		});

		this.updateStream.addEventListener(UpdateStreamEvent.ERROR, (event: ErrorEvent) => {
			console.log('EventSource: Error: ' + event.data);
		});
	}

	private heartbeatRetry() {
		return retryWhen(errors => errors.pipe(mergeMap(error => this.retries-- > 0 ? of(error) : throwError('Maximum of retries reached!'))));
	}

	private listenForHeartBeat(): void {
		this.heartbeatSubscriber = new Observable(observer => {
			this.updateStream.addEventListener('heartbeat', () => {
				observer.next();
			});
		}).pipe(timeout(TIMEOUT), this.heartbeatRetry())
			.subscribe({
				next: () => {
					console.log('EventSource: Heartbeat received');
					this.retries = MAX_HEARTBEATS_MISSING;
				},
				error: (error) => {
					console.log('EventSource: Server is down (' + error + ')');
					this.updateStream.close();
				}
			});
	}


}
