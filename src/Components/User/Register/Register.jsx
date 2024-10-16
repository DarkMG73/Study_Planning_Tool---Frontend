import styles from "./Register.module.scss";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  registerAUser,
  sign_inAUser,
  setUserCookie,
} from "../../../storage/userDB";
import { authActions } from "../../../store/authSlice";
import { toTitleCase } from "../../../Hooks/utility";
import usePasswordValidator, {
  passwordRequirements,
} from "../../../Hooks/usePasswordValidator";
import ReactCaptcha from "modern-react-captcha";
import reloadIcon from "../../../assets/media/reloadIcon.svg";
import PushButton from "../../../UI/Buttons/PushButton/PushButton";
import FormInput from "../../../UI/Form/FormInput/FormInput";
import { loadingRequestsActions } from "../../../store/loadingRequestsSlice";

const Register = (props) => {
  const dispatch = useDispatch();
  const inDemoMode = useSelector((state) => state.auth.inDemoMode);
  const [user, setUser] = useState({
    userName: "",
    email: "",
    password: "",
  });
  const [loginError, setLoginError] = useState(false);
  const [showLoginError, setShowLoginError] = useState(true);

  const makeLoadingRequest = function () {
    return dispatch(loadingRequestsActions.addToLoadRequest());
  };

  const removeLoadingRequest = function () {
    setTimeout(() => {
      dispatch(loadingRequestsActions.removeFromLoadRequest());
    }, 2000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const groomedName = name.split("#")[1];
    setUser({
      ...user, //spread operator
      [groomedName]: value,
    });
  };
  const [captchaVerified, setCaptchaVerified] = useState();
  const handleCAPTCHASuccess = () => {
    setCaptchaVerified(true);
    setLoginError("Sweet! The CAPTCHA matches! You are not a robot!");
    setShowLoginError(true);
  };
  const handleCAPTCHAFailure = () => {
    setLoginError("Oh no! CAPTCHA test does not match yet.");
    setShowLoginError(true);
    setCaptchaVerified(false);
  };
  const horizontalDisplay = props.horizontalDisplay ? "horizontal-display" : "";
  const passwordValidator = usePasswordValidator();

  const inputsValidate = (inputNameObject) => {
    /////////////////
    //INPUT CRITERIA
    //////////////////
    const validEmailRegex =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

    for (const key in inputNameObject) {
      if (
        !inputNameObject[key].constructor === String ||
        !inputNameObject[key].length > 0
      ) {
        return {
          valid: false,
          message:
            'The "' +
            toTitleCase(key, true) +
            '" field is empty. Please fill this in.',
        };
      } else if (
        key === "email" &&
        !inputNameObject[key].match(validEmailRegex)
      ) {
        return {
          valid: false,
          message:
            "The email address is not a valid email format. Please use a standard email address.",
        };
      } else if (key === "email" && !inputNameObject[key].includes(".")) {
        // If not period, ask if that was intended
        if (!inputNameObject[key].includes(".")) {
          const confirmPeriod = window.confirm(
            'There does not appear to be period "." in the email address. If there is no period in this email address, click "OK" to submit the form. \n\nMost email addresses have a period and a suffix like ".com" or ".net". If this email address should have a period, then click "CANCEL" to return to the registration form',
          );
          if (!confirmPeriod) return;
        }
      } else if (key === "password") {
        const passwordValidCheck = passwordValidator(
          inputNameObject[key],
          true,
        );

        if (!passwordValidCheck.isValid) {
          if (process.env.NODE_ENV === "development")
            return {
              valid: false,
              message: `The password does not meet the requirements. It failed with these errors:\n\n${passwordValidCheck.details
                .map((error, i) => {
                  const groomedMessage = error.message
                    .replace("string", "password")
                    .replace("digit", "number");
                  return "   " + (i + 1) + ": " + groomedMessage + ". ";
                })
                .join(
                  "\n",
                )}\n\nHere are all of the password requirements: ${passwordRequirements}`,
            };
        }
      }
    }
    return {
      valid: true,
      message: "Everything checked out OK",
    };
  };

  const completeSignInProcedures = (res) => {
    setLoginError(false);

    if (!inDemoMode)
      setUserCookie(res.data).then((res) => {
        if (process.env.NODE_ENV === "development")
          console.log(
            "%cSetting User Cookie:",
            "color:#287094;background:#f0f0ef;padding:5px;border-radius:0 25px 25px 0",
            res,
          );
      });

    dispatch(authActions.logIn(res.data));
  };

  const beginRegistration = (e) => {
    e.preventDefault();

    const { userName, email, password } = user;

    if (captchaVerified) {
      const inputsValidCheck = inputsValidate({ userName, email, password });
      if (inputsValidCheck.valid) {
        // axios("http://localhost:8000/api/users/auth/register", user)
        makeLoadingRequest();
        registerAUser(user).then((res) => {
          if (res && res.status >= 400) {
            alert(
              `There was an error trying to complete the registration process. ${res.message}`,
            );
          }
          if (res && res.status < 400) {
            sign_inAUser(user)
              .then((res) => {
                if (res && Object.hasOwn(res, "status")) {
                  if (res.status >= 200 && res.status < 400) {
                    completeSignInProcedures(res);
                  } else if (res.status === 404) {
                    setLoginError(
                      "There was a problem finding the user database. Make sure you are connected to the internet. Contact the site admin if the problem continues. Error: " +
                        res.status +
                        " | " +
                        res.statusText,
                    );
                    setShowLoginError(true);
                  } else if (res.status >= 400) {
                    setLoginError(
                      res.data.message ? res.data.message : res.statusText,
                    );
                    setShowLoginError(true);
                  }
                } else if (res && Object.hasOwn(res, "data")) {
                  setLoginError(false);
                  dispatch(authActions.logIn(res.data));
                } else {
                  setLoginError(
                    "Unfortunately, something went wrong and we can not figure out what happened.  Please refresh and try again.",
                  );
                  setShowLoginError(true);
                }
                removeLoadingRequest();
              })
              .catch((err) => {
                setLoginError(err);
                setShowLoginError(true);
                removeLoadingRequest();
              });
          }
        });
      } else {
        setLoginError(inputsValidCheck.message);
        setShowLoginError(true);
        alert("Invalid Input Error: " + inputsValidCheck.message);
      }
    } else {
      alert(
        'The CAPTCHA test has failed. Please fix the wrong items and then resubmit. Keep in mind that "I" and "1" and "l" can look really similar in that test. "0", "O" and "o" can also be mistaken.',
      );
    }
  };

  /////////////////////////////////////////
  // BUTTON HANDLERS
  /////////////////////////////////////////
  const errorDisplayButtonHandler = () => {
    setShowLoginError(!showLoginError);
  };

  /////////////////////////////////////////
  // Return
  /////////////////////////////////////////
  return (
    <div
      className={`${styles["registration-container"]}   ${styles[horizontalDisplay]}`}
    >
      <div className={styles["registration-title-wrap"]}>
        <h3 className={styles["registration-title"]}>Create a new account</h3>
      </div>
      <span className={styles["registration-question"]}>
        Already have an account ?
        <PushButton
          inputOrButton="button"
          colorType="secondary"
          value="login"
          data=""
          size="small"
          onClick={props.toggleSignupLoginButtonHandler}
          styles={{ borderRadius: "50px", height: "2em", padding: "0 2em" }}
        >
          &#x21e6;Login
        </PushButton>
      </span>
      <div className={styles["registration-form-wrap"]}>
        <form className={styles["form"]} action="#">
          <div className={styles["form-input-container"]}>
            <FormInput
              key={"register-4"}
              formNumber={1}
              inputDataObj={{
                name: "userName",
                title: "User Name",
                type: "text",
                value: user.name,
                placeholder: "User Name",
              }}
              requiredError={{}}
              onChange={handleChange}
            />
          </div>

          <div className={styles["form-input-container"]}>
            <FormInput
              key={"register-4"}
              formNumber={1}
              inputDataObj={{
                name: "email",
                title: "Email",
                type: "email",
                value: user.email,
                placeholder: "Email Address",
              }}
              requiredError={{}}
              onChange={handleChange}
            />
          </div>

          <div className={styles["form-input-container"]}>
            <FormInput
              key={"register-4"}
              formNumber={1}
              inputDataObj={{
                name: "password",
                title: "Password",
                type: "password",
                value: user.password,
                placeholder: "Password",
              }}
              requiredError={{}}
              onChange={handleChange}
            />
          </div>

          <div
            className={`${styles["form-input-container"]} ${styles["captcha-container"]}`}
          >
            <div
              className={`${styles["inner-form-input-container"]} ${styles["captcha-wrap"]}`}
            >
              <label>Separate Bots from Humans</label>
              <ReactCaptcha
                key={"captcha" + horizontalDisplay}
                charset="un"
                length={5}
                color="var(--spt-color-accent)"
                bgColor="var(--spt-color-background)"
                reload={true}
                reloadText="Reload Captcha"
                reloadIcon={reloadIcon}
                handleSuccess={handleCAPTCHASuccess}
                handleFailure={handleCAPTCHAFailure}
              />
            </div>
          </div>

          <div className={styles["form-submit-button-wrap"]}>
            <PushButton
              inputOrButton="button"
              colorType="secondary"
              value="login"
              data=""
              size="large"
              onClick={beginRegistration}
              styles={{
                borderRadius: "10px",
                height: "2em",
                padding: "0px 2em",
                margin: "0 1em 2em",
              }}
            >
              Submit Registration
            </PushButton>
          </div>
        </form>
        {loginError && showLoginError && (
          <div className={styles["form-input-error"]}>
            <button
              className={styles["form-input-error-close-button"]}
              onClick={errorDisplayButtonHandler}
            >
              X
            </button>
            <p>{loginError}</p>
          </div>
        )}
      </div>
    </div>
  );
};
export default Register;
