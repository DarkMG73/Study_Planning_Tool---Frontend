import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import styles from "./LoginStatus.module.scss";
import { authActions } from "../../../store/authSlice";
import { deleteUserCookie } from "../../../storage/userDB";
import { studyPlanDataActions } from "../../../store/studyPlanDataSlice";
import PushButton from "../../../UI/Buttons/PushButton/PushButton";
import Register from "../Register/Register";
import Login from "../Login/Login";

function LoginStatus(props) {
  const userData = useSelector((state) => state.auth);
  const user = userData.user;
  const dispatch = useDispatch();
  const [showLoginForm, setShowLoginForm] = useState(true);
  const [showSignupForm, setShowSignupForm] = useState(false);
  // const [loginEmail, setLoginEmail] = useState("");
  // const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState(false);
  const horizontalDisplay = props.horizontalDisplay ? "horizontal-display" : "";
  const uniqueID = props.uniqueID;
  const toggleSignupLoginButtonHandler = () => {
    setShowLoginForm(!showLoginForm);
    setShowSignupForm(!showSignupForm);
  };

  const addAToolButtonHandler = () => {
    dispatch(studyPlanDataActions.goToAddATool());
  };

  const logOutButtonHandler = async () => {
    const shouldDelete = window.confirm("Are you sure you want to do this?");

    if (!shouldDelete) return;
    try {
      deleteUserCookie();
      dispatch(authActions.logOut());
      setLoginError(false);
    } catch (error) {
      setLoginError(
        "Unfortunately, we could not log you out. Please contact general@glassinteractive.com if the problem continues. Error received: " +
          error.message
      );
    }
  };

  return (
    <div
      id={"db-login-container-" + uniqueID}
      className={`${styles["inner-wrap "]}  ${styles["db-login-container"]} ${styles[horizontalDisplay]}`}
    >
      <p
        id={"db-login-status-container-" + uniqueID}
        className={styles["db-login-status-container"]}
      >
        <span
          id={"db-login-status-" + uniqueID}
          className={styles["db-login-status"]}
        >
          {user ? (
            <span
              id={"login-text-" + uniqueID}
              className={styles["login-text"]}
            >
              {" "}
              {user.email} is Logged In{" "}
            </span>
          ) : (
            <span
              id={"login-text-" + uniqueID}
              className={
                styles["login-text"] + " " + styles["not-logged-in-text"]
              }
            >
              {" "}
              Login to access your study plan or sign up to get started!
            </span>
          )}
        </span>
      </p>
      <div
        id={"button-container-" + uniqueID}
        className={styles["button-container"] + uniqueID}
      >
        {!user && (
          <>
            <div
              id={"form-container-" + uniqueID}
              className={styles["form-container"]}
            >
              {showLoginForm && (
                <Login
                  toggleSignupLoginButtonHandler={
                    toggleSignupLoginButtonHandler
                  }
                  horizontalDisplay={props.horizontalDisplay}
                  signUpButtonStyles={props.signUpButtonStyles}
                  hideTitles={props.hideTitles}
                />
              )}
              {showSignupForm && (
                <Register
                  toggleSignupLoginButtonHandler={
                    toggleSignupLoginButtonHandler
                  }
                  horizontalDisplay={props.horizontalDisplay}
                />
              )}
            </div>
          </>
        )}

        {user && (
          <PushButton
            inputOrButton="button"
            id="logout-from-db"
            colorType="secondary"
            value="logout from db"
            data=""
            size="small"
            onClick={logOutButtonHandler}
            styles={{ margin: "1em auto", textTransform: "uppercase" }}
          >
            Log Out
          </PushButton>
        )}
        {loginError && <p>{loginError}</p>}
      </div>
      {props.showAddAQuestionButton && (
        <PushButton
          inputOrButton="button"
          id="create-entry-btn"
          colorType="secondary"
          value="Add a Question"
          data=""
          size="small"
          onClick={addAToolButtonHandler}
          styles={{
            width: "300px",
            letterSpacing: "var(--spt-spacing-subheading)",
            fontVariant: "small-caps",
            textAlign: "center",
            display: "flex",
            justifyContent: "center",
            margin: "1.5em auto",
            padding: "0.75em",
            transform: "none",
            borderRadius: "50px",
          }}
        >
          <span>Add a Question</span>
        </PushButton>
      )}
    </div>
  );
}

export default LoginStatus;
