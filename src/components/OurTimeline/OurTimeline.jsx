import React, { useEffect, useState } from 'react';
import { FormControl, Grid, InputLabel, MenuItem, Select } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { CreateTimelineAxis, CreateTimelineObjects } from '..'
import * as d3 from "d3";
import { getTimeRangeOfTimelineData, groupByPeriods, transformTimelineData } from "../../utils";
import { useStyles } from '../../styles';

export const OurTimeline = (props) => {
    const [input, dispatch] = props.reducer;
    const { timelineObjectsData } = props;

    const { t, i18n } = useTranslation();

    const classes = useStyles();

    const [sortedTimelineData, setSortedTimelineData] = useState([]);
    const [timeRangeOfTimelineData, setTimeRangeOfTimelineData] = useState([-6000, -500])

    //example for grouping timeline objects by period names
    //console.log(props.timelineObjectsData&&groupByPeriods(props.timelineObjectsData));

    useEffect(() => {
        setTimeRangeOfTimelineData(getTimeRangeOfTimelineData(timelineObjectsData, input.timelineSort));
        setSortedTimelineData(transformTimelineData(timelineObjectsData, input.timelineSort));
    }, [input.timelineSort, timelineObjectsData])


    return (
        <>
            <Grid className={classes.gridHead} item container direction="row" spacing={2}>
                <Grid item>
                    <h3 className={classes.h3}>{t('Timeline')}</h3>
                </Grid>
                <Grid item>
                    {input.mode === "objects" && <FormControl>
                        <InputLabel>Sort by</InputLabel>
                        <Select
                            value={input.timelineSort}
                            onChange={(event) => {
                                dispatch({type: "UPDATE_INPUT", payload: {field: "timelineSort", value: event.target.value}});
                            }}
                        >
                            <MenuItem value={"object"}>Object date</MenuItem>
                            <MenuItem value={"period"}>Period date</MenuItem>
                        </Select>
                    </FormControl>}
                </Grid>
            </Grid>
            {input.mode === "objects"
            && <Grid className={classes.gridContent} item>
                {//timelineObjectsData ?
                    <svg
                        //viewBox parameters are "min-x min-y width height"
                        viewBox={
                            timeRangeOfTimelineData
                                ? `${timeRangeOfTimelineData[0] - 100}
                                0 
                                ${Math.abs(timeRangeOfTimelineData[0]) + timeRangeOfTimelineData[1] + 150} 
                                500`
                                : "0 0 1000 500"
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
                            {//timeline objects made from iDAI.chronontology periods' data
                                sortedTimelineData && <g
                                    //move down along y axis by 50
                                    //transform="translate(0, 50)"
                                >
                                    <CreateTimelineObjects
                                        color={d3.color("red")}
                                        data={input.timelineSort === "period"
                                            ? [...groupByPeriods(sortedTimelineData).values()] //Array.from(groupByPeriods(sortedTimelineData).values())
                                            : sortedTimelineData
                                        }
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
            </Grid>}
        </>
    );
};
