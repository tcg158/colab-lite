import io from "socket.io-client";
import {
    CONNECT_TO_SESSION_SOCKET,
    DISCONNECT_FROM_SESSION_SOCKET,
    SESSION_SOCKET
} from "../dataMapping/socket";
const initState = {
    backgroundImage: "",
    [SESSION_SOCKET]: null
};

const socketReducer = (state = initState ,action)=>{
    switch (action.type) {
        case "backgroundImage":
            return {
                ...state,
                backgroundImage: action.payload
            };
        case CONNECT_TO_SESSION_SOCKET:
            return {
                ...state,
                [SESSION_SOCKET]: io.connect("/"+action.payload,{query: {token: localStorage.getItem('user')}})
            };
        case DISCONNECT_FROM_SESSION_SOCKET:
            state[SESSION_SOCKET].disconnect();
            return {
                ...state,
                [SESSION_SOCKET]: null
            };
        case SESSION_SOCKET:
            return {
                ...state,
                [SESSION_SOCKET]: action.payload
            };
        default:
            return state;
    }
};

export default socketReducer;