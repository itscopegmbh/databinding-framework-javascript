import { Observable, of, Subscription, throwError } from 'rxjs';
import { mergeMap, retryWhen, timeout } from 'rxjs/operators';
import { setConnectionState } from '../redux/actions';
import { Actions, Entity } from '../redux/types';
import {
	ErrorEvent,
	StateEvent,
	UpdateStream,
	UpdateStreamEvent
} from '../updateStream';
import { buildUri, IHeaders, IQueryParameters } from '../utils/buildUri';
import { AbstractDatabinding } from './AbstractDatabinding';

const MAX_HEARTBEATS_MISSING = 1;
const TIMEOUT = 16000;

export abstract class AbstractLiveDatabinding<T extends Entity> extends AbstractDatabinding<T> {
	protected updateStream: UpdateStream;
	protected heartbeatSubscriber: Subscription;
	protected heartbeatsMissing: number = MAX_HEARTBEATS_MISSING;

	protected constructor(path: string, headers: IHeaders, queryParameters: IQueryParameters, stateProperty: string, dispatch: (action: Actions<T>) => void) {
		super(path, headers, queryParameters, stateProperty, dispatch);
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

	protected createUpdateStream(): void {
		this.updateStream = new UpdateStream(buildUri(this.path, this.queryParameters, true), this.headers);
	}

	protected addCommonEventListeners(): void {
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

	protected listenForHeartbeat(): void {
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
