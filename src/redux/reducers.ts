import { Reducer } from 'redux';
import {
	DELETE_ENTITY,
	INSERT_ENTITIES, INSERT_ENTITY,
	SET_ENTITIES,
	SET_ENTITY,
	UPDATE_ENTITY
} from './types';

export function createDatabindingReducer<State>(initialState: State): Reducer<State> {
	return (state: State = initialState, action) => {
		switch (action.type) {
			case SET_ENTITY:
			case SET_ENTITIES:
				return {
					...state,
					[action.payload.property as keyof State]: action.payload.value
				};

			case INSERT_ENTITIES: {
				return {
					...state,
					[action.payload.property as keyof State]: (state[action.payload.property as keyof State] as unknown as never[]).concat(action.payload.value)
				};
			}

			case UPDATE_ENTITY: {
				const indexToUpdate = (state[action.payload.property as keyof State] as unknown as any[]).findIndex(entity => entity.uniqueId === action.payload.value.uniqueId);
				state[action.payload.property as keyof State][indexToUpdate] = action.payload.value;
				return {
					...state,
					[action.payload.property as keyof State]: (state[action.payload.property as keyof State] as unknown as any[]).map(
						(entity) => entity.uniqueId === action.payload.value.uniqueId ? action.payload.value : entity
					)
				};
			}

			case INSERT_ENTITY:
				return {
					...state,
					[action.payload.property as keyof State]: [...state[action.payload.property as keyof State] as unknown as never[], action.payload.value]
				};

			case DELETE_ENTITY: {
				const indexToDelete = (state[action.payload.property as keyof State] as unknown as any[]).findIndex(entity => entity.uniqueId === action.payload.value.uniqueId);
				return {
					...state,
					orderProposals: [
						...(state[action.payload.property as keyof State] as unknown as never[]).slice(0, indexToDelete),
						...(state[action.payload.property as keyof State] as unknown as never[]).slice(indexToDelete + 1)
					]
				};
			}

			default:
				return state;
		}
	};
}
