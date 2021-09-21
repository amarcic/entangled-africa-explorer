import React, {useEffect, useRef, useState} from "react";
import { useTranslation } from "react-i18next";
import { useStyles } from "../../styles";
import { select, scaleBand, axisBottom, scaleLinear, zoom } from "d3";
import {getTimeRangeOfTimelineData, newGroupByPeriods} from "../../utils";

export const TimelineChart = (props) => {
    const { t, i18n } = useTranslation();

    const classes = useStyles();

    const svgRef = useRef();

    //const filteredTimelineData = props.filteredTimelineData;
    console.log("dimensions", props.dimensions)
    const xDomain = getTimeRangeOfTimelineData(props.filteredTimelineData,"period");
    const dataUnsorted = newGroupByPeriods(props.filteredTimelineData);
    const data = dataUnsorted && new Map([...dataUnsorted.entries()]
        .sort( (a,b) =>
            a[1].periodSpan[0] - b[1].periodSpan[0] ));

    const timelineData = { xDomain, data, svgRef };

    //console.log("filteredTimelineData: ", props.filteredTimelineData);
    //console.log("grouped by periods: ", data)
    //console.log("sorted data: ", dataUnsorted)

    //setting up the svg after first render
    useEffect(() => {
        const { width, height, margin } = props.dimensions;
        //console.log("width", width)
        const svg = select(svgRef.current)
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom);
        svg.select('.timelineGroup')
            .attr("transform",`translate(${margin.left}, ${margin.top})`);

    }, [props.dimensions]);

    //draw timeline everytime filteredTimelineData changes
    useEffect( () => {
        drawTimeline(timelineData, props.dimensions)
    }, [props.filteredTimelineData, props.dimensions] );

//todo: check if still depending on outer scope (like height, width, margin)
    const drawTimeline = (timelineConfig, dimensions) => {

        const { data, svgRef, xDomain } = timelineConfig;
        const { width, height, margin } = dimensions;
        const svg = select(svgRef.current);

        if(!data||data.size===0) {
            svg.selectAll(".bar").remove();
            svg.selectAll(".label").remove();
            return;
        }
        //console.log([...data.values()]);

        const selection = svg.select(".timelineGroup").selectAll("rect").data([...data.values()], data => data.periodId);
        //console.log("initial selection", selection);
        const selectionLabels = svg.select(".timelineGroup").selectAll(".label").data([...data.values()], data => data.periodId);
        const periodIds = [...data.keys()];

        //scale for the x axis
        const xScale = scaleLinear()
            .domain(xDomain)
            .range([0,width])
        //scale for the y axis
        const yScale = scaleBand()
            .domain(periodIds)
            .range([height,0])
            .padding(0.2)

        //add x axis to svg
        const xAxis = axisBottom(xScale);
        const xAxisDraw = svg.select(".xAxis")
            .attr("transform", `translate(0,${height+margin.top})`)
            .call(xAxis);

        if (document.getElementById("clip")===null&&height&&width) {
            svg.append("defs").append("clipPath")
                .attr("id","clip")
                .append("rect")
                .attr("width", width)
                .attr("height", height)
                .attr("x", 0)
                .attr("y", 0);
        }

        svg.select(".timelineGroup")
            .attr("clip-path", "url(#clip)");

        //set up zoom and pan
        const handleZoom = (event) => {

            const transform = event.transform;
            //zoom and pan bars (geometric)
            svg.select(".timelineGroup").selectAll(".bar")
                .attr("transform", transform);

            const xScaleNew = transform.rescaleX(xScale);
            const yScaleNew = yScale.range([height,0].map( d => transform.applyY(d) ));

            xAxis.scale(xScaleNew);
            xAxisDraw.call(xAxis);

            svg.selectAll(".label")
                .attr("x", value => xScaleNew(value.periodSpan?.[0]))
                .attr("y", value => yScaleNew(value.periodId));
        };
        const zimzoom = zoom()
            .scaleExtent([1,5])
            .translateExtent([[0,0], [width, height+margin.bottom+margin.top]])
            .on("zoom", handleZoom);
        const initZoom = () => {
            svg
                .call(zimzoom);
        }

        //add bars (without extension) for each period on enter and return a selection of all entering and updating nodes
        const selectionEnteringAndUpdating = selection.join(
            enter => enter
                .append("rect")
                    .attr("class", "bar")
                    .attr("fill", "#69b3a2")
        );

        console.log("new and updating: ", selectionEnteringAndUpdating);

        //position and extend bars according to temporal extent of period
        selectionEnteringAndUpdating
            .attr("height", yScale.bandwidth())
            .transition()
            .attr("x", value => xScale(value.periodSpan?.[0]))
            .attr("y", (value, index) => yScale(periodIds[index]))
            .attr("width", value => Math.abs(xScale(value.periodSpan?.[0])-xScale(value.periodSpan?.[1]))||0)

        //add labels to the bars
        selectionLabels
            .enter()
            .append("text")
                .attr("class", "label")
                .attr("x", value => xScale(value.periodSpan?.[0]))
                .attr("y", value => yScale(value.periodId))
                .text(value => value.periodName);

        selectionLabels
            .attr("x", value => xScale(value.periodSpan?.[0]))
            .attr("y", value => yScale(value.periodId))

        //remove labels on exit
        selectionLabels
            .exit()
            .remove()

        initZoom();
    }

    const updateTimeline = () => {

    }

    /*
    useEffect(() => {



        svg.attr()


        //remove previously rendered timeline bars in the case there is no data from the current search
        //if (!timelineObjectsData||!byPeriodData||byPeriodData.size===0) {
        if (!data||data.size===0) {
            svg.select(".bars")
                .selectAll(".bar").remove()
            svg.select(".bars")
                .selectAll(".label").remove()
            svg.select(".background").selectAll("rect").remove();
        } else {
            const periodIds = [...data.keys()];

            //scale for the x axis
            const xScale = scaleLinear()
                .domain(xDomain)
                .range([0,width])

            //scale for the y axis
            const yScale = scaleBand()
                .domain(periodIds)
                .range([height,0])
                .padding(0.2)

            //todo: replace this temporary cleanup of the background svg group
            svg.select(".background").selectAll("rect").remove();



            //select and position svg element for the timeline
            const timelineCanvas = svg.select(".bars")
                .attr("transform",`translate(${margin.left}, ${margin.top})`)

            //bind svg groups for bars and labels to the values of the data (map grouped by periods)
            const barGroups = timelineCanvas
                .selectAll(".barGroup")
                .data([...data.values()], (data,index) => data.periodName+data.periodSpan[0]);
            //todo: evaluate if generating the key form period name + period beginning sufficiently unique?
            //console.log("bar groups: ", barGroups);

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
                            .attr("height", yScale.bandwidth())
                            .attr("fill", "#69b3a2");
                        group
                            .append("text")
                            .attr("class","label");
                        return group;
                    }
                )

            //position all new and updating groups
            newAndUpdatedGroups
                .attr("transform", (value, index) => `translate(${xScale(value.periodSpan?.[0])},${yScale(periodIds[index])})`)

            //extend the svg rect elements as chart bars according to the data and return as "bar"
            const bar = newAndUpdatedGroups.selectAll(".bar")
                .transition()
                .attr("width", value => Math.abs(xScale(value.periodSpan?.[0])-xScale(value.periodSpan?.[1]))||0);

            //add period names as text labels to the groups and return as "labels"
            const labels = newAndUpdatedGroups.selectAll(".label")
                .text(value => value.periodName);
            console.log("new and updated after labels: ", newAndUpdatedGroups);

            //attach click event and sort function to sort button;
            select(".sortButton").on("click", () =>
                svg.selectAll(".barGroup").sort( (a,b) => ascending(parseInt(a.periodSpan?.[0]),parseInt(b.periodSpan?.[0])) )
                    .attr("transform", (value, index) => `translate(${xScale(value.periodSpan?.[0])},${yScale(periodIds[index])})`)
            );

            //on click show detailed view of dated objects for a period
            newAndUpdatedGroups.on("click", (event, value) => {

                    //const element = svg.selectAll(".bar").nodes(),
                     //   index = element.indexOf(event.currentTarget);

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

                    //join svg rect elements with array of item dating
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
    */

    return (
        <div className="timeline">
            <svg ref={svgRef}>
                <g className="timelineGroup">

                </g>
                <g className="xAxis"></g>
                <g className="yAxis"></g>
                <g className="background" />
            </svg>
        </div>
    )
};
