import React, {useEffect, useState} from "react";
import {Grid} from "@material-ui/core";
import {useTranslation} from "react-i18next";
import {useQuery} from "@apollo/react-hooks";
import gql from 'graphql-tag';


export const OurTimeline = () => {

    const { t, i18n } = useTranslation();

    const input = {searchStr: "kopf"};

    const GET_TIMELINE_DATA = gql`
        query getTimelineData($searchTerm: String) {
            entitiesByString(searchString: $searchTerm) {
                identifier
                name
                type
                datingSpan
                periodName
            }
        }
    `;

    const {data: dataTimelineData, loading: loadingTimelineData, error: errorTimelineData} = useQuery(GET_TIMELINE_DATA,
        {variables: {searchTerm: input.searchStr}});

    const [timelineData, setTimelineData] = useState({});

    useEffect( () => {
        if(dataTimelineData) {
            setTimelineData(dataTimelineData);
            console.log("rerender timelineData --> timelineData: ", timelineData);
        }
    }, [dataTimelineData, input.searchStr]);


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

    return (
        <div>
            <h2>{t('Timeline')}</h2>
            <Grid className="grid-outer" container direction="row" spacing={1}>
                <Grid className="grid-timeline" item xs={12} lg={9}>
                    <svg
                        viewBox="-1000 0 2000 1000"
                        style={{ border: "2px solid gold" }}
                    >
                        {//mark coordinate 0,0 (= year 0) with a circle
                            <circle
                                cx="0"
                                cy="0"
                                r="10"
                            />}

                        {timelineData && timelineData.entitiesByString && timelineData.entitiesByString
                            .filter(filterNoDatingSpan) //filter out elements where no datingSpan is specified
                            .filter(filterMultipleDatingSpans) //temporary fix for imperfect sortYearAscending function
                            .sort(sortYearAscending) //sort elements by year in ascending order
                            .map((item, index) => {
                                return (item.datingSpan && item.datingSpan.map((ds, dsIndex) => {
                                            const calculatedWidth = Math.abs(Math.abs(ds[0]) - Math.abs(ds[1])); //TODO: calculate in a better was, because e.g. [-100, 100] would not work right now
                                            return (ds &&
                                                //
                                                (calculatedWidth !== 0
                                                        //draw a rect for each datingSpan:
                                                        //starting point x of the rect = the first element/year of the datingSpan,
                                                        //width of the rect = difference between first and second year of the datingSpan,
                                                        //offset the rects along the y-axis using the index value; TODO: find better solution for overlapping
                                                        ? <g key={"datingSpan_" + index + "_" + dsIndex}>
                                                            <rect
                                                                x={ds[0]}
                                                                y={index * 10}
                                                                width={calculatedWidth}
                                                                height="10"
                                                                strokeWidth="1"
                                                                stroke="black"
                                                                rx="2"
                                                                ry="2"
                                                                fill="gold"
                                                            />
                                                            <text
                                                                x={ds[0]}
                                                                y={index * 10 + 10}
                                                                fill="black"
                                                            >
                                                                {item.name}
                                                            </text>
                                                        </g>
                                                        //if the width of the rect would be 0 because datingSpan[0] === datingSpan[1], draw a circle instead
                                                        : <g key={"datingSpan_" + index + "_" + dsIndex}>
                                                            <circle
                                                                cx={ds[0]}
                                                                cy={index * 10}
                                                                r="5"
                                                                strokeWidth="1"
                                                                stroke="black"
                                                                fill="gold"
                                                            />
                                                            <text
                                                                x={ds[0]}
                                                                y={index * 10 + 10}
                                                                fill="black"
                                                            >
                                                                {item.name}
                                                            </text>
                                                        </g>
                                                )
                                            );
                                        }
                                    )
                                );
                            })}})}})}
                    </svg>
                </Grid>
            </Grid>
        </div>
    );
};
