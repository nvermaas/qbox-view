
import React, { Component } from 'react';
import { VictoryBar, VictoryChart, VictoryAxis, VictoryTheme, VictoryLabel, VictoryStack, VictoryZoomContainer } from 'victory';

class GasGraph extends Component {

    render() {
        let x = this.props.x;

        let y = this.props.y;
        let items = this.props.items;
        let title = "Gas"

        return (
            <div>
                <VictoryChart
                    style={{ parent: { maxWidth: "80%" } }}
                    domainPadding={{ x: 15 }}
                    theme={VictoryTheme.material}
                    width={600}
                >
                    {/* Define labels */}
                    <VictoryLabel x={200} y={24} text={title}
                    />
                    <VictoryAxis
                        tickValues={["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dec"]}
                        label="Maand"
                        style={{
                            axis: {stroke: "#756f6a"},
                            axisLabel: {fontSize: 10, padding: 30},
                            grid: {stroke: (t) => t > 0.5 ? "red" : "grey"},
                            ticks: {stroke: "grey", size: 5},
                            tickLabels: {fontSize: 9, padding: 5}
                        }}
                    />

                    <VictoryAxis
                        dependentAxis
                        tickFormat={(x) => (`${x/1000}`)}
                        animate={{
                            duration: 2000,
                            easing: "bounce"
                        }}
                        label="Verbruik in m3"
                        style={{
                            axis: {stroke: "#756f6a"},
                            axisLabel: {fontSize: 10, padding: 30},
                            grid: {stroke: (t) => t > 0.5 ? "red" : "grey"},
                            ticks: {stroke: "grey", size: 5},
                            tickLabels: {fontSize: 9, padding: 5}
                        }}
                    />

                    <VictoryStack>


                        <VictoryBar
                            style={{
                                data: {
                                    fill: "#0081C9",
                                    fillOpacity: 0.7,
                                },
                                labels: {
                                    fontSize: 10,
                                    fill: (d) => d.x === 3 ? "#000000" : "#c43a31"
                                }
                            }}

                            animate={{
                                duration: 2000,
                                onLoad: { duration: 1000 }
                            }}

                            data={items}
                            x={"month"}
                            y={"value"}
                        />
                    </VictoryStack>
                </VictoryChart>
            </div>

        );
    }
}
export default GasGraph;