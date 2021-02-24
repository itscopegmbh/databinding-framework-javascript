import { encode } from 'base-64';
import { Observable, of, Subscription, throwError } from 'rxjs';
import { mergeMap, retryWhen, timeout } from 'rxjs/operators';
import { get } from '../fetch/fetch';
import {
	deleteEntity,
	insertEntity, setConnectionState,
	setEntities, setFetching,
	updateEntity
} from '../redux/actions';
import { Entity } from '../redux/types';
import {
	ErrorEvent,
	StateEvent,
	UpdateStream,
	UpdateStreamEvent,
	UpdateStreamState
} from '../updateStream';
import { buildPath, IQueryParameters } from '../utils/buildPath';
import { AbstractDatabinding } from './AbstractDatabinding';

const MAX_HEARTBEATS_MISSING = 1;
const TIMEOUT = 16000;

export class LiveCollectionDatabinding<T extends Entity> extends AbstractDatabinding {
	private readonly queryParameters: IQueryParameters;
	private updateStream: UpdateStream;
	private heartbeatSubscriber: Subscription;
	private retries: number = MAX_HEARTBEATS_MISSING;

	constructor(path: string, userId: string, apiToken: string,
				dispatch: (action) => void, stateProperty: string,
				queryParameters: IQueryParameters) {
		super(path, userId, apiToken, dispatch, stateProperty);
		this.queryParameters = queryParameters;
	}

	getData(): void {
		this.dispatch(setFetching<T>(this.stateProperty, true));
		this.dispatch(setConnectionState<T>(this.stateProperty, UpdateStreamState.CLOSED));
		get(buildPath(this.path, this.queryParameters), {
			headers: { Authorization: 'Basic ' + encode(this.userId + ':' + this.apiToken) }
		}).then((data: T[]) => {
			this.dispatch(setEntities<T>(this.stateProperty, data));
			this.dispatch(setFetching<T>(this.stateProperty, false));
			this.initUpdateStream();
			this.listenForHeartBeat();
		}).catch((error: Error) => {
			console.error(error);
		});
	}

	close(): void {
		if (this.updateStream) {
			this.updateStream.close();
			this.heartbeatSubscriber.unsubscribe();
		}
	}

	reload(): void {
		this.dispatch(setFetching<T>(this.stateProperty, true));
		get(buildPath(this.path, this.queryParameters), {
			headers: { Authorization: 'Basic ' + encode(this.userId + ':' + this.apiToken) }
		}).then((data: T[]) => {
			this.dispatch(setEntities<T>(this.stateProperty, data));
			this.dispatch(setFetching<T>(this.stateProperty, false));
			this.updateStream.reconnect();
			this.listenForHeartBeat();
		}).catch((error: Error) => {
			console.error(error);
		});
	}

	private initUpdateStream() {
		this.updateStream = new UpdateStream(buildPath(this.path, this.queryParameters, true),
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

			const data: { serial: string } = JSON.parse(event.data);
			this.dispatch(deleteEntity<T>(this.stateProperty, data));
		});

		this.updateStream.addEventListener(UpdateStreamEvent.STATE, (event: StateEvent) => {
			console.log('EventSource: State changed to ' + event.data);

			this.dispatch(setConnectionState<T>(this.stateProperty, this.updateStream.getState()));
		});

		this.updateStream.addEventListener(UpdateStreamEvent.OPEN, () => {
			console.log('EventSource: Connection opened');
		});

		this.updateStream.addEventListener(UpdateStreamEvent.ERROR, (event: ErrorEvent) => {
			console.error('EventSource: Error: ' + event.data);
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
					console.error('EventSource: Server is down (' + error + ')');
					this.updateStream.close();
				}
			});
	}
}
