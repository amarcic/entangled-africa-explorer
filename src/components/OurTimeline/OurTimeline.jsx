import React, { useEffect, useState } from 'react';
import { FormControl, Grid, InputLabel, MenuItem, Select } from "@material-ui/core";
import Skeleton from "@material-ui/lab/Skeleton";
import { useTranslation } from "react-i18next";
import { CreateTimelineAxis, CreateTimelineObjects } from '..'
import * as d3 from "d3";
import { timelineMapper, groupByPeriods, transformTimelineData, getTimeRangeOfTimelineData } from "../../utils";


export const OurTimeline = (props) => {
    const { dispatch, input, timelineObjectsData } = props;

    const { t, i18n } = useTranslation();

    const [sortedTimelineData, setSortedTimelineData] = useState([]);
    const [timeRangeOfTimelineData, setTimeRangeOfTimelineData] = useState([-6000, -500])

    //example for grouping timeline objects by period names
    //console.log(props.timelineObjectsData&&groupByPeriods(props.timelineObjectsData));

    useEffect(() => {
        setTimeRangeOfTimelineData(getTimeRangeOfTimelineData(timelineObjectsData, input.timelineSort));
        setSortedTimelineData(transformTimelineData(timelineObjectsData, input.timelineSort));

        //transformTimelineData(timelineObjectsData);
    }, [input.timelineSort, timelineObjectsData])


    //console.log("timelineObjectsData:", timelineObjectsData)
    //console.log("sort by:", input.timelineSort)
    //console.log("sortedTimelineData:", sortedTimelineData)
    //console.log("timeRangeOfTimelineData:", timeRangeOfTimelineData)


    return (
        <div>
            <h2>{t('Timeline')}</h2>
            <FormControl>
                <InputLabel>Sort by</InputLabel>
                <Select
                    value={input.timelineSort}
                    onChange={(event) => {
                        //console.log("change sorting to", event.target.value);
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
                                        dispatch={dispatch}
                                        input={input}
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
                                        dispatch={dispatch}
                                        input={input}
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
