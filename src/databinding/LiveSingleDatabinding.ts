import { get } from '../fetch/fetch';
import { setConnectionState, setEntity, setFetching } from '../redux/actions';
import { Actions, Entity } from '../redux/types';
import { UpdateStreamState } from '../updateStream';
import { buildUri, IHeaders, IQueryParameters } from '../utils/buildUri';
import { AbstractLiveDatabinding } from './AbstractLiveDatabinding';

/**
 * Databinding for binding a collection a single Entity with realtime updates.
 */
export class LiveSingleDatabinding<T extends Entity> extends AbstractLiveDatabinding<T> {
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
		get(buildUri(this.path, this.queryParameters), this.headers).then((data: T) => {
			this.dispatch(setEntity<T>(this.stateProperty, data));
			this.dispatch(setFetching<T>(this.stateProperty, false));
			this.initUpdateStream();
			this.listenForHeartbeat();
		}).catch((error: Error) => {
			console.error(error);
		});
	}

	/**
	 * Fetches the data and stores it in the state. Existing data will be replaced.
	 * Reconnects to the update stream to get realtime updates.
	 */
	reload(): void {
		this.dispatch(setFetching<T>(this.stateProperty, true));
		get(buildUri(this.path, this.queryParameters), this.headers).then((data: T) => {
			this.dispatch(setEntity<T>(this.stateProperty, data));
			this.dispatch(setFetching<T>(this.stateProperty, false));
			this.updateStream.reconnect();
			this.listenForHeartbeat();
		}).catch((error: Error) => {
			console.error(error);
		});
	}

	private initUpdateStream() {
		this.createUpdateStream();
		this.addCommonEventListeners();

		this.updateStream.addEventListener('update', (event: MessageEvent) => {
			console.log('EventSource: New update event');

			const data: T = JSON.parse(event.data);
			this.dispatch(setEntity<T>(this.stateProperty, data));
		});
	}

}
