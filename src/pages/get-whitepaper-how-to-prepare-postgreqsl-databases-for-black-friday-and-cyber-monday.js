import React, { useEffect } from "react";
import Layout from "@theme/Layout";

function WPPage() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://js.hsforms.net/forms/shell.js";
    document.body.appendChild(script);

    script.addEventListener("load", () => {
      if (window.hbspt) {
        window.hbspt.forms.create({
          portalId: "8531691",
          formId: "203a1fdb-df6a-45b7-924a-dcae04b9563d",
          target: "#hubspotForm",
        });
      }
    });
},[]);
  return (
    <Layout title="How to prepare PostgreSQL databases for Black Friday and Cyber Monday">
      <div>
        <div id="hubspotForm"></div>
      </div>
    </Layout>
  );
}

export default WPPage;
