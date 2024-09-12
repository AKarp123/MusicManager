import { useState, useEffect } from "react";
import { Route, Switch } from "react-router-dom";
import AuthRoute from "./components/AuthRoute"
import Login from "./components/Login";
import { UserProvider } from "./UserProvider";
import Home from "./components/Home";
import Register from "./components/register";
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
                    <Route exact path="/login" component={Login} />
                    <Route exact path="/register" component={Register} />
                    <AuthRoute path="/" component={Home} />
                </Switch>
            </UserProvider>
            <CssBaseline />
        </ThemeProvider>
    );
}

export default App;
