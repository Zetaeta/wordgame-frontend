import React from "react";
import ReactDOM from "react-dom/client";
import "./index.scss";
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
  useRouteError,
} from "react-router-dom";
import { CodeNamesHome } from "./CodenamesHome";
import DecryptoHome from "./DecryptoHome";
import Decrypto from "./Decrypto";
import { MyNavbar } from "./common";
const router = createBrowserRouter(
  createRoutesFromElements([
    <Route path="/" element={<BigWordHome />}></Route>,
    <Route
      path="codenames"
      element={<CodeNamesHome></CodeNamesHome>}
      loader={async () => {
        const res = await fetch(BASE_URL + "/api/codenames/games");
        if (res.status === 404) {
          console.error(404);
          throw new Response("Not Found", { status: 404 });
        }
        return res;
      }}
      errorElement={<ErrorBoundary></ErrorBoundary>}
    ></Route>,
    <Route path="profile" element={<ProfilePage></ProfilePage>}></Route>,
    <Route
      path="codenames/:id"
      element={<CodeNames></CodeNames>}
      loader={({ params }: { params: any }) => {
        return fetchWithError(BASE_URL + "/api/codenames/" + params.id);
      }}
      errorElement={<ErrorBoundary></ErrorBoundary>}
    ></Route>,
    <Route
      path="decrypto"
      element={<DecryptoHome></DecryptoHome>}
      loader={async () => {
        return fetchWithError(BASE_URL + "/api/decrypto/games");
      }}
      errorElement={<ErrorBoundary></ErrorBoundary>}
    ></Route>,
    <Route
      path="decrypto/:id"
      element={<Decrypto></Decrypto>}
      loader={({ params }: { params: any }) => {
        return fetchWithError(BASE_URL + "/api/decrypto/" + params.id);
      }}
      errorElement={<ErrorBoundary></ErrorBoundary>}
    ></Route>,
  ])
);

async function fetchWithError(url: string) {
  const res = await fetch(url);
  if (res.status === 404) {
    throw new Response("Not Found", { status: 404 });
  }
  return res;
}

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <RouterProvider router={router}></RouterProvider>
  </React.StrictMode>
);

function ErrorBoundary() {
  let error: any = useRouteError();
  console.error(error);
  return (
    <div>
      <MyNavbar></MyNavbar>
      <ErrorPage error={error}></ErrorPage>
    </div>
  );
}

function ErrorPage({ error }: any) {
  console.log(error);
  console.log(error.status);
  if (error.status === 404) {
    return <div>This page doesn't exist!</div>;
  }

  if (error.status === 401) {
    return <div>You aren't authorized to see this</div>;
  }

  if (error.status === 503) {
    return <div>Looks like our API is down</div>;
  }

  if (error.status === 418) {
    return <div>🫖</div>;
  }
  return <div>Something went wrong</div>;
}
// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
