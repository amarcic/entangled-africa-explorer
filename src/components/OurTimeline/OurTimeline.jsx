import React, {useEffect, useRef, useState} from "react";
import { Grid } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import * as d3 from "d3";
import { useQuery } from "@apollo/react-hooks";
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
    }, [dataTimelineData]);

    return (
        <div>
            <h2>{t('Timeline')}</h2>
            <Grid className="grid-outer" container direction="row" spacing={1}>
                <Grid className="grid-timeline" item xs={12} lg={9}>
                    <svg
                        //viewBox="0 0 100 50"
                        style={{ border: "2px solid gold" }}>

                        <circle
                            cx="100"
                            cy="100"
                            r="10"
                            fill="yellow"
                        />
                        <rect
                            width="10"
                            height="20"
                            x="200"
                            y="50"
                            fill="blue"
                        />
                        <rect
                            width="30"
                            height="20"
                            x="50"
                            fill="green"
                        />
                        <rect
                            width="30"
                            height="20"
                            x="150"
                            y="25"
                            fill="orange"
                        />

                        {timelineData && timelineData.entitiesByString && timelineData.entitiesByString.map((item, index) => {
                                item && item.datingSpan && item.datingSpan.map((dating, index) => {
                                        return (
                                            dating &&
                                            <circle
                                                cx="10"
                                                cy="50"
                                                r="3"
                                                fill="red"
                                            />
                                            && console.log("draw a red circle!")
                                        );
                                })
                            }
                        )}
                    </svg>
                </Grid>
            </Grid>
        </div>
    );
};
