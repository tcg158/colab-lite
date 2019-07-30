import {createStore, applyMiddleware, combineReducers } from "redux";
import thunk from "redux-thunk";
import sessionReducer from "./reducers/sessionReducer";
import formReducer from "./reducers/formReducer";
import socketReducer from "./reducers/socketReducer";
import sessionData from "./reducers/sessionData";
import editorReducer from "./reducers/editorReducer";


export const rootReducer = combineReducers({
    user: userReducer,
    sessionStorage: sessionReducer,
    forms: formReducer,
    sockets:  socketReducer,
    sessionData: sessionData,
    editor: editorReducer,
});


export const store = createStore(rootReducer,applyMiddleware(thunk));