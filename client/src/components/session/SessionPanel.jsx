import React, { Component } from 'react';
import {
    Accordion, Button,
    Card,
    Col,
    DropdownButton,
    Dropdown,
    Form, FormControl,
    InputGroup,
    ProgressBar,
    Row, Nav , Tab
} from 'react-bootstrap';
import {connect} from "react-redux";
import {SESSION_SOCKET} from "../../store/dataMapping/socket";
import {GET_PROFILE_PIC} from "../../store/dataMapping/serverURLs";
import {SESSION_CONNECTED_USERS, SESSION_USER_ROLE} from "../../store/dataMapping/session";
import {USERNAME} from "../../store/dataMapping/user";
import {MY_ROLE} from "../../store/dataMapping/sessionUsersData";
import {ACE_INPUT_READONLY} from "../../store/dataMapping/ace";

class SessionPanel extends Component{


    state =  {
        activeUser: localStorage.getItem(USERNAME),
        activePermissions: "",
        [SESSION_CONNECTED_USERS]: [],
        inviteeUser: "",
        msg: "",
    };

    invite=()=>{
        const {socket} = this.props;
        socket.emit("invite", this.state.inviteeUser,(success)=>{
            if(success) this.setState({msg:"  Successful Invitation"});
            else this.setState({msg:"  *No Such User"});
        });
    };

    componentDidMount() {
        const {socket} = this.props;
        socket.on("current-users",(users, role ,callback)=>{
            this.props.setMyRole(role, ()=>{
                let dataSource = users.map((user)=> {
                    return{
                        ...user,
                        className: "user",
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
                        className: "user",
                        disabled: false,
                        grade: 0
                    }];
                console.log(dataSource);
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
        console.log(dataSource);
    };

    watchUser = (e)=>{
        this.setState({activeUser : e.currentTarget.name});
        if(this.props[MY_ROLE] === "ghost" && localStorage.getItem(USERNAME) !== e.currentTarget.name) {
            this.props.updateEditorInputReadOnly(true);
        } else {
            this.props.updateEditorInputReadOnly(false);
        }
        const {socket} = this.props;
        socket.emit("watch-user", e.currentTarget.name);
    };

    changePermission = (e)=>{
        const {socket} = this.props;
        socket.emit("set-permission", e.target.name, e.target.value);
    };

    ownerComponent = (data)=>{
        return (
            <Nav.Item disabled={data["disabled"]}>
                <Row>
                    <Col md={{span:2,offset:1}}>
                        <Accordion.Toggle name={data[USERNAME]} onClick={this.changeClass} className={data.className} eventKey={data[USERNAME]}/>
                    </Col>
                    <div className={"mydiv"}>
                        <Nav.Link name={data[USERNAME]} eventKey={data[USERNAME]}  variant={"success"} onClick={this.watchUser} style={{height: "100%", padding:0}}>
                            {/*<a id={data[USERNAME]} onClick={this.watchUser} className={"parent"}>*/}
                            <img className="eimage" src={ GET_PROFILE_PIC+data[USERNAME] }/>
                            <div className="ename">{data[USERNAME]}</div>
                            <div className="ejob">{data[SESSION_USER_ROLE]}</div>
                            {data[SESSION_USER_ROLE] === "ghost"?
                                <div className={"progressbarDiv"}>
                                    <ProgressBar className={"progressbar"} now={data.grade} label={data.grade+"%"} variant={"info"}/>
                                </div>: <></>}
                        </Nav.Link>
                    </div>
                </Row>
                {data[SESSION_USER_ROLE] !== "owner"?
                    <Accordion.Collapse eventKey={data[USERNAME]}>
                        <Form.Group className={"formGroup"}>
                            <Form.Check id={data[USERNAME]+"mod"} className={"formGroupItem"} custom={true} value={"mod"}
                                        type="radio" label="Moderator" name={data[USERNAME]}
                                        defaultChecked={data[SESSION_USER_ROLE] === "mod"}
                                        onClick={this.changePermission}/>
                            <Form.Check id={data[USERNAME]+"gh  ost"} className={"formGroupItem"} custom={true} value={"ghost"}
                                        type="radio" label="Ghost" name={data[USERNAME]}
                                        defaultChecked={data[SESSION_USER_ROLE] === "ghost"}
                                        onClick={this.changePermission}/>
                        </Form.Group>
                    </Accordion.Collapse>:<></>
                }
            </Nav.Item>
        );
    };

    ghostComponent = (data)=> {
        return(
            <Nav.Item disabled={data["disabled"]}>
                <Row>
                    <Col md={{span:2,offset:1}}>
                        <Accordion.Toggle name={data[USERNAME]} onClick={this.changeClass} variant={"link"} className={data.className} eventKey={data[USERNAME]}/>
                    </Col>
                    <div className={"mydiv"}>
                        <Nav.Link name={data[USERNAME]} eventKey={data[USERNAME]} onClick={this.watchUser} style={{height: "100%",padding:0}}>
                            {/*<a id={data[USERNAME]} onClick={this.watchUser} className={"parent"}>*/}
                            <img className="eimage" src={ GET_PROFILE_PIC+data[USERNAME] }/>
                            <div className="ename">{data[USERNAME]}</div>
                            <div className="ejob">{data[SESSION_USER_ROLE]}</div>
                            {data[SESSION_USER_ROLE] === "ghost"?
                                <div className={"progressbarDiv"}>
                                    <ProgressBar className={"progressbar"} now={data.grade} label={data.grade+"%"} variant={"info"}/>
                                </div>: <></>}
                        </Nav.Link>
                    </div>
                </Row>
            </Nav.Item>
        );
    };

    showTaskGrades = (e)=>{
        this.props.socket.emit("task-grades",e.target.id,(users)=>{
            users.forEach((user)=>{
                this.updateUsers(USERNAME, user.username, "grade" , user.grade);
            });
            console.log("af",this.state[SESSION_CONNECTED_USERS]);
        });
    };

    changeClass = (e)=>{
        this.setState({activePermissions: e.target.name !== this.state.activePermissions ? e.target.name : ""});
        this.updateUsers(USERNAME,e.target.name,"className", e.target.className === "user"? "user toggled":"user");
    };

    changeHandling = (e)=>{
        this.setState({[e.target.id]: e.target.value});
    };


    render() {
        return(
            <Col xs={3}>
                <div className={"panelSection"}>
                    <Card.Header as={"h4"}>
                        Users
                        <DropdownButton disabled={this.props.tasks.length === 0} variant={"success"} id="grades" title="Grades" style={{float:"right",marginTop: "-5px", marginRight:" -8px"}}>
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
                    <Tab.Container id="tabs" activeKey={this.state.activeUser}>

                        <Accordion activeKey={this.state.activePermissions}>
                            <Nav variant="pills success" className="flex-column">

                                {this.state[SESSION_CONNECTED_USERS].length > 0 && this.state[SESSION_CONNECTED_USERS].map((user)=>{
                                    return this.props[MY_ROLE] === "ghost"? this.ghostComponent(user): this.ownerComponent(user);
                                })}
                            </Nav>
                        </Accordion>
                    </Tab.Container>

                    <div style={{display:"flex", flexDirection: "column"}}>
                        <InputGroup style={{position:"absolute",bottom:4}} className="mb-3">
                            <FormControl
                                id={"inviteeUser"}
                                placeholder="Recipient's username"
                                onChange={this.changeHandling}
                            />
                            <InputGroup.Append>
                                <Button id="invite" variant={"success"} onClick={this.invite}>Invite</Button>
                            </InputGroup.Append>
                        </InputGroup>
                        <small style={{position:"absolute",bottom:4 , float:"right"}}>{this.state.msg}</small>
                    </div>
                </div>
            </Col>
        );
    }
}
const mapStateToProps = (combinedReducer)=> {
    return {
        tasks: combinedReducer.forms.tasks,
        socket: combinedReducer.sockets[SESSION_SOCKET],
        [MY_ROLE]: combinedReducer.sessionData[MY_ROLE]
    }
};
const mapDispatchToProps = (dispatch)=>{
    return {
        updateSessionUsers: (users)=> dispatch({type: SESSION_CONNECTED_USERS , payload: users}),
        setMyRole: (role,callback) => {
            dispatch({type: MY_ROLE, payload: role});
            callback();
        },
        updateEditorInputReadOnly: (value)=> dispatch({type: ACE_INPUT_READONLY , payload: value})
    };
};


export default connect(mapStateToProps,mapDispatchToProps)(SessionPanel);