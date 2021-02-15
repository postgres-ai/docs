import React, { useEffect } from "react";
import Layout from "@theme/Layout";

function SigninRedirect() {
  useEffect(() => {
    window.location.replace("https://console-v2.postgres.ai/signin");
  }),[];

  return (<div></div>);
}

export default SigninRedirect;
