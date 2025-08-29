@echo off
echo 🔐 Criando novo Service Principal para GitHub Actions...
echo.

REM Criar Service Principal
az ad sp create-for-rbac --name "printcloud-github-v2" --role contributor --scopes "/subscriptions/62221c55-00a3-42a0-b11d-89f949d14861" --query "{clientId:appId, clientSecret:password, subscriptionId:\"62221c55-00a3-42a0-b11d-89f949d14861\", tenantId:tenant, activeDirectoryEndpointUrl:\"https://login.microsoftonline.com\", resourceManagerEndpointUrl:\"https://management.azure.com/\", activeDirectoryGraphResourceId:\"https://graph.windows.net/\", sqlManagementEndpointUrl:\"https://management.core.windows.net:8443/\", galleryEndpointUrl:\"https://gallery.azure.com/\", managementEndpointUrl:\"https://management.core.windows.net/\"}" --output json

echo.
echo ✅ Service Principal criado!
echo 📋 COPIE o JSON acima e cole no GitHub secret AZURE_CREDENTIALS
echo 🌐 GitHub: https://github.com/pcsouzafv/Print_Cloud_v1/settings/secrets/actions
echo.
pause