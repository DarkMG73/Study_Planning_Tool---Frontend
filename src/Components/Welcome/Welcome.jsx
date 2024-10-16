import { useEffect } from "react";
import { useDispatch } from "react-redux";
import Styles from "./Welcome.module.scss";
import StudyPlanItems from "../StudyPlanItems/StudyPlanItems";
import { loadingRequestsActions } from "../../store/loadingRequestsSlice";
import AddToPlanButton from "../AddToPlanButton/AddToPlanButton";

const Welcome = (props) => {
  let userName = false;
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(loadingRequestsActions.removeFromLoadRequest());
  });

  if (props.user) {
    if (
      Object.hasOwn(props.user, "userName") &&
      props.user.userName.trim() !== ""
    ) {
      userName = props.user.userName;
    } else {
      userName = props.user.email;
    }
  }
  const instructionsJSX = (
    <div className={Styles["instructions-container"]}>
      {" "}
      <h3>Basic Use</h3>
      <ol>
        <li key="0">Create a profile.</li>
        <li key="1">
          click the "Add to Study Plan button" to open the new entry form.{" "}
          <span className={Styles["new-form-button"]}>
            {<StudyPlanItems id="studyPlan" onlyAddToButton={true} />}
          </span>
        </li>

        <li key="2">
          Fill out the small form. The name and type are required, and the "Goal
          or Step this Directly Works Towards" setting is important to be filled
          out for every item except one main goal.
        </li>
        <li key="3">Submit the form using the button at the bottom.</li>
        <li>
          Make sure there is no more or less than one goal showing in the Goals
          section. opening this goal will reveal all supporting goals and steps.
        </li>
        <li key="4">
          The Syllabus section shows all of the steps in order of the priority
          you set. WOrk this list from the highest priority first. (of course,
          you can change the sort order of these items with this sort tool, but
          it will always go back to sorting be priority).
        </li>
        <li key="5">
          Mark the "Status" as you progress through a step to keep a clear view
          of where you are at with each item.{" "}
        </li>
        <li key="6">
          When finished, fill out the "Skill Demonstrations" boxes with detail
          about what you did, what you learned and, ideally, specific takeaways
          that can be used later on a resume or as part of conversations at an
          interview. A link box is provided if you have a link to where an
          example of what you created would be.
        </li>
        <li key="7">
          Mark the "Status" as 100 and click the "Complete" button. If you feel
          you need to come back at a later date and review the material, click
          the Review Needed? button.
        </li>
        <li>
          Move on to the next item in the Syllabus list until every ons is
          completed.
        </li>
        <li key="8">
          At this point, <b>you have achieved your main goal!</b> Time to
          celebrate briefly, then get to work using this new knowledge to
          improve your life and the lives of others.
        </li>
      </ol>
      <p>
        <b>IMPORTANT NOTE</b>:{" "}
        <i>
          The most important setting in any new addition here is the
          aforementioned "Goal or Step this Directly Works Towards" dropdown
          menu. It will be empty when making your original main goal, but with
          each subsequent goal or step all previous goals or steps will be
          available to select. This directly points them towards some part of
          your main goal. If you find yourself adding something that does not
          actually support an existing goal or step, either do not add it
          (because it is not actually helping you) or mark the "Type" setting as
          "Hold" until you figure where it fits into this journey to the one
          main goal. When it is time to add it to the flow, just change the Type
          to a Step or Goal.
        </i>
      </p>
    </div>
  );
  if (props.onlyInstructions) return instructionsJSX;
  return (
    <div className={Styles["welcome-container"]}>
      <div className={Styles["text-container"]}>
        <h2>Welcome{userName && <span> {userName}</span>}!</h2>
        <p>Time to get started on your journey!</p>
        <p>
          Check out this{" "}
          <a
            href="https://studyplan.glassinteractive.com/demo"
            target="_blank"
            rel="noreferrer"
            alt=""
          >
            demo to see what this tool can do for you &rarr;
          </a>
        </p>
        <div>
          {!userName && (
            <p className={Styles["login-text"]}>
              Log in or sign up then &nbsp;
            </p>
          )}

          {userName && (
            <div style={{ textAlign: "center" }}>
              <div className={Styles["new-form-button"]}>
                <AddToPlanButton
                  data={{
                    title:
                      "Click Here To Add a Goal or Step to Your Study Plan!",
                    user: props.user,
                  }}
                />
              </div>
            </div>
          )}
        </div>
        <p>
          First, this is <b>NOT</b> a todo list or planner app. This is a tool
          to effectively take one huge, possibly overwhelming goal and provide
          an easy space to quickly break it down into the steps to conquer...no
          matter how small, large, easy or difficult...and actually work each
          step to achieve the main goal.
        </p>
        <p>
          Start with one huge main goal. Quickly put it in. That is what every
          item added after this point will support. Next, add two or three
          sub-goals that are needed to achieve the main goal. THen add any other
          sup-goals to support those two or three support goals. From there find
          courses, books, tutorials, projects...anything...as a step to support
          each sub-goal.
        </p>
        <p>
          Assuming you use the ""Goal or Step this Directly Works Towards" (and
          you will need to), you will end up with just one goal in the Goals
          section that, when opened, will reveals the tree of goals and steps to
          get there.
        </p>
        <p>
          Syllabus section provides an organized list of steps. Work and
          complete each of these steps. Add new steps as you move forward in
          this journey and learn more of what is needed.
        </p>
        <p>
          When every step is completed, you will have achieved the main goal!
        </p>
        {instructionsJSX}
      </div>
    </div>
  );
};

export default Welcome;
