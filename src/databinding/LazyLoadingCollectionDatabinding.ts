import { encode } from 'base-64';
import { get } from '../fetch/fetch';
import { insertEntities, setEntities } from '../redux/actions';
import { Entity } from '../redux/types';
import {
	buildPath,
	ILazyLoadingQueryParameters,
	IQueryParameters
} from '../utils/buildPath';
import { AbstractDatabinding } from './AbstractDatabinding';

export class LazyLoadingCollectionDatabinding<T extends Entity> extends AbstractDatabinding {
	private readonly queryParameters: ILazyLoadingQueryParameters;

	constructor(path: string, userId: string, apiToken: string,
				dispatch: (action) => void, stateProperty: string,
				queryParameters: IQueryParameters) {
		super(path, userId, apiToken, dispatch, stateProperty);
		this.queryParameters = {
			page: 1,
			...queryParameters
		};
	}

	getData(): void {
		get(buildPath(this.path, this.queryParameters), {
			headers: { Authorization: 'Basic ' + encode(this.userId + ':' + this.apiToken) }
		}).then((data: T[]) => {
			this.dispatch(setEntities<T>(this.stateProperty, data));
		}).catch((error: Error) => {
			console.error(error);
		});
	}

	getNextPage(): void {
		this.queryParameters.page++;
		get(buildPath(this.path, this.queryParameters), {
			headers: { Authorization: 'Basic ' + encode(this.userId + ':' + this.apiToken) }
		}).then((data: T[]) => {
			this.dispatch(insertEntities<T>(this.stateProperty, data));
		}).catch((error: Error) => {
			console.error(error);
		});
	}
}
