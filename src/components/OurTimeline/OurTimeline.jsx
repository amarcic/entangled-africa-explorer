import React from "react";
import { Grid } from "@material-ui/core";
import Skeleton from "@material-ui/lab/Skeleton";
import { useTranslation } from "react-i18next";
import { CreateTimelineAxis, CreateTimelineObjects } from '..'


export const OurTimeline = (props) => {
    const { timelineData } = props;

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

    //sort functions for timeline data:
    //sort by identifier in descending order (just a test)
    const sortByIdentifierDescending = (a, b) => {
        return b.identifier - a.identifier;
    }
    //sort by year; TODO: is based on datingSpan[0][0], if there is more than one datingSpan given this is not taken into account so far
    const sortYearAscending = (itemA, itemB) => {
        return itemA.datingSpan[0][0] - itemB.datingSpan[0][0];
    }

    //apply filters and sorts to transform data as needed/wanted
    const sortedTimelineData = timelineData && timelineData.entitiesMultiFilter && timelineData.entitiesMultiFilter
        .filter(filterNoDatingSpan) //filter out elements where no datingSpan is specified
        .sort(sortYearAscending); //sort elements by year in ascending order

    //put the smallest and largest year in the sortedTimelineData into variable for easier access
    let timeRangeOfTimelineData;
    if (sortedTimelineData) {
        timeRangeOfTimelineData = [parseInt(sortedTimelineData[0].datingSpan[0][0]), parseInt(sortedTimelineData[sortedTimelineData.length - 1].datingSpan[0][1])];
    }

    return (
        <div>
            <h2>{t('Timeline')}</h2>
            <Grid className="grid-outer" container direction="row" spacing={1}>
                <Grid className="grid-timeline" item xs={12} lg={9}>
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
                                        color="red"
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
                                        color="gold"
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
                </Grid>
            </Grid>
        </div>
    );
};
