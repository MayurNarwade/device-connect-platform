export class RouteManager {
  constructor() {
    this.currentMode = 'UNKNOWN';
  }

  evaluateState(iceState) {
    // Simple heuristic: update mode based on connection state
    if (iceState === 'connected') {
      // We could infer from candidate type, but for UI we rely on getStats
    }
  }

  getModeFromStats(stats) {
    // In production, parse candidate pair stats to determine LAN/P2P/relay
    return 'P2P'; // placeholder
  }
}