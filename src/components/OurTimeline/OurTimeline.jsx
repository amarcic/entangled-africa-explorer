import React from "react";
import { FormControl, Grid, InputLabel, MenuItem, Select } from "@material-ui/core";
import Skeleton from "@material-ui/lab/Skeleton";
import { useTranslation } from "react-i18next";
import { CreateTimelineAxis, CreateTimelineObjects } from '..'
import * as d3 from "d3";


export const OurTimeline = (props) => {
    const { dispatch, input, timelineData } = props;

    const { t, i18n } = useTranslation();

    //filter functions for timeline data:
    //filter out elements that do not have a datingSpan specified
    const filterNoDatingSpan = (element) => {
        if (element.datingSpan !== null && element.datingSpan.length !== 0) return element;
    }
    //filter out elements that have more than one datingSpan (just temporarily)
    const filterMultipleDatingSpans = (element) => {
        if (element.datingSpan.length === 1) return element;
    }
    //filter out elements that do not have a period timespan specified
    const filterNoPeriodDating = (element) => {
        //shorten conditions?
        if (element && element.temporal && element.temporal[0] && element.temporal[0].senses && element.temporal[0].senses[0] && element.temporal[0].senses[0].begin && element.temporal[0].senses[0].begin !== null && element.temporal[0].senses[0].begin !== undefined)
            return element;
    }

    //sort functions for timeline data:
    //sort by identifier in descending order (just a test)
    const sortByIdentifierDescending = (a, b) => {
        return b.identifier - a.identifier;
    }
    //sort by object dating start date; TODO: is based on datingSpan[0][0], if there is more than one datingSpan given this is not taken into account so far
    const sortYearAscending = (itemA, itemB) => {
        return itemA.datingSpan[0][0] - itemB.datingSpan[0][0];
    }
    //sort by period start date
    const sortPeriodAscending = (itemA, itemB) => {
        //shorten conditions?
        if (itemA && itemA.temporal && itemA.temporal[0] && itemA.temporal[0].senses && itemA.temporal[0].senses[0] && itemA.temporal[0].senses[0].begin
            && itemB && itemB.temporal && itemB.temporal[0] && itemB.temporal[0].senses && itemB.temporal[0].senses[0] && itemB.temporal[0].senses[0].begin)
            return itemA.temporal[0][0].senses[0].begin - itemB.temporal[0][0].senses[0].begin
        else
            return 0
    }

    //apply filters and sorts to transform data as needed/wanted
    const sortedTimelineData = timelineData && timelineData.entitiesMultiFilter && timelineData.entitiesMultiFilter
        .filter(filterNoDatingSpan) //filter out elements where no datingSpan is specified
        .sort(sortYearAscending); //sort elements by year in ascending order

    //put the smallest and largest year in the sortedTimelineData into variable for easier access
    let timeRangeOfTimelineData;
    if (sortedTimelineData !== null && sortedTimelineData !== undefined && sortedTimelineData.length !== 0) {
        timeRangeOfTimelineData = [parseInt(sortedTimelineData[0].datingSpan[0][0]), parseInt(sortedTimelineData[sortedTimelineData.length - 1].datingSpan[0][1])];
    }

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
                {timelineData ?
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
                                        whichTimespan="temporal"
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
                                        whichTimespan="datingSpan"
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
                    : <Skeleton variant="rect" width="100%" height="70%" />}
            </Grid>
        </div>
    );
};
