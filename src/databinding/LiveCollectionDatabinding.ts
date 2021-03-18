import { get } from '../fetch/fetch';
import {
	deleteEntity,
	insertEntity,
	setConnectionState,
	setEntities,
	setFetching,
	updateEntity
} from '../redux/actions';
import { Actions, DatabindingState, Entity } from '../redux/types';
import { UpdateStreamState } from '../updateStream';
import { buildUri, IHeaders, IQueryParameters } from '../utils/buildUri';
import { nameof } from '../utils/nameof';
import { AbstractLiveDatabinding } from './AbstractLiveDatabinding';

/**
 * Databinding for binding a collection of an Entity with realtime updates.
 */
export class LiveCollectionDatabinding<T extends Entity, S extends DatabindingState> extends AbstractLiveDatabinding<T, S> {
	constructor(path: string, headers: IHeaders, queryParameters: IQueryParameters, stateProperty: nameof<S>, dispatch: (action: Actions<T, S>) => void) {
		super(path, headers, queryParameters, stateProperty, dispatch);
	}

	/**
	 * Fetches the data and stores it in the state. Existing data will be replaced.
	 * Opens an update stream to get realtime updates.
	 */
	getData(): void {
		this.dispatch(setFetching<T, S>(this.stateProperty, true));
		this.dispatch(setConnectionState<T, S>(this.stateProperty, UpdateStreamState.CLOSED));
		get(buildUri(this.path, this.queryParameters), this.headers).then((data: T[]) => {
			this.dispatch(setEntities<T, S>(this.stateProperty, data));
			this.dispatch(setFetching<T, S>(this.stateProperty, false));
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
		this.dispatch(setFetching<T, S>(this.stateProperty, true));
		get(buildUri(this.path, this.queryParameters), this.headers).then((data: T[]) => {
			this.dispatch(setEntities<T, S>(this.stateProperty, data));
			this.dispatch(setFetching<T, S>(this.stateProperty, false));
			this.updateStream.reconnect();
			this.listenForHeartbeat();
		}).catch((error: Error) => {
			console.error(error);
		});
	}

	private initUpdateStream(): void {
		this.createUpdateStream();
		this.addCommonEventListeners();

		this.updateStream.addEventListener('update', (event: MessageEvent) => {
			console.log('EventSource: New update event');

			const data: T = JSON.parse(event.data);
			this.dispatch(updateEntity<T, S>(this.stateProperty, data));
		});

		this.updateStream.addEventListener('insert', (event: MessageEvent) => {
			console.log('EventSource: New insert event');

			const data: T = JSON.parse(event.data);
			this.dispatch(insertEntity<T, S>(this.stateProperty, data));
		});

		this.updateStream.addEventListener('delete', (event: MessageEvent) => {
			console.log('EventSource: New delete event');

			const data: { serial: string } = JSON.parse(event.data);
			this.dispatch(deleteEntity<T, S>(this.stateProperty, data));
		});
	}
}
