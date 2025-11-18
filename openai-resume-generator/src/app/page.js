import Image from "next/image";
// import styles from "./page.module.css";
import ResumeForm from "@/components/ResumeForm";
import ResumeViewer from "@/components/ResumeViewer";

export default function Home() {
  return (
    <div >
        <ResumeForm />
        <ResumeViewer />
    </div>
  );
}
