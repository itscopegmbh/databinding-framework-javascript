import { get } from '../fetch/fetch';
import { setEntity, setFetching } from '../redux/actions';
import { Actions, Entity } from '../redux/types';
import { buildUri, IHeaders, IQueryParameters } from '../utils/buildUri';
import { AbstractDatabinding } from './AbstractDatabinding';

/**
 * Databinding for binding a single Entity.
 */
export class SingleDatabinding<T extends Entity> extends AbstractDatabinding<T> {
	constructor(path: string, headers: IHeaders, queryParameters: IQueryParameters, stateProperty: string, dispatch: (action: Actions<T>) => void) {
		super(path, headers, queryParameters, stateProperty, dispatch);
	}

	/**
	 * Fetches the data and stores it in the state. Existing data will be replaced.
	 */
	getData(): void {
		this.dispatch(setFetching<T>(this.stateProperty, true));
		get(buildUri(this.path, this.queryParameters), this.headers).then((data: T) => {
			this.dispatch(setEntity<T>(this.stateProperty, data));
			this.dispatch(setFetching<T>(this.stateProperty, false));
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
