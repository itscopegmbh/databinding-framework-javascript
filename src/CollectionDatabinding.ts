import { encode } from 'base-64';
import { get } from './fetch/fetch';
import { setEntities } from './redux/actions';

export class CollectionDatabinding<T> {
	private readonly path: string;
	private readonly userId: string;
	private readonly apiToken: string;
	private readonly dispatch: (action) => void;
	private readonly stateProperty: string;

	constructor(path: string, userId: string, apiToken: string, dispatch: (action) => void, stateProperty: string) {
		this.path = path;
		this.userId = userId;
		this.apiToken = apiToken;
		this.dispatch = dispatch;
		this.stateProperty = stateProperty;
	}

	getData(): void {
		this.getStaticData().then((data: T[]) => {
			this.dispatch(setEntities<T>(this.stateProperty, data));
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
