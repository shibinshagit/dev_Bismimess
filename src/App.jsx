import { Routes, Route, Navigate } from "react-router-dom";
import { Dashboard, Auth } from "@/layouts";
import { SignIn } from "./pages/auth";
import PrivateRoute from "./helpers/protect";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import Attendance from "./layouts/attendance";

function App() {
  return (
    <Provider store={store}>
    <Routes>
      <Route path="/" element={<SignIn />}/>
      <Route path="/dashboard/*" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/auth/*" element={<Auth />} />
      <Route path="/attendance/*" element={<Attendance />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </Provider>
  );
}

export default App;
