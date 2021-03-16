import { group } from "d3-array";
import * as d3 from "d3";


//TIMELINE HELPER FUNCTIONS

const timelineAdapter = ( object ) => {

    let periodData = {};
    let timelineData = [];

    object.temporal?.flat().forEach( period => {
        let periodStuff = {
            periodName: period.title,
            periodType: period.type,
            periodSpan: period.begin||period.end ? [period.begin, period.end] : undefined
        };
        //only checks for senses when period has no begin
        //assumes there are no periods with an end but no beginning
        //periodName is not updated to the name of the period in senses
        if (periodStuff.periodSpan?.[0]===undefined) {
            let begin = period.senses?.[0]?.begin;
            let end = period.senses?.[0]?.end;
            periodStuff.periodSpan= begin||end ? [begin, end] : undefined;
        }
        periodData[period.identifier] = periodStuff;
    })

    object.datingSets?.forEach( datingSet => {
            const timelineObject = {
                itemId: object.identifier,
                itemName: object.name,
                timespan: datingSet.datingSpan,
                periodIds: datingSet.periodIds,
                periodNames: datingSet.periodIds?.map( periodId => periodData[periodId].periodName ),
                periodSpans: datingSet.periodIds?.map( periodId => periodData[periodId].periodSpan )
                //object.temporal?.flat().find( period => period.identifier === datingSet.periodIds?.[0] )?.title
            }

            timelineData.push(timelineObject)
        }
    )

    return timelineData;
}

//maps selected fields from deeply nested query result data for easy digestion by timeline
const timelineMapper = ( item ) => {
    const objectDating = item.datingSpan;
    let periodDating = item.temporal?.map( periodSpan => periodSpan.map( period => {
        if (period.begin||period.end) {
            return {
                name: period.title,
                begin: period.begin,
                end: period.end
            }
        } else {
            //checks senses only if no dating is given on the period itself
            return {
                name: period.title,
                begin: period.senses?.[0]?.begin,
                end: period.senses?.[0]?.end
            }
        }
    }))

    return {
        itemId: item.identifier,
        itemName: item.name,
        objectDating: objectDating,
        periodDating: periodDating
    }
};

const groupByPeriods = ( timelineObject ) =>
    timelineObject && group(timelineObject, timelineObject => timelineObject.periodIds?.[0]);

//filter functions for timeline data:
//filter out elements that do not have a datingSpan specified
const filterNoDatingSpan = (element) => {
    if (element.timespan?.length > 0) return element;
}
//filter out elements that have more than one timespan (just temporarily)
/*const filterMultipleDatingSpans = (element) => {
    if (element.timespan.length === 1) return element;
}*/
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
/*const sortByIdentifierDescending = (a, b) => {
    return b.identifier - a.identifier;
}*/
//sort by object dating start date
const sortYearAscending = (itemA, itemB) => {
    // sort by "begin" values (index 0) of timespan arrays; if those values are equal, then sort by "end" values (index 1)
    if (itemA.timespan?.[0] === itemB.timespan?.[0]) return itemA.timespan?.[1] - itemB.timespan?.[1];
    else return itemA.timespan?.[0] - itemB.timespan?.[0];
}
//sort by period start date; TODO: takes into account only the first element in periodSpans
const sortPeriodAscending = (itemA, itemB) => {
    const hasBeginA = itemA?.periodSpans?.[0]?.[0];
    const hasBeginB = itemB?.periodSpans?.[0]?.[0];
    if (hasBeginA && hasBeginB) {
        // sort by "begin" values (index 0) of periodSpans arrays; if those values are equal, then sort by "end" values (index 1)
        if (itemA.periodSpans?.[0]?.[0] === itemB.periodSpans?.[0]?.[0]) return itemA.periodSpans?.[0]?.[1] - itemB.periodSpans?.[0]?.[1];
        else return itemA.periodSpans?.[0]?.[0] - itemB.periodSpans?.[0]?.[0];
    }
    else return 0;
}

//put the smallest and largest year in the timelineObjectsData into variable for easier access
//some default values are given in case no reasonable values are available
const getTimeRangeOfTimelineData = (timeLData, mode) => {
    if (!timeLData) return;

    let timeRange;
    const sortedTLDataLength = timeLData.length;

    if (sortedTLDataLength > 0 && timeLData[0]) {
        if (mode === "object") {
            //const first = d3.min(timeLData.map(item => parseInt(item.timespan?.[0])) || -6000);
            const minFirst = d3.min(timeLData.map(item => parseInt(item.timespan?.[0])))
            const first = minFirst !== undefined ? minFirst : -6000;
            const maxLast = d3.max(timeLData.map(item => parseInt(item.timespan?.[1])))
            const last = maxLast !== undefined ? maxLast : -500;
            timeRange = [parseInt(first), parseInt(last)];
        }
        else if (mode === "period") {
            //thorough checking for valid dates is done, but should not be necessary after filtering
            const minFirst = d3.min(timeLData.map(item => item.periodSpans?.map(nestedItem => parseInt(nestedItem?.[0]))).flat());
            const first = minFirst !== undefined ? minFirst : -6000;
            const maxLast = d3.max(timeLData.map((item) => item.periodSpans?.map((nestedItem) => parseInt(nestedItem?.[1]))).flat());
            const last = maxLast !== undefined ? maxLast : -500;
            timeRange = [parseInt(first), parseInt(last)];
        }
    }
    return timeRange;
}

//apply filters and sorts to transform data as needed/wanted
const transformTimelineData = (timeLData, mode) => {
    if(!timeLData) return;

    let transformedTimelineData = timeLData;
    if (mode === "object") {
        //sort elements by object dating in ascending order
        //(also sort by period so the order makes sense if object datings are equal)
        transformedTimelineData = transformedTimelineData.filter(filterNoDatingSpan).sort(sortYearAscending).sort(sortPeriodAscending);
        //transformedTimelineData = transformedTimelineData.filter(filterNoDatingSpan).sort(sortYearAscending);
    }
    else if (mode === "period") {
        //sort elements by period dating in ascending order
        //(also sort by object so the order makes sense if period datings are equal)
        transformedTimelineData = transformedTimelineData.filter(filterNoPeriodDating).sort(sortPeriodAscending).sort(sortYearAscending);
        //transformedTimelineData = transformedTimelineData.filter(filterNoPeriodDating).sort(sortPeriodAscending);
    }

    //console.log("timelineObjectsData is being transformed!")
    //console.log(transformedTimelineData);
    //getTimeRangeOfTimelineData(transformedTimelineData);
    return transformedTimelineData;
    //setSortedTimelineData(transformedTimelineData);
}

export { timelineAdapter, timelineMapper, groupByPeriods, transformTimelineData, getTimeRangeOfTimelineData };