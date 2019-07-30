import React, { Component } from 'react';
import {Spinner} from 'react-bootstrap';
import SessionLayout from "./SessionLayout";
import SessionPanel from "./SessionPanel";
import {connect} from "react-redux";
import {joinSession} from "../../store/actions/sessionActions/joinSessionAction";
import {DISCONNECT_FROM_SESSION_SOCKET, SESSION_SOCKET} from "../../store/dataMapping/socket";
import {SESSION_CONNECTED_USERS} from "../../store/dataMapping/session";
import axios from "axios";
import {USERNAME} from "../../store/dataMapping/user";
import SessionToolbar from "./SessionToolbar";



class Session extends Component{


    state = {
        id: this.props.match.params.sessionId,
        taskShow: false,
        loaded: false,
        correct: 0,
        wrong: 0,
        grade: 0

    };

    componentDidMount() {
        this.props.joinSession(this.state.id,()=>{
           this.setState({loaded:true});
        });
    }


    componentWillUnmount() {
        this.setState({loaded: true});
        this.props.disconnect();
    }


    run = ()=>{
        console.log("run function");
        this.props.socket.emit("save-file",this.state.editor,(data)=>{
            if(data) {
                axios.post("/lsp/run-task",{
                    sessionId: this.state.id,
                    username: localStorage.getItem(USERNAME),
                    taskId: 1
                },{headers: {'Authorization': "bearer " + localStorage.getItem('user')}})
                    .then((res)=> {
                        let grade = res.data.correct/(res.data.correct+res.data.wrong)*100;
                        this.setState({correct: res.data.correct, wrong:res.data.wrong, grade: grade})
                    })
                    .catch(()=> console.log("grade error"))
            }
        });
    };


    render() {
        if(!this.state.loaded){
            return <div className={"loading"}>
                <Spinner animation={"border"}/>
            </div>;
        }
        else return(
            <div className={"sessionBody"}>
                <SessionToolbar/>
                <div className={"wrapper"} style={{color:'white'}}>
                    <SessionPanel />
                    <SessionLayout handler={this.handler} taskButtonValue={"Task"} rooms={["Master","Mourad"]}/>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (combinedReducer)=> {
    return {
        socket: combinedReducer.sockets[SESSION_SOCKET]
    }
};

const mapDispatchToProps = (dispatch)=>{
    return {
        joinSession: (id,callback)=> dispatch(joinSession(id,callback)),
        updateSessionUsers: (users)=> dispatch({type: SESSION_CONNECTED_USERS , payload: users}),
        disconnect: ()=> dispatch({type: DISCONNECT_FROM_SESSION_SOCKET})
    };
};

export default connect(mapStateToProps,mapDispatchToProps)(Session);