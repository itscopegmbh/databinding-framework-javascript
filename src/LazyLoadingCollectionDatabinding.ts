import { encode } from 'base-64';
import { get } from './fetch/fetch';
import { insertEntities, setEntities } from './redux/actions';

export class LazyLoadingCollectionDatabinding<T> {
	private readonly path: string;
	private readonly userId: string;
	private readonly apiToken: string;
	private readonly dispatch: (action) => void;
	private readonly stateProperty: string;
	private actualPage = 1;

	constructor(path: string, userId: string, apiToken: string, dispatch: (action) => void, stateProperty: string) {
		this.path = path;
		this.userId = userId;
		this.apiToken = apiToken;
		this.dispatch = dispatch;
		this.stateProperty = stateProperty;
	}

	getData(): void {
		this.getStaticData(this.path + '&page=' + this.actualPage).then((data: T[]) => {
			this.dispatch(setEntities<T>(this.stateProperty, data));
		}).catch((error: Error) => {
			console.log(error);
		});
	}

	getNextPage(): void {
		this.actualPage++;
		this.getStaticData(this.path  + '&page=' + this.actualPage).then((data: T[]) => {
			this.dispatch(insertEntities<T>(this.stateProperty, data));
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
