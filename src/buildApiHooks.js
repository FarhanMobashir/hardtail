// /@ts-check
import React from "react";

/**
 *
 * @param {{
 * baseUrl: string,
 * headers: RequestInit["headers"]
 * }} param0
 * @returns Promise<{
 * get: (url: string, params?: any) => Promise<any>,
 * post: (url: string, data?: any) => Promise<any>,
 * put: (url: string, data?: any) => Promise<any>,
 * delete: (url: string) => Promise<any>
 * }>
 */
export const fetchBaseQuery = ({ baseUrl, headers }) => {
  return async (query, options) => {
    return await fetch(`${baseUrl}${query}`, {
      ...options,
      headers: headers,
    });
  };
};

const enhancedispatch = (dispatch, data, item) => {
  dispatch({ type: item.name, payload: data });
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
      const useQuery = ({ urlParams = "", fetchOptions }) => {
        const [loading, setLoading] = React.useState(true);
        const [error, setError] = React.useState(false);
        const [data, setData] = React.useState(null);
        React.useEffect(() => {
          setLoading(true);

          baseQuery(`${item.query}/${urlParams}`, {
            ...fetchOptions,
          })
            .then((res) => {
              if (item.log) {
                console.log("logging response", res);
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

          return () => {};
        }, [dispatchFn, urlParams]);

        return { loading, data, error };
      };

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
          ({ body = {}, urlParams = "" }) => {
            setLoading(true);
            baseQuery(`${item.query}/${urlParams}`, {
              method: item.method,
              body: JSON.stringify(body),
            })
              .then((res) => {
                if (item.log) {
                  console.log("logging response", res);
                }
                return res.json();
              })
              .then((data) => {
                setData(data);
                setLoading(false);
                enhancedispatch(
                  dispatchFn,
                  {
                    data: data,
                  },
                  item
                );
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
