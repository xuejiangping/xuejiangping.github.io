# Copy-Item '.\src copy' './'

$title = $args[0]?"-$($args[0])":""
(Get-ChildItem './src[1-9]*').Length | Set-Variable index
Copy-Item '.\src copy' "./src$($index+1)$title" -Recurse
