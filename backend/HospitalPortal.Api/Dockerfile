FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 5000

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["HospitalPortal.Api/HospitalPortal.Api.csproj", "HospitalPortal.Api/"]
COPY ["HospitalPortal.Core/HospitalPortal.Core.csproj", "HospitalPortal.Core/"]
RUN dotnet restore "HospitalPortal.Api/HospitalPortal.Api.csproj"
COPY . .
WORKDIR "/src/HospitalPortal.Api"
RUN dotnet build "HospitalPortal.Api.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "HospitalPortal.Api.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENV ASPNETCORE_URLS=http://+:5000
ENTRYPOINT ["dotnet", "HospitalPortal.Api.dll"]
