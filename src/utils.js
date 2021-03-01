
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

    object.datingSets.forEach( datingSet => {
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
}

export { timelineAdapter, timelineMapper };