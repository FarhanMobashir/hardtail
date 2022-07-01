import React from "react";
import { buildHooks } from "./buildApiHooks";
import { useThunkReducer } from "./useThunkReducer";
export const ApiContext = React.createContext();

export const ApiProvider = ({
  children,
  apiArray = [],
  baseQuery,
  apiActionTypes = {},
}) => {
  const getInitialState = (apiActionTypes) => {
    let data = {};
    for (let key in apiActionTypes) {
      data[key] = null;
    }
    return data;
  };

  const initialState = getInitialState(apiActionTypes);

  const reducer = (state = initialState, action) => {
    for (let key in initialState) {
      if (action.type === key) {
        state[action.type] = action.payload;
      }
    }
    return state;
  };

  const [state, dispatch] = useThunkReducer(reducer, initialState);

  const api = buildHooks(dispatch)({
    queryArray: apiArray,
    baseQuery: baseQuery,
  });

  return (
    <ApiContext.Provider value={{ state, dispatch, ...api }}>
      {children}
    </ApiContext.Provider>
  );
};

export const useApi = () => {
  const context = React.useContext(ApiContext);
  if (context === undefined) {
    throw new Error(`useApi must be used within a ApiProvider`);
  }
  return context;
};
