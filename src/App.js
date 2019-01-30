import React, { Component } from 'react';
import './App.css';
import { Grid, Jumbotron, Row, Col } from 'react-bootstrap';

import Configuration from './components/Configuration';
import MainGraph from './components/MainGraph';
import HeaderPanel from './components/HeaderPanel';
import PeriodPanel from './components/PeriodPanel';
import PresentationPanel from './components/PresentationPanel';
import StatusPanel from './components/StatusPanel';
import LoadingSpinner from './components/LoadingSpinner';
import {pad, getDate, getYearStart, getYearEnd, getMonthStart, getMonthEnd, getWeekStart, getWeekEnd, getYear,
    getDaysInMonth, getDayStart, getDayEnd, goBackInTime, goForwardInTime, getDaysBetween} from './utils/utils'

//import my_data from '../assets/data.json';
var my_2018_data = require('./assets/my_2018_data.json');
var my_month_data = require('./assets/my_month_data.json');
var my_today_data = require('./assets/my_today_data.json');

var QserverIP = "192.168.178.64"
var qbox_sn = "15-49-002-081"
var API_BASE = "http://"+QserverIP+"/api/getseries?sn=" + qbox_sn

var API_URL

const tickValues = {
    "hour" : ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11",
              "12", "13", "14", "15", "16", "17","18", "19", "20", "21", "22", "23"],
    "day" : ["Zondag", "Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag", "Zaterdag"],
    "month" : ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dec"]
}

export function createCustomTickvalues(from,to,interval) {
    let days = getDaysBetween(from,to)
    let tv = new Array(days)
    var i;
    for (i = 0; i < tv.length; i++) {
        tv[i] = i+1
    }

    //alert('createCustomTickValues('+days+') = '+tv.toString())
    return tv
}

class App extends Component {

    constructor(props) {
        super(props);

        this.state = {
            presentation: 'Gas',
            dataset : 'Gas',
            period : "today",
            from : getDayStart(new Date()),
            to   : getDayEnd(new Date()),
            range  : "Dag",
            resolution : "Hour",
            tickValues : tickValues["hour"],
            status : 'idle'}
    }


    // get the data from the api
    fetchData = (API_URL) => {
        //alert('fetchData: '+(API_URL))
        this.setState({
            status: 'fetching',
        })
        fetch(API_URL)
            .then(results => {
                return results.json();
            })
            .then(data => {
                let myData = data;
                this.setState({
                    fetchedData: myData,
                    status : 'fetched'})
            })
            .catch(function() {
                alert("fetch to "+API_URL+ " failed.");
            })
        }

     // simulating the fetch with data from the assets folder
     fetchData0 = (API_URL) => {
         alert("DEMO DATA")
         let my_data
         if (this.state.period === '2018') {
            my_data = my_2018_data
         } else
         if (this.state.period === 'this_month') {
             my_data = my_month_data
         } else
         if (this.state.period === 'today') {
             my_data = my_today_data
         }

         this.setState({fetchedData: my_data,
                        presentation: 'Gas',
                        dataset : 'Gas',
                        status  : 'fetched'})
     }


    // this function is called when the period choices change
    handleConfigChange = (ip, sn) => {
        API_BASE = "http://"+ip+"/api/getseries?sn=" + sn
        API_URL = API_BASE+ "&from=" + this.state.from + "&to=" + this.state.to + "&resolution=" + this.state.resolution
        this.fetchData(API_URL)
    }

    // this function is called when the presentation choice changes (gas, stroom, netto, etc)
    handlePresentationChoice = (presentation, dataset) => {
        //alert('handlePresentationChoice : '+presentation+ ','+dataset)
        this.setState({
            presentation: presentation,
            dataset: dataset,
        });
    }


    // this function is called when a bar n the graph is clicked
    // depending on the 'range' it will zoom into the next range (year, month, day)
    handleZoom = (i) => {
        //alert('app.handleZoom:' +i)

        let year = getYear(this.state.from).toString()
        let from = year+'-'+pad((i+1).toString(),2)+'-01'
        let days = getDaysInMonth(from).toString()

        let to = year+'-'+pad((i+1).toString(),2)+'-'+days
        let resolution = "Day"
        let tv = createCustomTickvalues(from,to,resolution)
        //alert(tv)

        API_URL = API_BASE+ "&from=" + from + "&to=" + to + "&resolution=" + resolution
        //alert(API_URL)
        this.fetchData(API_URL)

        this.setState({
            from: from,
            to: to,
            period : "maand",
            range : "Maand",
            resolution : resolution,
            tickValues : tv
        });

    }


    // this function is called when the period choices change
    handleChangeDate = (from, to) => {
        //alert('app.handleChangeDate:' +from+','+to)

        // make this changable later
        let resolution = "Day"
        let tv = createCustomTickvalues(from,to,resolution)
        //alert(tv)
        API_URL = API_BASE+ "&from=" + from + "&to=" + to + "&resolution=" + resolution
        this.fetchData(API_URL)

        this.setState({
            from: from,
            to: to,
            period : "custom",
            range : "custom",
            resolution : resolution,
            tickValues : null
        });
    }


    // this function is called when a different time period is selected.
    // it then also does a new fetch of the data.
    handlePeriodChoice = (period) => {
        let from
        let to
        let range
        let resolution
        let tv

        if (period==='this_year') {
            from = getYearStart(new Date())
            to = getYearEnd(new Date())
            range = "Jaar"
            resolution = "Month"
            tv = tickValues["month"]
        }

        if (period==='this_month') {
            from = getMonthStart(new Date())
            to   = getMonthEnd(new Date())
            range = "Maand"
            resolution = "Day"
            tv = null
        }

        if (period==='this_week') {
            from = getWeekStart(new Date())
            to   = getWeekEnd(new Date())
            range = "Week"
            resolution = "Day"
            tv = tickValues["day"]
        }

        if (period==='today') {
            from = getDayStart(new Date())
            to   = getDayEnd(new Date())
            range = "Dag"
            resolution = "Hour"
            tv = tickValues["hour"]
        }

        // depending go back 1 'resolution
        if (period==='back') {
            from = goBackInTime(this.state.from,this.state.range)
            to   = goBackInTime(this.state.to,this.state.range)
            range = this.state.range
            resolution = this.state.resolution
            tv = this.state.tickValues
        }

        // depending go back 1 'resolution
        if (period==='forward') {
            from = goForwardInTime(this.state.from,this.state.range)
            to   = goForwardInTime(this.state.to,this.state.range)
            range = this.state.range
            resolution = this.state.resolution
            tv = this.state.tickValues
        }

        //alert('from = '+from+', to = '+to)
        API_URL = API_BASE + "&from=" + from + "&to=" + to + "&resolution=" + resolution

        this.fetchData(API_URL)

        this.setState({
            from       : from,
            to         : to,
            period     : period,
            range      : range,
            resolution : resolution,
            tickValues : tv,
        })
    }

    // this function is called when the resolution has changed (Month, Day, Hour)
    // the x-axis labels (tickValues) should change accordingly
    handleResolutionChoice = (resolution) => {
        this.setState({
            resolution: resolution,
            tickValues: tickValues[resolution],
        });
    }

    // fetch the data
    componentWillMount() {
        console.log("componentWillMount()")

        // read the QserverIP and Qbos serial number from the localstorage
        // this is unique per user and stored in the broswer.
        QserverIP = localStorage.getItem('QserverIP');
        qbox_sn = localStorage.getItem('QboxSN')

        if (QserverIP==null) {
            alert("QserverIP is nog niet ingevuld. Gebruik de Configuratie knop.")

        } else {
            API_BASE = "http://"+QserverIP+"/api/getseries?sn=" + qbox_sn
            API_URL = API_BASE + "&from=" + this.state.from + "&to=" + this.state.to + "&resolution=" + this.state.resolution
            this.fetchData(API_URL)
        }
        //this.readData()   //read test data
    }

    render() {
        let renderGraph
        let renderConfiguration

        // conditional render, only render the GUI when there is data fetched.
        if (this.state.status==='fetched') {
            //alert('render: this.state.tickvalues = '+this.state.tickValues)
            renderGraph = <MainGraph state = {this.state} handleZoom={this.handleZoom}/>
        } else {
            // fill in IP and serialnumber
            //renderConfiguration=  <Configuration ip = "192.168.178.64" sn = "15-49-002-081" gp = "0.63" ep = "0.2" show="true" />
        }
        const loading = this.state.status === 'fetching'

        return (
        <div>

            <Jumbotron>
                <Grid>
                    <Row className="show-grid">
                        <Col xs={6} md={4}>
                            <HeaderPanel/>
                            <PeriodPanel
                                from={this.state.from}
                                to={this.state.to}
                                range={this.state.range}
                                resolution={this.state.resolution}
                                handleChoice={this.handlePeriodChoice}
                                handleChangeDate={this.handleChangeDate}
                            />
                            <PresentationPanel handleChoice={this.handlePresentationChoice} />
                            <StatusPanel state={this.state} handleConfigChange={this.handleConfigChange} />
                        </Col>
                        <Col xs={12} md={8}>
                            {loading ? <LoadingSpinner /> :
                                <div>
                                    {renderConfiguration}
                                    {renderGraph}
                                </div>
                            }
                        </Col>
                    </Row>
                </Grid>
            </Jumbotron>
            <small> (C) 2019 - Nico Vermaas</small>
        </div>
        );
    }
}

export default App;
