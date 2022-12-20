import { SERVER_URL, IO_PORT, BASE_URL } from "./Env";
import { io } from "socket.io-client";
const socketUrl = "ws://" + SERVER_URL + ":" + IO_PORT;
const socket = io(socketUrl);
socket.onAnyOutgoing((event, ...args) => {
  console.log("sending " + event);
  console.log(args);
});
export default socket;
