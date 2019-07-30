import React, { Component } from 'react';
import {Button, Col, Dropdown, DropdownButton, Form, Modal, Row} from "react-bootstrap";
import {CLOSE_FORM, TASK_GRADE, TASK_VIEW_FORM, TASKS} from "../../store/dataMapping/form";
import {connect} from "react-redux";
import {SESSION_ID} from "../../store/dataMapping/session";
import {SESSION_SOCKET} from "../../store/dataMapping/socket";

class TaskViewForm extends Component {

    state ={
        listTitle: "Select Task",
        selectedTaskID: 0
    };

    listChange = (e)=>{
        this.setState({listTitle: e.target.name, selectedTaskID: e.target.id});
    };

    submitTask = (e)=>{
        this.props.socket.emit("run-task", e.target.id, (taskResult)=>{
            this.props.updateTaskResult(taskResult);
        });
    };

    task =()=> {
        let task = null;
        this.props.data.forEach((iter)=>{
            if(iter.taskId === parseInt(this.state.selectedTaskID)){
                task = iter;
            }
        });
        if(task === null){
            return "";
        }
        else
        {
            return(
                <Form>
                    <Form.Group>
                        <Form.Label style={{marginLeft: "45%"}}><h6><b>{task.name}</b></h6></Form.Label>
                        <p>{task.description} </p>
                    </Form.Group>
                    <Form.Label><h6><u>Example</u></h6></Form.Label>
                    <Form.Group style={{width: "100%"}}>
                        <Form.Label>Input</Form.Label>
                        <Form.Text type="text" as={"textarea"} value={task.inputs.join(',').replace(',', '\n')}
                                   style={{resize: "none", width: "100%"}}/>
                    </Form.Group>
                    <Form.Group style={{width: "100%"}}>
                        <Form.Label>Output</Form.Label>
                        <Form.Text type
                                       ="text" as={"textarea"} value={task.outputs.join(',').replace(',', '\n')}
                                   style={{resize: "none", width: "100%"}}/>
                    </Form.Group>
                    <p>{(task.grade == null ? "":"Your Grade: "+task.grade+"%")}</p>
                    <p style={{color: "red", fontSize: 12}}>{task.messages}</p>
                    <Button id={task.taskId} variant={"outline-dark"} onClick={this.submitTask}>Submit</Button>
                    <hr style={{width: "100%"}}/>
                </Form>
            )
        }
    };

    render() {
        return (
            <Modal size="lg" {...this.props} style={{color:"black"}} show={this.props.display} onHide={this.props.closeTaskForm} aria-labelledby="contained-modal-title-vcenter" centered>
                <Modal.Header style={{backgroundColor:"#ededed"}} closeButton>
                    <Row style={{width: "100%"}}>
                        <Col md={{span:2}}>
                            <h3>Tasks</h3>
                        </Col>
                        <Col md={{span:2, offset:7}} style={{marginTop:2}}>
                            <DropdownButton variant={"dark"} className={"tasksList"} id={"tasksList"} title={this.state.listTitle}
                                            style={{width: "200px"}}>
                                {this.props.data.map((task)=>{
                                    return(
                                        <Dropdown.Item onClick={this.listChange} id={task.taskId} name={task.name}>{task.name}</Dropdown.Item>)
                                })}
                            </DropdownButton>
                        </Col>
                    </Row>
                </Modal.Header>
                <Modal.Body style={{width:"100%"}}>
                    {
                        this.task()
                    }
                </Modal.Body>
            </Modal>
        );
    }
}

const mapStateToProps = (combinedReducer)=>{
    return{
        socket: combinedReducer.sockets[SESSION_SOCKET],
        display: combinedReducer.forms[TASK_VIEW_FORM],
        data: combinedReducer.forms[TASKS],
        sessionId: combinedReducer.sessionData[SESSION_ID]
    }
};

const mapDispatchToProps = (dispatch)=>{
    return{
        closeTaskForm: ()=> dispatch({type:TASK_VIEW_FORM, payload: CLOSE_FORM}),
        updateTaskResult: (task)=> dispatch({type: TASK_GRADE , payload: task})
    };
};

export default connect(mapStateToProps,mapDispatchToProps)(TaskViewForm);