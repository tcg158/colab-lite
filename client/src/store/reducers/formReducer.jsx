import {
    ADD_CASE,
    CASES,
    TASK_CREATION_FORM, TASK_HINTSFIELD,
    TASK_INPUTFIELD, TASK_OUTPUTFIELD, TASK_WEIGHTFIELD, TASK_VIEW_FORM, TASKS, GET_TASKS, TASK_GRADE, STAT_FORM
} from "../dataMapping/form";

const initState = {
    [TASK_CREATION_FORM]: false,
    [STAT_FORM]: false,
    [TASK_VIEW_FORM]: false,
    [CASES]:[],
    [TASKS]:[]
};

const formReducer = (state = initState ,action)=>{
    switch (action.type) {
         case TASK_CREATION_FORM:
            return {
                ...state,
                [TASK_CREATION_FORM]: action.payload
            };
        case TASK_VIEW_FORM:
            return {
                ...state,
                [TASK_VIEW_FORM]: action.payload
            };
        case GET_TASKS:
            return {
                ...state,
                [TASKS]: action.payload
            };
        case TASK_GRADE:
            let arr = state[TASKS].map((task) =>{
               if(task.taskId === parseInt(action.payload.taskId)){
                   task["grade"]= action.payload.score;
                   task["messages"]= action.payload.msgs;
               }
               return task
            });
            return {
                ...state,
                [TASKS]: arr
            };
        case ADD_CASE:
            state[CASES].push({inputs:'', outputs:'', weight:null, hint:''});
            return state;
        case TASK_INPUTFIELD:
                state[CASES][action.payload.index][TASK_INPUTFIELD] = action.payload.value;
            return state;
        case TASK_OUTPUTFIELD:
            state[CASES][action.payload.index][TASK_OUTPUTFIELD] = action.payload.value;
            return state;
        case TASK_HINTSFIELD:
            state[CASES][action.payload.index][TASK_HINTSFIELD] = action.payload.value;
            return state;
        case TASK_WEIGHTFIELD:
            state[CASES][action.payload.index][TASK_WEIGHTFIELD] = action.payload.value;
            return state;
        case STAT_FORM:
            return {
                ...state,
                [STAT_FORM]: action.payload
            };
        default:
            return state;
    }
};

export default formReducer;