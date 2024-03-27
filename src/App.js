import "./App.css";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { useState, useEffect, Fragment } from "react";
import { Routes, Route } from "react-router-dom";
import { studyPlanDataActions } from "./store/studyPlanDataSlice";
import { statusUpdateActions } from "./store/statusUpdateSlice";
import { useUserDataInit } from "./Hooks/useUserDataInit";
import { useRunGatherStudyPlanData } from "./Hooks/useRunGatherStudyPlanData";
// import { useRunGatherContentData } from "./Hooks/useRunGatherContentData";
import Home from "./pages/Home/Home";
import Manage from "./pages/Manage/Manage";
import Demo from "./pages/Demo/Demo";
import CardTransparent from "./UI/Cards/CardTransparent/CardTransparent";
import Header from "./Components/Header/Header";
import BarLoader from "./UI/Loaders/BarLoader/BarLoader";
import { ErrorBoundary } from "./HOC/ErrorHandling/ErrorBoundary/ErrorBoundary";
import LocalErrorDisplay from "./HOC/ErrorHandling/LocalErrorDisplay/LocalErrorDisplay";

function App() {
  const loadingStatus = useSelector(
    (state) => state.loadingRequests.pendingLoadRequests,
  );
  const dispatch = useDispatch();
  // const studyPlanData = GatherStudyPlanData();
  const studyPlan = useSelector((state) => state.studyPlanData);
  const { reGatherStudyPlan } = studyPlan;
  const contentData = useSelector((state) => state.contentData);
  if (
    (!process.env.NODE_ENV || process.env.NODE_ENV === "development") &&
    Object.hasOwn(studyPlan, "studyPlan") &&
    studyPlan.studyPlan
  ) {
    console.log(
      "%cStudyPlan Data:",
      "color:#fff;background:#be6502;padding:5px;border-radius:0 25px 25px 0",
      studyPlan,
    );
    console.log(
      "%cContent Data:",
      "color:#fff;background:#007215;padding:5px;border-radius:0 25px 25px 0",
      contentData,
    );
  }

  const [userInitComplete, setUserInitComplete] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const [localError, setLocalError] = useState({
    title: null,
    active: false,
    message: null,
  });
  const userDataInit = useUserDataInit();
  const [noDBErrors, setNoDBErrors] = useState({
    status: true,
    message: "All is well.",
  });
  let aboutIsActive = false;

  if (contentData.content) {
    aboutIsActive = Object.values(contentData.content).filter((value) => {
      if (value.type.replace(" ", "") !== "about") return false;
      const activeValue = Object.hasOwn(value, "active")
        ? value.active.replace(" ", "")
        : null;
      return activeValue && activeValue !== "false";
    });
    aboutIsActive = aboutIsActive.length > 0;
  }

  ////////////////////////////////////////
  /// Network Communication
  ////////////////////////////////////////
  // axios.interceptors.request.use(
  //   (request) => {
  //     dispatch(loadingRequestsActions.addToLoadRequest());
  //     return request;
  //   },
  //   (error) => {
  //     return Promise.reject(error);
  //   }
  // );

  axios.interceptors.response.use(
    (response) => {
      const serverRateLimitRemaining = response.headers["ratelimit-remaining"];
      if (!process.env.NODE_ENV || process.env.NODE_ENV === "development") {
        console.log(
          "%cRate Limit Remaining: ",
          "color:#fff;background:#ccd62d;padding:5px;border-radius:0 25px 25px 0",
          serverRateLimitRemaining,
        );
      }
      // dispatch(loadingRequestsActions.removeFromLoadRequest());
      // dispatch(
      //   statusUpdateActions.updateStatus({
      //     status: response.status,
      //     statusText: response.statusText,
      //     rateLimitRemaining: serverRateLimitRemaining,
      //   })
      // );
      setTimeout(() => {
        // dispatch(authActions.resetRecentLogout());
        // dispatch(authActions.resetRecentLogin());
      }, 3000);

      return response;
    },
    (error) => {
      console.log(
        "%cERROR:",
        "color:#f0f0ef;background:#ff0000;padding:10px;border-radius:0 25px 25px 0",
        error,
      );
      dispatch(
        statusUpdateActions.updateStatus({
          status:
            Object.hasOwn(error, "response") && error.response.status
              ? error.response.status
              : 500,
          statusText:
            Object.hasOwn(error, "response") && error.response.statusText
              ? error.response.statusText
              : error.message,
        }),
      );
      return Promise.reject(error);
    },
  );

  ////////////////////////////////////////
  /// FUNCTIONALITY
  ////////////////////////////////////////
  const runGatherStudyPlanData = useRunGatherStudyPlanData();
  // const runGatherContentData = useRunGatherContentData();

  ////////////////////////////////////////
  /// EFFECTS
  ////////////////////////////////////////

  ///////
  // Login user at startup if active user cookie.
  useEffect(() => {
    userDataInit({ setLocalError, setUserInitComplete });
  }, []);

  useEffect(() => {
    if (userInitComplete) {
      runGatherStudyPlanData({ user: user, setLocalError });
      // runGatherContentData({ user: user, setLocalError });
    }
  }, [user, userInitComplete]);

  useEffect(() => {
    if (reGatherStudyPlan) {
      runGatherStudyPlanData({ user: user, setLocalError });
      dispatch(studyPlanDataActions.reGatherStudyPlan(false));
    }
  }, [reGatherStudyPlan]);

  // Register error if studyPlan DB not accessible.
  useEffect(() => {
    if (localError.active) {
      setNoDBErrors({
        status: false,
        message: localError.message,
      });
    }
  }, [localError]);

  useEffect(() => {
    if (
      (user && !process.env.NODE_ENV) ||
      process.env.NODE_ENV === "development"
    )
      console.log(
        "%cUser:",
        "color:#fff;background:#007215;padding:5px;border-radius:0 25px 25px 0",
        user,
      );

    // if (user && user !== "not logged in")
    //   // setUser(userLoggedIn);
    //   dispatch(authActions.logIn(user));
  }, [user]);

  useEffect(() => {
    if (!noDBErrors.status)
      dispatch(
        statusUpdateActions.updateStatus({
          status: 500,
          statusText: noDBErrors.message,
        }),
      );
  }, [noDBErrors.status]);

  ////////////////////////////////////////
  /// Output
  ////////////////////////////////////////
  return (
    <div className="App">
      <ErrorBoundary>
        <header className="App-header">
          <CardTransparent>
            <Header
              aboutIsActive={aboutIsActive}
              goalsIsActive={true}
              stepsIsActive={true}
              holdsIsActive={true}
              controlsIsActive={true}
              socialIsActive={false}
            />
          </CardTransparent>
        </header>
      </ErrorBoundary>
      <ErrorBoundary>
        {localError.active && (
          <div className="local-error-container">
            <div className="local-error-inner-wrap">
              <LocalErrorDisplay
                title={localError.title}
                message={localError.message}
              />
            </div>
          </div>
        )}
        {loadingStatus && (
          <div className="bar-loader-container">
            <div className="bar-loader-wrap">
              <BarLoader />
            </div>
          </div>
        )}

        <Routes>
          <Fragment>
            {loadingStatus && <Route path="/*" element={<BarLoader />} />}

            <Fragment>
              <Route
                path="/manage"
                element={
                  <Manage
                    noDBErrors={noDBErrors}
                    setNoDBErrors={setNoDBErrors}
                  />
                }
              />
              <Route
                path="/demo"
                element={
                  <Demo
                    noDBErrors={noDBErrors}
                    setNoDBErrors={setNoDBErrors}
                    aboutIsActive={aboutIsActive}
                    musicIsActive={true}
                    userInitComplete={userInitComplete}
                    user={user}
                  />
                }
              />
              <Route
                path="/"
                element={
                  <Home
                    noDBErrors={noDBErrors}
                    setNoDBErrors={setNoDBErrors}
                    aboutIsActive={aboutIsActive}
                    musicIsActive={true}
                    userInitComplete={userInitComplete}
                    user={user}
                  />
                }
              />
              <Route
                path="*"
                element={
                  <Home
                    notFound={true}
                    noDBErrors={noDBErrors}
                    setNoDBErrors={setNoDBErrors}
                    aboutIsActive={aboutIsActive}
                    musicIsActive={true}
                    userInitComplete={userInitComplete}
                    user={user}
                  />
                }
              />
            </Fragment>
          </Fragment>
        </Routes>
      </ErrorBoundary>
    </div>
  );
}

export default App;
