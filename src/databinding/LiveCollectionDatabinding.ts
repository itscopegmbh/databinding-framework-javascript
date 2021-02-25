import { Observable, of, Subscription, throwError } from 'rxjs';
import { mergeMap, retryWhen, timeout } from 'rxjs/operators';
import { get } from '../fetch/fetch';
import {
	deleteEntity,
	insertEntity,
	setConnectionState,
	setEntities,
	setFetching,
	updateEntity
} from '../redux/actions';
import { Actions, Entity } from '../redux/types';
import {
	ErrorEvent,
	StateEvent,
	UpdateStream,
	UpdateStreamEvent,
	UpdateStreamState
} from '../updateStream';
import { buildUri, IHeaders, IQueryParameters } from '../utils/buildUri';
import { AbstractDatabinding } from './AbstractDatabinding';

const MAX_HEARTBEATS_MISSING = 1;
const TIMEOUT = 16000;

/**
 * Databinding for binding a collection of an Entity with realtime updates.
 */
export class LiveCollectionDatabinding<T extends Entity> extends AbstractDatabinding<T> {
	private updateStream: UpdateStream;
	private heartbeatSubscriber: Subscription;
	private heartbeatsMissing: number = MAX_HEARTBEATS_MISSING;

	constructor(path: string, headers: IHeaders, queryParameters: IQueryParameters, stateProperty: string, dispatch: (action: Actions<T>) => void) {
		super(path, headers, queryParameters, stateProperty, dispatch);
	}

	/**
	 * Fetches the data and stores it in the state. Existing data will be replaced.
	 * Opens an update stream to get realtime updates.
	 */
	getData(): void {
		this.dispatch(setFetching<T>(this.stateProperty, true));
		this.dispatch(setConnectionState<T>(this.stateProperty, UpdateStreamState.CLOSED));
		get(buildUri(this.path, this.queryParameters), this.headers).then((data: T[]) => {
			this.dispatch(setEntities<T>(this.stateProperty, data));
			this.dispatch(setFetching<T>(this.stateProperty, false));
			this.initUpdateStream();
			this.listenForHeartbeat();
		}).catch((error: Error) => {
			console.error(error);
		});
	}

	/**
	 * Closes the update stream.
	 */
	close(): void {
		if (this.updateStream) {
			this.updateStream.close();
		}

		if (this.heartbeatSubscriber) {
			this.heartbeatSubscriber.unsubscribe();
		}
	}

	/**
	 * Fetches the data and stores it in the state. Existing data will be replaced.
	 * Reconnects to the update stream to get realtime updates.
	 */
	reload(): void {
		this.dispatch(setFetching<T>(this.stateProperty, true));
		get(buildUri(this.path, this.queryParameters), this.headers).then((data: T[]) => {
			this.dispatch(setEntities<T>(this.stateProperty, data));
			this.dispatch(setFetching<T>(this.stateProperty, false));
			this.updateStream.reconnect();
			this.listenForHeartbeat();
		}).catch((error: Error) => {
			console.error(error);
		});
	}

	private initUpdateStream() {
		this.updateStream = new UpdateStream(buildUri(this.path, this.queryParameters, true), this.headers);

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
		return retryWhen(errors => errors.pipe(mergeMap(error =>
			this.heartbeatsMissing-- > 0 ? of(error) : throwError('Maximum of '
				+ MAX_HEARTBEATS_MISSING + ' heartbeat(s) missed!'))));
	}

	private listenForHeartbeat(): void {
		this.heartbeatSubscriber = new Observable(observer => {
			this.updateStream.addEventListener('heartbeat', () => {
				observer.next();
			});
		}).pipe(timeout(TIMEOUT), this.heartbeatRetry())
			.subscribe({
				next: () => {
					console.log('EventSource: Heartbeat received');
					this.heartbeatsMissing = MAX_HEARTBEATS_MISSING;
				},
				error: (error) => {
					console.error('EventSource: Server is down (' + error + ')');
					this.updateStream.close();
				}
			});
	}
}
