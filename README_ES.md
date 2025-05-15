[English](README.md)

check quick demo
[CTRL & Click para ver video-demo en Loom](https://bit.ly/langgraph-ai-agent)

# 🎬 Chatbot/Agente-IA de Películas para Ciudad de Guatemala

Un chatbot impulsado por inteligencia artificial diseñado para asistir a los usuarios en Ciudad de Guatemala con listados de películas, ubicaciones de cines y horarios de funciones. Construido como una herramienta educativa para demostrar la integración del desarrollo web moderno con tecnologías de modelos de lenguaje de gran tamaño (LLM).

## 1. 🧭 Configuración del Proyecto

Este proyecto sirve como material educativo para un taller dirigido a desarrolladores que se adentran en aplicaciones web potenciadas por LLM. Muestra la integración de tecnologías como LangChain, LangGraph, las API de LLM de Anthropic/OpenAI y MongoDB como almacenamiento vectorial, junto con una pila de desarrollo web moderna.

## 2. 🎯 Declaración del Problema

El chatbot aborda la necesidad de un asistente inteligente y localizado capaz de:

- Proporcionar listados de películas para cines específicos.
- Identificar cines que están proyectando una película en particular.
- Confirmar si una película específica se está exhibiendo en un cine determinado.
- Seguramente agregare algunas mas opciones

El chatbot admite consultas tanto en español como en inglés, respondiendo en el idioma de la consulta.

## 3. ⚠️ Consideraciones

- **Fuente de Datos**: Actualmente, los datos se obtienen exclusivamente de la franquicia "Cinépolis", trabajando para incorporar más franquicias próximamente.
- **Alcance Geográfico**: La información se limita a Ciudad de Guatemala y sus alrededores.
- **Actualización de Datos**: El sistema proporciona información solo para el día actual. Un trabajo cron diario siembra los datos necesarios.

## 4. 🛠️ Pila Tecnológica

- **Frontend**: Next.js v15.x con React y TypeScript.
- **Backend**:
  - Node.js con TypeScript.
  - LangChain y LangGraph para la orquestación de LLM.
  - MongoDB como almacenamiento vectorial.
  - Prisma ORM con Prisma Accelerate para almacenamiento en caché.
- **Monorepo**: Gestionado utilizando TurboRepo, utilizando el paquete `create-agent-chat-app` de LangChain AI.

## 5. 🔍 Detalles de Ejecución

- **Modelo de Razonamiento**: Utiliza el modelo `Claude-Sonet-3.7` para cadenas RAG y razonamiento del agente.
- **Respuestas de Herramientas**: El chatbot muestra respuestas de herramientas para mayor transparencia. Esta función puede activarse o desactivarse según la preferencia del usuario.
- **Detección de Idioma**: El sistema detecta el idioma de la consulta del usuario y responde en consecuencia.

## 6. 📹 Demostración

Próximamente estará disponible un video en Loom que demostrará las características y funcionalidades del chatbot.

## Gráfico del Agente

<img src="static/graph.png" width="800" >
