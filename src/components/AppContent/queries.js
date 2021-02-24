import gql from 'graphql-tag';

const GET_OBJECTS = gql`
    query searchObjects ($searchTerm: String, $project: [String], $bbox: [String], $periodTerm: String) {
        entitiesMultiFilter(searchString: $searchTerm, projects: $project, coordinates: $bbox, period: $periodTerm, entityTypes: [Einzelobjekte]) {
            identifier
            name
            spatial {
                identifier
                name
                coordinates
            }
            dating
            datingSpan
            onDating
            datingSets {
                datingText
                datingItems
                datingSpan
                periodIds
            }
            temporal {
                title
                identifier
                types
                senses(typeOfSense: political) {
                    title
                    identifier
                    begin
                    end
                }
            }
        }
    }
`;

const GET_OBJECT_CONTEXT = gql`
    query searchObjectContext($arachneId: ID!) {
        entity(id: $arachneId) {
            identifier
            name
            spatial {
                identifier
                name
                coordinates
            }
            #are dating stuff and temporal needed here?
            dating
            datingSpan
            onDating
            datingSets {
                datingText
                datingItems
                datingSpan
                periodIds
            }
            temporal {
                title
                begin
                end
            }
            related(types: [Einzelobjekte, Bauwerke]) {
                identifier
                name
                type
                spatial {
                    identifier
                    name
                    coordinates
                }
            }
        }
    }
`;

const GET_ARCHAEOLOGICAL_SITES = gql`
    query searchArchaeoSites($searchTerm: String, $bbox: [String]) {
        archaeologicalSites(searchString: $searchTerm, coordinates: $bbox) {
            identifier
            name
            coordinates
            types
            locatedIn {
                identifier
                name
            }
        }
    }
`;

const GET_SITES_BY_REGION = gql`
    query byRegion($searchTerm: String, $idOfRegion: ID!) {
        sitesByRegion(searchString: $searchTerm, id: $idOfRegion) {
            identifier
            name
            coordinates
            types
            locatedIn {
                identifier
                name
            }
        }
    }
`;

/*const GET_ARCHAEOLOGICAL_SITE_CONTEXT = gql`
    query searchArchaeoSiteContext($searchTerm: String, $bbox: [String]) {
        place() {
            identifier
            name
            coordinates
            types
            locatedIn {
                identifier
                name
            }
        }
    }
`;*/

export { GET_OBJECTS, GET_OBJECT_CONTEXT, GET_ARCHAEOLOGICAL_SITES, GET_SITES_BY_REGION }