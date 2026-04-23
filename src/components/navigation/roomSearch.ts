export const roomSearchFocusEventName = 'streamshore:focus-room-search'

export function dispatchRoomSearchFocus(): void {
  globalThis.window.dispatchEvent(new Event(roomSearchFocusEventName))
}
