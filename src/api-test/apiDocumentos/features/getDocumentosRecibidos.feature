@API @Documentos @DocumentosRecibidos
Feature: GET /documentos/recibidos - Documentos recibidos por la entidad (E01)
# =================================================================================
# == Pruebas para el método GET /documentos/recibidos
# =================================================================================

  @RequiereCredenciales
  Scenario: Consultar documentos recibidos con token válido
    Given que realizo una petición "GET" a "/documentos/recibidos" con token "válido"
    Then el estado de la respuesta debe ser 200
    And el cuerpo de la respuesta debe tener la propiedad "result"
    And el cuerpo de la respuesta debe tener la estructura de éxito "JSON_RESPONSE_DOCUMENTOS_LISTA"

  @Negativo
  Scenario Outline: Validar "GET" - "/documentos/recibidos" con distintos token
    Given que realizo una petición "GET" a "/documentos/recibidos" con token "<tipo_auth>"
    Then el estado de la respuesta debe ser <status>
    And el cuerpo de la respuesta debe ser el texto "<cuerpo>"

    Examples:
      | tipo_auth | status | cuerpo           |
      | inválido  |    401 | No autorizado.   |
      | expirado  |    401 | Sesión expirada. |
      | nulo      |    401 | 401 UNAUTHORIZED |
