import {
	Actions,
	DELETE_ENTITY,
	Entity,
	INSERT_ENTITIES,
	INSERT_ENTITY,
	SET_ENTITIES,
	SET_ENTITY,
	UPDATE_ENTITY
} from './types';

export function setEntity<T extends Entity>(property: string, entity: T): Actions<T> {
	return {
		type: SET_ENTITY,
		payload: {
			property: property,
			value: entity
		}
	};
}

export function setEntities<T extends Entity>(property: string, entities: T[]): Actions<T> {
	return {
		type: SET_ENTITIES,
		payload: {
			property: property,
			value: entities
		}
	};
}

export function insertEntities<T extends Entity>(property: string, entities: T[]): Actions<T> {
	return {
		type: INSERT_ENTITIES,
		payload: {
			property: property,
			value: entities
		}
	};
}

export function updateEntity<T extends Entity>(property: string, entity: T): Actions<T> {
	return {
		type: UPDATE_ENTITY,
		payload: {
			property: property,
			value: entity
		}
	};
}

export function insertEntity<T extends Entity>(property: string, entity: T): Actions<T> {
	return {
		type: INSERT_ENTITY,
		payload: {
			property: property,
			value: entity
		}
	};
}

export function deleteEntity<T extends Entity>(property: string, serial: { serial: string }): Actions<T> {
	return {
		type: DELETE_ENTITY,
		payload: {
			property: property,
			value: serial
		}
	};
}
