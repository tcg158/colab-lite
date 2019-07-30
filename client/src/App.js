import React, { Component } from 'react';
import {BrowserRouter , Route , Switch} from "react-router-dom";
import Home from "./components/home/Home";
import Dashboard from "./components/dashboard/Dashboard";
import Session from "./components/session/Session";
import {connect} from "react-redux";


class App extends Component {



    render() {
        return (
            <BrowserRouter>
                <div style={{backgroundImage: this.props.backgroundImage,backgroundSize: "cover", height: "100%"}}>
                    <Switch>
                        <Route exact path="/" component={Home}/>
                        <Route exact path="/dashboard" component={Dashboard}/>
                        <Route exact path="/session/:sessionId" component={Session}/>
                    </Switch>
                </div>
            </BrowserRouter>
    );
  }
}
const mapStateToProps = (rootReducer)=>{
    return{
        backgroundImage: rootReducer.sockets.backgroundImage
    }
};

export default connect(mapStateToProps)(App);
