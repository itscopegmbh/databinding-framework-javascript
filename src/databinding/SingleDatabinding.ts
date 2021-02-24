import { encode } from 'base-64';
import { Entity } from '../redux/types';
import { AbstractDatabinding } from './AbstractDatabinding';
import { get } from '../fetch/fetch';
import { setEntity, setFetching } from '../redux/actions';
import { buildPath, IQueryParameters } from '../utils/buildPath';

export class SingleDatabinding<T extends Entity> extends AbstractDatabinding {
	private readonly queryParameters: IQueryParameters;

	constructor(path: string, userId: string, apiToken: string,
				dispatch: (action) => void, stateProperty: string,
				queryParameters: IQueryParameters) {
		super(path, userId, apiToken, dispatch, stateProperty);
		this.queryParameters = queryParameters;
	}

	getData(): void {
		this.dispatch(setFetching<T>(this.stateProperty, true));
		get(buildPath(this.path, this.queryParameters), {
			headers: { Authorization: 'Basic ' + encode(this.userId + ':' + this.apiToken) }
		}).then((data: T) => {
			this.dispatch(setEntity<T>(this.stateProperty, data));
			this.dispatch(setFetching<T>(this.stateProperty, false));
		}).catch((error: Error) => {
			console.error(error);
		});
	}
}
