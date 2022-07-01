import e from "react";
const t = (t, r) => {
    const [o, n] = e.useReducer(t, r);
    return [
      o,
      e.useCallback(
        (e) => {
          "development" === process.env.NODE_ENV &&
            console.log("action type", e.type, "payload", e.payload),
            "function" == typeof e ? e(n) : n(e);
        },
        [n]
      ),
    ];
  },
  r = (e, t, r) => {
    e({ type: r.name, payload: t });
  },
  o =
    (t) =>
    ({ queryArray: o, baseQuery: n }) => {
      const a = {};
      return (
        o.forEach((o) => {
          const s = ((e) => `use${e.name[0].toUpperCase() + e.name.slice(1)}`)(
              o
            ),
            l = ({ urlParams: a = "", fetchOptions: s }) => {
              const [l, u] = e.useState(!0),
                [c, i] = e.useState(!1),
                [p, y] = e.useState(null);
              return (
                e.useEffect(
                  () => (
                    u(!0),
                    n(`${o.query}/${a}`, { ...s })
                      .then(
                        (e) => (
                          o.log && console.log("logging response", e), e.json()
                        )
                      )
                      .then((e) => {
                        y(e), u(!1), r(t, e, o);
                      })
                      .catch((e) => {
                        o.log && console.error("logging error", e), u(!1), i(e);
                      }),
                    () => {}
                  ),
                  [t, a]
                ),
                { loading: l, data: p, error: c }
              );
            };
          "query" === o.type
            ? (a[s] = l)
            : "mutation" === o.type &&
              (a[s] = function () {
                const [a, s] = e.useState(null),
                  [l, u] = e.useState(!1),
                  [c, i] = e.useState(null);
                let p = e.useCallback(({ body: e = {}, urlParams: a = "" }) => {
                  s(!0),
                    n(`${o.query}/${a}`, {
                      method: o.method,
                      body: JSON.stringify(e),
                    })
                      .then(
                        (e) => (
                          o.log && console.log("logging response", e), e.json()
                        )
                      )
                      .then((e) => {
                        i(e), s(!1), r(t, { data: e }, o);
                      })
                      .catch((e) => {
                        o.log && console.error("logging error", e), s(!1), u(e);
                      });
                }, []);
                return [p, { loading: a, error: l, data: c }];
              });
        }),
        a
      );
    },
  n = e.createContext(),
  a = ({
    children: r,
    apiArray: a = [],
    baseQuery: s,
    apiActionTypes: l = {},
  }) => {
    const u = ((e) => {
        let t = {};
        for (let r in e) t[r] = null;
        return t;
      })(l),
      [c, i] = t((e = u, t) => {
        for (let r in u) t.type === r && (e[t.type] = t.payload);
        return e;
      }, u),
      p = o(i)({ queryArray: a, baseQuery: s });
    return e.createElement(
      n.Provider,
      { value: { state: c, dispatch: i, ...p } },
      r
    );
  },
  s = () => {
    const t = e.useContext(n);
    if (void 0 === t)
      throw new Error("useApi must be used within a ApiProvider");
    return t;
  };
export { a as ApiProvider, o as buildHooks, s as useApi, t as useThunkReducer };
//# sourceMappingURL=index.js.map
