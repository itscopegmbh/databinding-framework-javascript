import { Reducer } from 'redux';
import {
	Actions,
	DatabindingState,
	DELETE_ENTITY,
	Entity,
	INSERT_ENTITIES,
	INSERT_ENTITY,
	LiveCollectionState,
	SET_CONNECTION_STATE,
	SET_ENTITIES,
	SET_ENTITY,
	SET_FETCHING,
	UPDATE_ENTITY
} from './types';

export function createDatabindingReducer<S extends DatabindingState>(initialState: S): Reducer<S> {
	return (state: S = initialState, action: Actions<Entity, S>) => {
		switch (action.type) {
			case SET_FETCHING: {
				return {
					...state,
					[action.payload.property]: {
						...state[action.payload.property],
						isFetching: action.payload.value
					}
				};
			}

			case SET_CONNECTION_STATE: {
				return {
					...state,
					[action.payload.property]: {
						...state[action.payload.property],
						connectionState: action.payload.value
					}
				};
			}

			case SET_ENTITY: {
				return {
					...state,
					[action.payload.property]: {
						...state[action.payload.property],
						entity: action.payload.value
					}
				};
			}

			case SET_ENTITIES: {
				return {
					...state,
					[action.payload.property]: {
						...state[action.payload.property],
						entities: action.payload.value
					}
				};
			}

			case INSERT_ENTITIES: {
				return {
					...state,
					[action.payload.property]: {
						...state[action.payload.property],
						entities: (state[action.payload.property] as unknown as LiveCollectionState<Entity>).entities.concat(action.payload.value)
					}
				};
			}

			case UPDATE_ENTITY: {
				return {
					...state,
					[action.payload.property]: {
						...state[action.payload.property],
						entities: (state[action.payload.property] as unknown as LiveCollectionState<Entity>).entities.map(
							(entity) => entity.uniqueId === action.payload.value.uniqueId ? action.payload.value : entity)
					}
				};
			}

			case INSERT_ENTITY: {
				return {
					...state,
					[action.payload.property]: {
						...state[action.payload.property],
						entities: [
							...(state[action.payload.property] as unknown as LiveCollectionState<Entity>).entities,
							action.payload.value
						]
					}
				};
			}

			case DELETE_ENTITY: {
				const indexToDelete = (state[action.payload.property] as unknown as LiveCollectionState<Entity>).entities.findIndex(entity => entity.uniqueId === action.payload.value.serial);
				return {
					...state,
					[action.payload.property]: {
						...state[action.payload.property],
						entities: [
							...(state[action.payload.property] as unknown as LiveCollectionState<Entity>).entities.slice(0, indexToDelete),
							...(state[action.payload.property] as unknown as LiveCollectionState<Entity>).entities.slice(indexToDelete + 1)
						]
					}
				};
			}

			default:
				return state;
		}
	};
}
