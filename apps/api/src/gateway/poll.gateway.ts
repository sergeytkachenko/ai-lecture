import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  },
})
export class PollGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('join:room')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { code: string },
  ) {
    client.join(data.code);
    return { joined: data.code };
  }

  emitToRoom(room: string, event: string, data: any) {
    this.server.to(room).emit(event, data);
  }
}
