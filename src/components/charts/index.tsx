import React from 'react';
import Plot from 'react-plotly.js';
import dayjs from 'dayjs'
import {Area, AreaChart, Tooltip, XAxis, YAxis, ResponsiveContainer, TooltipProps} from "recharts";

interface ChartData {
    x: string[]
    y: string[]
}


const PairChart = ({x, y}: ChartData) => {
    const plotlyData = [
        {
            showlegend: false,
            line: {
                color: "#46D521",
                shape: "spline"
            },
            x: x,
            y: y
        }
    ]

    return (
        <>
            <Plot data={plotlyData}
                  config={{
                      displaylogo: false,
                      displayModeBar: false
                  }}
                  layout={{
                      xaxis: {showgrid: false},
                      yaxis: {showgrid: false, exponentformat: "none"},
                      autosize: true,
                      plot_bgcolor: "rgba(0,0,0,0)",
                      paper_bgcolor: "rgba(0,0,0,0)"}}
                  style={{width: "100%"}} />
        </>
    )
}


const CustomTooltip = (props: TooltipProps<any, any>) => {
    let price = 0;

    if (props.payload && props.payload.length > 0){
        price = props.payload[0].payload.y.toFixed(4)
    }

    return (
        <div>
            <p>Price: {price}</p>
        </div>
    )
};

const RechartPairChart = ({x, y}: ChartData) => {
    let data = []

    let counter = 0

    while (counter < x.length){
        data.push({
            x: x[counter],
            y: y[counter]
        })
        counter += 1
    }


    return (
        <ResponsiveContainer width={"100%"} height={300}>
        <AreaChart data={data} margin={{left: 40, right: 40}}>
            <defs>
                <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#214B17" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#161F15" stopOpacity={0}/>
                </linearGradient>
            </defs>
            <XAxis dataKey="x" tickFormatter={(value)=> {
                return dayjs(value).format('HH:mm D MMM')
            }} />
            <YAxis dataKey="y" />

            <Tooltip
                content={<CustomTooltip />} />
            <Area type="monotone" dataKey="y" stroke="#46D521" fillOpacity={1} fill="url(#colorUv)" />
        </AreaChart>
            </ResponsiveContainer>
    )
}


export {PairChart, RechartPairChart}