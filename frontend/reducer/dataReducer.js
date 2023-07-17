import { ADD_DATA } from "../constants";

const initialState = {
    
};

const dataReducer = (state=initialState, action) => {
    switch(action.type){
        case ADD_DATA: {
           return {
            ...state,
            ...action.payload
           }}

        

        default:
            return state;

            
    }
}

export default dataReducer;