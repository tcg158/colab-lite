import React, {Component} from 'react';
import {InputGroup, FormControl, Button, Image} from 'react-bootstrap';
import {connect} from "react-redux";
import {CONNECT_TO_DEFAULT_SOCKET, DEFAULT_SOCKET} from "../../store/dataMapping/socket";
import {PUBLIC_SESSIONS} from "../../store/dataMapping/session";
import io from "socket.io-client";
import {AUTHENTICATED} from "../../store/dataMapping/auth";

class Home extends Component {
    state={
        username: "",
        errorMsg: ""
    };
    componentWillMount() {
        this.props.changeBackGroundImage("backgroundImage", "url('colab15.jpg')");
    }

    componentWillUnmount() {
        this.props.changeBackGroundImage("backgroundImage","");
    }

    handleChange = (e)=>{
        this.setState({username: e.target.value});
    };

    connect = ()=>{
        this.props.connect(this.state.username);
    };

    render() {
        return (
            <div className={"homeImage"}>
                <Image
                    width={320}
                    height={180}
                    src={process.env.PUBLIC_URL + "/logo.png"}
                />
                <InputGroup size={"lg"}>
                    <FormControl
                        onChange={this.handleChange}
                        style={{marginTop:"20%"}}
                        placeholder="Username"
                    />
                    <InputGroup.Append
                        style={{marginTop:"20%"}}>
                        <Button onClick={this.connect}>Enter</Button>
                    </InputGroup.Append>
                </InputGroup>
                <small>{this.state.errorMsg}</small>
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
        changeBackGroundImage: (type, value)=> dispatch({type: type, payload:value}),
        logIn: (username)=> dispatch({type:AUTHENTICATED, payload: username})
    };
};

export default connect(mapStateToProps,mapDispatchToProps)(Home);