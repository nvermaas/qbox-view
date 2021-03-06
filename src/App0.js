import React, { Component } from 'react';
import './App.css';
import { Container, Jumbotron, Row, Col } from 'react-bootstrap';

import './MyHandlers'
import MainGraph from './components/MainGraph';
import HeaderPanel from './components/HeaderPanel';
import LiveView from './components/LiveView';
import PeriodPanel from './components/PeriodPanel';
import PresentationPanel from './components/PresentationPanel';
import StatusPanel from './components/StatusPanel';
import LoadingSpinner from './components/LoadingSpinner';
import {pad, getYearStart, getYearEnd, getMonthStart, getMonthEnd, getWeekStart, getWeekEnd, getYear, getMonth,
    addDays, getDayStart, getDayEnd, goBackInTime, goForwardInTime } from './utils/DateUtils'
import { tickValues, createCustomTickvalues } from './utils/common';

var MyEnergyServerIP = "192.168.178.64"
var API_MY_ENERGY_SERVER = "http://"+MyEnergyServerIP+"/my_energy/"
var API_BASE = API_MY_ENERGY_SERVER + "api/getseries"
var API_URL

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


    // this function is called when the IP address is changed in the configuration screen
    handleConfigChange = (ip) => {
        API_MY_ENERGY_SERVER = "http://"+ip+"/my_energy/"
        API_BASE = API_MY_ENERGY_SERVER + "api/getseries"
        API_URL = API_BASE+ "?from=" + this.state.from + "&to=" + this.state.to + "&resolution=" + this.state.resolution
        this.fetchData(API_URL)
    }

    // this function is called when the presentation choice changes (gas, power, etc)
    handlePresentationChoice = (presentation, dataset) => {
        this.setState({
            presentation: presentation,
            dataset: dataset,
        });
    }


    // this function is called when a bar n the graph is clicked
    // depending on the 'range' it will zoom into the next range (year, month, day)
    handleZoom = (i) => {
        //alert('app.handleZoom:' + i + 'this.state.resolution = ' + this.state.resolution)
        let from = this.state.from
        let to = this.state.to
        let resolution = this.state.resolution
        let range = this.state.range
        let tv = this.state.tv

        // only range year, month and day are valid, because for custom ranges it is not known
        // to which month, day the 'index' points when clicking a bar
        if (this.state.range === 'custom') {
            return
        }

        // clicked on a month bar in a Year overview
        if (this.state.resolution === 'Month') {
            range = 'Maand'
            let month = i+1
            let year = getYear(this.state.from).toString()
            from = year + '-' + pad((month).toString(), 2) + '-01'

            from = getMonthStart(from)
            to = getMonthEnd(from)
            resolution = "Day"
            tv = createCustomTickvalues(from, to, resolution)
        } else

        // clicked on a day bar in a month overview
        if (this.state.resolution === 'Day') {
            if (this.state.range==='Week') {
                from = this.state.from
                from = addDays(from,i)
                to = addDays(from,1)
            } else {
                let day = i+1
                let year = getYear(this.state.from).toString()
                let month = pad(getMonth(this.state.from).toString(),2)
                from = year + '-' + month+ '-'+pad((day).toString(), 2)
                to = year + '-' + month+ '-'+pad((day+1).toString(), 2)
            }
            range = 'Dag'

            resolution = "Hour"
            tv = tickValues["hour"]
        }

        // clicked on a day bar in a month overview
        if (this.state.resolution === 'Hour') {
            //alert('Dieper inzoomen is nog niet mogelijk.')
            resolution = "15MINUTES"
        }

        // clicked on a day bar in a month overview
        if (this.state.resolution === '15MINUTES') {
            //alert('Dieper inzoomen is nog niet mogelijk.')
            tv = tickValues["hour"]
            resolution = "Hour"
        }

        //alert(API_URL)
        API_URL = API_BASE+ "?from=" + from + "&to=" + to + "&resolution=" + resolution
        this.fetchData(API_URL)

        this.setState({
            from: from,
            to: to,
            period : "zoom",
            range : range,
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
        API_URL = API_BASE+ "?from=" + from + "&to=" + to + "&resolution=" + resolution
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
            tv = createCustomTickvalues(from, to, resolution)
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
            //resolution = "15MINUTES"
            //tv = tickValues["15MINUTES"]
        }

        // depending go back 1 'resolution
        if (period==='back') {
            from = goBackInTime(this.state.from,this.state.range)
            to   = goBackInTime(this.state.to,this.state.range)
            range = this.state.range
            resolution = this.state.resolution
            tv = this.state.tickValues
            if (range=='Maand') {
                to = getMonthStart(this.state.from)
                tv = createCustomTickvalues(from, to, resolution)
            }
        }

        // depending go back 1 'resolution
        if (period==='forward') {
            from = goForwardInTime(this.state.from,this.state.range)
            to   = goForwardInTime(this.state.to,this.state.range)
            range = this.state.range
            resolution = this.state.resolution
            tv = this.state.tickValues
            if (range=='Maand') {
                tv = createCustomTickvalues(from, to, resolution)
            }
        }

        API_URL = API_BASE + "?from=" + from + "&to=" + to + "&resolution=" + resolution

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

        // read the MyEnergyServerIP and Qbos serial number from the localstorage
        // this is unique per user and stored in the broswer.
        MyEnergyServerIP = localStorage.getItem('MyEnergyServerIP');

        if (MyEnergyServerIP==null) {
            alert("IP address of MyEnergyServer has not been set yet. Use 'configuration' button.")

        } else {
            API_MY_ENERGY_SERVER = "http://"+MyEnergyServerIP+"/my_energy/"
            API_BASE = API_MY_ENERGY_SERVER + "api/getseries"
            API_URL = API_BASE + "?from=" + this.state.from + "&to=" + this.state.to + "&resolution=" + this.state.resolution
            this.fetchData(API_URL)
        }
    }

    componentDidMount() {
        // refresh the data every 5 minutes (this is also the Domoticz interval)
        this.timer = setInterval(() => this.doPolling(), 300000)
    }

    componentWillUnmount () {
        // use intervalId from the state to clear the interval
        clearInterval(this.timer)
    }

    doPolling() {
        if (this.state.status==='fetched') {
            this.fetchData(API_URL)
        }
    }

    render() {
        let renderGraph
        let renderConfiguration

        // conditional render, only render the GUI when there is data fetched.
        if (this.state.status==='fetched') {
            //alert('render: this.state.tickvalues = '+this.state.tickValues)
            renderGraph = <MainGraph state = {this.state} handleZoom={this.handleZoom}/>
        }

        const loading = this.state.status === 'fetching'
        // <Col xs={4} md={4} sm={2}>

        return (
        <div>

            <Jumbotron>
                <Container fluid>
                    <Row className="show-grid">
                        <Col lg={true}>
                            <HeaderPanel/>
                            &nbsp;
                            <PeriodPanel
                                from={this.state.from}
                                to={this.state.to}
                                range={this.state.range}
                                resolution={this.state.resolution}
                                handleChoice={this.handlePeriodChoice}
                                handleChangeDate={this.handleChangeDate}
                            />
                            &nbsp;
                            <PresentationPanel handleChoice={this.handlePresentationChoice} />
                            &nbsp;
                            <LiveView host={MyEnergyServerIP} />
                            &nbsp;
                            <StatusPanel state={this.state}
                                         url = {API_MY_ENERGY_SERVER}
                                         handleConfigChange={this.handleConfigChange} />

                        </Col>
                        <Col xs={14} md={8} sm={4}>
                            {loading ? <LoadingSpinner /> :
                                <div>
                                    {renderConfiguration}
                                    {renderGraph}
                                </div>
                            }
                        </Col>
                    </Row>
                </Container>
            </Jumbotron>
            <small> (C) 2019 - Nico Vermaas - version 1.5.0 - 16 feb 2019</small>
        </div>
        );
    }
}

export default App;
