/**
 * Imprime en la consola la respuesta de la API de forma formateada.
 * @param response El objeto de respuesta de axios.
 * @param isError Opcional. Si es true, el título del log indicará un error.
 */
export function logApiResponse(response: any, isError: boolean = false) {
  const title = isError ? "--- Respuesta de la API (Error) ---" : "--- Respuesta de la API ---";
  const separator = "-".repeat(title.length);

  if (!response) {
    console.log(title);
    console.log("La respuesta (response) es nula o indefinida.");
    console.log(separator);
    return;
  }

  console.log(title);
  console.log("Status:", response.status);
  console.log("Body:", JSON.stringify(response.data, null, 2));
  console.log(separator);
}
