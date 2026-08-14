import { Given, When, Then } from "@cucumber/cucumber";
import axios from "axios";
import assert from "assert";
import dotenv from "dotenv";
import { apiContext } from "../../../common/support/apiContext";

dotenv.config({ path: ".env" });

Given("la API v2 está configurada", function () {
  assert.ok(process.env.API_BASEURL, "Falta API_BASEURL en .env");
  assert.ok(process.env.ACCESS_TOKEN, "Falta ACCESS_TOKEN en .env");
});

When("consulto {string} {string}", async function (method: string, path: string) {
  const response = await axios.request({
    method,
    url: `${process.env.API_BASEURL}${path}`,
    headers: {
      Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
      Accept: "application/json",
    },
    validateStatus: () => true,
  });

  apiContext.lastStatus = response.status;
  apiContext.lastBody = response.data;
});

Then("la respuesta HTTP es {int}", function (status: number) {
  assert.equal(
    apiContext.lastStatus,
    status,
    `Esperado ${status}, recibido ${apiContext.lastStatus}. Body: ${JSON.stringify(apiContext.lastBody)}`
  );
});