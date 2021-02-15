import React, { useEffect } from "react";
import Layout from "@theme/Layout";

function EventPage() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://js.hsforms.net/forms/shell.js";
    document.body.appendChild(script);

    script.addEventListener("load", () => {
      if (window.hbspt) {
        window.hbspt.forms.create({
          portalId: "8531691",
          formId: "b10a4f21-a7ca-4f51-ae9d-fca5f09df6db",
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

export default EventPage;
