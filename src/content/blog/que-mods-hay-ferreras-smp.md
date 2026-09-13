---
title: "Qué mods hay en Cubusfera y cómo mantenemos una experiencia cercana a vanilla"
seoTitle: "Qué mods hay en Cubusfera y por qué no necesitas modpack"
description: "Conoce los mods server-side y datapacks de Cubusfera, para qué sirven y por qué puedes jugar sin instalar un modpack."
publishedAt: 2026-07-19
updatedAt: 2026-09-05
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
    href: "/blog/que-es-servidor-smp-minecraft/"
  - title: "Normas de Cubusfera"
    description: "Revisa las bases para construir y convivir respetando a la comunidad."
    href: "/normas/"
---

Cubusfera usa mods y datapacks para proteger el mundo, facilitar la convivencia y que el servidor vaya fino. Casi todos funcionan solo en el servidor, así que entras desde Minecraft Java sin descargar un modpack ni tocar tu cliente.

La idea no es convertir Minecraft en otro juego. Seguimos queriendo un survival reconocible: las mejoras están para que el mundo funcione mejor, para poder reparar un destrozo si ocurre y para que algunas tareas pesadas dejen de serlo.

> Si solo quieres jugar, no necesitas leer esta lista. Está aquí porque nos parece justo que sepas qué corre en el servidor donde vas a construir.

## Qué es un mod server-side

Minecraft separa el cliente —el juego que abres en tu ordenador— del servidor que mantiene el mundo y decide su estado real. Un mod *server-side* se instala y se ejecuta en ese servidor. Si está pensado para hablar con clientes vanilla, tú no necesitas tener nada instalado.

Por eso puedes notar una mejora sin haber descargado nada: el servidor registra quién cambió un bloque, optimiza la generación del mundo o te deja reclamar un terreno mientras tu juego sigue siendo el de siempre. La [documentación de Fabric sobre mods server-side](https://wiki.fabricmc.net/community:serverside_mods) explica esa separación.

No todos los mods son así. Algunos cambian gráficos o interfaz y solo funcionan en el cliente; otros hacen falta en ambos lados. Los de esta lista son los del servidor.

## En qué se parece a un plugin de Paper o Spigot

Desde fuera se parecen bastante: los dos amplían lo que hace el servidor y normalmente entras sin instalar nada. La diferencia está en cómo se integran.

- Fabric carga mods, que trabajan con la lógica de Minecraft y con las API del ecosistema Fabric.
- Paper y Spigot cargan plugins, que usan las API de Bukkit, Spigot o Paper. La [documentación de Paper](https://docs.papermc.io/paper/dev/how-do-plugins-work/) describe su ciclo de vida.
- Un mod de Fabric no es un plugin de Paper, ni un plugin se copia sin más a un servidor Fabric.

Ninguna opción es mejor en abstracto. Usamos Fabric porque nos deja combinar herramientas de administración con optimizaciones internas sin cambiar el comportamiento del juego que queremos conservar.

## Protección del mundo y convivencia

Las piezas que más importan cuando varias personas comparten construcciones y recursos:

- [Open Parties and Claims](https://modrinth.com/mod/open-parties-and-claims) permite crear grupos y reclamar zonas. Es la base de la protección de terrenos.
- [Ledger](https://modrinth.com/mod/ledger) registra las acciones del mundo para poder investigar un cambio o un destrozo. [Ledger Databases](https://modrinth.com/mod/ledger-databases) amplía dónde se guardan esos registros.
- [AntiXray](https://modrinth.com/mod/anti-xray) dificulta localizar minerales con ventaja.
- [BanHammer](https://modrinth.com/mod/banhammer) y [LuckPerms](https://modrinth.com/mod/luckperms) son las herramientas de moderación y permisos.
- [EasyAuth](https://modrinth.com/mod/easyauth) gestiona la autenticación.
- [No Chat Reports](https://modrinth.com/mod/no-chat-reports) cambia el sistema de firma y reporte del chat cuando es posible.

La tecnología ayuda, pero no sustituye a las [normas](/normas/). Las reclamaciones y los registros son la red de seguridad; la convivencia sigue dependiendo de respetar el trabajo de los demás.

## Comunidad e información

[Discord MC Chat](https://modrinth.com/mod/discord-mc-chat) conecta el chat del juego con Discord, para no tener que estar conectados a la vez para hablar.

[BlueMap](https://modrinth.com/mod/bluemap) genera un mapa tridimensional del mundo que se ve desde la web. [TAB](https://modrinth.com/mod/tab-was-taken) organiza la lista de jugadores y [TabTPS](https://modrinth.com/mod/tabtps) muestra datos de rendimiento dentro del juego.

[Server Day Counter](https://modrinth.com/mod/serverdaycounter) lleva la cuenta de los días del mundo y [Villager Names](https://modrinth.com/mod/villager-names-serilum) pone nombre a los aldeanos. Son detalles, pero le dan memoria y carácter al sitio.

## Pequeñas mejoras que siguen sintiéndose vanilla

Cambian acciones concretas sin montar una progresión nueva:

- [RightClickHarvest](https://modrinth.com/mod/rightclickharvest): cosechar y replantar con clic derecho.
- [Armed Stands](https://modrinth.com/mod/armed-stands): brazos y poses en los soportes para armaduras.
- [Clumps](https://modrinth.com/mod/clumps): agrupa los orbes de experiencia, con menos entidades y la misma recompensa.
- [Carpet](https://modrinth.com/mod/carpet): herramientas para analizar y controlar aspectos técnicos.
- [Let Me Despawn](https://modrinth.com/mod/lmd): ajusta la desaparición de criaturas que se quedan cargadas sin motivo.

Son cambios deliberadamente cortos. Sigues explorando, consiguiendo recursos y construyendo con las reglas de siempre.

## Rendimiento y estabilidad

Buena parte de la lista no añade nada visible: reduce carga, acelera tareas internas o evita el tirón al entrar en una zona nueva.

- [Lithium](https://modrinth.com/mod/lithium), [ServerCore](https://modrinth.com/mod/servercore) y [Very Many Players](https://modrinth.com/mod/vmp-fabric) optimizan distintas partes de la lógica del servidor.
- [C2ME](https://modrinth.com/mod/c2me-fabric), [NoisiumForked](https://modrinth.com/mod/noisiumforked) y [Chunky](https://modrinth.com/mod/chunky) trabajan la carga, la generación y la pregeneración de chunks.
- [FerriteCore](https://modrinth.com/mod/ferrite-core) baja el uso de memoria y [ModernFix-mVUS](https://modrinth.com/mod/modernfix-mvus) reúne correcciones y mejoras de rendimiento.
- [Alternate Current](https://modrinth.com/mod/alternate-current) optimiza el polvo de redstone.
- [ScalableLux](https://modrinth.com/mod/scalablelux) mejora el cálculo de la luz.
- [View Distance Fix](https://modrinth.com/mod/view-distance-fix) corrige la niebla cuando tu distancia de renderizado supera la del servidor.

Esto no elimina los límites físicos de una máquina. Sirve para aprovecharla mejor y que la partida sea estable, sin meter mecánicas ajenas al survival.

## Administración y piezas técnicas

Trabajan detrás y no se notan jugando:

- [spark](https://modrinth.com/mod/spark) diagnostica consumo y problemas de rendimiento.
- [Proxy Protocol Support](https://modrinth.com/mod/proxy-protocol-support) añade compatibilidad con conexiones que pasan por un proxy.
- [Fabric API](https://modrinth.com/mod/fabric-api) y [Fabric Language Kotlin](https://modrinth.com/mod/fabric-language-kotlin) dan funciones compartidas que otros mods necesitan.
- [Cloth Config](https://modrinth.com/mod/cloth-config), [Collective](https://modrinth.com/mod/collective) y [Almanac](https://modrinth.com/mod/almanac) son librerías de las que dependen otros.

Son dependencias, no contenido. Existen para que el resto funcione.

## Qué datapacks utiliza Cubusfera

Los datapacks usan el sistema de datos del propio Minecraft para añadir recetas, funciones o ajustes. Tenemos cinco:

- [All Mob Heads](https://modrinth.com/datapack/amh): cabezas de las criaturas del juego.
- [Server Sleep](https://modrinth.com/datapack/serversleep): dormir sin tener que coordinar a todo el servidor cada noche.
- [Craftable Elytra](https://modrinth.com/datapack/craft-elytra): receta para fabricar élitros.
- [SMP Starter](https://modrinth.com/datapack/smp-starter): automatiza parte de la preparación inicial del mundo.
- [Elytra Vaults](https://modrinth.com/datapack/elytra-vaults-atlasplays): cambia el élitro de los barcos del End por bóvedas, para que pueda conseguirlo más de una persona.

Es la parte que más se acerca a añadir contenido, pero siguen siendo cambios concretos. No hay campaña, ni habilidades, ni máquinas, ni una progresión distinta.

## Entonces, ¿qué tienes que instalar?

Nada de esta lista. Para jugar solo necesitas una versión compatible de Minecraft Java y la dirección del servidor: los mods y los datapacks ya están donde tienen que estar.

El resultado es un survival con protección, herramientas de comunidad y una base técnica cuidada, sin convertir la entrada en la instalación de un modpack. Si quieres probarlo, mira [cómo entrar](/como-entrar/) y añade `play.cubusfera.com` a tu lista.
