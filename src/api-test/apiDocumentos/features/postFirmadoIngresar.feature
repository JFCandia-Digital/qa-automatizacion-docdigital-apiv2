@API @Documentos @FirmadoIngresar
Feature: POST /documentos/firmado/ingresar - Cargar documento firmado y despachar (E01)
# =================================================================================
# == Pruebas para el método POST /documentos/firmado/ingresar
# == ¡ATENCIÓN! El happy-path @Mutacion DESPACHA una comunicación. Debe dirigirse
# == EXCLUSIVAMENTE a una entidad de prueba (Test 2019), NUNCA a instituciones
# == reales. Está excluido de npm run apiTest.
# ==
# == Requiere en .env: ACCESS_TOKEN (o CLIENT_ID/SECRET) y DESTINATARIO_ENTIDAD_ID
# == (ID de Test 2019 en el ambiente). PDF: src/data/files/Firmado_por_ecert.pdf
# =================================================================================

  # NOTA (anomalía, igual que /documentos/buscar): con un token de formato no-JWT
  # (p. ej. "Bearer x") este endpoint NO responde 401 sino que pasa a validar el
  # cuerpo (400). Por eso el caso "inválido" no se valida aquí; solo "nulo".
  @Negativo
  Scenario: Validar "POST" - "/documentos/firmado/ingresar" sin token
    Given que envío una petición "POST" a "/documentos/firmado/ingresar" con token "nulo" y el cuerpo:
      """
      {}
      """
    Then el estado de la respuesta debe ser 401
    And el cuerpo de la respuesta debe ser el texto "401 UNAUTHORIZED"

  @RequiereCredenciales
  Scenario: Ingresar documento firmado con cuerpo vacío devuelve 400 (validación de campos)
    Given que envío una petición "POST" a "/documentos/firmado/ingresar" con token "válido" y el cuerpo:
      """
      {}
      """
    Then el estado de la respuesta debe ser 400
    And el cuerpo de la respuesta debe contener el texto "El nombre del documento es obligatorio"

  @Mutacion @RequiereCredenciales @RequiereDatos
  Scenario: (Mutación) Ingresar y despachar un documento firmado a la entidad de prueba
    # DESPACHA de verdad -> destinatario SOLO DESTINATARIO_ENTIDAD_ID (Test 2019).
    Given que cargo el PDF firmado "Firmado_por_ecert.pdf"
    And que ingreso y despacho el documento firmado a la entidad de prueba con token "válido"
    Then el estado de la respuesta debe ser 200
