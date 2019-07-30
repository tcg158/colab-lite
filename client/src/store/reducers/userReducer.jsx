import {AUTHENTICATED} from "../dataMapping/auth";

const initState = {
    [AUTHENTICATED]: false
};

const userReducer = (state = initState,action)=>{
    switch (action.type) {
        case AUTHENTICAT:
            return {
                ...state,
                [AUTHENTICATED]: true
            };
        default:
            return state;
        
    }
};
export default userReducer;