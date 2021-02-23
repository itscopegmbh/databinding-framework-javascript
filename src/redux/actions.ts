import {
	Actions,
	DELETE_ENTITY,
	INSERT_ENTITIES,
	INSERT_ENTITY,
	SET_ENTITIES,
	SET_ENTITY,
	UPDATE_ENTITY
} from './types';

export function setEntity<T>(property: string, entity: T): Actions<T> {
	return {
		type: SET_ENTITY,
		payload: {
			property: property,
			value: entity
		}
	}
}

export function setEntities<T>(property: string, entities: T[]): Actions<T> {
	return {
		type: SET_ENTITIES,
		payload: {
			property: property,
			value: entities
		}
	}
}

export function insertEntities<T>(property: string, entities: T[]): Actions<T> {
	return {
		type: INSERT_ENTITIES,
		payload: {
			property: property,
			value: entities
		}
	}
}

export function updateEntity<T>(property: string, entity: T): Actions<T> {
	return {
		type: UPDATE_ENTITY,
		payload: {
			property: property,
			value: entity
		}
	}
}

export function insertEntity<T>(property: string, entity: T): Actions<T> {
	return {
		type: INSERT_ENTITY,
		payload: {
			property: property,
			value: entity
		}
	}
}

export function deleteEntity<T>(property: string, id: string): Actions<T> {
	return {
		type: DELETE_ENTITY,
		payload: {
			property: property,
			value: id
		}
	}
}
