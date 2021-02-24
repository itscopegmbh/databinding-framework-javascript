import { Reducer } from 'redux';
import {
	Actions,
	DELETE_ENTITY,
	Entity,
	INSERT_ENTITIES,
	INSERT_ENTITY,
	SET_ENTITIES,
	SET_ENTITY,
	State,
	UPDATE_ENTITY
} from './types';

export function createDatabindingReducer<S extends State>(initialState: S): Reducer<S> {
	return (state: S = initialState, action: Actions<Entity>) => {
		switch (action.type) {
			case SET_ENTITY:
			case SET_ENTITIES:
				return {
					...state,
					[action.payload.property as keyof S]: action.payload.value
				};

			case INSERT_ENTITIES: {
				return {
					...state,
					[action.payload.property as keyof S]: (state[action.payload.property as keyof State] as Entity[]).concat(action.payload.value)
				};
			}

			case UPDATE_ENTITY: {
				const indexToUpdate = (state[action.payload.property as keyof S] as Entity[]).findIndex(entity => entity.uniqueId === action.payload.value.uniqueId);
				state[action.payload.property as keyof State][indexToUpdate] = action.payload.value;
				return {
					...state,
					[action.payload.property as keyof S]: (state[action.payload.property as keyof S] as Entity[]).map(
						(entity) => entity.uniqueId === action.payload.value.uniqueId ? action.payload.value : entity
					)
				};
			}

			case INSERT_ENTITY: {
				return {
					...state,
					[action.payload.property as keyof S]: [...state[action.payload.property as keyof State] as Entity[], action.payload.value]
				};
			}

			case DELETE_ENTITY: {
				const indexToDelete = (state[action.payload.property as keyof S] as Entity[]).findIndex(entity => entity.uniqueId === action.payload.value.serial);
				return {
					...state,
					[action.payload.property as keyof S]: [
						...(state[action.payload.property as keyof S] as Entity[]).slice(0, indexToDelete),
						...(state[action.payload.property as keyof S] as Entity[]).slice(indexToDelete + 1)
					]
				};
			}

			default:
				return state;
		}
	};
}
