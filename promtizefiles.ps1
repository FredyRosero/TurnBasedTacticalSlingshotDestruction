# Parámetros opcionales: si no se especifican, se usa el directorio actual y se muestra en consola
param(
  [string]$Ruta = ".",
  [string]$ArchivoSalida = ""
)

# Función para escribir contenido (a archivo o consola según corresponda)
function Write-OutputContent {
  param([string]$Contenido)
  
  if ($ArchivoSalida -ne "") {
    $Contenido | Out-File -FilePath $ArchivoSalida -Append
  } else {
    Write-Output $Contenido
  }
}

# Si se especificó un archivo de salida y existe, lo borra para empezar limpio
if ($ArchivoSalida -ne "" -and (Test-Path $ArchivoSalida)) {
  Remove-Item $ArchivoSalida -Force
}

# Obtener archivos hasta dos niveles de profundidad (requiere PowerShell 7+)
Get-ChildItem -Path $Ruta -File -Recurse -Depth 1 | ForEach-Object {
  # Saltar el directorio "fonts" y "lib" (si existen)
  if ($_.FullName -like "*fonts*" -or $_.FullName -like "*lib*" -or $_.FullName -like "*bkp*") { return }
  # Obtener la ruta del archivo relativa al directorio actual
  $RutaRelativa = $_.FullName.Substring($Ruta.Length) 
  # Escribe la línea con la marca requerida
  Write-OutputContent ('```' + $RutaRelativa)
  # Escribe el contenido del archivo
  Get-Content $_.FullName | ForEach-Object { Write-OutputContent $_ }
  Write-OutputContent '```'
}
