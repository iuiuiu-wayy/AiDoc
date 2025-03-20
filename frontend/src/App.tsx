import Login from "./features/login/Login";
import "./App.css";
import MainLayout from "./layout/mainLayout";
import { UploadPage } from "./pages/Upload";
function App() {
  return (
    <Login>
      <MainLayout>
        <UploadPage />
      </MainLayout>
    </Login>
  );
}

export default App;
