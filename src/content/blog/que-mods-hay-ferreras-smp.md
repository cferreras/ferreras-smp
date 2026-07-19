---
title: "Qué mods hay en Ferreras SMP y cómo mantenemos una experiencia cercana a vanilla"
description: "Conoce los mods server-side y datapacks de Ferreras SMP, para qué sirven y por qué puedes jugar sin instalar un modpack."
publishedAt: 2026-07-19
updatedAt: 2026-07-19
author: "Carlos Ferreras"
category: "Servidor"
tags:
  - minecraft-java
  - mods-server-side
  - fabric
  - survival
image: "/images/blog/que-mods-hay-ferreras-smp.webp"
imageAlt: "Dos jugadores contemplan una base survival protegida, con cultivos, aldeanos y mecanismos de redstone"
draft: false
relatedLinks:
  - title: "Qué es un servidor SMP de Minecraft"
    description: "Descubre cómo funciona un mundo survival compartido y qué puedes esperar al entrar."
    href: "/blog/que-es-servidor-smp-minecraft"
  - title: "Mods de cliente recomendados"
    description: "Consulta las herramientas opcionales para el mapa y la gestión de terrenos."
    href: "/mods-recomendados"
  - title: "Normas de Ferreras SMP"
    description: "Revisa las bases para construir y convivir respetando a la comunidad."
    href: "/normas"
---

Ferreras SMP utiliza mods y datapacks para proteger el mundo, facilitar la convivencia y mejorar el rendimiento. La mayoría trabaja únicamente en el servidor: puedes entrar desde Minecraft Java sin descargar un modpack ni modificar tu cliente.

La idea no es transformar Minecraft en otro juego. Seguimos buscando una experiencia survival reconocible y cercana a vanilla. Las mejoras técnicas están ahí para que el mundo funcione mejor, se pueda reparar un daño si ocurre y algunas tareas cotidianas resulten más cómodas.

## Qué es un mod server-side

Minecraft separa el cliente —el juego que abres en tu ordenador— del servidor que mantiene el mundo y decide su estado real. Un mod *server-side* se instala y ejecuta en ese servidor. Si está diseñado para comunicarse con clientes vanilla, el jugador no necesita tener una copia instalada.

Por eso puedes notar una mejora añadida por un mod sin haber descargado nada: el servidor puede registrar quién modificó un bloque, optimizar la generación del mundo o permitir reclamar un terreno mientras tu cliente sigue funcionando con normalidad. La [documentación de Fabric sobre mods server-side](https://wiki.fabricmc.net/community:serverside_mods) explica esta separación entre servidor y cliente.

Esto no significa que todos los mods de Minecraft sean server-side. Algunos modifican gráficos o interfaces y solo funcionan en el cliente; otros necesitan estar instalados en ambos lados. La lista de este artículo corresponde a las herramientas que utiliza el servidor.

## En qué se parece a un plugin de Paper o Spigot

Desde el punto de vista del jugador, un mod server-side de Fabric puede parecerse mucho a un plugin de Paper o Spigot: ambos amplían las funciones del servidor y normalmente permiten entrar sin instalar nada adicional.

La diferencia principal está en cómo se integran:

- Fabric carga mods y les permite trabajar con la lógica de Minecraft y con las API del ecosistema Fabric.
- Paper y Spigot cargan plugins que utilizan las API de Bukkit, Spigot o Paper. La [documentación de Paper](https://docs.papermc.io/paper/dev/how-do-plugins-work/) describe su carga y ciclo de vida.
- Un mod de Fabric no es automáticamente un plugin de Paper, ni un plugin puede copiarse sin más a un servidor Fabric.

No hay una opción universalmente mejor. En Ferreras SMP usamos Fabric porque nos permite combinar herramientas de administración con optimizaciones internas manteniendo el comportamiento del juego que queremos conservar.

## Protección del mundo y convivencia

Estas son las herramientas más importantes cuando varias personas comparten construcciones y recursos:

- [Open Parties and Claims](https://modrinth.com/mod/open-parties-and-claims) permite crear grupos y reclamar zonas. Es la base técnica de la protección de terrenos del servidor.
- [Ledger](https://modrinth.com/mod/ledger) registra acciones del mundo para que el equipo pueda investigar cambios o daños. [Ledger Databases](https://modrinth.com/mod/ledger-databases) amplía las opciones de almacenamiento de esos registros.
- [AntiXray](https://modrinth.com/mod/anti-xray) ayuda a combatir el uso de ventajas injustas para localizar minerales.
- [BanHammer](https://modrinth.com/mod/banhammer) y [LuckPerms](https://modrinth.com/mod/luckperms) aportan herramientas de moderación y permisos.
- [EasyAuth](https://modrinth.com/mod/easyauth) gestiona la autenticación en servidores Fabric.
- [No Chat Reports](https://modrinth.com/mod/no-chat-reports) modifica el sistema de firma y reporte del chat cuando es posible.

La tecnología ayuda, pero no sustituye a las [normas de Ferreras SMP](/normas). Las reclamaciones y los registros sirven como red de seguridad; la convivencia sigue dependiendo de respetar el trabajo de otras personas.

## Comunidad e información dentro y fuera del juego

[Discord MC Chat](https://modrinth.com/mod/discord-mc-chat) conecta el chat de Minecraft con Discord. Esto ayuda a mantener el contacto con la comunidad sin obligar a todo el mundo a estar conectado al juego al mismo tiempo.

[BlueMap](https://modrinth.com/mod/bluemap) genera una representación tridimensional del mundo para visualizarla desde la web. [TAB](https://modrinth.com/mod/tab-was-taken) organiza información mostrada en la lista de jugadores, mientras que [TabTPS](https://modrinth.com/mod/tabtps) permite supervisar datos de rendimiento desde elementos de la interfaz del juego.

[Server Day Counter](https://modrinth.com/mod/serverdaycounter) muestra el día del mundo y [Villager Names](https://modrinth.com/mod/villager-names-serilum) da nombres a los aldeanos. Son detalles pequeños, pero ayudan a que el mundo compartido tenga memoria y personalidad.

## Pequeñas mejoras que siguen sintiéndose vanilla

Algunos mods cambian acciones concretas sin crear un sistema de progresión nuevo:

- [RightClickHarvest](https://modrinth.com/mod/rightclickharvest) permite cosechar y replantar cultivos con clic derecho.
- [Armed Stands](https://modrinth.com/mod/armed-stands) añade brazos a los soportes para armaduras y permite ajustar su estado.
- [Clumps](https://modrinth.com/mod/clumps) agrupa orbes de experiencia, reduciendo entidades sin cambiar la recompensa obtenida.
- [Carpet](https://modrinth.com/mod/carpet) incorpora herramientas para analizar y controlar aspectos técnicos del juego.
- [Let Me Despawn](https://modrinth.com/mod/lmd) ajusta la desaparición de criaturas que permanecen cargadas de forma involuntaria.

Son cambios deliberadamente limitados. El jugador sigue explorando, consiguiendo recursos, construyendo y sobreviviendo con las reglas reconocibles de Minecraft.

## Rendimiento y estabilidad

Una parte grande de la lista no añade contenido visible. Su función es reducir carga, acelerar tareas internas o evitar que una zona nueva provoque una pausa innecesaria.

- [Lithium](https://modrinth.com/mod/lithium), [ServerCore](https://modrinth.com/mod/servercore) y [Very Many Players](https://modrinth.com/mod/vmp-fabric) optimizan distintos aspectos de la lógica y el funcionamiento del servidor.
- [C2ME](https://modrinth.com/mod/c2me-fabric), [NoisiumForked](https://modrinth.com/mod/noisiumforked) y [Chunky](https://modrinth.com/mod/chunky) trabajan alrededor de la carga, generación y pregeneración de chunks.
- [FerriteCore](https://modrinth.com/mod/ferrite-core) reduce el uso de memoria y [ModernFix-mVUS](https://modrinth.com/mod/modernfix-mvus) reúne correcciones y mejoras de rendimiento.
- [Alternate Current](https://modrinth.com/mod/alternate-current) optimiza el funcionamiento del polvo de redstone.
- [ScalableLux](https://modrinth.com/mod/scalablelux) mejora el cálculo de actualizaciones de luz.
- [View Distance Fix](https://modrinth.com/mod/view-distance-fix) corrige la niebla cuando la distancia de renderizado del cliente supera la configurada en el servidor.

Estas optimizaciones no eliminan todos los límites físicos de un servidor. Su objetivo es aprovechar mejor los recursos y mantener una experiencia más estable sin introducir mecánicas ajenas al survival.

## Administración y piezas técnicas

Otras herramientas trabajan detrás de escena:

- [spark](https://modrinth.com/mod/spark) permite diagnosticar consumo y problemas de rendimiento.
- [Proxy Protocol Support](https://modrinth.com/mod/proxy-protocol-support) añade compatibilidad con conexiones que pasan por un proxy compatible.
- [Fabric API](https://modrinth.com/mod/fabric-api) y [Fabric Language Kotlin](https://modrinth.com/mod/fabric-language-kotlin) ofrecen funciones compartidas que necesitan otros mods.
- [Cloth Config](https://modrinth.com/mod/cloth-config), [Collective](https://modrinth.com/mod/collective) y [Almanac](https://modrinth.com/mod/almanac) son librerías o bases comunes para otros proyectos.

Estas dependencias forman parte de la instalación, pero no tendría sentido presentarlas como contenido jugable. Existen para que el resto de herramientas pueda funcionar.

## Qué datapacks utiliza Ferreras SMP

Los datapacks aprovechan el sistema de datos incorporado en Minecraft para añadir recetas, funciones o ajustes al mundo. Ferreras SMP utiliza cinco:

- [All Mob Heads](https://modrinth.com/datapack/amh) permite obtener cabezas de las criaturas del juego.
- [Server Sleep](https://modrinth.com/datapack/serversleep) adapta el descanso a una partida multijugador para que no sea necesario coordinar a todo el servidor cada noche.
- [Craftable Elytra](https://modrinth.com/datapack/craft-elytra) añade una receta para fabricar élitros.
- [SMP Starter](https://modrinth.com/datapack/smp-starter) automatiza parte de la preparación inicial de un mundo SMP.
- [Elytra Vaults](https://modrinth.com/datapack/elytra-vaults-atlasplays) sustituye el élitro de los barcos del End por bóvedas para que varias personas puedan conseguirlo.

Los datapacks son la parte que más se acerca a añadir contenido, pero siguen siendo cambios concretos. No incorporan una campaña, árboles de habilidades, máquinas ni una progresión diferente de la habitual.

## Entonces, ¿qué tienes que instalar para entrar?

Nada de esta lista. Para jugar en Ferreras SMP solo necesitas una versión compatible de Minecraft Java y la dirección del servidor. Los mods server-side y los datapacks ya están instalados donde corresponde.

Si quieres más comodidad, puedes añadir de forma opcional Xaero’s Minimap, Xaero’s World Map y Open Parties and Claims en tu cliente. No son requisitos de acceso; consulta sus funciones y fuentes en la página de [mods recomendados](/mods-recomendados).

El resultado es un survival con protección, herramientas de comunidad y una base técnica cuidada, pero sin convertir la entrada en la instalación de un modpack. Si quieres probarlo, revisa [cómo entrar a Ferreras SMP](/como-entrar) y añade `mc.ferreras.dev` a tu lista multijugador.
