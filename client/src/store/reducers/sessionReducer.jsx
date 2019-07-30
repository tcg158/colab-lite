import {
    MY_SESSIONS_RETRIEVED,
    MY_SESSIONS,
    PUBLIC_SESSIONS,
    PUBLIC_SESSIONS_RETRIEVED,
} from "../dataMapping/session";

const initState ={
    [PUBLIC_SESSIONS]: null,
    [MY_SESSIONS]: null,
};

const sessionReducer = (state = initState , action)=>{
    switch (action.type) {
        case PUBLIC_SESSIONS_RETRIEVED:
            return {
                ...state,
                [PUBLIC_SESSIONS]: action.payload
            };
        case MY_SESSIONS_RETRIEVED:
            return {
                ...state,
                [MY_SESSIONS]: action.payload
            };
        default:
            return state;
    }
};

export default sessionReducer;