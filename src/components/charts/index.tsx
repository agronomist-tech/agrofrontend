import React from 'react';
import dayjs, {extend} from 'dayjs'
import {BigNumber as BN} from 'bignumber.js';
import {Area, AreaChart, Tooltip, XAxis, YAxis, ResponsiveContainer, TooltipProps} from "recharts";

interface ChartData {
    x: string[]
    y: number[]
}


interface TooltipPropsExt extends TooltipProps<any, any> {
    notation: string
}


const CustomTooltip = (props: TooltipPropsExt) => {
    let value = "0";

    if (props.payload && props.payload.length > 0 && typeof props.payload[0].payload.y === "number"){
        value = new BN(props.payload[0].payload.y).toFormat(2)
    } else if (props.payload && props.payload.length > 0) {
        value = props.payload[0].payload.y
    }

    return (
        <div>
            <p>{props.notation}: {value}</p>
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
                content={<CustomTooltip notation={"Price"}/>} />
            <Area type="monotone" dataKey="y" stroke="#46D521" fillOpacity={1} fill="url(#colorUv)" />
        </AreaChart>
            </ResponsiveContainer>
    )
}


const RechartLPoolChart = ({x, y}: ChartData) => {
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
            <YAxis dataKey="y" tickFormatter={(value) => new Intl.NumberFormat('en', { notation: "compact", compactDisplay: "short" }).format(value)} />

            <Tooltip
                content={<CustomTooltip notation={"Value"}/>} />
            <Area type="monotone" dataKey="y" stroke="#46D521" fillOpacity={1} fill="url(#colorUv)" />
        </AreaChart>
            </ResponsiveContainer>
    )
}



export {RechartPairChart, RechartLPoolChart}