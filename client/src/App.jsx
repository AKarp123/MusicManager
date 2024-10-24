import { useState, useEffect } from "react";
import { Route, Switch } from "react-router-dom";
import AuthRoute from "./components/AuthRoute";
import Login from "./components/Login";
import { UserProvider } from "./UserProvider";
import Home from "./components/Home";
import Register from "./components/Register";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { CssBaseline, Alert, Snackbar } from "@mui/material";
import ErrorContext from "./ErrorContext";

const darkTheme = createTheme({
    palette: {
        mode: "dark",
    },
});

function App() {
    const [error, setError] = useState(null);

    const displayError = (errorMessage, variant = "error") => {

        setError({ errorMessage, variant });
    };

    return (
        <ThemeProvider theme={darkTheme}>
            <CssBaseline />
            <ErrorContext.Provider value={displayError}>
                <UserProvider>
                    <Switch>
                        <Route exact path="/login" component={Login} />
                        <Route exact path="/register" component={Register} />
                        <AuthRoute path="/" component={Home} />
                    </Switch>
                </UserProvider>
            </ErrorContext.Provider>
            {error && (
                <Snackbar
                    open={error !== undefined && error !== null}
                    autoHideDuration={2000}
                    onClose={() => setError(null)}
                >
                    <Alert
                        severity={error.variant}
                        onClose={() => setError(null)}
                    >
                        {error.errorMessage}
                    </Alert>
                </Snackbar>
            )}
        </ThemeProvider>
    );
}

export default App;
