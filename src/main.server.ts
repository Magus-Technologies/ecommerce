// src\main.server.ts
import { bootstrapApplication } from "@angular/platform-browser"
import { AppComponent } from "./app/app.component"
import { appConfig } from "./app/app.config" // Importa appConfig
import { provideServerRendering } from "@angular/platform-server" // Importa esto

const bootstrap = () =>
  bootstrapApplication(AppComponent, {
    providers: [
      ...appConfig.providers, // ✅ Incluye los proveedores del lado del cliente
      provideServerRendering(), // ✅ Esto provee PLATFORM_ID para el servidor
    ],
  })

export default bootstrap
