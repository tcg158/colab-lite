import {
    ADD_CASE,
    CASES,
    SESSION_CREATION_FORM,
    SIGN_IN_FORM,
    SIGN_UP_FORM,
    TASK_CREATION_FORM, TASK_HINTSFIELD,
    TASK_INPUTFIELD, TASK_OUTPUTFIELD, TASK_WEIGHTFIELD, INVITATION_FORM, TASK_VIEW_FORM, TASKS, GET_TASKS, TASK_GRADE
} from "../dataMapping/form";

const initState = {
    [SIGN_IN_FORM]: false,
    [SIGN_UP_FORM]: false,
    [INVITATION_FORM]: false,
    [SESSION_CREATION_FORM]: false,
    [TASK_CREATION_FORM]: false,
    [TASK_VIEW_FORM]: false,
    [CASES]:[],
    [TASKS]:[]
};

const formReducer = (state = initState ,action)=>{
    switch (action.type) {
        case SIGN_IN_FORM:
            return {
                ...state,
                [SIGN_IN_FORM]: action.payload
            };
        case SIGN_UP_FORM:
            return {
                ...state,
                [SIGN_UP_FORM]: action.payload
            };
        case SESSION_CREATION_FORM:
            return {
                ...state,
                [SESSION_CREATION_FORM]: action.payload
            };
        case INVITATION_FORM:
            return {
                ...state,
                [INVITATION_FORM]: action.payload
            };
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
        default:
            return state;
    }
};

export default formReducer;