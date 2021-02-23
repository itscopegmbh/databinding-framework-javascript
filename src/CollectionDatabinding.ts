import { encode } from 'base-64';
import { AbstractDatabinding } from './AbstractDatabinding';
import { get } from './fetch/fetch';
import { setEntities } from './redux/actions';
import { buildPath, IQueryParameters } from './utils/utils';

export class CollectionDatabinding<T> extends AbstractDatabinding {
	private readonly queryParameters: IQueryParameters;

	constructor(path: string, userId: string, apiToken: string,
				dispatch: (action) => void, stateProperty: string,
				queryParameters: IQueryParameters) {
		super(path, userId, apiToken, dispatch, stateProperty);
		this.queryParameters = queryParameters;
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
}
