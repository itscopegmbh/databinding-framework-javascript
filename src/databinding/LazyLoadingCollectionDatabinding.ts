import { get } from '../fetch/fetch';
import { insertEntities } from '../redux/actions';
import { Actions, DatabindingState, Entity } from '../redux/types';
import {
	buildUri,
	convertToLazyLoadingQueryParam,
	IHeaders,
	ILazyLoadingQueryParameters,
	IQueryParameters
} from '../utils/buildUri';
import { nameof } from '../utils/nameof';
import { CollectionDatabinding } from './CollectionDatabinding';

/**
 * Databinding for binding a collection of an Entity with Lazy loading.
 */
export class LazyLoadingCollectionDatabinding<T extends Entity, S extends DatabindingState> extends CollectionDatabinding<T, S> {
	constructor(path: string, headers: IHeaders, queryParameters: IQueryParameters, stateProperty: nameof<S>, dispatch: (action: Actions<T, S>) => void) {
		const lazyLoadingQueryParam = convertToLazyLoadingQueryParam(queryParameters);
		super(path, headers, lazyLoadingQueryParam, stateProperty, dispatch);
	}

	/**
	 * Fetches the data of the next page and stores it in the state.
	 * The data will be append to the existing data.
	 */
	getNextPage(): void {
		(this.queryParameters as ILazyLoadingQueryParameters).page++;
		get(buildUri(this.path, this.queryParameters), this.headers).then((data: T[]) => {
			this.dispatch(insertEntities<T, S>(this.stateProperty, data));
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
		this.queryParameters = convertToLazyLoadingQueryParam(queryParameters);
	}
}
