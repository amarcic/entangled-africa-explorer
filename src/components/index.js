//this index.js exports all components from the sub folders
//by doing this all components can be imported from './components/';
//named exports are used instead of default export; thus imports need to be destructured
export { HelloComputerButton } from './HelloComputerButton/HelloComputerButton';
export { PageHeader } from './PageHeader/PageHeader';
export { OurMap } from './OurMap/OurMap';
export { ReturnPopup } from './ReturnPopup/ReturnPopup';
export { CreateMarkers } from './CreateMarkers/CreateMarkers';
export { ReturnMarker } from './ReturnMarker/ReturnMarker';
export { Filters } from './Filters/Filters'
export { CollapsedFilters } from './CollapsedFilters/CollapsedFilters'
export { ResultsTable } from './ResultsTable/ResultsTable'
export { ResultsTableRow } from './ResultsTableRow/ResultsTableRow'
export { ArachneEntry } from './ArachneEntry/ArachneEntry.JSX'
export { GazetteerEntry } from './GazetteerEntry/GazetteerEntry'