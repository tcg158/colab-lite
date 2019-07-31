import React,{Component} from "react";
import {Modal} from "react-bootstrap";
import {CLOSE_FORM, STAT_FORM} from "../../store/dataMapping/form";
import {SESSION_SOCKET} from "../../store/dataMapping/socket";
import connect from "react-redux/es/connect/connect";
import {withRouter} from "react-router";
import { Category, ChartComponent, ColumnSeries, Inject, LineSeries, SeriesCollectionDirective, SeriesDirective } from '@syncfusion/ej2-react-charts';



class Graph extends Component{
    state = {
        graphData : []
    };
    constructor() {
        super(...arguments);
        this.primaryxAxis = { title: 'Tasks', labelIntersectAction: 'Rotate90', valueType: 'Category' };
        this.primaryyAxis = { title: 'Ghosts (Pass in Task)', minimum: 0, maximum: 10, interval: 1 };
    }

    getData = ()=> {
        const socket = this.props.socket;
        socket.emit("task-data", (data) => {
            console.log(data);
            this.setState({graphData: data});
        });
    };

    render() {
        return(
            <Modal size="lg" {...this.props} style={{color:"black"}} onShow={this.getData} show={this.props.display} onHide={this.props.closeStatForm} aria-labelledby="contained-modal-title-vcenter" centered>
                <Modal.Header closeButton />
                <Modal.Body>
                    <ChartComponent id='charts' primaryXAxis={this.primaryxAxis} primaryYAxis={this.primaryyAxis}>
                        <Inject services={[ColumnSeries, LineSeries, Category]}/>
                        <SeriesCollectionDirective>
                            <SeriesDirective dataSource={this.state.graphData} xName='label' type='Column' yName='y' name='Sales'/>
                        </SeriesCollectionDirective>
                    </ChartComponent>
                </Modal.Body>
            </Modal>
        );
    }
}

const mapStateToProps = (combinedReducer)=>{
    return{
        display: combinedReducer.forms[STAT_FORM],
        socket: combinedReducer.sockets[SESSION_SOCKET]
    }
};
const mapDispatchToProps = (dispatch)=>{
    return{
        closeStatForm: ()=> dispatch({type:STAT_FORM, payload: CLOSE_FORM})
    };
};


export default connect(mapStateToProps,mapDispatchToProps)(withRouter(Graph));
