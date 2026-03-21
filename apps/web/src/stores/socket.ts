import { defineStore } from 'pinia';
import { ref } from 'vue';
import { io, Socket } from 'socket.io-client';

export const useSocketStore = defineStore('socket', () => {
  const socket = ref<Socket | null>(null);

  function connect() {
    if (socket.value?.connected) return;
    socket.value = io({ transports: ['websocket', 'polling'] });
  }

  function joinRoom(code: string) {
    connect();
    socket.value?.emit('join:room', { code });
  }

  function on(event: string, handler: (...args: any[]) => void) {
    socket.value?.on(event, handler);
  }

  function off(event: string, handler?: (...args: any[]) => void) {
    socket.value?.off(event, handler);
  }

  function disconnect() {
    socket.value?.disconnect();
    socket.value = null;
  }

  return { socket, connect, joinRoom, on, off, disconnect };
});
