import React from "react";
import { ReturnTimelineObject } from "..";
import * as d3 from "d3";

export const CreateTimelineObjects = (props) => {
    const { color, data, whichTimespan } = props;

    if (whichTimespan === "objectDating") {
        return data && data.map((item, index) => {
                return (item.timespan
                    && <ReturnTimelineObject
                        key={"objectDating_" + index + "_" + 0}
                        timespan={item.timespan}
                        timespanIndex={0}
                        index={index}
                        name={item.itemName}
                        color={color}
                        whichTimespan={whichTimespan}
                    />)
            }
        )
    }
    //TODO: make less messy
    else if (whichTimespan === "periodDating") {
        return data && data.map((item, index) => {
            return item.periodSpans?.map( (periodSpan, spanDex) => {
                return (periodSpan
                    && <ReturnTimelineObject
                        key={"period_" + index + "_" + spanDex + "_" + 0}
                        timespan={periodSpan}
                        timespanIndex={spanDex}
                        index={index}
                        name={item.periodNames}
                        color={color}
                        whichTimespan={whichTimespan}
                    />)
            } )
        })
    }
}
