import Login from "./features/login/Login";
import "./App.css";
import MainLayout from "./layout/mainLayout";
import { UploadPage } from "./pages/Upload";
import { Flex } from "antd";
import AskInput from "./components/ShowFile/AskYouPdf";
import { ShowFile } from "./components/ShowFile/ShowFile";

function App() {
  return (
    <Login>
      <MainLayout>
        <Flex vertical={true} gap="middle">
          <UploadPage />
          <AskInput />
          <ShowFile />
        </Flex>
      </MainLayout>
    </Login>
  );
}
export default App;
