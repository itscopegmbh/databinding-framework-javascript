import { UpdateStreamState } from '../updateStream';
import { nameof } from '../utils/nameof';
import {
	Actions,
	DatabindingState,
	DELETE_ENTITY,
	Entity,
	INSERT_ENTITIES,
	INSERT_ENTITY,
	SET_CONNECTION_STATE,
	SET_ENTITIES,
	SET_ENTITY,
	SET_FETCHING,
	UPDATE_ENTITY
} from './types';

export function setFetching<T extends Entity, S extends DatabindingState>(property: nameof<S>, isFetching: boolean): Actions<T, S> {
	return {
		type: SET_FETCHING,
		payload: {
			property: property,
			value: isFetching
		}
	};
}

export function setConnectionState<T extends Entity, S extends DatabindingState>(property: nameof<S>, connectionState: UpdateStreamState): Actions<T, S> {
	return {
		type: SET_CONNECTION_STATE,
		payload: {
			property: property,
			value: connectionState
		}
	};
}

export function setEntity<T extends Entity, S extends DatabindingState>(property: nameof<S>, entity: T): Actions<T, S> {
	return {
		type: SET_ENTITY,
		payload: {
			property: property,
			value: entity
		}
	};
}

export function setEntities<T extends Entity, S extends DatabindingState>(property: nameof<S>, entities: T[]): Actions<T, S> {
	return {
		type: SET_ENTITIES,
		payload: {
			property: property,
			value: entities
		}
	};
}

export function insertEntities<T extends Entity, S extends DatabindingState>(property: nameof<S>, entities: T[]): Actions<T, S> {
	return {
		type: INSERT_ENTITIES,
		payload: {
			property: property,
			value: entities
		}
	};
}

export function updateEntity<T extends Entity, S extends DatabindingState>(property: nameof<S>, entity: T): Actions<T, S> {
	return {
		type: UPDATE_ENTITY,
		payload: {
			property: property,
			value: entity
		}
	};
}

export function insertEntity<T extends Entity, S extends DatabindingState>(property: nameof<S>, entity: T): Actions<T, S> {
	return {
		type: INSERT_ENTITY,
		payload: {
			property: property,
			value: entity
		}
	};
}

export function deleteEntity<T extends Entity, S extends DatabindingState>(property: nameof<S>, serial: { serial: string }): Actions<T, S> {
	return {
		type: DELETE_ENTITY,
		payload: {
			property: property,
			value: serial
		}
	};
}
