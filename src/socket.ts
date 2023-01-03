import { SERVER_URL, IO_PORT, BASE_URL } from "./Env";
import { io } from "socket.io-client";
const savedDN = localStorage.getItem("name");
export const defaultUN = getSavedUN();

function getSavedUN() {
  const savedUN = localStorage.getItem("username");
  if (savedUN) {
    return savedUN;
  }
  const random = randomUsername();
  localStorage.setItem("username", random);
  return random;
}

export const defaultDN = savedDN ? savedDN : "Player";
export let username = defaultUN;

export function setUsername(n: string) {
  username = n;
}

export function setDisplayname(d: string) {
  displayname = d;
}

export let displayname = defaultDN;
const socketUrl = "ws://" + SERVER_URL + ":" + IO_PORT;
const socket = io(socketUrl, {
  auth: { username: username, displayname: displayname },
});
socket.onAnyOutgoing((event, ...args) => {
  console.log("sending " + event);
  console.log(args);
});

// socket.emit("login", {
//   username: username,
//   displayName: displayname,
// });

export default socket;

function randomUsername() {
  return "user" + Math.floor(Math.random() * 100000);
}
