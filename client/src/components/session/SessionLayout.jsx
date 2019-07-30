import React, { Component } from 'react';
import { Col} from "react-bootstrap";
import '../../css/index.css';
import Draggable from 'react-draggable';
import AceEditor from 'react-ace';

import 'brace/mode/java';
import 'brace/mode/c_cpp';
import 'brace/theme/github';
import 'brace/theme/tomorrow';
import 'brace/theme/monokai';
import 'brace/theme/terminal';
import {connect} from "react-redux";
import {
    ACE_FONT_SIZE,
    ACE_THEME,
    ACE_INPUT_TEXT,
    ACE_OUTPUT_TEXT,
    ACE_OUTPUT_READONLY, ACE_CURRENT_USER_VIEW, ACE_INPUT_READONLY
} from "../../store/dataMapping/ace";
import {SESSION_SOCKET} from "../../store/dataMapping/socket";
import {GET_TASKS} from "../../store/dataMapping/form";

class SessionLayout extends Component{

    state={
        resizing:false,
        CodeSectionHeight:70,
        OutputSectionHeight:29.01,
    };

    componentDidMount() {
        const {socket} = this.props;
        socket.on("init-file", (textData)=>{
            this.props.handleChange(ACE_INPUT_TEXT, textData);
        });
        socket.on("init-tasks", (tasks)=>{
            tasks.forEach(function (task) {
                task["grade"] = null;
                task["messages"] = "";
            });
            this.props.getTasks(tasks);
        });
    }

    handleChange = (e)=>{
        this.props.changeAceInputText(e);
        const {socket} = this.props;
        socket.emit("update-file", e);
    };

    handleOutputChange = (e)=>{
        this.props.changeAceOutputText(e);
    };

    joinRoom = (event)=>{
        this.state.socket.emit("joinRoom",event);
    };

    send = (event)=>{
        this.state.socket.emit("sharedCode", event.target.id , event.target.value);
    };

    getDimensions=(el)=> {
        let rect=el.getBoundingClientRect();
        return {height:rect.height,y:rect.top};
    };

    resize = (e)=>{
        e.stopPropagation();
        e.preventDefault();
        let div = this.getDimensions(document.querySelector(".wrapper"));
        let Y_start = div.y;
        let h = div.height;
        let newHeight = Math.min((e.clientY - Y_start)/h*100,96);
        newHeight = Math.max(newHeight,4);
        this.setState({CodeSectionHeight:newHeight,OutputSectionHeight:99.01-newHeight-0.01});
    };

    render() {
        return(
            <Col xs={9}>
                <div className={"codingSection"}>
                    <div className={"content"} style={{height:this.state.CodeSectionHeight+"%"}}>
                        <AceEditor
                            id={"input"}
                            readOnly={this.props[ACE_INPUT_READONLY]}
                            value={this.props[ACE_INPUT_TEXT]}
                            onChange={this.handleChange}
                            fontSize={this.props[ACE_FONT_SIZE]+"px"}
                            mode="c_cpp"
                            width={"100%"}
                            height={"100%"}
                            theme={this.props[ACE_THEME]}
                            showPrintMargin={false}
                            name="input"
                            editorProps={{$blockScrolling: true}}
                            setOptions={{
                                enableBasicAutoCompletion: true,
                                enableLiveAutoCompletion: true,
                                enableSnippets: false,
                                showLineNumbers: true,
                                tabSize: 2,
                            }}
                        />
                    </div>
                    <Draggable axis="y" onDrag={(e)=> this.resize(e)} scale={0} bounds={{bottom: 10}}>
                        <div className={"handle"}/>
                    </Draggable>
                    <div className={"content"} style={{height:this.state.OutputSectionHeight+"%"}}>
                        <AceEditor
                            id={"output"}
                            onChange={this.handleOutputChange}
                            value={this.props[ACE_OUTPUT_TEXT]}
                            fontSize={this.props[ACE_FONT_SIZE]+"px"}
                            width={"100%"}
                            height={"100%"}
                            theme={this.props[ACE_THEME]}
                            /*showPrintMargin={false}*/
                            name="outputArea"
                            editorProps={{$blockScrolling: true}}
                            readOnly={this.props[ACE_OUTPUT_READONLY]}
                            showGutter={false}
                            highlightActiveLine={false}
                        />
                    </div>
                </div>
            </Col>
        );
    }
}

const mapStateTpProps=(combinedReducer)=>{
    return{
        [ACE_THEME]: combinedReducer.editor[ACE_THEME],
        [ACE_FONT_SIZE]: combinedReducer.editor[ACE_FONT_SIZE],
        [ACE_INPUT_TEXT]: combinedReducer.editor[ACE_INPUT_TEXT],
        [ACE_INPUT_READONLY]: combinedReducer.editor[ACE_INPUT_READONLY],
        [ACE_OUTPUT_READONLY]: combinedReducer.editor[ACE_OUTPUT_READONLY],
        [ACE_OUTPUT_TEXT]: combinedReducer.editor[ACE_OUTPUT_TEXT],
        [ACE_CURRENT_USER_VIEW]: combinedReducer.editor[ACE_CURRENT_USER_VIEW],
        socket: combinedReducer.sockets[SESSION_SOCKET]
    };
};
const mapDispatchTpProps=(dispatch)=> {
    return {
        handleChange: (type,value) => dispatch({type:type , payload: value}),
        getTasks: (tasks) => dispatch({type:GET_TASKS, payload: tasks}),
        changeAceOutputText: (text)=> dispatch({type: ACE_OUTPUT_TEXT, payload:text}),
        changeAceInputText: (text)=> dispatch({type: ACE_INPUT_TEXT, payload:text})
    };
};


export default connect(mapStateTpProps,mapDispatchTpProps)(SessionLayout);