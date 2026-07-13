export const server = {
  name: "Ferreras SMP",
  address: "mc.ferreras.dev",
  discord: "https://discord.gg/f8aBZ98EDT",
  description:
    "Un servidor de supervivencia sencillo, cuidado y cercano a la experiencia original.",
};

export const recommendedClientMods = [
  {
    name: "Xaero’s Minimap",
    description: "Añade un minimapa discreto mientras exploras y construyes.",
  },
  {
    name: "Xaero’s World Map",
    description: "Permite consultar cómodamente el mundo que ya has recorrido.",
  },
  {
    name: "Open Parties and Claims",
    description: "Integra las reclamaciones de terreno con el mapa para crearlas y gestionarlas con más facilidad.",
  },
];

export const rules = [
  {
    title: "Juega limpio",
    text: "No uses trampas, clientes modificados ni cualquier ventaja injusta.",
  },
  {
    title: "Cuida el servidor",
    text: "No intentes saturarlo, explotar errores o perjudicar su funcionamiento.",
  },
  {
    title: "Respeta lo ajeno",
    text: "No rompas, robes o modifiques construcciones y pertenencias de otros jugadores.",
  },
  {
    title: "Deja espacio",
    text: "No construyas excesivamente cerca de otra persona sin pedirle permiso.",
  },
  {
    title: "Convive",
    text: "No acoses, provoques, hagas spam o molestes deliberadamente a los demás.",
  },
  {
    title: "Usa el sentido común",
    text: "Sigue las indicaciones del equipo y avisa de cualquier problema por Discord.",
  },
];

export const modGroups = [
  {
    name: "Rendimiento y estabilidad",
    description: "Mejoras internas para que el mundo responda de forma más fluida.",
    mods: [
      "Alternate Current",
      "C2ME",
      "Clumps",
      "FerriteCore",
      "Lithium",
      "ModernFix",
      "Noisium Forked",
      "ScalableLux",
      "ServerCore",
      "VMP",
      "View Distance Fix",
    ],
  },
  {
    name: "Administración y seguridad",
    description: "Herramientas para moderar, proteger y diagnosticar el servidor.",
    mods: [
      "Anti-Xray",
      "BanHammer",
      "Carpet",
      "Chunky",
      "EasyAuth",
      "Ledger",
      "Ledger Databases",
      "LuckPerms",
      "Open Parties and Claims",
      "Proxy Protocol Support",
      "Spark",
    ],
  },
  {
    name: "Experiencia y comunidad",
    description: "Pequeños ajustes que hacen más agradable el día a día.",
    mods: [
      "Almanac",
      "Armed Stands",
      "BlueMap",
      "Collective",
      "Discord MC Chat",
      "RightClickHarvest",
      "Server Day Counter",
      "Villager Names",
    ],
  },
  {
    name: "Dependencias técnicas",
    description: "Librerías necesarias para el funcionamiento de otros mods.",
    mods: [
      "Cloth Config",
      "Fabric API",
      "Fabric Language Kotlin",
      "Fabric Loader / LMD",
    ],
  },
  {
    name: "Datapacks",
    description: "Contenido y ajustes ligeros integrados directamente en el mundo.",
    mods: [
      "AMH",
      "ServerSleep",
      "Craft Elytra",
      "SMP Starter",
    ],
  },
];
