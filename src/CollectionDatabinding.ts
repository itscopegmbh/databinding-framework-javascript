import { encode } from 'base-64';
import { get } from './fetch/fetch';
import { CollectionActionTypes } from './redux/CollectionActionTypes';

export class CollectionDatabinding<T> {
	private readonly path: string;
	private readonly userId: string;
	private readonly apiToken: string;
	private readonly dispatch: (action) => void;
	private readonly actionTypes: CollectionActionTypes;

	constructor(path: string, userId: string, apiToken: string, dispatch: (action) => void, actionTypes: CollectionActionTypes) {
		this.path = path;
		this.userId = userId;
		this.apiToken = apiToken;
		this.dispatch = dispatch;
		this.actionTypes = actionTypes;
	}

	getData(): void {
		this.getStaticData().then((data: T[]) => {
			this.dispatch({ type: this.actionTypes.SET_ENTITIES, payload: data });
		}).catch((error: Error) => {
			console.log(error);
		});
	}

	private getStaticData(): Promise<T[]> {
		return get(this.path, {
			headers: { Authorization: 'Basic ' + encode(this.userId + ':' + this.apiToken) }
		});
	}
}
