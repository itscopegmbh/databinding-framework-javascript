import { UpdateStreamState } from '../updateStream';

export interface Entity {
	uniqueId: string;
}

export interface DatabindingState {
	[key: string]: State
}

interface State {
	isFetching: boolean
}

export interface SingleState<T> extends State {
	entity: T
}

export interface CollectionState<T> extends State {
	entities: T[]
}

interface LiveState {
	connectionState: UpdateStreamState,
}

export type LiveSingleState<T> = SingleState<T> & LiveState;
export type LiveCollectionState<T> = CollectionState<T> & LiveState;

export const initialCollectionState = {
	entities: [],
	isFetching: false
}

export const initialLiveCollectionState = {
	entities: [],
	isFetching: false,
	connectionState: UpdateStreamState.CLOSED
};

export const initialSingleState = {
	entity: undefined,
	isFetching: false
}

export const initialLiveSingleState = {
	entity: undefined,
	isFetching: false,
	connectionState: UpdateStreamState.CLOSED
}

export const SET_FETCHING = 'SET_FETCHING';
export const SET_CONNECTION_STATE = 'SET_CONNECTION_STATE';
export const SET_ENTITY = 'SET_ENTITY';
export const SET_ENTITIES = 'SET_ENTITIES';
export const INSERT_ENTITIES = 'INSERT_ENTITIES';
export const UPDATE_ENTITY = 'UPDATE_ENTITY';
export const INSERT_ENTITY = 'INSERT_ENTITY';
export const DELETE_ENTITY = 'DELETE_ENTITY';

interface SetFetchingAction {
	type: typeof SET_FETCHING
	payload: {
		property: string,
		value: boolean
	}
}

interface SetConnectionStateAction {
	type: typeof SET_CONNECTION_STATE
	payload: {
		property: string,
		value: UpdateStreamState
	}
}

interface SetEntityAction<T extends Entity> {
	type: typeof SET_ENTITY
	payload: {
		property: string,
		value: T
	}
}

interface SetEntitiesAction<T extends Entity> {
	type: typeof SET_ENTITIES
	payload: {
		property: string,
		value: T[]
	}
}

interface InsertEntitiesAction<T extends Entity> {
	type: typeof INSERT_ENTITIES
	payload: {
		property: string,
		value: T[]
	}
}

interface UpdateEntityAction<T extends Entity> {
	type: typeof UPDATE_ENTITY
	payload: {
		property: string,
		value: T
	}
}

interface InsertEntityAction<T extends Entity> {
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
		value: {
			serial: string
		}
	}
}

export type Actions<T extends Entity> =
	SetFetchingAction
	| SetConnectionStateAction
	| SetEntityAction<T>
	| SetEntitiesAction<T>
	| InsertEntitiesAction<T>
	| UpdateEntityAction<T>
	| InsertEntityAction<T>
	| DeleteEntityAction;

