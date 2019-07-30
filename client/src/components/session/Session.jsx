import React, { Component } from 'react';
import {Spinner} from 'react-bootstrap';
import SessionLayout from "./SessionLayout";
import SessionPanel from "./SessionPanel";
import {connect} from "react-redux";
import {DISCONNECT_FROM_SESSION_SOCKET, SESSION_SOCKET} from "../../store/dataMapping/socket";
import {SESSION_CONNECTED_USERS} from "../../store/dataMapping/session";
import axios from "axios";
import {USERNAME} from "../../store/dataMapping/auth";
import SessionToolbar from "./SessionToolbar";
import io from "socket.io-client";



class Session extends Component{


    state = {
        id: this.props.match.params.sessionId,
        taskShow: false,
        loaded: false,
        correct: 0,
        wrong: 0,
        grade: 0

    };

    componentWillMount() {
        const socket = io.connect(
            "/"+this.state.id,
            {query:'uname='+sessionStorage.getItem("username")
            });
        if(socket)
        {
            socket.on('error', ()=>{
                console.log('Connection Failed');
            });
            socket.on('connect', ()=>{
                this.setState({loaded:true});
                console.log('Connected');
            });
            socket.on('disconnect', ()=> {
                console.log('Disconnected');
            });
        }
        this.props.sessionSocket(socket);
    }


    componentWillUnmount() {
        this.setState({loaded: false});
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
                    <SessionLayout handler={this.handler} taskButtonValue={"Task"}/>
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
        updateSessionUsers: (users)=> dispatch({type: SESSION_CONNECTED_USERS , payload: users}),
        disconnect: ()=> dispatch({type: DISCONNECT_FROM_SESSION_SOCKET}),
        sessionSocket: (socket)=> dispatch({type: SESSION_SOCKET , payload: socket})
    };
};

export default connect(mapStateToProps,mapDispatchToProps)(Session);