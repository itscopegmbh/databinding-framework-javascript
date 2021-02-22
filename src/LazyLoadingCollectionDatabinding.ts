import { encode } from 'base-64';
import { get } from './fetch/fetch';
import { CollectionActionTypes } from './redux/CollectionActionTypes';
import { LazyLoadingActionTypes } from './redux/LazyLoadingActionTypes';

export class LazyLoadingCollectionDatabinding<T> {
	private readonly path: string;
	private readonly userId: string;
	private readonly apiToken: string;
	private readonly dispatch: (action) => void;
	private readonly actionTypes: CollectionActionTypes & LazyLoadingActionTypes;
	private actualPage = 1;

	constructor(path: string, userId: string, apiToken: string, dispatch: (action) => void, actionTypes: CollectionActionTypes & LazyLoadingActionTypes) {
		this.path = path;
		this.userId = userId;
		this.apiToken = apiToken;
		this.dispatch = dispatch;
		this.actionTypes = actionTypes;
	}

	getData(): void {
		this.getStaticData(this.path + '&page=' + this.actualPage).then((data: T[]) => {
			this.dispatch({
				type: this.actionTypes.SET_ENTITIES,
				payload: data
			});
		}).catch((error: Error) => {
			console.log(error);
		});
	}

	getNextPage(): void {
		this.actualPage++;
		this.getStaticData(this.path  + '&page=' + this.actualPage).then((data: T[]) => {
			this.dispatch({
				type: this.actionTypes.INSERT_ENTITIES,
				payload: data
			});
		}).catch((error: Error) => {
			console.log(error);
		});
	}

	private getStaticData(path: string): Promise<T[]> {
		return get(path, {
			headers: { Authorization: 'Basic ' + encode(this.userId + ':' + this.apiToken) }
		});
	}
}
