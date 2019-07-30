import {AUTHENTICATE, AUTHENTICATED, AUTHENTICATION_ERROR, DEAUTHENTICATE} from "../dataMapping/auth";

const initState = {
    [AUTHENTICATED]: false,
    errorMsg: ""
};

const userReducer = (state = initState,action)=>{
    switch (action.type) {
        case AUTHENTICATE:
            return {
                ...state,
                [AUTHENTICATED]: true
            };
        case AUTHENTICATION_ERROR:
            return {
                ...state,
                errorMsg: "username already exists"
            };
        case DEAUTHENTICATE:
            return {
                ...state,
                [AUTHENTICATED]: false
            };
        default:
            return state;

    }
};
export default userReducer;