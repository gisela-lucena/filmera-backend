import jwt from "jsonwebtoken";
import { WebSocket, WebSocketServer } from "ws";
import Room from "../models/room.js";

const clientsByRoom = new Map();

const serializeRoom = (room) => ({
  _id: room._id,
  code: room.code,
  participants: room.participants,
  movies: room.movies,
  filters: room.filters,
  status: room.status,
  matchedMovie: room.matchedMovie,
});

const send = (socket, event) => {
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(event));
  }
};

const removeClient = (roomCode, socket) => {
  const clients = clientsByRoom.get(roomCode);
  if (!clients) {
    return;
  }

  clients.delete(socket);
  if (clients.size === 0) {
    clientsByRoom.delete(roomCode);
  }
};

export const broadcastRoomEvent = (roomCode, type, room, data = {}) => {
  const clients = clientsByRoom.get(roomCode.toUpperCase());
  if (!clients) {
    return;
  }

  const event = {
    type,
    room: serializeRoom(room),
    ...data,
  };

  clients.forEach((socket) => send(socket, event));
};

export const setupWebSocketServer = (server) => {
  const webSocketServer = new WebSocketServer({ noServer: true });

  server.on("upgrade", async (request, socket, head) => {
    try {
      const url = new URL(request.url, `http://${request.headers.host}`);
      const match = url.pathname.match(/^\/rooms\/([^/]+)\/ws$/);

      if (!match) {
        socket.destroy();
        return;
      }

      const token = url.searchParams.get("token");
      if (!token) {
        socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
        socket.destroy();
        return;
      }

      const payload = jwt.verify(token, process.env.JWT_SECRET || "dev-secret");
      const roomCode = decodeURIComponent(match[1]).toUpperCase();
      const room = await Room.findOne({ code: roomCode });
      const isParticipant = room?.participants.some(
        (participant) => participant.toString() === payload._id?.toString(),
      );

      if (!room || !isParticipant) {
        socket.write("HTTP/1.1 403 Forbidden\r\n\r\n");
        socket.destroy();
        return;
      }

      webSocketServer.handleUpgrade(request, socket, head, (webSocket) => {
        webSocketServer.emit("connection", webSocket, {
          room,
          roomCode,
          userId: payload._id,
        });
      });
    } catch {
      socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
      socket.destroy();
    }
  });

  webSocketServer.on("connection", (socket, { room, roomCode, userId }) => {
    const clients = clientsByRoom.get(roomCode) || new Set();
    clients.add(socket);
    clientsByRoom.set(roomCode, clients);

    socket.isAlive = true;
    socket.userId = userId;
    socket.on("pong", () => {
      socket.isAlive = true;
    });
    socket.on("close", () => removeClient(roomCode, socket));
    socket.on("error", () => removeClient(roomCode, socket));

    send(socket, {
      type: "room.updated",
      room: serializeRoom(room),
    });
  });

  const heartbeat = setInterval(() => {
    webSocketServer.clients.forEach((socket) => {
      if (!socket.isAlive) {
        socket.terminate();
        return;
      }

      socket.isAlive = false;
      socket.ping();
    });
  }, 30000);

  server.on("close", () => clearInterval(heartbeat));

  return webSocketServer;
};
