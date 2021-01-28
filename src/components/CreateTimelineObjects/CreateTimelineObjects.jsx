import React from "react";
import { ReturnTimelineObject } from "..";
import * as d3 from "d3";

export const CreateTimelineObjects = (props) => {
    const { color, data, whichTimespan } = props;

    if (whichTimespan === "objectDating") {
        return data && data.map((item, index) => {
            return item.objectDating && item.objectDating.map((ds, dsIndex) => {
                    return (
                        ds
                        && <ReturnTimelineObject
                            key={"objectDating_" + index + "_" + dsIndex}
                            timespan={ds}
                            timespanIndex={dsIndex}
                            index={index}
                            item={item}
                            color={color}
                            whichTimespan={whichTimespan}
                        />
                    );
                }
            )
        })
    }
    //TODO: make less messy
    else if (whichTimespan === "periodDating") {
        return data && data.map((item, index) => {
            return item.periodDating?.map( (periodSpan, spanDex) => periodSpan.map( (period, periodIndex) => {
                return (period.begin && period.end
                && <ReturnTimelineObject
                    key={"period_" + index + "_" + spanDex + "_" + periodIndex}
                    timespan={[period.begin, period.end]}
                    timespanIndex={spanDex}
                    index={index}
                    item={period}
                    color={color}
                    whichTimespan={whichTimespan}
                />)
            } ) )
            /*
            return item.temporal && item.temporal.map((temporal, temporalIndex) => {
                    return temporal && temporal.map((temporalItem, temporalItemIndex) => {
                            return temporalItem.senses && temporalItem.senses.map((sense, senseIndex) => {
                                return (sense && sense.begin && sense.end
                                    && <ReturnTimelineObject
                                        key={"temporal_sense_" + index + "_" + temporalIndex + "_" + temporalItemIndex + "_" + senseIndex}
                                        timespan={[sense.begin, sense.end]}
                                        timespanIndex={senseIndex}
                                        index={index}
                                        item={temporalItem}
                                        color={color}
                                        whichTimespan={whichTimespan}
                                    />
                                );
                            })
                        }
                    )
                }
            )*/
        })
    }
}
