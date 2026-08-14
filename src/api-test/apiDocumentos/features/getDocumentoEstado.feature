@API @Documentos @DocumentoEstado
Feature: GET /documentos/{id}/estado - Estado e historial de un documento (E01)
# =================================================================================
# == Pruebas para el método GET /documentos/{id}/estado
# == El id se toma de la variable de entorno DOC_ID_PRUEBA (ver .env.example).
# =================================================================================

  @RequiereCredenciales @RequiereDatos
  Scenario: Consultar el estado de un documento con token válido
    Given que realizo una petición "GET" a "/documentos/{DOC_ID_PRUEBA}/estado" con token "válido"
    Then el estado de la respuesta debe ser 200
    And el cuerpo de la respuesta debe tener la propiedad "result"
    And el cuerpo de la respuesta debe tener la estructura de éxito "JSON_RESPONSE_DOCUMENTO_ESTADO"

  @Negativo
  Scenario Outline: Validar "GET" - "/documentos/{id}/estado" con distintos token
    Given que realizo una petición "GET" a "/documentos/1/estado" con token "<tipo_auth>"
    Then el estado de la respuesta debe ser <status>
    And el cuerpo de la respuesta debe ser el texto "<cuerpo>"

    Examples:
      | tipo_auth | status | cuerpo           |
      | inválido  |    401 | No autorizado.   |
      | expirado  |    401 | Sesión expirada. |
      | nulo      |    401 | 401 UNAUTHORIZED |
