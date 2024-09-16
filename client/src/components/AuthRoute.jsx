import { Route, Redirect } from "react-router-dom";
import { useContext } from "react";
import UserContext from "../UserProvider";
import { useHistory } from "react-router-dom";

const AuthRoute = ({ component: Component, ...rest }) => {
    const userData = useContext(UserContext);

    const { user } = userData;


  



    
    
    return (
        <Route
            {...rest}
            render={(props) =>
                (user && user !== "Complete Configuration") ? (
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
