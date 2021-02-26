import { get } from '../fetch/fetch';
import { insertEntities } from '../redux/actions';
import { Actions, Entity } from '../redux/types';
import {
	buildUri,
	convertToLazyLoadingQueryParam,
	IHeaders,
	ILazyLoadingQueryParameters,
	IQueryParameters
} from '../utils/buildUri';
import { CollectionDatabinding } from './CollectionDatabinding';

/**
 * Databinding for binding a collection of an Entity with Lazy loading.
 */
export class LazyLoadingCollectionDatabinding<T extends Entity> extends CollectionDatabinding<T> {

	/**
	 *
	 * @param path
	 * @param headers
	 * @param queryParameters
	 * @param stateProperty Use nameof<T>(property) to typechecking property name.
	 * @param dispatch
	 */
	constructor(path: string, headers: IHeaders, queryParameters: IQueryParameters, stateProperty: string, dispatch: (action: Actions<T>) => void) {
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
			this.dispatch(insertEntities<T>(this.stateProperty, data));
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
