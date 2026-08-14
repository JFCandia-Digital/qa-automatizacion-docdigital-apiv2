@API @Documentos @DocumentoDescargar
Feature: GET /documentos/{id}/archivo/descargar - Descarga del archivo (E01)
# =================================================================================
# == Pruebas para el método GET /documentos/{id}/archivo/descargar
# == Endpoint BINARIO: se solicita con Accept: */* (con application/json responde 406)
# == y se valida contenido/Content-Type en vez de JSON.
# == El id se toma de la variable de entorno DOC_ID_PRUEBA (ver .env.example).
# =================================================================================

  @RequiereCredenciales @RequiereDatos
  Scenario: Descargar el archivo de un documento con token válido
    Given que descargo el archivo de "/documentos/{DOC_ID_PRUEBA}/archivo/descargar" con token "válido"
    Then el estado de la respuesta debe ser 200
    And la respuesta debe ser un archivo descargable

  @Negativo
  Scenario Outline: Validar descarga "/documentos/{id}/archivo/descargar" con distintos token
    Given que descargo el archivo de "/documentos/1/archivo/descargar" con token "<tipo_auth>"
    Then el estado de la respuesta debe ser <status>
    And el cuerpo de la respuesta debe ser el texto "<cuerpo>"

    Examples:
      | tipo_auth | status | cuerpo           |
      | inválido  |    401 | No autorizado.   |
      | nulo      |    401 | 401 UNAUTHORIZED |
