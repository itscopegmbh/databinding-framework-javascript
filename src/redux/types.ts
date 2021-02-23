export const SET_ENTITY = 'SET_ENTITY';
export const SET_ENTITIES = 'SET_ENTITIES';
export const INSERT_ENTITIES = 'INSERT_ENTITIES';
export const UPDATE_ENTITY = 'UPDATE_ENTITY';
export const INSERT_ENTITY = 'INSERT_ENTITY';
export const DELETE_ENTITY = 'DELETE_ENTITY';

interface SetEntityAction<T> {
	type: typeof SET_ENTITY
	payload: {
		property: string,
		value: T
	}
}

interface SetEntitiesAction<T> {
	type: typeof SET_ENTITIES
	payload: {
		property: string,
		value: T[]
	}
}

interface InsertEntitiesAction<T> {
	type: typeof INSERT_ENTITIES
	payload: {
		property: string,
		value: T[]
	}
}

interface UpdateEntityAction<T> {
	type: typeof UPDATE_ENTITY
	payload: {
		property: string,
		value: T
	}
}

interface InsertEntityAction<T> {
	type: typeof INSERT_ENTITY
	payload: {
		property: string,
		value: T
	}
}

interface DeleteEntityAction {
	type: typeof DELETE_ENTITY
	payload: {
		property: string,
		value: string
	}
}

export type Actions<T> =
	SetEntityAction<T>
	| SetEntitiesAction<T>
	| InsertEntitiesAction<T>
	| UpdateEntityAction<T>
	| InsertEntityAction<T>
	| DeleteEntityAction;

