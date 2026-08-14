@API @Documentos @AtributosAdicionales
Feature: PUT /documentos/{id}/atributos-adicionales - Actualizar atributos (E01)
# =================================================================================
# == Pruebas para el método PUT /documentos/{id}/atributos-adicionales
# == Los escenarios @Mutacion (happy-path) modifican datos y NO se ejecutan por
# == defecto (excluidos de npm run apiTest). Operan solo sobre documentos propios
# == de la entidad de prueba.
# =================================================================================

  @Negativo
  Scenario Outline: Validar "PUT" - "/documentos/{id}/atributos-adicionales" sin token válido
    Given que envío una petición "PUT" a "/documentos/1/atributos-adicionales" con token "<tipo_auth>" y el cuerpo:
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
  Scenario: Actualizar atributos de un documento inexistente devuelve 404
    Given que envío una petición "PUT" a "/documentos/999999999/atributos-adicionales" con token "válido" y el cuerpo:
      """
      {}
      """
    Then el estado de la respuesta debe ser 404
    And el cuerpo de la respuesta debe contener el texto "Documento no encontrado"

  @Mutacion @RequiereCredenciales @RequiereDatos
  Scenario: (Mutación) Actualizar atributos adicionales de un documento propio
    # Requiere DOC_ID_PRUEBA de un documento de la entidad de prueba. Confirmar el
    # esquema del cuerpo contra el contrato real antes de ejecutar.
    Given que envío una petición "PUT" a "/documentos/{DOC_ID_PRUEBA}/atributos-adicionales" con token "válido" y el cuerpo:
      """
      { "atributos_adicionales": [ { "nombre": "prueba_qa", "valor": "automatizacion" } ] }
      """
    Then el estado de la respuesta debe ser 200
