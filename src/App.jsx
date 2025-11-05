import "./App.css";
import ChatRoomEnhanced from "./components/ChatRoomEnhanced";

function App() {
  // Use ChatRoomEnhanced for SSL support with toggle
  // Use ChatRoom for the original version (Member 1 & 2)
  // Using ChatRoomEnhanced with SSL enabled (port 7443)
  return <ChatRoomEnhanced />;
}

export default App;
