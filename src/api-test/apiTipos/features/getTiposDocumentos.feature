@API @Tipos @TiposDocumentos
Feature: GET /tipos/documentos/ - Consulta de tipos de documentos (E05)
# =================================================================================
# == Pruebas para el método GET /tipos/documentos/
# =================================================================================

  @RequiereCredenciales
  Scenario: Consultar tipos de documentos con token válido
    Given que realizo una petición "GET" a "/tipos/documentos/" con token "válido"
    Then el estado de la respuesta debe ser 200
    And el cuerpo de la respuesta debe tener la propiedad "result"
    And el cuerpo de la respuesta debe tener la estructura de éxito "JSON_RESPONSE_TIPO_DOCUMENTO"

  @Negativo @Smoke
  Scenario Outline: Validar "GET" - "/tipos/documentos/" con distintos token
    Given que realizo una petición "GET" a "/tipos/documentos/" con token "<tipo_auth>"
    Then el estado de la respuesta debe ser <status>
    And el cuerpo de la respuesta debe ser el texto "<cuerpo>"

    Examples:
      | tipo_auth | status | cuerpo           |
      | inválido  |    401 | No autorizado.   |
      | expirado  |    401 | No autorizado.   |
      | nulo      |    401 | 401 UNAUTHORIZED |
