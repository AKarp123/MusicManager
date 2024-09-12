import { Route, Redirect } from "react-router-dom";
import { useContext } from "react";
import UserContext from "../UserProvider";

const AuthRoute = ({ component: Component, ...rest }) => {
    const { user } = useContext(UserContext);

    if (user === "Loading") {
        return <></>;
    }

    return (
        <Route
            {...rest}
            render={(props) =>
                user ? (
                    <Component {...props} />
                ) : (
                    <Redirect
                        to={{
                            pathname: "/login",
                            state: {
                                from: props.location,
                            },
                        }}
                    />
                )
            }
        />
    );
};

export default AuthRoute;
