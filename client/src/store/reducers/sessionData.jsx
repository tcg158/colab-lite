import {SESSION, SESSION_ID, MY_SESSION_ROLE} from "../dataMapping/session";

const initState = {
    [SESSION]: null,
    [SESSION_ID]: null,
    [MY_SESSION_ROLE]: null,
};

const sessionData = (state = initState , action)=>{
    switch (action.type) {
        case SESSION_ID:
            return {
                ...state,
                [SESSION_ID]: action.payload
            };
        case MY_SESSION_ROLE:
            return {
                ...state,
                [MY_SESSION_ROLE]: action.payload
            };
        default:
            return state;
    }
};

export default sessionData;