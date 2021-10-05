import { createTheme, makeStyles } from "@material-ui/core/styles";

const theme = createTheme({
    palette: {
        primary: {
            light: '#ffcccb',
            main: '#ef9a9a',
            dark: '#ba6b6c',
            contrastText: '#fff',
        },
        secondary: {
            light: '#ffffff',
            main: '#fff3e0',
            dark: '#ccc0ae',
            contrastText: '#000',
        },
    },
});

const useStyles = makeStyles(theme => ({
    appBar: {
        //height: "80px",
        height: "auto",
        zIndex: 1200// theme.zIndex.drawer + 1,
    },
    //drawerPaper: {
    //marginTop: "80px"
    //},
    dashboardHeader: {
        justifyContent:"space-between",
        alignItems:"stretch",
        minHeight: "12vh",
        zIndex: 100
    },
    dashboardBody: {
        //height: "calc(100vh - 80px - 12px)"
    },
    dashboardFooter: {
        height: "12px"
    },

    dashboardTileHeader: {
        //height: "50px",
        //minHeight: "5%",
        justifyContent:"space-between",
    },
    dashboardTileContent: {
        height: "calc(100% - (8px * 6))", // 8px is the size of theme.spacing(1)
        //width: "100%",
        overflow: "scroll"
    },
    dashboardTile: {
        padding: theme.spacing(1),
        height: "100%",
        width: "100%"
    },
    cardOfTileWithShowNext: {
        padding: theme.spacing(2),
        height: "calc(100% - 35px)", //35px is the height of the ShowNext bar
        width: "100%"
    },
    cardOfTileWithoutShowNext: {
        padding: theme.spacing(2),
        height: "100%",
        width: "100%"
    },
    fullHeightTile: {
        height: "calc(100vh - 12vh - 12px + (8px * 2))", // 8px is the size of theme.spacing(1)
        //marginTop: theme.spacing(2)
    },
    halfHeightTile: {
        height: `calc((100vh - 12vh - 12px ) * 0.5)`, // half of the fullHeightTile height
        // this class will take the same height as fullHeightTile if the screen is size "xs":
        [theme.breakpoints.down("xs")]: {
            height: "calc(100vh - 12vh - 12px + (8px * 2))",
        }
    },
    //"dashboardBody || fullHeightTile || halfHeightTile": {
    //justifyContent: "space-between",
    //alignItems: "center"
    //},
    tabs: {
        height: "35px",
        minHeight: "35px",
        width: "100%",
        //paddingTop: theme.spacing(0.5),
        //marginRight: "-5%",
        //justifyContent:"space-between",
        //alignItems:"center",
    },
    tab: {
        height: "35px",
        minHeight: "35px",
        borderTopRightRadius: "10px",
        borderTopLeftRadius: "10px",
        marginRight: "0.5%",
        marginTop: theme.spacing(1),
        backgroundColor: "rgba(171,134,97,0.08)",
    },
    tabSelected: {
        height: "35px",
        minHeight: "35px",
        borderTopRightRadius: "10px",
        borderTopLeftRadius: "10px",
        marginRight: "0.5%",
        marginTop: theme.spacing(0),
        backgroundColor: "rgba(171,134,97,0.18)",
    },
    maximizeTileButton: {
        backgroundColor: "rgba(171,134,97,0.18)",
        float: "right",
        height: "30px",
        width: "30px",
    },

    h1: {
        fontSize: "1.25rem"
    },
    h2: {
        fontSize: "1rem"
    },
    h3: {
        fontSize: "0.8rem",
        textTransform: "uppercase"
    },
    paper: {
        marginRight: theme.spacing(2),
    },
}));

export { theme };
export { useStyles };