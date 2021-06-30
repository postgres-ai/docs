import React, { useEffect } from "react";
import Layout from "@theme/Layout";

function ConsoleRedirect() {
  useEffect(() => {
    window.location.replace("https://console.postgres.ai/");
  }),[];

  return (<div></div>);
}

export default ConsoleRedirect;
