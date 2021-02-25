import { Actions, Entity } from '../redux/types';
import { IHeaders, IQueryParameters } from '../utils/buildUri';

export abstract class AbstractDatabinding<T extends Entity> {
	protected readonly path: string;
	protected readonly headers: IHeaders;
	protected queryParameters: IQueryParameters;
	protected readonly stateProperty: string;
	protected readonly dispatch: (action: Actions<T>) => void;

	protected constructor(path: string, headers: IHeaders, queryParameters: IQueryParameters, stateProperty: string, dispatch: (action: Actions<T>) => void) {
		this.path = path;
		this.headers = headers;
		this.queryParameters = queryParameters;
		this.stateProperty = stateProperty;
		this.dispatch = dispatch;
	}
}
