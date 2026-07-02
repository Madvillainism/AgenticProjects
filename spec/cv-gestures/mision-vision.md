# Misión y Visión - CV Gestures Tool

## 🎯 Misión

Desarrollar una herramienta local, ligera y de alta precisión basada en visión artificial que transforme los gestos de las manos en interacciones inmediatas con el sistema operativo. El proyecto busca iniciar de forma recreativa y expresiva (emojis y memes en pantalla) para consolidar un pipeline matemático robusto que, en su fase final, sirva como un sistema de accesibilidad capaz de emular y controlar el mouse por completo sin contacto físico.

## 👁️ Visión

Convertirse en el estándar de código abierto para el control gestual de interfaces en entornos de escritorio, demostrando que no se necesitan costosos sensores de hardware ni modelos pesados de Inteligencia Artificial para lograr un tracking de manos fluido, de baja latencia y con un consumo de recursos mínimo para el usuario.

## 🛠️ Principios de Diseño (Guardarraíles Constitucionales)

1. **Privacidad Absoluta:** El procesamiento de la cámara se realiza estrictamente en tiempo real y de forma local en la CPU. No se almacena, transmite ni registra ningún frame de video.
2. **Eficiencia Crítica:** El hilo de captura y el motor matemático deben optimizarse para no saturar el procesador (limitar a 30 FPS).
3. **Fluidez (Zero-Lag):** La conversión de coordenadas vectoriales a eventos del sistema debe priorizar una latencia menor a 15ms.

## 📐 Stack Tecnológico

- **Lenguaje:** Python 3.11+
- **Visión Artificial:** MediaPipe Hands (tracking de 21 landmarks)
- **Procesamiento de Imagen:** OpenCV
- **Cálculo Matemático:** NumPy (distancias euclidianas entre landmarks)
- **Control del Sistema:** PyAutoGUI / Pynput (solo para emulación de mouse)
- **Imágenes:** APIs/Scraping para memes y emojis (solo para fase recreativa)

## 🔒 Restricciones Técnicas

1. **Sin APIs en la nube** para reconocimiento de gestos
2. **Sin interfaces web** complejas
3. **Procesamiento CPU-only** (sin GPU)
4. **Máximo 2 manos** detectadas simultáneamente
5. **Confianza mínima:** 0.7 para detección y tracking