import React,{Component} from "react";
import {Row, Col, Accordion, Card, Button, FormControl, InputGroup} from "react-bootstrap";
import {MDBIcon} from "mdbreact";
import {connect} from "react-redux";
import {DEFAULT_SOCKET} from "../../store/dataMapping/socket";
import {PUBLIC_SESSIONS} from "../../store/dataMapping/session";
import io from "socket.io-client";

class dashboard extends Component{

    state = {
        sessionName:""
    };


    handleChange = (e)=>{
        this.setState({sessionName: e.target.value});
    };

    createSession = async ()=>{
        await this.props[DEFAULT_SOCKET].emit("create-session",this.state.sessionName);
        const socket = io.connect(
            "/"+this.state.sessionName,
            {query:'uname='+localStorage.getItem("username")
            });
        if(socket)
        {
            socket.on('error', ()=>{
                this.setState({errorMsg: "Username already exists"});
                console.log('Connection Failed');
            });
            socket.on('connect', ()=>{
                this.props.history.push("/session/"+this.state.sessionName);
                console.log('Connected');
            });
            socket.on('disconnect', ()=> {
                console.log('Disconnected');
            });
        }
    };

    joinSession= ()=>{

    };

    render(){
        return(
            <div style={{margin:"auto",width:"90%"}}>
                <div style={{margin:"auto",width:520}}>
                    <InputGroup size={"sm"}>
                        <FormControl
                            onChange={this.handleChange}
                            style={{marginTop:"5%"}}
                            placeholder="Session Name"
                        />
                        <InputGroup.Append
                            style={{marginTop:"5%"}}>
                            <Button onClick={this.createSession}>Create</Button>
                        </InputGroup.Append>
                    </InputGroup>
                </div>
                <Accordion style={{marginTop: 30,color:"black"}}>
                        <Card>
                            <Accordion.Toggle as={Card.Header} eventKey={"session[SESSION_ID]"}>
                                <Row>
                                    <Col md={{span:4}}>{"Session Name"}</Col>
                                    <Col md={{span:3,offset:5}}><MDBIcon icon="info-circle" />{"  More Information"}</Col>
                                </Row>
                            </Accordion.Toggle>
                            <Accordion.Collapse eventKey={"session[SESSION_ID]"} style={{paddingRight:"1%"}}>
                                <Row style={{marginTop:"1%", marginBottom:"1%"}}>
                                    <Col md={{span: 2,offset:2}}>
                                        <h6> Owner </h6>
                                    </Col>
                                    <Col md={{span: 2,offset:3}}>
                                        <Button href="#" style={{fontSize: 18, background:"none",color:"black",border:"none"}}>
                                            <MDBIcon icon="sign-in-alt"/>{"  Join "}
                                        </Button>
                                    </Col>
                                    <Col md={{offset:3}}/>
                                </Row>
                            </Accordion.Collapse>
                        </Card>
                </Accordion>
            </div>
        );
    }
}
const mapStateToProps = (rootReducer)=> {
    return{
        [DEFAULT_SOCKET]: rootReducer.sockets[DEFAULT_SOCKET],
        [PUBLIC_SESSIONS]: rootReducer.sessionStorage[PUBLIC_SESSIONS]
    }
};

const mapDispatchToProps = (dispatch)=>{
    return{
        createSession: ()=> dispatch
    }
};
export default connect(mapStateToProps,mapDispatchToProps)(dashboard);