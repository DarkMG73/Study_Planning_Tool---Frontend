import { useDispatch } from "react-redux";
import { formInputDataActions } from "../store/formInputDataSlice";

const useAddInputData = () => {
  const dispatch = useDispatch();

  const outputFunction = (e, props) => {
    console.log(
      "%c⚪️►►►► %cline:7%cprops",
      "color:#fff;background:#ee6f57;padding:3px;border-radius:2px",
      "color:#fff;background:#1f3c88;padding:3px;border-radius:2px",
      "color:#fff;background:rgb(38, 157, 128);padding:3px;border-radius:2px",
      props,
    );
    e.preventDefault();
    let typingTimer = null;
    const target = e.target;
    const outputValue = target.value;
    console.log(
      "%c⚪️►►►► %cline:18%coutputValue",
      "color:#fff;background:#ee6f57;padding:3px;border-radius:2px",
      "color:#fff;background:#1f3c88;padding:3px;border-radius:2px",
      "color:#fff;background:rgb(178, 190, 126);padding:3px;border-radius:2px",
      outputValue,
    );
    const { emptyForm, editedField, setEditedField } = props;

    // Allows the form show only inputs needed by each type
    const parentMasterID = target.getAttribute("data-parentmasterid");
    let title = target.getAttribute("title");

    if (title === "type")
      document
        .getElementById(parentMasterID)
        .setAttribute("newFormType", outputValue);

    clearTimeout(typingTimer);

    typingTimer = setTimeout(() => {
      if (outputValue) {
        groomAndAddInputData(
          target,
          parentMasterID,
          outputValue,
          emptyForm,
          editedField,
          setEditedField,
        );
      }
    }, 2000);
  };

  function groomAndAddInputData(
    target,
    parentMasterID,
    outputValue,
    emptyForm,
    editedField,
    setEditedField,
  ) {
    const parentKey = target.getAttribute("data-parentkey");
    const parentsParentKey = target.getAttribute("parentsParentKey");
    let title = target.getAttribute("title");

    if (parentMasterID !== parentKey) {
      if (parentMasterID === parentsParentKey) {
        outputValue = { [parentKey]: outputValue };
        title = parentKey;
      } else {
        outputValue = { [title]: outputValue };
        title = parentKey;
      }
    }

    setTimeout(() => {
      if (emptyForm)
        dispatch(
          formInputDataActions.addToNewFormInputDataObj({
            parentMasterID,
            title,
            outputValue,
          }),
        );

      if (!emptyForm)
        dispatch(
          formInputDataActions.addToExistingFormInputDataObj({
            parentMasterID,
            title,
            outputValue,
          }),
        );
    }, 500);

    if (!editedField) setEditedField(true);
  }

  return outputFunction;
};

export default useAddInputData;
