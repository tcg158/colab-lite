import axios from "axios";
import {EXECUTION_OUTPUT} from "../../dataMapping/ace";

export const execute = (data)=>{
    return (dispatch)=>{
        axios.post("/lsp/run",data,
            {headers: {'Authorization': "bearer " + localStorage.getItem('user')}})
            .then((res)=>{
                dispatch({type: EXECUTION_OUTPUT , payload: res.data.msgs});
                console.log("ace", res.data.msgs);
            })
            .catch(()=> console.log("execution error"));
    };

};