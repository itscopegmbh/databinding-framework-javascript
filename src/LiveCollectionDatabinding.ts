import { encode } from 'base-64';
import { Observable, of, Subscription, throwError } from 'rxjs';
import { mergeMap, retryWhen, timeout } from 'rxjs/operators';
import { get } from './fetch/fetch';
import {
	deleteEntity,
	insertEntity,
	setEntities,
	updateEntity
} from './redux/actions';
import {
	ErrorEvent,
	StateEvent,
	UpdateStream,
	UpdateStreamEvent,
	UpdateStreamState
} from './UpdateStream';

const MAX_HEARTBEATS_MISSING = 1;
const TIMEOUT = 16000;

export class LiveCollectionDatabinding<T> {
	private readonly path: string;
	private readonly updatePath: string;
	private readonly userId: string;
	private readonly apiToken: string;
	private readonly dispatch: (action) => void;
	private readonly stateProperty: string;
	private readonly updateConnectionStateCallback: (state: UpdateStreamState) => void;
	private updateStream: UpdateStream;
	private heartbeatSubscriber: Subscription;
	private retries: number = MAX_HEARTBEATS_MISSING;

	constructor(path: string, updatePath: string, userId: string,
				apiToken: string, dispatch: (action) => void,
				stateProperty: string,
				updateConnectionStateCallback: (state: UpdateStreamState) => void) {
		this.path = path;
		this.updatePath = updatePath;
		this.userId = userId;
		this.apiToken = apiToken;
		this.dispatch = dispatch;
		this.stateProperty = stateProperty;
		this.updateConnectionStateCallback = updateConnectionStateCallback;
	}

	getData(): void {
		this.getStaticData().then((data: T[]) => {
			this.dispatch(setEntities<T>(this.stateProperty, data));
		}).then(() => {
			this.initUpdateStream();
			this.listenForHeartBeat();
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
		this.getStaticData().then((data: T[]) => {
			this.dispatch(setEntities<T>(this.stateProperty, data));

		}).then(() => {
			// reconnect update stream
			this.updateStream.reconnect();
			this.listenForHeartBeat();

		}).catch((error: Error) => {
			console.log(error);
		});
	}

	getConnectionState(): UpdateStreamState {
		return this.updateStream.getState();
	}

	private getStaticData(): Promise<T[]> {
		return get(this.path, {
			headers: { Authorization: 'Basic ' + encode(this.userId + ':' + this.apiToken) }
		});
	}

	private initUpdateStream() {
		this.updateStream = new UpdateStream(this.updatePath,
			{ headers: { Authorization: 'Basic ' + encode(this.userId + ':' + this.apiToken) } });

		this.updateStream.addEventListener('update', (event: MessageEvent) => {
			console.log('EventSource: New update event');

			const data: T = JSON.parse(event.data);
			this.dispatch(updateEntity<T>(this.stateProperty, data));

		});

		this.updateStream.addEventListener('insert', (event: MessageEvent) => {
			console.log('EventSource: New insert event');

			const data: T = JSON.parse(event.data);
			this.dispatch(insertEntity<T>(this.stateProperty, data));

		});

		this.updateStream.addEventListener('delete', (event: MessageEvent) => {
			console.log('EventSource: New delete event');

			const data: string = JSON.parse(event.data);
			this.dispatch(deleteEntity<T>(this.stateProperty, data));
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
