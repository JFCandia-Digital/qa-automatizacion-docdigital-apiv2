import { Before, setDefaultTimeout } from "@cucumber/cucumber";
import dotenv from "dotenv";
import { apiContext } from "../support/apiContext";

setDefaultTimeout(60_000);
dotenv.config({ path: ".env" });

Before(function () {
  apiContext.token = null;
  apiContext.response = null;
  apiContext.requestTimestamp = null;
  apiContext.requestEndpoint = null;
  apiContext.requestAuthType = null;
  apiContext.requestQueryParams = new Map();
  apiContext.worldData = new Map();
  apiContext.attachData = {};
});
