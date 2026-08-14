@API @Documentos @Devolver
Feature: PUT /documentos/recibidos/{id}/devolver - Devolver/rechazar recibido (E01)
# =================================================================================
# == Pruebas para el método PUT /documentos/recibidos/{id}/devolver
# == El happy-path @Mutacion SOLO debe ejecutarse sobre un documento que la entidad
# == de prueba haya recibido DESDE otra entidad de prueba (KE <-> Test 2019).
# == Excluido de npm run apiTest.
# =================================================================================

  @Negativo
  Scenario Outline: Validar "PUT" - ".../devolver" sin token válido
    Given que envío una petición "PUT" a "/documentos/recibidos/1/devolver" con token "<tipo_auth>" y el cuerpo:
      """
      { "motivo": "prueba" }
      """
    Then el estado de la respuesta debe ser <status>
    And el cuerpo de la respuesta debe ser el texto "<cuerpo>"

    Examples:
      | tipo_auth | status | cuerpo           |
      | inválido  |    401 | No autorizado.   |
      | nulo      |    401 | 401 UNAUTHORIZED |

  @RequiereCredenciales
  Scenario: Devolver sin motivo válido devuelve 400 (validación de cuerpo)
    Given que envío una petición "PUT" a "/documentos/recibidos/999999999/devolver" con token "válido" y el cuerpo:
      """
      {}
      """
    Then el estado de la respuesta debe ser 400
    And el cuerpo de la respuesta debe contener el texto "Motivo de rechazo"

  @Mutacion @RequiereCredenciales @RequiereDatos
  Scenario: (Mutación) Devolver un documento recibido desde la entidad de prueba
    # DOC_RECIBIDO_ID debe ser un documento recibido DESDE Test 2019 (no de terceros reales).
    Given que envío una petición "PUT" a "/documentos/recibidos/{DOC_RECIBIDO_ID}/devolver" con token "válido" y el cuerpo:
      """
      { "motivo": "Devolución de prueba de automatización QA (KE <-> Test 2019)" }
      """
    Then el estado de la respuesta debe ser 200
