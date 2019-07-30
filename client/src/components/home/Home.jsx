import React, {Component} from 'react';
import {InputGroup, FormControl, Button, Image} from 'react-bootstrap';
import {connect} from "react-redux";
import {login} from "../../store/actions/handshake";
import Form from "react-bootstrap/Form";

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

    logIn = (e)=>{
        if(e.currentTarget.checkValidity()) {
            e.preventDefault();
            this.props.logIn(this.state.username,()=>{
                this.props.history.push("/dashboard");
            });
        }

    };

    render() {
        return (
            <Form onSubmit={this.logIn} validated={true} className={"homeImage"}>
                <Image
                    width={320}
                    height={180}
                    src={process.env.PUBLIC_URL + "/logo.png"}
                />
                <InputGroup size={"lg"}>
                    <FormControl
                        required
                        onChange={this.handleChange}
                        style={{marginTop:"20%"}}
                        placeholder="Username"
                    />
                    <InputGroup.Append
                        style={{marginTop:"20%"}}>
                        <Button type={"submit"}>Enter</Button>
                    </InputGroup.Append>
                </InputGroup>
                <small>{this.props.errorMsg}</small>
            </Form>
        );
    }
}

const mapStateToProps = (rootReducer)=> {
    return{
        errorMsg: rootReducer.user.errorMsg
    }
};

const mapDispatchToProps = (dispatch)=>{
    return{
        changeBackGroundImage: (type, value)=> dispatch({type: type, payload:value}),
        logIn: (username,callback)=> dispatch(login(username,callback))
    };
};

export default connect(mapStateToProps,mapDispatchToProps)(Home);