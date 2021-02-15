import React, { useEffect } from "react";
import Layout from "@theme/Layout";

function EventRuPage() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://js.hsforms.net/forms/shell.js";
    document.body.appendChild(script);

    script.addEventListener("load", () => {
      if (window.hbspt) {
        window.hbspt.forms.create({
          portalId: "8531691",
          formId: "558347ba-59d6-495a-9703-c584f1bf0d68",
          target: "#hubspotForm",
        });
      }
    });
},[]);
  return (
    <Layout title="Database Lab 2.0">
      <div>
        <div id="hubspotForm"></div>
      </div>
    </Layout>
  );
}

export default EventRuPage;
