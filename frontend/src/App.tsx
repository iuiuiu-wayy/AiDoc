import "./App.css";
import Login from "./features/login/Login";

import MainLayout from "./layout/mainLayout";
import { UploadPage } from "./pages/Upload";
import { Flex } from "antd";
import AskInput from "./components/ShowFile/AskYouPdf";
import { ShowFile } from "./components/ShowFile/ShowFile";
import FileList from "./components/FileList";

function App() {
  return (
    <Login>
      <MainLayout>
        <Flex vertical={true} gap="middle">
          <Flex gap="middle" className="upload-and-list">
            <FileList />
            <UploadPage />
          </Flex>
          <AskInput />
          <ShowFile />
        </Flex>
      </MainLayout>
    </Login>
  );
}
export default App;
