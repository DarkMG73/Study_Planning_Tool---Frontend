import { useState, useEffect, Fragment, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import styles from "./StudyPlanItemsList.module.scss";
import StudyPlanItemsSubList from "../StudyPlanItemsSubList/StudyPlanItemsSubList";
import StudyPlanItem from "../StudyPlanItem/StudyPlanItem";
import { deleteDocFromDb } from "../../../storage/studyPlanDB";
import { deleteContentDocFromDb } from "../../../storage/contentDB";
import CollapsibleElm from "../../../UI/CollapsibleElm/CollapsibleElm";
import { studyPlanDataActions } from "../../../store/studyPlanDataSlice";
import { loadingRequestsActions } from "../../../store/loadingRequestsSlice";

const StudyPlanItemsList = (props) => {
  const [refresh] = useState(1);
  const studyPlanItemsObj = props.studyPlanItemsObj;
  const user = useSelector((state) => state.auth.user);
  const parentKey = props.parentKey;
  const parentsParentKey = props.parentsParentKey;
  const parentMasterID = props.parentMasterID;
  const parentMasterType = props.parentMasterType;
  const section = props.section;
  const subListLevel = props.subListLevel;
  const formInputData = useSelector((state) => state.formInputData);
  const displayConditions = props.displayConditions;
  const onlyList = props.onlyList;
  const noEditButton = props.noEditButton;
  const [showProtectedHidden, setShowProtectedHidden] = useState(
    props.showProtectedHidden ? props.showProtectedHidden : []
  );
  const showProtectedHiddenRef = useRef();
  showProtectedHiddenRef.current = showProtectedHidden;
  const [unlockProtectedVisible, setUnlockProtectedVisible] = useState(
    props.unlockProtectedVisible ? props.unlockProtectedVisible : []
  );
  const unlockProtectedVisibleRef = useRef();
  unlockProtectedVisibleRef.current = unlockProtectedVisible;
  const [existingFormInputValuesObj, setExistingFormInputValuesObj] = useState(
    {}
  );
  const existingFormInputValuesObjRef = useRef();
  const dispatch = useDispatch();

  ////////////////////////////////////////////////////////////////
  /// Functionality
  ////////////////////////////////////////////////////////////////
  const updateExistingFormState = (
    parentMasterID,
    parentKey,
    title,
    outputValue
  ) => {
    existingFormInputValuesObjRef.current = outputValue;

    setExistingFormInputValuesObj((prevState) => {
      const outputObj = { ...prevState };

      if (!Object.hasOwn(outputObj, parentMasterID)) {
        outputObj[parentMasterID] = { [title]: outputValue };
      } else if (
        Object.hasOwn(outputObj[parentMasterID], title) &&
        !["String", "Array", "number", "Boolean"].includes(
          outputObj[parentMasterID][title].constructor.name
        )
      ) {
        outputObj[parentMasterID][title] = {
          ...outputObj[parentMasterID][title],
          ...outputValue,
        };
      } else {
        outputObj[parentMasterID][title] = outputValue;
      }

      return outputObj;
    });

    //////
  };

  existingFormInputValuesObjRef.current = existingFormInputValuesObj;

  ////////////////////////////////////////////////////////////////////////
  /// Effects
  ////////////////////////////////////////////////////////////////////////
  useEffect(() => {
    dispatch(loadingRequestsActions.removeFromLoadRequest());
  }, []);

  useEffect(() => {
    existingFormInputValuesObjRef.current = existingFormInputValuesObj;
  }, [existingFormInputValuesObj]);

  // useEffect(() => {}, [existingFormInputValuesObjRef.current]);

  ////////////////////////////////////////////////////////////////////////
  /// HANDLERS
  ////////////////////////////////////////////////////////////////////////
  const unlockProtectedVisibleHandler = (e) => {
    e.preventDefault();
    const buttonMasterID = e.target.value;

    setUnlockProtectedVisible((prevState) => {
      const output = [...prevState];
      if (output.includes(buttonMasterID)) {
        output.splice(output.indexOf(buttonMasterID), 1);
      } else {
        output.push(buttonMasterID);
      }
      return output;
    });
  };

  const showProtectedHiddenHandler = (e) => {
    e.preventDefault();

    const buttonMasterID = e.target.value;
    setShowProtectedHidden((prevState) => {
      const output = [...prevState];
      if (output.includes(buttonMasterID)) {
        output.splice(output.indexOf(buttonMasterID), 1);
      } else {
        output.push(buttonMasterID);
      }
      return output;
    });
  };

  const submitFormButtonHandler = (e) => {
    e.preventDefault();
    dispatch(loadingRequestsActions.addToLoadRequest());

    // Allow a pause to ensure input data is fully updated to existing form state
    setTimeout(() => {
      const parentMasterID = e.target.getAttribute("data-parentmasterid");
      // const parentSection = e.target.getAttribute("data-section");
      const rawItemWithNewEdits = { ...studyPlanItemsObj[parentMasterID] };
      const _id = rawItemWithNewEdits._id;
      const existingFormEdits = { ...formInputData.existingFormInputDataObj };

      for (const key in existingFormEdits[parentMasterID]) {
        if (key === "markcomplete" || key === "markforreview") {
          if (
            existingFormEdits[parentMasterID][key] === "false" ||
            existingFormEdits[parentMasterID][key] === ""
          ) {
            rawItemWithNewEdits[key] = false;
          } else {
            rawItemWithNewEdits[key] = true;
          }
          rawItemWithNewEdits[key] = existingFormEdits[parentMasterID][key];
        }
        if (
          existingFormEdits[parentMasterID][key] &&
          existingFormEdits[parentMasterID][key].constructor === Object
        ) {
          const newInnerItemWithNewEdits = {};

          for (const innerKey in existingFormEdits[parentMasterID][key]) {
            newInnerItemWithNewEdits[innerKey] =
              existingFormEdits[parentMasterID][key][innerKey];
          }

          if (key == 0) {
            const newKey = Object.keys(newInnerItemWithNewEdits)[0];
            rawItemWithNewEdits[newKey] = newInnerItemWithNewEdits[newKey];
          } else {
            rawItemWithNewEdits[key] = { ...newInnerItemWithNewEdits };
          }
        } else {
          rawItemWithNewEdits[key] = existingFormEdits[parentMasterID][key];
        }
      }

      // Clean itemWithNewEdits
      const itemWithNewEdits = {};
      for (const [key, value] of Object.entries(rawItemWithNewEdits)) {
        if (key === "_id") {
          delete itemWithNewEdits[key];
        } else if (
          (key === "markcomplete" || key === "markforreview") &&
          rawItemWithNewEdits[key].constructor !== Boolean
        ) {
          if (
            existingFormEdits[parentMasterID] &&
            (!existingFormEdits[parentMasterID][key] ||
              ["", "false"].includes(existingFormEdits[parentMasterID][key]))
          ) {
            itemWithNewEdits[key] = false;
          } else {
            itemWithNewEdits[key] = true;
          }
        } else {
          itemWithNewEdits[key] = value;
        }
      }
      if (user) {
        dispatch(
          studyPlanDataActions.updateOneStudyPlanItem({
            _id: _id,
            item: itemWithNewEdits,
          })
        );

        dispatch(
          studyPlanDataActions.updateStudyPlanDB({ itemWithNewEdits, user })
        );
        // updateAStudyPlanItem(dataObj, user);
      } else {
        alert("You must be logged in to be able to make changes.");
      }
      dispatch(loadingRequestsActions.removeFromLoadRequest());
    }, 7000);
  };

  const deleteFormButtonHandler = (e) => {
    e.preventDefault();

    const parentMasterID = e.target.getAttribute("data-parentmasterid");
    const parentSection = e.target.getAttribute("data-section");
    const itemIdentifier = studyPlanItemsObj[parentMasterID].identifier;
    const deleteItemFromDB =
      parentSection === "content" ? deleteContentDocFromDb : deleteDocFromDb;
    const confirm = window.confirm(
      "Are you sure you want to delete the " +
        studyPlanItemsObj[parentMasterID].type +
        ' titled "' +
        studyPlanItemsObj[parentMasterID].name +
        ' "?'
    );
    if (confirm && user && user.isAdmin == true) {
      // if (true) {

      deleteItemFromDB(itemIdentifier, user).then((res) => {
        const status = res.status ? res.status : res.response.status;
        if (status >= 400) {
          alert("There was an error: " + res.response.data.message);
        } else if (status >= 200) {
          alert("Success! The item has been deleted.");
          // setInEditMode(false);
        } else {
          alert("there was an error: " + res.message);
        }
      });
    } else if (confirm) {
      const sendEmail = window.confirm(
        '2222 Thank you for contributing. All contributions must be reviewed before becoming public. Click "OK" to send this via email for review and, if approved, to be included. Click "Cancel" to cancel this and not send an email.'
      );
      if (sendEmail) {
        const questionAdminEmail = "general@glassinteractive.com";
        const subject =
          "A Question Edit Request for the Interview Questions Tool";
        const body = `A question edit is being recommended: ${JSON
          .stringify
          // editedQuestions.current.edits
          ()}`;
        window.open(
          `mailto:${questionAdminEmail}?subject=${subject}l&body=${encodeURIComponent(
            body
          )}`
        );
      }
    }
  };

  ////////////////////////////////////////////////////////////////////////
  /// OUTPUT
  ////////////////////////////////////////////////////////////////////////
  if (studyPlanItemsObj)
    return Object.keys(studyPlanItemsObj).map((key) => {
      if (
        studyPlanItemsObj[key] &&
        Object.hasOwn(studyPlanItemsObj[key], "dependencies") &&
        studyPlanItemsObj[key].dependencies.length > 0
      )
        return (
          <ul
            data-marker="CATALOG-ITEM-LIST"
            data-section={section}
            key={key}
            id={key}
            type={props.type ? props.type : studyPlanItemsObj[key].type}
            data-parentmastertype={
              parentMasterType ? parentMasterType : studyPlanItemsObj[key].type
            }
            data-maingoal={
              "" +
              (Object.hasOwn(studyPlanItemsObj[key], "msup") &&
                studyPlanItemsObj[key].msup.trim() === "")
            }
            data-forreview={
              "" +
              (Object.hasOwn(studyPlanItemsObj[key], "markforreview") &&
                studyPlanItemsObj[key].markforreview &&
                studyPlanItemsObj[key].markforreview !== "false")
            }
            data-markedcomplete={
              "" +
              (Object.hasOwn(studyPlanItemsObj[key], "markcomplete") &&
                studyPlanItemsObj[key].markcomplete &&
                studyPlanItemsObj[key].marcomplete !== "false")
            }
            className={
              (subListLevel > 0 &&
                styles.subgroup +
                  " " +
                  styles[!!parentKey && !parentsParentKey && "subgroup-set"] +
                  " " +
                  styles[!!parentKey && "subgroup-set-child"] +
                  " " +
                  styles["subgroup-" + key] +
                  " " +
                  styles["sub-level-" + subListLevel]) +
              " " +
              ((!subListLevel || subListLevel <= 0) &&
                styles["master-parent-group"]) +
              " " +
              styles[key] +
              " " +
              styles[parentKey] +
              " " +
              styles[parentMasterID] +
              " " +
              (unlockProtectedVisible.includes(key) && styles["edited-list"]) +
              " " +
              (props.inModal && styles["in-modal"])
            }
          >
            <CollapsibleElm
              elmId={key + "-collapsible-elm"}
              styles={{
                position: "relative",
                maxWidth: "100%",
              }}
              maxHeight={"3em"}
              s
              inputOrButton="button"
              buttonStyles={{
                margin: "0 auto",
                padding: "0.5em 2em",
                transition: "0.7s all ease",
                maxWidth: "80%",
                textAlign: "center",
                display: "flex",
                alignItems: "center",
                borderRadius: "0 0 50px 0",
                fontFamily: "Arial",
                border: "none",
                position: "absolute",
                top: "0",
                left: "0",
                flexGrow: "1",
                minWidth: "4.5em",
                boxShadow:
                  "inset 3px 3px 5px 0px #ffffffe0, inset -3px -3px 5px 0px #00000038",
                fontSize: "1.2rem",
                fontVariant: "all-small-caps",
                letterSpacing: "0.2em",
                cursor: "pointer",
                height: "100%",
                maxHeight: "4em",
                transformOrigin: "left",
              }}
              colorType="primary"
              data=""
              size="small"
              open={false}
              showBottomGradient={false}
              buttonTextOpened={<Fragment>&uarr;Less</Fragment>}
              buttonTextClosed={<Fragment>&darr;More</Fragment>}
              hideButtonArrows={true}
            >
              <h2
                key={parentKey}
                className={
                  styles["group-title"] +
                  " " +
                  styles[parentKey] +
                  " " +
                  styles.title
                }
              >
                {studyPlanItemsObj[key] &&
                Object.hasOwn(studyPlanItemsObj[key], "name") ? (
                  <Fragment>
                    <span className={styles["title"]}>
                      {studyPlanItemsObj[key].name}
                    </span>
                  </Fragment>
                ) : (
                  key
                )}
              </h2>
              <StudyPlanItemsSubList
                key={studyPlanItemsObj[key]}
                studyPlanItemsObj={studyPlanItemsObj[key]}
                allStudyPlanItems={props.allStudyPlanItems}
                parentKey={key}
                parentsParentKey={parentKey}
                parentMasterID={
                  parentMasterID ? parentMasterID : studyPlanItemsObj[key]._id
                }
                parentMasterType={
                  parentMasterType
                    ? parentMasterType
                    : studyPlanItemsObj[key].type
                }
                section={section}
                displayConditions={displayConditions}
                subListLevel={subListLevel}
                unlockProtectedVisible={
                  props.unlockProtectedVisible
                    ? props.unlockProtectedVisible
                    : unlockProtectedVisible
                }
                showProtectedHidden={
                  props.showProtectedHidden
                    ? props.showProtectedHidden
                    : showProtectedHidden
                }
                refresh={refresh}
                onlyList={onlyList}
                emptyForm={props.emptyForm}
                setFormType={props.setFormType}
              />
              <ul
                className={styles["dependencies-container"]}
                data-section={section}
              >
                <h3>The Path to {studyPlanItemsObj[key].name}</h3>

                {props.allStudyPlanItems &&
                  studyPlanItemsObj[key].dependencies.map(
                    (dependencyIdentifier) => {
                      const dependenciesObj = Object.values(
                        props.allStudyPlanItems
                      ).filter(
                        (item) => dependencyIdentifier === item.identifier
                      );
                      if (dependenciesObj.length <= 0) return false;
                      return (
                        <StudyPlanItemsSubList
                          key={
                            key +
                            "-" +
                            section +
                            "-" +
                            parentKey +
                            "-" +
                            (parentMasterID
                              ? parentMasterID
                              : studyPlanItemsObj[key]._id) +
                            "-" +
                            subListLevel +
                            "-" +
                            (props.type
                              ? props.type
                              : studyPlanItemsObj[key].type +
                                "-" +
                                (dependenciesObj &&
                                  dependenciesObj.length > 0 &&
                                  Object.hasOwn(dependenciesObj[0], "_id") &&
                                  dependenciesObj[0]._id) +
                                "-sub--2")
                          }
                          studyPlanItemsObj={dependenciesObj}
                          allStudyPlanItems={props.allStudyPlanItems}
                          parentKey={key}
                          parentsParentKey={parentKey}
                          parentMasterID={
                            parentMasterID
                              ? parentMasterID
                              : studyPlanItemsObj[key]._id
                          }
                          parentMasterType={
                            parentMasterType
                              ? parentMasterType
                              : studyPlanItemsObj[key].type
                          }
                          section={section}
                          displayConditions={displayConditions}
                          subListLevel={subListLevel}
                          unlockProtectedVisible={
                            props.unlockProtectedVisible
                              ? props.unlockProtectedVisible
                              : unlockProtectedVisible
                          }
                          showProtectedHidden={
                            props.showProtectedHidden
                              ? props.showProtectedHidden
                              : showProtectedHidden
                          }
                          refresh={refresh}
                          onlyList={onlyList}
                          emptyForm={props.emptyForm}
                          setFormType={props.setFormType}
                        />
                      );
                    }
                  )}
              </ul>
              {!onlyList && !subListLevel && (
                <div className={styles["button-container"]}>
                  {!noEditButton && (
                    <button
                      className={
                        styles["form-button"] + " " + styles["edit-form-button"]
                      }
                      value={key}
                      data-parentmasterid={key}
                      onClick={unlockProtectedVisibleHandler}
                    >
                      {!unlockProtectedVisible.includes(key) && (
                        <Fragment>
                          <span>Edit </span>
                          <span className={styles["edit-button-target-name"]}>
                            "{studyPlanItemsObj[key].name}"
                          </span>
                        </Fragment>
                      )}
                      {unlockProtectedVisible.includes(key) && (
                        <Fragment>
                          Cancel Editing{" "}
                          <span className={styles["edit-button-target-name"]}>
                            {studyPlanItemsObj[key].name}
                          </span>
                          <span
                            className={styles["edit-button-cancel-title"]}
                          ></span>
                        </Fragment>
                      )}
                    </button>
                  )}
                  <button
                    className={
                      styles["form-button"] +
                      " " +
                      styles["show-hidden-form-button"]
                    }
                    value={key}
                    data-parentmasterid={key}
                    onClick={showProtectedHiddenHandler}
                  >
                    Show Hidden Fields
                  </button>
                  {!onlyList && unlockProtectedVisible.includes(key) && (
                    <Fragment>
                      <button
                        className={
                          styles["form-button"] +
                          " " +
                          styles["submit-form-button"]
                        }
                        value={key}
                        data-parentmasterid={key}
                        data-section={section}
                        onClick={submitFormButtonHandler}
                      >
                        Submit Changes
                      </button>{" "}
                      <button
                        className={
                          styles["form-button"] +
                          " " +
                          styles["delete-form-button"]
                        }
                        value={key}
                        data-parentmasterid={key}
                        data-section={section}
                        onClick={deleteFormButtonHandler}
                      >
                        Delete
                      </button>
                    </Fragment>
                  )}
                </div>
              )}{" "}
            </CollapsibleElm>
          </ul>
        );
      if (studyPlanItemsObj[key] && typeof studyPlanItemsObj[key] === "object")
        return (
          <ul
            data-marker="CATALOG-ITEM-LIST"
            data-section={section}
            key={
              key +
              section +
              parentKey +
              parentMasterType +
              subListLevel +
              onlyList +
              (props.type
                ? props.type
                : studyPlanItemsObj[key].type + "-sub--2")
            }
            id={key}
            type={props.type ? props.type : studyPlanItemsObj[key].type}
            data-parentmastertype={
              parentMasterType ? parentMasterType : studyPlanItemsObj[key].type
            }
            data-maingoal={
              "" +
              (Object.hasOwn(studyPlanItemsObj[key], "msup") &&
                studyPlanItemsObj[key].msup.trim() === "")
            }
            data-forreview={
              "" +
              (Object.hasOwn(studyPlanItemsObj[key], "markforreview") &&
                studyPlanItemsObj[key].markforreview &&
                studyPlanItemsObj[key].markforreview !== "false")
            }
            data-markedcomplete={
              "" +
              (Object.hasOwn(studyPlanItemsObj[key], "markcomplete") &&
                studyPlanItemsObj[key].markcomplete &&
                studyPlanItemsObj[key].marcomplete !== "false")
            }
            className={
              (subListLevel > 0 &&
                styles.subgroup +
                  " " +
                  styles[!!parentKey && !parentsParentKey && "subgroup-set"] +
                  " " +
                  styles[!!parentKey && "subgroup-set-child"] +
                  " " +
                  styles["subgroup-" + key] +
                  " " +
                  styles["sub-level-" + subListLevel]) +
              " " +
              ((!subListLevel || subListLevel <= 0) &&
                styles["master-parent-group"]) +
              " " +
              styles[key] +
              " " +
              styles[parentKey] +
              " " +
              styles[parentMasterID] +
              " " +
              (unlockProtectedVisible.includes(key) && styles["edited-list"]) +
              " " +
              (props.inModal && styles["in-modal"])
            }
          >
            <CollapsibleElm
              elmId={key + "-collapsible-elm"}
              styles={{
                position: "relative",
                maxWidth: "100%",
              }}
              maxHeight={"3em"}
              s
              inputOrButton="button"
              buttonStyles={{
                margin: "0 auto",
                padding: "0.5em 2em",
                transition: "0.7s all ease",
                maxWidth: "80%",
                textAlign: "center",
                display: "flex",
                alignItems: "center",
                borderRadius: "0 0 50px 0",
                fontFamily: "Arial",
                border: "none",
                position: "absolute",
                top: "0",
                left: "0",
                flexGrow: "1",
                minWidth: "4.5em",
                height: "100%",
                maxHeight: "4em",
                boxShadow:
                  "inset 3px 3px 5px 0px #ffffffe0, inset -3px -3px 5px 0px #00000038",
                fontSize: "1.2rem",
                fontVariant: "all-small-caps",
                letterSpacing: "0.2em",
                cursor: "pointer",
                transformOrigin: "left",
              }}
              colorType="primary"
              data=""
              size="small"
              open={false}
              showBottomGradient={false}
              buttonTextOpened={<Fragment>&uarr;Less</Fragment>}
              buttonTextClosed={<Fragment>&darr;More</Fragment>}
              hideButtonArrows={true}
            >
              <h2
                className={
                  styles["group-title"] +
                  " " +
                  styles[parentKey] +
                  " " +
                  styles.title
                }
              >
                {studyPlanItemsObj[key] &&
                Object.hasOwn(studyPlanItemsObj[key], "name") ? (
                  <Fragment>
                    <span className={styles["title"]}>
                      {studyPlanItemsObj[key].name}
                    </span>
                  </Fragment>
                ) : (
                  key
                )}
              </h2>
              <StudyPlanItemsSubList
                key={studyPlanItemsObj[key]}
                studyPlanItemsObj={studyPlanItemsObj[key]}
                allStudyPlanItems={props.allStudyPlanItems}
                parentKey={key}
                parentsParentKey={parentKey}
                parentMasterID={
                  parentMasterID ? parentMasterID : studyPlanItemsObj[key]._id
                }
                parentMasterType={
                  parentMasterType
                    ? parentMasterType
                    : studyPlanItemsObj[key].type
                }
                section={section}
                displayConditions={displayConditions}
                subListLevel={subListLevel}
                unlockProtectedVisible={
                  props.unlockProtectedVisible
                    ? props.unlockProtectedVisible
                    : unlockProtectedVisible
                }
                showProtectedHidden={
                  props.showProtectedHidden
                    ? props.showProtectedHidden
                    : showProtectedHidden
                }
                refresh={refresh}
                onlyList={onlyList}
                emptyForm={props.emptyForm}
                setFormType={props.setFormType}
              />{" "}
              {!onlyList && !subListLevel && (
                <div className={styles["button-container"]}>
                  {!noEditButton && (
                    <button
                      className={
                        styles["form-button"] + " " + styles["edit-form-button"]
                      }
                      value={key}
                      data-parentmasterid={key}
                      onClick={unlockProtectedVisibleHandler}
                    >
                      {!unlockProtectedVisible.includes(key) && (
                        <Fragment>
                          {" "}
                          <span className={styles["edit-button-title"]}>
                            <span>Edit </span>
                          </span>
                          <span className={styles["edit-button-target-name"]}>
                            "{studyPlanItemsObj[key].name}"
                          </span>
                        </Fragment>
                      )}
                      {unlockProtectedVisible.includes(key) && (
                        <Fragment>
                          {" "}
                          <span className={styles["edit-button-cancel-title"]}>
                            Cancel Editor
                          </span>
                        </Fragment>
                      )}
                    </button>
                  )}{" "}
                  <button
                    className={
                      styles["form-button"] +
                      " " +
                      styles["show-hidden-form-button"]
                    }
                    value={key}
                    data-parentmasterid={key}
                    onClick={showProtectedHiddenHandler}
                  >
                    Show Hidden Fields
                  </button>
                  {!onlyList && unlockProtectedVisible.includes(key) && (
                    <Fragment>
                      {" "}
                      <button
                        className={
                          styles["form-button"] +
                          " " +
                          styles["submit-form-button"]
                        }
                        value={key}
                        data-parentmasterid={key}
                        data-section={section}
                        onClick={submitFormButtonHandler}
                      >
                        Submit Changes
                      </button>{" "}
                      <button
                        className={
                          styles["form-button"] +
                          " " +
                          styles["delete-form-button"]
                        }
                        value={key}
                        data-parentmasterid={key}
                        data-section={section}
                        onClick={deleteFormButtonHandler}
                      >
                        Delete
                      </button>
                    </Fragment>
                  )}
                </div>
              )}{" "}
            </CollapsibleElm>
          </ul>
        );
      return (
        <StudyPlanItem
          key={parentMasterID + parentsParentKey + parentKey + key}
          studyPlanItemsObj={props}
          passedKey={key}
          parentKey={parentKey}
          parentsParentKey={parentsParentKey}
          parentMasterID={parentMasterID}
          parentMasterType={
            parentMasterType ? parentMasterType : studyPlanItemsObj[key].type
          }
          displayConditions={displayConditions}
          unlockProtectedVisible={
            props.unlockProtectedVisible
              ? props.unlockProtectedVisible
              : unlockProtectedVisible
          }
          showProtectedHidden={
            props.showProtectedHidden
              ? props.showProtectedHidden
              : showProtectedHidden
          }
          refresh={refresh}
          setExistingFormInputValuesObj={updateExistingFormState}
          emptyForm={props.emptyForm}
          onlyList={onlyList}
          setFormType={props.setFormType}
          formType={props.formType}
        />
      );
    });
  return (
    <div>
      <h2>There are no items to list.</h2>
    </div>
  );
};

export default StudyPlanItemsList;
