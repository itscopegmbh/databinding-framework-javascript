export abstract class AbstractDatabinding {
	protected readonly path: string;
	protected readonly userId: string;
	protected readonly apiToken: string;
	protected readonly dispatch: (action) => void;
	protected readonly stateProperty: string;

	protected constructor(path: string, userId: string, apiToken: string,
						dispatch: (action) => void, stateProperty: string) {
		this.path = path;
		this.userId = userId;
		this.apiToken = apiToken;
		this.dispatch = dispatch;
		this.stateProperty = stateProperty;
	}
}
