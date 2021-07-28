import React, {useEffect, useRef, useState} from "react";
import { Card, Grid } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { useStyles } from "../../styles";
import {select, scaleBand, axisBottom, axisLeft, scaleLinear, max, min, ascending} from "d3";
import {getTimeRangeOfTimelineData, newGroupByPeriods} from "../../utils";

export const Timeline = (props) => {
    const { t, i18n } = useTranslation();

    const classes = useStyles();

    const { timelineObjectsData } = props;
    const filteredTimelineData = timelineObjectsData&&timelineObjectsData.filter( datapoint => datapoint.periodSpans?.[0]!==undefined||datapoint.periodSpans?.length>1);
    //const data = newGroupByPeriods(filteredTimelineData);
    const xDomain = getTimeRangeOfTimelineData(timelineObjectsData,"period");

    console.log(timelineObjectsData);
    console.log(filteredTimelineData);
    //console.log(byPeriodData);

    //console.log(props.timelineData);

    const svgRef = useRef();
    //const [data, setData] = useState(binnedData);
    //const [scale, setScale] = useState();

    const [data, setData] = useState();

    const svg = select(svgRef.current);

    const sortPeriods = () =>
        setData(newGroupByPeriods(filteredTimelineData.sort( (a, b) => a.periodSpans[0] - b.periodSpans[0] )));

    const margin = {top: 5, right: 20, left: 20, bottom: 30};

    useEffect( () => {
        if (timelineObjectsData||filteredTimelineData) {
            setData(newGroupByPeriods(filteredTimelineData));
            data&&data.size>0&&console.log([...data.values()].sort( (a,b) => a.periodSpan?.[0]-b.periodSpan?.[0] ));
        }
        //const byPeriodData = newGroupByPeriods(filteredTimelineData)

        }, [props.timelineObjectsData]
    )

    useEffect(() => {
        //setData(byPeriodData);

        //svg dimensions
        const containerHeight = parseInt(select("#timelineContainer").style("height")),
            containerWidth = parseInt(select("#timelineContainer").style("width"));

        const width = containerWidth - margin.left - margin.right,
            height = containerHeight - margin.top - margin.bottom;

        svg.attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom);

        //remove previously rendered timeline bars in the case there is no current data from the current search
        //if (!timelineObjectsData||!byPeriodData||byPeriodData.size===0) {
        if (!data||data.size===0) {
            console.log("data", data);
            svg.select(".bars")
                .selectAll(".bar").remove()
            svg.select(".bars")
                .selectAll(".label").remove()
            svg.select(".background").selectAll("rect").remove();
        } else {
            const periodIds = [...data.keys()];

            const xScale = scaleLinear()
                .domain(xDomain)
                .range([0,width])

            const yScale = scaleBand()
                .domain(periodIds)
                .range([height,0])
                .padding(0.2)

            //todo: replace this temporary cleanup of the background svg group
            svg.select(".background").selectAll("rect").remove();

            //add x axis to svg
            svg.select(".xAxis")
                .attr("transform", `translate(0,${height})`)
                .call(axisBottom(xScale))

            //select and position svg element for the timeline
            const timelineCanvas = svg.select(".bars")
                .attr("transform",`translate(${margin.left}, ${margin.top})`)

            //sync svg groups for bars and labels to the values of the data (map grouped by periods)
            const barGroups = timelineCanvas
                .selectAll(".barGroup")
                .data([...data.values()], (data,index) => periodIds[index]);
            console.log(barGroups);

            //instructions for joining the synced data and group elements: add svg g, rect and text elements on enter
            //returns a selection of new and updating groups
            const newAndUpdatedGroups = barGroups
                .join(
                    enter => {
                        let group = enter
                            .append("g");
                        group.attr("class","barGroup");
                        group
                            .append("rect")
                            .attr("class", "bar")
                        group
                            .append("text")
                            .attr("class","label");
                        return group;
                    }
                )

            //position all new and updating groups
            newAndUpdatedGroups
                .attr("transform", (value, index) => `translate(${xScale(value.periodSpan?.[0])},${yScale(periodIds[index])})`)

            //extend the svg rect elements as chart bars according to the data
            const bar = newAndUpdatedGroups.selectAll(".bar")
                .attr("height", yScale.bandwidth())
                .attr("fill", "#69b3a2")
                .transition()
                .attr("width", value => Math.abs(xScale(value.periodSpan?.[0])-xScale(value.periodSpan?.[1]))||0);

            //add period names as text labels to the groups
            const labels = newAndUpdatedGroups.selectAll(".label")
                .text(value => value.periodName);
            console.log(newAndUpdatedGroups);

            select(".sortButton").on("click", () =>
                svg.selectAll(".barGroup").sort( (a,b) => ascending(parseInt(a.periodSpan?.[0]),parseInt(b.periodSpan?.[0])) )
                    .attr("transform", (value, index) => `translate(${xScale(value.periodSpan?.[0])},${yScale(periodIds[index])})`)
            );

            //on click show detailed view of items for a period
            newAndUpdatedGroups.on("click", (event, value) => {
                    //console.log(value)

                    const element = svg.selectAll(".bar").nodes(),
                        index = element.indexOf(event.currentTarget);

                    const itemDatingMin = min(value.items, item => item.spanDated?.[0]),
                        itemDatingMax = max(value.items, item => item.spanDated?.[1]);

                    const xScaleDetail = scaleLinear()
                        .domain([itemDatingMin,itemDatingMax])
                        .range([0,width])

                    const yScaleDetail = scaleLinear()
                        .domain([0, value.items.length])
                        .range([height,0]);

                    //remove bars and labels
                    svg.selectAll(".bar").remove();
                    svg.selectAll(".label").remove();

                    svg.select(".background").selectAll("rect").remove();

                    //attach x axis
                    svg.select(".xAxis")
                        .attr("transform", `translate(0,${height})`)
                        .call(axisBottom(xScaleDetail))

                    //join svg rect elements with array of item datings
                    svg.select(".bars")
                        .selectAll("rect").data(value.items).join(
                            enter => enter.append("rect")
                        ).attr("class","bar")
                        .attr("x", value => xScaleDetail(value.spanDated?.[0]))
                        .attr("y", (value,index) => yScaleDetail(index))
                        .attr("height", 5)
                        .transition()
                        .attr("width", value => Math.abs(xScaleDetail(value.spanDated?.[0])-xScaleDetail(value.spanDated?.[1]))+1||0)

                    //paint on the background a rect representing the temporal extension of the period
                    svg.select(".background")
                        .selectAll("rect").data([value]).join("rect")
                        .attr("width", Math.abs(xScaleDetail(value.periodSpan?.[0])-xScaleDetail(value.periodSpan?.[1]))||0)
                        .attr("height", height)
                        .attr("x", xScaleDetail(value.periodSpan[0]))
                        .transition()
                        .attr("opacity", 0.3)
                })

        }
    }, [data])

    return (
        <Card className={classes.card}>
            <Grid className={classes.gridHead} item container direction="row" spacing={2}>
                <Grid item>
                    <span><h3 className={classes.h3}>{t('Temporal distribution')}</h3>
                    <button className="sortButton">sort</button></span>
                </Grid>
            </Grid>
            <Grid id="timelineContainer" className={classes.gridContent} item container direction="column" spacing={2}>
                <Grid item>
                    <svg ref={svgRef}>
                        <g className="bars">
                            <g className="xAxis"></g>
                            <g className="yAxis"></g>
                        </g>
                        <g className="background" />
                    </svg>
                </Grid>
            </Grid>
        </Card>
    )
};
