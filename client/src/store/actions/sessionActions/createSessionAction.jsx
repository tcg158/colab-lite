import axios from "axios";
import {CREATE_SESSION} from "../../dataMapping/serverURLs";
import {
    SESSION_CREATED,
    SESSION_DESCRIPTION,
    SESSION_NAME,
    SESSION_PRIVACY
} from "../../dataMapping/session";
import {SESSION_IMAGE,} from "../../dataMapping/user";

export const createSession = (session,callback)=>{
    return (dispatch)=>{
        const data = new FormData();
        data.append(SESSION_NAME, session[SESSION_NAME]);
        data.append(SESSION_DESCRIPTION, session[SESSION_DESCRIPTION]);
        data.append(SESSION_PRIVACY, session[SESSION_PRIVACY]);
        data.append(SESSION_IMAGE, session[SESSION_IMAGE]);
        axios.post(CREATE_SESSION, data ,
            {headers: {'Authorization': "bearer " + localStorage.getItem('user')}})
            .then((res)=>dispatch({type: SESSION_CREATED , payload: res.data.session}))
            .then(()=> callback())
            .catch((error)=> console.log(error.response.data));
    };

};