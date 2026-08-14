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
    # Requisitos para ejecutar:
    #  1) La credencial API de la entidad debe tener HABILITADO el permiso de esta
    #     operación; de lo contrario responde 403 "sin permiso para la operación".
    #  2) El cuerpo es un OBJETO (mapa clave->valor), no un array (verificado contra
    #     el contrato: la API espera Map<String,String>).
    #  3) DOC_ID_PRUEBA debe ser un documento propio de la entidad de prueba.
    Given que envío una petición "PUT" a "/documentos/{DOC_ID_PRUEBA}/atributos-adicionales" con token "válido" y el cuerpo:
      """
      { "prueba_qa": "automatizacion" }
      """
    Then el estado de la respuesta debe ser 200
