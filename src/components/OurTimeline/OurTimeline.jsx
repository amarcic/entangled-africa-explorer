import React, { useEffect, useState } from 'react';
import { FormControl, Grid, InputLabel, MenuItem, Select } from "@material-ui/core";
import Skeleton from "@material-ui/lab/Skeleton";
import { useTranslation } from "react-i18next";
import { CreateTimelineAxis, CreateTimelineObjects } from '..'
import * as d3 from "d3";
import { timelineMapper, groupByPeriods } from "../../utils";


export const OurTimeline = (props) => {
    const { dispatch, input, timelineObjectsData } = props;

    const { t, i18n } = useTranslation();

    const [sortedTimelineData, setSortedTimelineData] = useState([]);
    const [timeRangeOfTimelineData, setTimeRangeOfTimelineData] = useState([-6000, -500])

    //example for grouping timeline objects by period names
    //console.log(props.timelineObjectsData&&groupByPeriods(props.timelineObjectsData));

    //filter functions for timeline data:
    //filter out elements that do not have a datingSpan specified
    const filterNoDatingSpan = (element) => {
        if (element.timespan?.length > 0) return element;
    }
    //filter out elements that have more than one timespan (just temporarily)
    const filterMultipleDatingSpans = (element) => {
        if (element.timespan.length === 1) return element;
    }
    //filter out elements that do not have a period timespan specified
    const filterNoPeriodDating = (element) => {
        //conditions shortened
        //only .begin is checked but later .end is used
        //const hasBegin = element?.temporal?.[0]?.[0]?.senses?.[0]?.begin;
        const hasBegin = element?.periodSpans?.[0]?.[0];
        if (hasBegin) {
            return element;
        }
    }

    //sort functions for timeline data:
    //sort by identifier in descending order (just a test)
    const sortByIdentifierDescending = (a, b) => {
        return b.identifier - a.identifier;
    }
    //sort by object dating start date
    const sortYearAscending = (itemA, itemB) => {
        return itemA.timespan[0] - itemB.timespan[0];
    }
    //sort by period start date; TODO: takes into account only the first element in periodSpans
    const sortPeriodAscending = (itemA, itemB) => {
        //shorten conditions?
        const hasBeginA = itemA?.periodSpans?.[0]?.[0];
        const hasBeginB = itemB?.periodSpans?.[0]?.[0];
        if (hasBeginA && hasBeginB)
            return itemA.periodSpans?.[0]?.[0] - itemB.periodSpans?.[0]?.[0]
        else
            return 0
    }

    //put the smallest and largest year in the sortedTimelineData into variable for easier access
    const getTimeRangeOfTimelineData = (sortedTLData) => {
        if (!sortedTLData) return;

        let timeRange;
        const sortedTLDataLength = sortedTLData.length;

        if (sortedTLDataLength > 0 && sortedTLData[0]) {
            if (input.timelineSort === "object") {
                const first = sortedTLData[0].timespan[0];
                const last = d3.max(sortedTLData.map(item => parseInt(item.timespan?.[1])))
                timeRange = [parseInt(first), parseInt(last)];
            }
            else if (input.timelineSort === "period") {
                //thorough checking for valid dates is done, but should not be necessary after filtering
                //some default values are given in case no reasonable values are available
                const first = sortedTLData[0].periodSpans?.[0]?.[0] || -6000;
                const last = d3.max(sortedTLData.map(item => parseInt(item.periodSpans?.[0]?.[1])))
                timeRange = [parseInt(first), parseInt(last)];
            }
        }
        setTimeRangeOfTimelineData(timeRange)
    }

    //apply filters and sorts to transform data as needed/wanted
    const transformTimelineData = (timeLData) => {
        if(!timeLData) return;

        let transformedTimelineData = timeLData.filter(filterNoDatingSpan); //filter out elements where no datingSpan is specified
        if (input.timelineSort === "object") transformedTimelineData = transformedTimelineData.sort(sortYearAscending); //sort elements by object dating in ascending order
        else if (input.timelineSort === "period") transformedTimelineData = transformedTimelineData.filter(filterNoPeriodDating).sort(sortPeriodAscending); //sort elements by period dating in ascending order

        //console.log("timelineObjectsData is being transformed!")
        //console.log(transformedTimelineData);
        getTimeRangeOfTimelineData(transformedTimelineData);
        setSortedTimelineData(transformedTimelineData);
    }


    useEffect(() => {
        transformTimelineData(timelineObjectsData);
    }, [input.timelineSort, timelineObjectsData])


    //console.log("timelineObjectsData:", timelineObjectsData)
    //console.log("sort by:", input.timelineSort)
    //console.log("sortedTimelineData:", sortedTimelineData)
    console.log("timeRangeOfTimelineData:", timeRangeOfTimelineData)


    return (
        <div>
            <h2>{t('Timeline')}</h2>
            <FormControl>
                <InputLabel>Sort by</InputLabel>
                <Select
                    value={input.timelineSort}
                    onChange={(event) => {
                        console.log("change sorting to", event.target.value);
                        dispatch({type: "UPDATE_INPUT", payload: {field: "timelineSort", value: event.target.value}});
                    }}
                >
                    <MenuItem value={"object"}>Object date</MenuItem>
                    <MenuItem value={"period"}>Period date</MenuItem>
                </Select>
            </FormControl>
            <Grid className="grid-timeline" item xs={12}/* lg={9}*/>
                {//timelineObjectsData ?
                    <svg
                        //viewBox parameters are "min-x min-y width height"
                        viewBox={
                            timeRangeOfTimelineData
                                ? `${timeRangeOfTimelineData[0] - 100}
                                0 
                                ${Math.abs(timeRangeOfTimelineData[0]) + timeRangeOfTimelineData[1] + 150} 
                                1000`
                                : "0 0 1000 1000"
                        }
                    >

                        {//top axis
                            timeRangeOfTimelineData
                            && <g>
                                <CreateTimelineAxis
                                    domain={timeRangeOfTimelineData}
                                    range={timeRangeOfTimelineData}
                                    position="top"
                                />
                            </g>}

                        <g
                            transform="translate(0, 50)"
                        >
                            {//timeline objects made from iDAI.chronontology periods' data //TODO: not solved well so far
                                sortedTimelineData && <g
                                    //move down along y axis by 50
                                    //transform="translate(0, 50)"
                                >
                                    <CreateTimelineObjects
                                        color={d3.color("red")}
                                        data={sortedTimelineData}
                                        whichTimespan="periodDating"
                                    />
                                </g>}

                            {//timeline objects (rects or circles) made from iDAI.objects entities' data
                                sortedTimelineData && <g
                                    //move down along y axis by 50
                                    //transform="translate(0, 50)"
                                >
                                    <CreateTimelineObjects
                                        color={d3.color("blue")}
                                        data={sortedTimelineData}
                                        whichTimespan="objectDating"
                                    />
                                </g>}
                        </g>

                        {//bottom axis
                            timeRangeOfTimelineData
                            && <g
                                transform="translate(0, 950)"
                            >
                                <CreateTimelineAxis
                                    domain={timeRangeOfTimelineData}
                                    range={timeRangeOfTimelineData}
                                    position="bottom"
                                />
                            </g>}
                    </svg>
                    //: <Skeleton variant="rect" width="100%" height="70%" />
                }
            </Grid>
        </div>
    );
};
