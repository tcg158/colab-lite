import axios from "axios";
import {AUTHENTICATE, AUTHENTICATION_ERROR, DEAUTHENTICATE} from "../dataMapping/auth";

export const login = (username,callback)=>{
    return (dispatch)=>{
        axios.get("/handshake?uname="+username)
            .then(()=>{
                sessionStorage.setItem("username", username);
                dispatch({type: AUTHENTICATE});
                console.log("succeeded")
            })
            .then(()=> callback())
            .catch(()=> dispatch({type: AUTHENTICATION_ERROR}));
    };

};