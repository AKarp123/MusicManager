import { useState } from "react";
import { Route, Switch } from "react-router-dom";
import AuthRoute from "./AuthRoute";
import Login from "./login";
import { UserProvider } from "./UserProvider";
import Home from "./Home";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";

const darkTheme = createTheme({
    palette: {
        mode: "dark",
    },
});

function App() {
    

    return (
        <ThemeProvider theme={darkTheme}>
            <UserProvider>
                <Switch>
                    <Route path="/login" component={Login} />
                    <AuthRoute path="/" component={Home} />
                </Switch>
            </UserProvider>
            <CssBaseline />
        </ThemeProvider>
    );
}

export default App;
