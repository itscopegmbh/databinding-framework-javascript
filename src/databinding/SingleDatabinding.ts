import { get } from '../fetch/fetch';
import { setEntity, setFetching } from '../redux/actions';
import { Actions, Entity } from '../redux/types';
import { buildUri, IHeaders, IQueryParameters } from '../utils/buildUri';
import { AbstractDatabinding } from './AbstractDatabinding';

export class SingleDatabinding<T extends Entity> extends AbstractDatabinding<T> {
	constructor(path: string, headers: IHeaders, queryParameters: IQueryParameters, stateProperty: string, dispatch: (action: Actions<T>) => void) {
		super(path, headers, queryParameters, stateProperty, dispatch);
	}

	getData(): void {
		this.dispatch(setFetching<T>(this.stateProperty, true));
		get(buildUri(this.path, this.queryParameters), this.headers).then((data: T) => {
			this.dispatch(setEntity<T>(this.stateProperty, data));
			this.dispatch(setFetching<T>(this.stateProperty, false));
		}).catch((error: Error) => {
			console.error(error);
		});
	}
}
