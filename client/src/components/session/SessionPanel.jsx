import React, { Component } from 'react';
import {Card, Col, DropdownButton, Dropdown, ProgressBar, Nav , Tab} from 'react-bootstrap';
import {connect} from "react-redux";
import {SESSION_SOCKET} from "../../store/dataMapping/socket";
import {MY_SESSION_ROLE, SESSION_CONNECTED_USERS} from "../../store/dataMapping/session";
import {USERNAME} from "../../store/dataMapping/auth";
import {ACE_INPUT_READONLY} from "../../store/dataMapping/ace";
import ReactAvatar from "react-avatar";

class SessionPanel extends Component{


    state =  {
        [SESSION_CONNECTED_USERS]: [],
        msg: "",
    };

    componentDidMount() {
        const {socket} = this.props;
        socket.on("current-users",(users, role ,callback)=>{
            this.props.setMyRole(role, ()=>{
                let dataSource = users.map((user)=> {
                    return{
                        ...user,
                        disabled: false,
                        grade:0
                    };
                });
                this.setState({[SESSION_CONNECTED_USERS]: dataSource});
                callback();
            });
        });

        socket.on("user-joined",(user)=>{
            if(this.state[SESSION_CONNECTED_USERS].some( item => item[USERNAME] === user[USERNAME] )) {
                this.updateUsers(USERNAME,user[USERNAME],"disabled",false);
            }else {
                let dataSource = [...this.state[SESSION_CONNECTED_USERS]
                    ,{
                        ...user,
                        disabled: false,
                        grade: 0
                    }];
                this.setState({[SESSION_CONNECTED_USERS]: dataSource});
            }

        });

        socket.on("user-left",(user)=>{
            this.updateUsers(USERNAME,user[USERNAME],"disabled",true);
        });
    }


    updateUsers = (key,username,attr,value)=>{
        let dataSource = this.state[SESSION_CONNECTED_USERS].map((user)=> {
            if(user[key] === username) {
                user[attr] = value;
            }
            return user;
        });
        this.setState({[SESSION_CONNECTED_USERS]: dataSource});
    };

    watchUser = (e)=>{
        if(!this.props[MY_SESSION_ROLE] && sessionStorage.getItem(USERNAME) !== e.currentTarget.name) {
            this.props.updateEditorInputReadOnly(true);
        } else {
            this.props.updateEditorInputReadOnly(false);
        }
        const {socket} = this.props;
        socket.emit("watch-user", e.currentTarget.name);
    };

    showTaskGrades = (e)=>{
        this.props.socket.emit("task-grades",e.target.id,(users)=>{
            users.forEach((user)=>{
                this.updateUsers(USERNAME, user.username, "grade" , user.grade);
            });
        });
    };

    render() {
        return(
            <Col xs={3}>
                <div className={"panelSection"}>
                    <Card.Header as={"h4"}>
                        Users
                        <DropdownButton disabled={this.props.tasks.length === 0} id="grades" title="Grades" style={{float:"right",marginTop: "-5px", marginRight:" -8px"}}>
                            {
                                this.props.tasks.map((task)=>{
                                    return (
                                        <Dropdown.Item id={task.taskId} onClick={this.showTaskGrades}>
                                            {task.name}
                                        </Dropdown.Item>
                                    )})
                            }
                        </DropdownButton>
                    </Card.Header>
                    <Tab.Container id="tabs" defaultActiveKey={sessionStorage.getItem(USERNAME)}>
                        <Nav variant="pills primary" className="flex-column">
                            {this.state[SESSION_CONNECTED_USERS].length > 0 && this.state[SESSION_CONNECTED_USERS].map((data)=>{
                                return <Nav.Item disabled={data["disabled"]}>
                                        <div disabled={data.disabled}>
                                            <Nav.Link name={data[USERNAME]} eventKey={data[USERNAME]} onClick={this.watchUser}>
                                                <ReactAvatar size={"35px"} className="eimage" name={data[USERNAME]}/>
                                                <div className="ename">{data[USERNAME]}</div>
                                                <div className="ejob">{data.owner ? "Owner" : "Ghost" }</div>
                                                {!data.owner ?
                                                    <div className={"progressbarDiv"}>
                                                        <ProgressBar className={"progressbar"} now={data.grade} label={data.grade+"%"} variant={"info"}/>
                                                    </div>: <></>}
                                            </Nav.Link>
                                        </div>
                                </Nav.Item>;
                            })}
                        </Nav>
                    </Tab.Container>
                </div>
            </Col>
        );
    }
}
const mapStateToProps = (combinedReducer)=> {
    return {
        tasks: combinedReducer.forms.tasks,
        socket: combinedReducer.sockets[SESSION_SOCKET],
        [MY_SESSION_ROLE]: combinedReducer.sessionData[MY_SESSION_ROLE]
    }
};
const mapDispatchToProps = (dispatch)=>{
    return {
        updateSessionUsers: (users)=> dispatch({type: SESSION_CONNECTED_USERS , payload: users}),
        setMyRole: (role,callback) => {
            dispatch({type: MY_SESSION_ROLE, payload: role});
            callback();
        },
        updateEditorInputReadOnly: (value)=> dispatch({type: ACE_INPUT_READONLY , payload: value})
    };
};


export default connect(mapStateToProps,mapDispatchToProps)(SessionPanel);