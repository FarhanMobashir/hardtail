// /@ts-check
import React from "react";

/**
 *
 * @param {{
 * baseUrl: string,
 * fetchOptions: RequestInit
 * }} param0
 * @returns Promise<{
 * get: (url: string, params?: any) => Promise<any>,
 * post: (url: string, data?: any) => Promise<any>,
 * put: (url: string, data?: any) => Promise<any>,
 * delete: (url: string) => Promise<any>
 * }>
 */
export const fetchBaseQuery = ({ baseUrl, fetchOptions }) => {
  return async (query, options) => {
    return await fetch(`${baseUrl}${query}`, {
      ...fetchOptions,
      ...options,
    });
  };
};

const enhancedispatch = (dispatch, data, item) => {
  if (item.tag) {
    dispatch({ type: item.tag, payload: data });
  } else {
    dispatch({ type: item.name, payload: data });
  }
};

/**
 *
 * @param {item} item
 * @returns {makeHookName(item)}
 */
export const makeHookName = (item) => {
  return `use${item.name[0].toUpperCase() + item.name.slice(1)}`;
};

export const buildHooks =
  (dispatchFn) =>
  /**
   *
   * @param {{
   * queryArray: Array<{
   * name: string,
   * query: string,
   * method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH",
   * type: "query" | "mutation",
   * }>
   * baseQuery: <typeof fetchBaseQuery>,
   * dispatchFn: React.DispatchWithoutAction
   * }} props
   * @returns {{[k: string]: CallableFunction;}}
   *
   * This function is used to fetch the base query for the API.
   */
  ({ queryArray, baseQuery }) => {
    /**
     * @type {{[k: string]: CallableFunction}}
     */
    const hooks = {};
    queryArray.forEach((item) => {
      const hookName = makeHookName(item);

      /**
       * @param {{urlParams:string,fetchOptions:}} param0
       * @returns {{loading: boolean, data: any, error: any}}
       */
      const useQuery = React.useCallback(
        (urlParams = "", fetchOptions = {}) => {
          const [loading, setLoading] = React.useState(true);
          const [error, setError] = React.useState(false);
          const [errorValue, setErrorValue] = React.useState();
          const [data, setData] = React.useState(null);

          const reload = React.useCallback(() => {
            apiCall(item, urlParams, fetchOptions, dispatchFn);
          }, [urlParams]);

          const apiCall = async (item, urlParams, fetchOptions, dispatchFn) => {
            try {
              setLoading(true);
              const response = await baseQuery(
                `${item.query}/${urlParams ? urlParams : ""}`,
                {
                  ...fetchOptions,
                }
              );
              if (response.status >= 400 && response.status <= 599) {
                setError(true);
                setErrorValue(res);
              }
              if (response.status >= 200 && response.status <= 299) {
                const apiData = await response.json();
                setData(apiData);
                enhancedispatch(dispatchFn, apiData, item);
                setError(false);
              }
            } catch (err) {
              setError(true);
            } finally {
              setLoading(false);
            }
          };

          React.useEffect(() => {
            apiCall(item, urlParams, fetchOptions, dispatchFn);
          }, [urlParams, reload]);
          return { loading, data, error, errorValue, reload };
        },
        []
      );

      /**
       *
       * @param {{
       * body: any,
       * urlParams: string
       * }} urlParams
       * @returns {[
       * mutationCallBack : ({ body, urlParams }: {
       * body?: {};
       * urlParams?: string;
       * }) => void,
       * {
       * loading: boolean;
       * error: boolean;
       * data: any;
       * }
       * ]}
       */
      function useMutation() {
        const [loading, setLoading] = React.useState(null);
        const [error, setError] = React.useState(false);
        const [errorValue, setErrorValue] = React.useState(null);
        const [data, setData] = React.useState(null);
        /**
         * @param {{
         * body: any,
         * urlParams: string
         * }} urlParams
         * @returns {void}
         *
         */
        let mutationCallBack = React.useCallback(
          ({ body = {}, urlParams = "", fetchOptions = {} }) => {
            setLoading(true);
            baseQuery(`${item.query}/${urlParams}`, {
              method: item.method,
              body: JSON.stringify(body),
              ...fetchOptions,
            })
              .then((res) => {
                if (item.log) {
                  console.log("logging response", res);
                }
                if (res.status >= 400 && res.status <= 599) {
                  setError(true);
                  setLoading(false);
                  setErrorValue(res);
                }
                return res.json();
              })
              .then((data) => {
                setData(data);
                setLoading(false);
                enhancedispatch(dispatchFn, data, item);
              })
              .catch((err) => {
                if (item.log) {
                  console.error("logging error", err);
                }
                setLoading(false);
                setError(err);
              });
          },
          []
        );

        return [
          mutationCallBack,
          {
            loading,
            error,
            errorValue,
            data,
          },
        ];
      }

      if (item.type === "query") {
        hooks[hookName] = useQuery;
      } else if (item.type === "mutation") {
        hooks[hookName] = useMutation;
      }
    });

    return hooks;
  };
