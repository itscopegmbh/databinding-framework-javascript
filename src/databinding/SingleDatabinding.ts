import { get } from '../fetch/fetch';
import { setEntity, setFetching } from '../redux/actions';
import { Actions, DatabindingState, Entity } from '../redux/types';
import { buildUri, IHeaders, IQueryParameters } from '../utils/buildUri';
import { nameof } from '../utils/nameof';
import { AbstractDatabinding } from './AbstractDatabinding';

/**
 * Databinding for binding a single Entity.
 */
export class SingleDatabinding<T extends Entity, S extends DatabindingState> extends AbstractDatabinding<T, S> {
	constructor(path: string, headers: IHeaders, queryParameters: IQueryParameters, stateProperty: nameof<S>, dispatch: (action: Actions<T, S>) => void) {
		super(path, headers, queryParameters, stateProperty, dispatch);
	}

	/**
	 * Fetches the data and stores it in the state. Existing data will be replaced.
	 */
	getData(): void {
		this.dispatch(setFetching<T, S>(this.stateProperty, true));
		get(buildUri(this.path, this.queryParameters), this.headers).then((data: T) => {
			this.dispatch(setEntity<T, S>(this.stateProperty, data));
			this.dispatch(setFetching<T, S>(this.stateProperty, false));
		}).catch((error: Error) => {
			console.error(error);
		});
	}

	/**
	 * Set the query parameters. To fetch the data for the new query parameters
	 * call {@link getData()}.
	 * @param queryParameters
	 */
	setQueryParameters(queryParameters: IQueryParameters): void {
		this.queryParameters = queryParameters;
	}
}
