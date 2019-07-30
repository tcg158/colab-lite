import {MY_ROLE} from "../dataMapping/sessionUsersData";
import {SESSION, SESSION_CREATED, SESSION_ID} from "../dataMapping/session";

const initState = {
    [SESSION]: null,
    [SESSION_ID]: null,
    [MY_ROLE]: null,
};

const sessionData = (state = initState , action)=>{
    switch (action.type) {
        case SESSION_CREATED:
            return {
                ...state,
                [SESSION]: action.payload
            };
        case SESSION_ID:
            return {
                ...state,
                [SESSION_ID]: action.payload
            };
        case MY_ROLE:
            return {
                ...state,
                [MY_ROLE]: action.payload
            };
        default:
            return state;
    }
};

export default sessionData;