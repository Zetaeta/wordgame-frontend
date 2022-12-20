import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { BigWordHome } from "./BigWord";
import { CodeNames } from "./Codenames";
import { BASE_URL } from "./Env";
import ProfilePage from "./Profile";
import reportWebVitals from "./reportWebVitals";
import "bootstrap/dist/css/bootstrap.css";
import {
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
  Route,
  Link,
} from "react-router-dom";
import { CodeNamesHome } from "./CodenamesHome";
const router = createBrowserRouter(
  createRoutesFromElements([
    <Route path="/" element={<BigWordHome />}></Route>,
    <Route
      path="codenames"
      element={<CodeNamesHome></CodeNamesHome>}
      loader={async () => {
        return fetch(BASE_URL + "/api/codenames/games");
      }}
    ></Route>,
    <Route path="profile" element={<ProfilePage></ProfilePage>}></Route>,
    <Route
      path="codenames/:id"
      element={<CodeNames></CodeNames>}
      loader={({ params }: { params: any }) => {
        return fetch(BASE_URL + "/api/codenames/" + params.id);
      }}
    ></Route>,
  ])
);
const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <RouterProvider router={router}></RouterProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
