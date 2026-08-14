@API @Documentos @FirmadoIngresar
Feature: POST /documentos/firmado/ingresar - Cargar documento firmado y despachar (E01)
# =================================================================================
# == Pruebas para el método POST /documentos/firmado/ingresar
# == ¡ATENCIÓN! El happy-path @Mutacion DESPACHA una comunicación. Debe dirigirse
# == EXCLUSIVAMENTE a una entidad de prueba (Test 2019), NUNCA a instituciones
# == reales. Está excluido de npm run apiTest y requiere un PDF firmado válido.
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
    # DESPACHA de verdad -> destinatario SOLO Test 2019. Requiere un PDF firmado válido
    # (base64) y confirmar el esquema del cuerpo contra el contrato real antes de ejecutar.
    Given que envío una petición "POST" a "/documentos/firmado/ingresar" con token "válido" y el cuerpo:
      """
      {
        "nombre": "Documento QA automatizacion",
        "tipo_id": 1,
        "entidad_id": 2,
        "folio": "QA-0001",
        "materia": "Prueba de automatización QA (KE -> Test 2019)",
        "documento_base64": "<PDF_FIRMADO_BASE64>"
      }
      """
    Then el estado de la respuesta debe ser 200
