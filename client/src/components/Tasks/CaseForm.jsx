import React, {Component} from "react";
import {Form, Col, Row} from "react-bootstrap";
import {CASES} from "../../store/dataMapping/form";
import {connect} from "react-redux";
import {withRouter} from "react-router-dom";


class CaseForm extends Component{

    changeHandler = (e)=>{
      this.props.changeHandler(e.target.id, e.target.value,this.props.id);
    };

    render() {
        return(
            <div>
                <Form.Group controlId="inputs">
                    <Form.Label>Input</Form.Label>
                    <Form.Control as={"textarea"} value={this.props.data.input} onChange={this.changeHandler} type={"text"} rows="2" />
                </Form.Group>
                <Form.Group controlId="outputs">
                    <Form.Label>Output</Form.Label>
                    <Form.Control required rows="2" value={this.props.data.output} onChange={this.changeHandler} type={"text"} as={"textarea"} />
                </Form.Group>
                <Row>
                    <Col>
                        <Form.Control id={"weight"} value={this.props.data.weight} type={"number"} onChange={this.changeHandler} placeholder="Weight" />
                    </Col>
                    <Col>
                        <Form.Control id={"hint"} value={this.props.data.weight} onChange={this.changeHandler} placeholder="Hint" />
                    </Col>
                </Row>
                <hr style={{width:"100%"}}/>
            </div>
        );
    }
}

const mapStateToProps = (combinedReducer)=> {
    return{
        data: combinedReducer.forms[CASES]
    }
};
const mapDispatchToProps = (dispatch)=>{
  return{
      changeHandler: (type,value,index)=> dispatch ({type:type,payload:{value:value,index:index}})
  }
};
export default connect(mapStateToProps,mapDispatchToProps) (withRouter(CaseForm));