import { UpdateStreamState } from '../updateStream';
import { nameof } from '../utils/nameof';

export interface Entity {
	uniqueId: string;
}

export interface DatabindingState {
	[key: string]: State
}

interface State {
	isFetching: boolean
}

export interface SingleState<T extends Entity> extends State {
	entity: T
}

export interface CollectionState<T extends Entity> extends State {
	entities: T[]
}

interface LiveState {
	connectionState: UpdateStreamState,
}

export type LiveSingleState<T extends Entity> = SingleState<T> & LiveState;
export type LiveCollectionState<T extends Entity> = CollectionState<T> & LiveState;

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

interface SetFetchingAction<S extends DatabindingState> {
	type: typeof SET_FETCHING
	payload: {
		property: nameof<S>,
		value: boolean
	}
}

interface SetConnectionStateAction<S extends DatabindingState> {
	type: typeof SET_CONNECTION_STATE
	payload: {
		property: nameof<S>,
		value: UpdateStreamState
	}
}

interface SetEntityAction<T extends Entity, S extends DatabindingState> {
	type: typeof SET_ENTITY
	payload: {
		property: nameof<S>,
		value: T
	}
}

interface SetEntitiesAction<T extends Entity, S extends DatabindingState> {
	type: typeof SET_ENTITIES
	payload: {
		property: nameof<S>,
		value: T[]
	}
}

interface InsertEntitiesAction<T extends Entity, S extends DatabindingState> {
	type: typeof INSERT_ENTITIES
	payload: {
		property: nameof<S>,
		value: T[]
	}
}

interface UpdateEntityAction<T extends Entity, S extends DatabindingState> {
	type: typeof UPDATE_ENTITY
	payload: {
		property: nameof<S>,
		value: T
	}
}

interface InsertEntityAction<T extends Entity, S extends DatabindingState> {
	type: typeof INSERT_ENTITY
	payload: {
		property: nameof<S>,
		value: T
	}
}

interface DeleteEntityAction<S extends DatabindingState> {
	type: typeof DELETE_ENTITY
	payload: {
		property: nameof<S>,
		value: {
			serial: string
		}
	}
}

export type Actions<T extends Entity, S extends DatabindingState> =
	SetFetchingAction<S>
	| SetConnectionStateAction<S>
	| SetEntityAction<T, S>
	| SetEntitiesAction<T, S>
	| InsertEntitiesAction<T, S>
	| UpdateEntityAction<T, S>
	| InsertEntityAction<T, S>
	| DeleteEntityAction<S>;

