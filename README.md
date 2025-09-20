# Portfolio Juan Pablo González

Este es mi portfolio personal desarrollado como una Progressive Web App (PWA) optimizada para GitHub Pages.

## 🚀 Características

- ✅ **PWA Completa** - Funciona offline con Service Worker
- ✅ **Responsive Design** - Optimizado para todos los dispositivos
- ✅ **SEO Optimizado** - Meta tags y JSON-LD estructurado
- ✅ **Accesibilidad** - Navegación por teclado y screen readers
- ✅ **Performance** - Carga rápida y optimizada
- ✅ **GitHub Pages** - Completamente compatible

## 🛠️ Tecnologías Utilizadas

- HTML5 semántico
- CSS3 con variables personalizadas
- JavaScript ES6+ modular
- Service Worker para PWA
- Manifest.json para instalación
- Google Analytics

## 📁 Estructura del Proyecto

```
jp-developer0.github.io/
├── index.html              # Página principal
├── manifest.json           # Manifiesto PWA
├── sw.js                   # Service Worker
├── favicon.png             # Ícono del sitio
├── .nojekyll              # Para GitHub Pages
├── src/                    # Código fuente
│   ├── styles/            # Estilos CSS
│   │   ├── main.css      # Archivo principal
│   │   ├── base/         # Estilos base
│   │   └── components/   # Componentes
│   └── scripts/          # JavaScript
│       ├── main.js      # Script principal
│       ├── modules/     # Módulos
│       └── utils/       # Utilidades
├── assets/               # Recursos estáticos
│   └── img/             # Imágenes
├── documents/           # Documentos y certificados
├── projects/           # Páginas de proyectos
└── website_images/     # Imágenes del sitio
```

## 🖥️ Desarrollo Local

### Prerrequisitos

- Un navegador web moderno (Chrome, Firefox, Safari, Edge)
- Un servidor web local (recomendado)

### Opción 1: Servidor HTTP Simple con Python

Si tienes Python instalado:

```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

Luego visita: http://localhost:8000

### Opción 2: Live Server (VS Code)

1. Instala la extensión "Live Server" en VS Code
2. Haz clic derecho en `index.html`
3. Selecciona "Open with Live Server"

### Opción 3: Node.js http-server

```bash
# Instalar globally
npm install -g http-server

# Ejecutar en el directorio del proyecto
http-server -p 8000
```

### Opción 4: Servidor web local simple

Si tienes Node.js instalado, puedes usar npx:

```bash
npx serve .
```

## 🌐 Despliegue en GitHub Pages

### Configuración Automática

1. **Fork o clona** este repositorio
2. **Renombra** el repositorio a `tu-usuario.github.io`
3. Ve a **Settings** → **Pages**
4. Selecciona **Deploy from a branch**
5. Elige **main branch** como fuente
6. El sitio estará disponible en `https://tu-usuario.github.io`

### Configuración Manual

```bash
# Clonar el repositorio
git clone https://github.com/jp-developer0/jp-developer0.github.io.git
cd jp-developer0.github.io

# Realizar cambios
# ... editar archivos ...

# Commit y push
git add .
git commit -m "Update portfolio"
git push origin main
```

## 🔧 Personalización

### Información Personal

Edita las siguientes secciones en `index.html`:

1. **Meta tags** (líneas 4-23)
2. **JSON-LD** (líneas 53-76)
3. **Información personal** (sección #about)
4. **Experiencia profesional** (sección #experience)
5. **Educación** (sección #education)
6. **Proyectos** (sección #portfolio)

### Estilos

Los estilos están organizados en:

- `src/styles/base/` - Variables, reset, tipografía
- `src/styles/components/` - Componentes específicos
- `src/styles/main.css` - Archivo principal

### JavaScript

- `src/scripts/main.js` - Funcionalidad principal
- `src/scripts/modules/` - Módulos específicos
- `src/scripts/utils/` - Funciones de utilidad

## 📱 PWA Features

### Service Worker

El Service Worker (`sw.js`) proporciona:

- **Cache First** para recursos estáticos
- **Network First** para contenido dinámico
- **Stale While Revalidate** para recursos externos
- **Offline fallback** para navegación

### Manifest

El archivo `manifest.json` permite:

- Instalación como app nativa
- Iconos personalizados
- Pantalla de splash
- Tema de color
- Atajos de teclado

## 🧪 Testing

### Verificar PWA

1. Abre DevTools → Application
2. Revisa el Service Worker
3. Verifica el Manifest
4. Prueba el modo offline

### Performance

```bash
# Lighthouse CLI (opcional)
npm install -g lighthouse
lighthouse https://tu-usuario.github.io --view
```

### Validación HTML

Usa el [W3C Markup Validator](https://validator.w3.org/)

## 🔍 SEO y Analytics

### Google Analytics

El sitio incluye Google Analytics configurado. Para usar tu propio tracking:

1. Edita el código en `index.html` (líneas 79-85)
2. Reemplaza `UA-169007209-3` con tu tracking ID

### Sitemap

Para mejorar el SEO, considera agregar:

```xml
<!-- sitemap.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>https://tu-usuario.github.io/</loc>
        <lastmod>2024-01-01</lastmod>
        <priority>1.0</priority>
    </url>
</urlset>
```

## 🐛 Troubleshooting

### Problemas Comunes

**❌ PWA no se instala:**
- Verifica que `manifest.json` sea válido
- Asegúrate de que el Service Worker se registre correctamente
- Revisa que uses HTTPS (GitHub Pages lo proporciona automáticamente)

**❌ CSS/JS no cargan:**
- Verifica las rutas relativas (`./` al inicio)
- Revisa la consola del navegador por errores 404
- Asegúrate de que `.nojekyll` existe

**❌ Service Worker falla:**
- Revisa la consola por errores
- Verifica que las rutas en `STATIC_ASSETS` sean correctas
- Intenta limpiar el cache del navegador

### Debug Mode

Para habilitar logs detallados, abre DevTools → Console y ejecuta:

```javascript
// Habilitar logs del Service Worker
localStorage.setItem('debug', 'true');
location.reload();
```

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📞 Contacto

**Juan Pablo González**
- Email: juan.gonzalez.working@gmail.com
- LinkedIn: [jp-gonzalez](https://www.linkedin.com/in/jp-gonzalez)
- GitHub: [jp-developer0](https://github.com/jp-developer0)

---

⭐ **¡Dale una estrella al proyecto si te fue útil!** ⭐