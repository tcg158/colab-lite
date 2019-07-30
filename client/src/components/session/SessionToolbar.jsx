import React, { Component } from 'react';
import {Button, Nav, Row} from "react-bootstrap";
import {MDBIcon} from "mdbreact";
import {ACE_FONT_SIZE, ACE_OUTPUT_READONLY, ACE_OUTPUT_TEXT, ACE_THEME} from "../../store/dataMapping/ace";
import {connect} from "react-redux";
import {OPEN_FORM, TASK_CREATION_FORM, TASK_VIEW_FORM} from "../../store/dataMapping/form";
import TaskCreationForm from "../Tasks/TaskCreationForm";
import {MY_ROLE} from "../../store/dataMapping/sessionUsersData";
import TaskViewForm from "../Tasks/TaskViewForm";
import {SESSION_ID} from "../../store/dataMapping/session";
import {execute} from "../../store/actions/sessionActions/executeAction";


class SessionToolbar extends Component{

    handleChange= (e)=>{
        this.props.handleChange(e.target.id,e.target.value);
    };

    openForm = ()=>{
        if(this.props.role === "ghost") {
            this.props.openTaskViewForm();
        }
        else {
            this.props.openTaskCreationForm();
        }
    };

    run = ()=>{
        /*this.props.changeAceReadonly(false);*/
        this.props.execute({sessionId: this.props[SESSION_ID], inputs: [this.props[ACE_OUTPUT_TEXT]]});
    };


    render() {
        return(
            <Row className={"sessionBar"}>
                <Nav className="justify-content-end" activeKey="/home">
                    <Nav.Item style={{marginRight:"42%"}}>
                        {
                            this.props.role === "owner" || this.props.role === "mod" ? (<Button
                                href={"http://192.168.43.173:4213/reports/"+this.props.sessionId+"/grades-pdf"}
                                target={"_blank"}
                                style={{marginRight: "0px",color: "white"}}
                                variant={"outline-success"}>
                                My Grades
                            </Button>
                            ):("")
                        }
                    </Nav.Item>
                    <Nav.Item>
                        <span className="custom-dropdown small">
                            <select id={ACE_FONT_SIZE} onChange={this.handleChange} value={this.props[ACE_FONT_SIZE]}>
                                <option value={"10"}>10</option>
                                <option value={"12"}>12</option>
                                <option value={"14"}>14</option>
                                <option value={"16"}>16</option>
                                <option value={"18"}>18</option>
                                <option value={"20"}>20</option>
                                <option value={"22"}>22</option>
                                <option value={"24"}>24</option>
                            </select>
                        </span>
                    </Nav.Item>
                    <Nav.Item>
                        <span className="custom-dropdown small">
                            <select id={ACE_THEME} onChange={this.handleChange} value={this.props[ACE_THEME]}>
                                <option value={"tomorrow"}>tomorrow</option>
                                <option value={"github"}>github</option>
                                <option value={"monokai"}>monokai</option>
                                <option value={"terminal"}>terminal</option>
                            </select>
                        </span>
                    </Nav.Item>
                    <Nav.Item>
                        <Button className={"barButtons"} size={"sm"} variant={"success"} onClick={this.openForm}><MDBIcon icon="tasks" />  {this.props.role === "ghost" ? "View Task":"Create Task" }</Button>
                        <TaskCreationForm/>
                        <TaskViewForm/>
                    </Nav.Item>
                    <Nav.Item>
                        <Button className={"barButtons"} onClick={this.run} size={"sm"} variant={"success"}><MDBIcon icon="play" />{" Run"}</Button>
                    </Nav.Item>
                </Nav>
            </Row>
        );
    }
}

const mapStateTpProps=(combinedReducer)=>{
    return{
        [SESSION_ID]: combinedReducer.sessionData[SESSION_ID],
        [ACE_OUTPUT_TEXT]: combinedReducer.editor[ACE_OUTPUT_TEXT],
        [ACE_THEME]: combinedReducer.editor[ACE_THEME],
        [ACE_FONT_SIZE]: combinedReducer.editor[ACE_FONT_SIZE],
        role: combinedReducer.sessionData[MY_ROLE],
        sessionId: combinedReducer.sessionData[SESSION_ID]
    };
};
const mapDispatchTpProps=(dispatch)=> {
    return {
        handleChange: (type,value) => dispatch({type:type , payload: value}),
        openTaskCreationForm: ()=> dispatch({type:TASK_CREATION_FORM, payload: OPEN_FORM}),
        openTaskViewForm: ()=> dispatch({type:TASK_VIEW_FORM, payload: OPEN_FORM}),
        changeAceReadonly: (readonly)=> dispatch({type: ACE_OUTPUT_READONLY, payload: readonly}),
        execute: (data)=> dispatch(execute(data))
    };
};

export default connect(mapStateTpProps,mapDispatchTpProps)(SessionToolbar);