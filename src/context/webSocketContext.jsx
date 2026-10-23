import { createContext, useContext, useState, useEffect } from "react";
import useWebSocket from "react-use-websocket";
import { useAuthContext } from "../auth/AuthContext";
import { WS_URL } from "../utils/AppConstant";

const FileWebSocketContext = createContext(null);

export function FileWebSocketProvider({ children }) {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");

  const { user_id } = useAuthContext();

  const socketUrl = user_id
    ? `${WS_URL}file/progress/?job_id=${user_id}`
    : null;

  const socket = useWebSocket(socketUrl, {
    shouldReconnect: () => true,
    reconnectAttempts: Infinity,
    reconnectInterval: 3000,
    share: true,

    onOpen: () => {
      // console.log("Websocket is Connected");
    },

    onClose: () => {
      // console.log("Websocket is Disconnected");
    },
  });

  useEffect(() => {
    if (!socket.lastMessage) return;

    const data = JSON.parse(socket.lastMessage.data);
    setLoading(data.loading);
    setProgress(data.progress);
    setMessage(data.message);
  }, [socket.lastMessage]);

  return (
    <FileWebSocketContext.Provider
      value={{
        ...socket,
        loading,
        setLoading,
        progress,
        setProgress,
        message,
        setMessage,
        status,
        setStatus,
      }}
    >
      {children}
    </FileWebSocketContext.Provider>
  );
}

export function useFileWebSocket() {
  return useContext(FileWebSocketContext);
}
