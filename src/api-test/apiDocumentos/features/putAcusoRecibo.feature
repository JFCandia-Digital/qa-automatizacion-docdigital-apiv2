@API @Documentos @AcusoRecibo
Feature: PUT /documentos/recibidos/{id}/acusorecibo - Acuso de recibo (E01)
# =================================================================================
# == Pruebas para el método PUT /documentos/recibidos/{id}/acusorecibo
# == El happy-path @Mutacion SOLO debe ejecutarse sobre un documento recibido DESDE
# == otra entidad de prueba (KE <-> Test 2019). Excluido de npm run apiTest.
# =================================================================================

  @Negativo
  Scenario Outline: Validar "PUT" - ".../acusorecibo" sin token válido
    Given que envío una petición "PUT" a "/documentos/recibidos/1/acusorecibo" con token "<tipo_auth>" y el cuerpo:
      """
      {}
      """
    Then el estado de la respuesta debe ser <status>
    And el cuerpo de la respuesta debe ser el texto "<cuerpo>"

    Examples:
      | tipo_auth | status | cuerpo           |
      | inválido  |    401 | No autorizado.   |
      | nulo      |    401 | 401 UNAUTHORIZED |

  @RequiereCredenciales
  Scenario: Acuso de recibo de un documento sin estado pendiente devuelve 400
    Given que envío una petición "PUT" a "/documentos/recibidos/999999999/acusorecibo" con token "válido" y el cuerpo:
      """
      {}
      """
    Then el estado de la respuesta debe ser 400
    And el cuerpo de la respuesta debe contener el texto "estado pendiente"

  @Mutacion @RequiereCredenciales @RequiereDatos
  Scenario: (Mutación) Dar acuso de recibo a un documento recibido de prueba
    # DOC_RECIBIDO_ID debe ser un documento recibido DESDE Test 2019 en estado pendiente.
    Given que envío una petición "PUT" a "/documentos/recibidos/{DOC_RECIBIDO_ID}/acusorecibo" con token "válido" y el cuerpo:
      """
      {}
      """
    Then el estado de la respuesta debe ser 200
