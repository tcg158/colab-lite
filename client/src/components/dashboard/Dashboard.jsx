import React,{Component} from "react";
import {Row, Col, Accordion, Card, Button, FormControl, InputGroup, Form} from "react-bootstrap";
import {MDBIcon} from "mdbreact";
import {connect} from "react-redux";
import io from "socket.io-client";
import {AUTHENTICATE, AUTHENTICATED, DEAUTHENTICATE} from "../../store/dataMapping/auth";
import {Redirect} from "react-router";

class dashboard extends Component{

    state = {
        socket: null,
        sessionName:"",
        errorMsg: "",
        sessions: []
    };

    componentWillMount() {
        if(!sessionStorage.getItem("username"))
            return;
        const socket = io.connect("/",{query:'uname='+sessionStorage.getItem("username")});
        if(socket)
        {
            socket.on('error', ()=>{
                console.log('Connection Failed');
            });
            socket.on('connect', ()=>{
                if(!this.props[AUTHENTICATED]) {
                    this.props.connect();
                }
                console.log('Connected');
            });
            socket.on('disconnect', ()=> {
                console.log("Disconnect");
            });
            socket.on("current-sessions",(sessions)=>{
                this.setState({sessions: sessions});
            });
            socket.on("new-session",(session)=>{
                const arr = this.state.sessions;
                arr.push(session);
                this.setState({sessions: arr});
            });
        }
        this.setState({socket: socket})
    }

    handleChange = (e)=>{
        this.setState({sessionName: e.target.value});
    };

    createSession = (e)=>{
        if(e.currentTarget.checkValidity()) {
            e.preventDefault();
            this.state.socket.emit("create-session",this.state.sessionName,(success)=>{
                if(success)
                    this.props.history.push("/session/"+this.state.sessionName);
                else
                    this.setState({errorMsg: "name already taken"});
            });
        }
    };

    render(){
        if(!this.props[AUTHENTICATED] && !sessionStorage.getItem("username"))
            return <Redirect to={"/"}/>;
        return(
            <div style={{margin:"auto",width:"90%"}}>
                <Form id={"create"} onSubmit={this.createSession} validated={true} style={{margin:"auto",width:520}}>
                    <InputGroup size={"sm"}>
                        <FormControl
                            required
                            onChange={this.handleChange}
                            style={{marginTop:"5%"}}
                            placeholder="Session Name"
                        />
                        <InputGroup.Append
                            style={{marginTop:"5%"}}>
                            <Button form="create" type={"submit"}>Create</Button>
                        </InputGroup.Append>
                    </InputGroup>
                    <small>{this.state.errorMsg}</small>
                </Form>
                <Accordion style={{marginTop: 30,color:"black"}}>
                    {this.state.sessions && this.state.sessions.map((session)=> {
                        return (
                            <Card>
                                <Accordion.Toggle as={Card.Header} eventKey={session.sname}>
                                    <Row>
                                        <Col md={{span:4}}>{session.sname}</Col>
                                        <Col md={{span:3,offset:5}}><MDBIcon icon="info-circle" />{"  More Information"}</Col>
                                    </Row>
                                </Accordion.Toggle>
                                <Accordion.Collapse eventKey={session.sname} style={{paddingRight:"1%"}}>
                                    <Row style={{marginTop:"1%", marginBottom:"1%"}}>
                                        <Col md={{span: 2,offset:2}}>
                                            <h6> Owner </h6>
                                            {session.owner}
                                        </Col>
                                        <Col md={{span: 2,offset:3}}>
                                            <Button href={"/session/"+session.sname} style={{fontSize: 18, background:"none",color:"black",border:"none"}}>
                                                <MDBIcon icon="sign-in-alt"/>{"  Join "}
                                            </Button>
                                        </Col>
                                        <Col md={{offset:3}}/>
                                    </Row>
                                </Accordion.Collapse>
                            </Card>
                        )})}
                </Accordion>
            </div>
        );
    }
}
const mapStateToProps = (rootReducer)=> {
    return{
        [AUTHENTICATED]: rootReducer.user[AUTHENTICATED]
    }
};

const mapDispatchToProps = (dispatch)=>{
    return{
        disconnect: ()=> dispatch({type: DEAUTHENTICATE}),
        connect: ()=> dispatch({type: AUTHENTICATE})
    }
};
export default connect(mapStateToProps,mapDispatchToProps)(dashboard);