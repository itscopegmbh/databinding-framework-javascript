export interface IQueryParameters {
	[key: string]: string | number
}

export interface ILazyLoadingQueryParameters extends IQueryParameters {
	page: number
}

export interface IHeaders {
	headers: Record<string, string>
}

export const convertToLazyLoadingQueryParam = (queryParameters: IQueryParameters, page = 1): ILazyLoadingQueryParameters => {
	return {
		...queryParameters,
		page: page
	};
}

export const buildUri = (path: string, queryParameters: IQueryParameters, createUpdatePath = false): string => {
	let uri = path;
	if (createUpdatePath) {
		uri += '/update';
	}
	let index = 0;
	if (Object.keys(queryParameters).length > 0) {
		for (const key in queryParameters) {
			if (Object.prototype.hasOwnProperty.call(queryParameters, key)) {
				const value = queryParameters[key];
				if (index === 0) {
					uri = uri + '?' + key + '=' + value;
				} else {
					uri = uri + '&' + key + '=' + value;
				}
				index++;
			}
		}
	}
	return uri;
};




