---
title: Manual básico de incubadoras LibrePollo

---

# Manual de Usuario - Incubadora LibrePollo 
## Innovación tecnológica y productiva en la cadena avícola para la agricultura familiar, campesina e indígena.
![image](https://hackmd.io/_uploads/r1-SmOHvJl.png =x200)
### Indice
[TOC]
### Introducción
LibreIncu es una incubadora de huevos desarrollada por AlterMundi y CTO. Este proyecto,  integra tecnología de monitoreo y control para optimizar la incubación avícola.


### Componentes Principales

#### 1. Sistema de Control de Temperatura
- **Sensor BME280**: Mide temperatura, humedad y presión con  mucha precisión (±0.5°C). Estos datos son los que visualizamos en la app y en grafana
 - **Resistencia Calefactora**: Está fijada bajo la bandeja de humedad. Tiene aprox ~200W, se prende y apaga para lograr el promedio de temperatura que indicamos en la app. De fábrica está calibrado para huevos de pollo: 37,8º
- **Ventilador**: Asegura que el calor se distribuya de manera pareja en toda la cámara y fuerza la entrada de aire con oxígeno para el desarrollo de los pollitos
#### 2. Sistema de Humidificación 
- **Recipiente de Agua**:  Se alimenta de la red doméstica y tiene un flotante para mantener el nivel de agua que la bomba necesita. Es necesario asegurar la correcta posicion del reservorio, la bomba y el flotante además de una conexión de agua segura y sin perdidas, similar a la de un lavaropas (canilla abierta).  
- **Humidificador por microaspersión**: Dentro de la incubadora un microaspersor genera microgotas que en relación con la bandeja y el calor de la resistencia, mantiene el ambiente húmedo.  
#### 3. Sistema de Rotación
- **Motor de Rotación**: Se encuentra en la parte superior y hace subir por fuerza a través de una cinta que se une a las bandejas. Baja soltando la cinta por un contrapeso de plomo ubicado debajo de la última bandeja.
- **Sensores Reed**: Informan al controlador cuando las bandejas de rotación se aproximan al punto máximo superior e inferior"
- **Bandeja Porta Huevos**:  Es desmontable para facilitar su limpieza.
#### 4. Sistema de Control
- **Placa de Control**: Posee un circuito empoderado por un microcontrolador ESP32-s Donde se conectan los componentes como motores y resistencia.
- **App LibrePollo**: A través de la App los usuarios pueden acceder en cualquier momento al estado de la incubadora. Ya sea para conocer la temperatura o el nivel de humedad actual dentro de la misma como para modificar estos valores y monitorearlos de forma histórica.
Además, la aplicación cuenta con un sistema de notificaciones y una pantalla en la cual agregar información sobre la carga de bandejas, permitiendo que el usuario pueda tener todos los datos de importancia sobre la incubadora.

### Cómo empezar a usar la incubadora

#### Ubicación:
- Lugar ventilado pero sin corrientes de aire
- Con acceso a conexión de agua
- Cerca de un tomacorriente
- En lo posible con señal WiFi y al alcance del celular


#### Primer encendido:

- Conectá y encendé la incubadora
- Esperá que aparezca la red WiFi "incu-", luego del guión cada Incubadora tiene un número único de identificación
- Conectate desde tu celular con la contraseña: 12345678
- Configurá los parámetros básicos


### Mantenimiento Básico

1. **Limpieza Regular**
   - Limpiá el interior después de cada ciclo
   - Mantené el recipiente de agua limpio y conectado a la red
   - Revisá que las bandejas estén siempre limpias

2. **Verificaciones Periódicas**
   - Nivel de agua en el recipiente
   - Funcionamiento de la rotación
   - Lecturas de temperatura y humedad

3. Mantenimiento del humidificador:
Desenrosca el pico de aspersión con cuidado, limpia con suavidad la boquilla para retirar suciedades. 


#### Apagado
Cuando apaques la incubadora asegurate de vaciar el circuito de agua y lubricar la bomba para preservarla del óxido.



### Solución de Problemas

1. **La temperatura no sube**
   - Verificá que la resistencia esté funcionando
   - Revisá las conexiones
   - Controlá que el ventilador distribuya el aire

2. **La humedad está baja**
   - Revisá el nivel de agua en el reservorio
   - Verificá que la bomba funcione
   - Controlá que no haya suciedad en el pico microaspersor

3. **La rotación no funciona**
   - Revisá  la posición de la bandeja y los sensores Reed
   - Verificá las conexiones del motor
   - Controlá que las partes (cinta polea y motor) estén bien asociadas.

## Precauciones importantes

- Tratá de no abrirla mientras está funcionando si no es para algún mantenimiento.
- Mantené conexiones de agua sin pérdidas y el reservorio limpio.
- Protegé la incubadora de temperaturas extremas
- No tapes las ventilaciones

### Recordá Siempre
- La paciencia es clave en la incubación
- Lee con cuidado las Buenas Prácticas de manejo de huevos fértiles.
- La constancia en el control hace la diferencia
- Estás participando en un proyecto de tecnología libre y soberana

¡A incubar se ha dicho! 💚 :hatching_chick: 

:::success
 <p xmlns:cc="http://creativecommons.org/ns#" >This work is licensed under <a href="http://creativecommons.org/licenses/by/4.0/?ref=chooser-v1" target="_blank" rel="license noopener noreferrer" style="display:inline-block;">CC BY 4.0<img style="height:22px!important;margin-left:3px;vertical-align:text-bottom;" src="https://mirrors.creativecommons.org/presskit/icons/cc.svg?ref=chooser-v1"><img style="height:22px!important;margin-left:3px;vertical-align:text-bottom;" src="https://mirrors.creativecommons.org/presskit/icons/by.svg?ref=chooser-v1"></a></p> 
:::
