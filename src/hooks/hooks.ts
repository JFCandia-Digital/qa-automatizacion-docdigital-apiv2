import { Before, setDefaultTimeout } from "@cucumber/cucumber";
import dotenv from "dotenv";
import { apiContext } from "../support/apiContext";

setDefaultTimeout(60_000);
dotenv.config({ path: ".env" });

Before(function () {
  apiContext.lastStatus = undefined;
  apiContext.lastBody = undefined;
});