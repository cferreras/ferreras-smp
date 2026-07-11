export const emptyPlayerMessages = [
  "El spawn está disfrutando de un momento de paz.",
  "Todo tranquilo. Hasta los chunks están descansando.",
  "El servidor está practicando su monólogo.",
  "Hay sitio de sobra. Sospechosamente de sobra.",
  "El mundo está esperando a que alguien rompa el primer bloque.",
  "Ahora mismo, el jugador más conectado eres tú. Casi.",
] as const;

export const getRandomEmptyPlayerMessage = () =>
  emptyPlayerMessages[Math.floor(Math.random() * emptyPlayerMessages.length)];
