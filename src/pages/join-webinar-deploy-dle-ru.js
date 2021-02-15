import React, { useEffect } from "react";
import Layout from "@theme/Layout";

function WebinarPage() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://js.hsforms.net/forms/shell.js";
    document.body.appendChild(script);

    script.addEventListener("load", () => {
      if (window.hbspt) {
        window.hbspt.forms.create({
          portalId: "8531691",
          formId: "afef7635-2e09-4b8d-bc08-8eaa87143490",
          target: "#hubspotForm",
        });
      }
    });
},[]);
  return (
    <Layout title="Вебинар: Разворачиваем Database Lab Engine">
      <div>
        <div id="hubspotForm"></div>
      </div>
    </Layout>
  );
}

export default WebinarPage;
