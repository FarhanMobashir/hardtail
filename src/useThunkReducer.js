import React from "react";
export const useThunkReducer = (reducer, initialState, log) => {
  const [state, dispatch] = React.useReducer(reducer, initialState);
  const enhancedDispatch = React.useCallback(
    (action) => {
      if (log === "log") {
        console.log("action type", action.type, "payload", action.payload);
      }
      if (typeof action === "function") {
        action(dispatch);
      } else {
        dispatch(action);
      }
    },
    [dispatch]
  );
  return [state, enhancedDispatch];
};
