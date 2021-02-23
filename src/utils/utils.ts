export interface IQueryParameters {
	[key: string]: string | number
}

export interface ILazyLoadingQueryParameters extends IQueryParameters {
	page: number
}

export const buildPath = (baseUrl: string, queryParameters: IQueryParameters, createUpdatePath = false): string => {
	let path = baseUrl;
	if (createUpdatePath) {
		path += '/update';
	}
	let index = 0;
	if (Object.keys(queryParameters).length > 0) {
		for (const key in queryParameters) {
			if (Object.prototype.hasOwnProperty.call(queryParameters, key)) {
				const value = queryParameters[key];
				if (index === 0) {
					path = path + '?' + key + '=' + value;
				} else {
					path = path + '&' + key + '=' + value;
				}
				index++;
			}
		}
	}
	return path;
};
