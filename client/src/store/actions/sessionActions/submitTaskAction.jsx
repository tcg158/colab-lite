import {SUBMIT_TASK} from "../../dataMapping/serverURLs";
import axios from "axios";
import {TASK_GRADE} from "../../dataMapping/form";

export const submitTask = (taskData)=>{
    return (dispatch)=>{
        axios.post(SUBMIT_TASK,taskData,
            {headers: {'Authorization': "bearer " + localStorage.getItem('user')}})
            .then((res)=>dispatch({type: TASK_GRADE , payload: res.data}))
            .catch(()=> console.log("submit error"));
    };

};