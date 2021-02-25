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

export class LazyLoadingCollectionDatabinding<T extends Entity> extends CollectionDatabinding<T> {
	constructor(path: string, headers: IHeaders, queryParameters: IQueryParameters, stateProperty: string, dispatch: (action: Actions<T>) => void) {
		const lazyLoadingQueryParam = convertToLazyLoadingQueryParam(queryParameters);
		super(path, headers, lazyLoadingQueryParam, stateProperty, dispatch);
	}

	getNextPage(): void {
		(this.queryParameters as ILazyLoadingQueryParameters).page++;
		get(buildUri(this.path, this.queryParameters), this.headers).then((data: T[]) => {
			this.dispatch(insertEntities<T>(this.stateProperty, data));
		}).catch((error: Error) => {
			console.error(error);
		});
	}

	setQueryParameters(queryParameters: IQueryParameters): void {
		this.queryParameters = convertToLazyLoadingQueryParam(queryParameters);
	}
}
