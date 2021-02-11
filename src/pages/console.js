import React, { useEffect } from "react";
import Layout from "@theme/Layout";

function ConsoleRedirect() {
  useEffect(() => {
    window.location.replace("https://console-v2.postgres.ai/");
  }),[];

  return (<div></div>);
}

export default ConsoleRedirect;
