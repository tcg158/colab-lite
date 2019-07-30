import React, { Component } from 'react';
import {Button, Form, Modal} from "react-bootstrap";
import {ADD_CASE, CASES, CLOSE_FORM, TASK_CREATION_FORM} from "../../store/dataMapping/form";
import {connect} from "react-redux";
import {withRouter} from "react-router-dom";
import CaseForm from "./CaseForm";
import {MDBIcon} from "mdbreact";
import {SESSION_SOCKET} from "../../store/dataMapping/socket";

class TaskCreationForm extends Component {

    componentDidMount() {
        this.props.addCase();
    }

    id = 0;
    state = {
        taskName:"",
        taskDescription: "",
        taskHints:"",
        cases: [<CaseForm id={this.id}/>]
    };

    changeHandler = (e)=>{
        this.setState({[e.target.id] : e.target.value});
    };

    addCase = ()=>{
        this.id = this.id +1;
        const newCase = <CaseForm id={this.id}/>;
        this.props.addCase();
        this.setState({
            cases:[
                ...this.state.cases,
                newCase
            ]
        })
    };

    submitTask = ()=>{
        let cases = [];
        this.props.data.forEach(function (item) {
            let inputs = item.inputs.split('\n');
            let outputs = item.outputs.split('\n');
            let tmp = {inputs:inputs, outputs:outputs};
            let weight = (item.weight === null);
            let hint = (item.hint === "");
            if(!weight)
                tmp["weight"] = item.weight;
            if(!hint)
                tmp["hint"] = item.hint;
            cases.push(tmp);
        });
        const task =
            {
                "name": this.state.taskName,
                "description": this.state.taskDescription,
                "cases": cases
            };
        const {socket} = this.props;
        socket.emit("create-task", task);
        this.props.closeTaskForm();
    };

    render() {
        return (
            <Modal size="lg" {...this.props} style={{color:"black"}} show={this.props.display} onHide={this.props.closeTaskForm} aria-labelledby="contained-modal-title-vcenter" centered>
                <Modal.Header closeButton >
                    <Modal.Title id="contained-modal-title-vcenter">
                        <h4>Create Task</h4>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body >
                    <Form validated={true}>
                        <Form.Group>
                            <Form.Label>Task Name</Form.Label>
                            <Form.Control required type="text" value={this.state.taskName} id={"taskName"} onChange={this.changeHandler} placeholder="Task Name"/>
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Description</Form.Label>
                            <Form.Text required as={"textarea"} value={this.state.taskDescription} id={"taskDescription"} onChange={this.changeHandler} rows="4" style={{width:"100%"}} type="text" placeholder="Description" />
                        </Form.Group>
                        <hr style={{width:"100%"}}/>
                        <Form.Group >
                                <h5>Cases</h5>
                            <div id={"cases"} ref={"cases"}>
                                {this.state.cases.map(caseChild => caseChild)}
                            </div>
                            <Form.Label>
                                <a style={{cursor:"pointer"}} onClick={this.addCase}><MDBIcon icon="plus-square" />   Add New Case</a>
                            </Form.Label>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer >
                    <Button variant={"success"} onClick={this.submitTask}>Add</Button>
                </Modal.Footer>
            </Modal>
        );
    }
}

const mapStateToProps = (combinedReducer)=>{
    return{
        display: combinedReducer.forms[TASK_CREATION_FORM],
        data: combinedReducer.forms[CASES],
        socket: combinedReducer.sockets[SESSION_SOCKET]
    }
};

const mapDispatchToProps = (dispatch)=>{
    return{
        addCase: ()=> dispatch({type:ADD_CASE}),
        closeTaskForm: ()=> dispatch({type:TASK_CREATION_FORM, payload: CLOSE_FORM})
    };
};

export default connect(mapStateToProps,mapDispatchToProps)(withRouter(TaskCreationForm));