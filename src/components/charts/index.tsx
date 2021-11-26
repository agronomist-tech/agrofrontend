import React from 'react';
import Plot from 'react-plotly.js';


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


export {PairChart}