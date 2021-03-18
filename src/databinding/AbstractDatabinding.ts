import { Actions, DatabindingState, Entity } from '../redux/types';
import { IHeaders, IQueryParameters } from '../utils/buildUri';
import { nameof } from '../utils/nameof';

export abstract class AbstractDatabinding<T extends Entity, S extends DatabindingState> {
	protected readonly path: string;
	protected readonly headers: IHeaders;
	protected queryParameters: IQueryParameters;
	protected readonly stateProperty: nameof<S>;
	protected readonly dispatch: (action: Actions<T, S>) => void;

	protected constructor(path: string, headers: IHeaders, queryParameters: IQueryParameters, stateProperty: nameof<S>, dispatch: (action: Actions<T, S>) => void) {
		this.path = path;
		this.headers = headers;
		this.queryParameters = queryParameters;
		this.stateProperty = stateProperty;
		this.dispatch = dispatch;
	}

	abstract getData(): void;
}
