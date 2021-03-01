import React from "react";
import { ReturnTimelineObject } from "..";
import * as d3 from "d3";

export const CreateTimelineObjects = (props) => {
    const { color, data, whichTimespan, dispatch, input } = props;

    if (whichTimespan === "objectDating") {
        return data && data.map((item, index) => {
                return (item.timespan
                    && <ReturnTimelineObject
                        key={"objectDating_" + index}
                        timespan={item.timespan}
                        timespanIndex={0}
                        index={index}
                        item={item}
                        color={color}
                        whichTimespan={whichTimespan}
                        dispatch={dispatch}
                        input={input}
                    />)
            }
        )
    }
    else if (whichTimespan === "periodDating") {
        return data && data.map((item, index) => {
            return item.periodSpans?.map( (periodSpan, spanDex) => {
                return (periodSpan
                    && <ReturnTimelineObject
                        key={"period_" + index + "_" + spanDex}
                        timespan={periodSpan}
                        timespanIndex={spanDex}
                        index={index}
                        item={item}
                        color={color}
                        whichTimespan={whichTimespan}
                        dispatch={dispatch}
                        input={input}
                    />)
            } )
        })
    }
}
