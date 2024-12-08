import dgram from 'node:dgram'

interface BedrockServerStatus {
  motd: string
  protocol: number
  version: string
  currentPlayers: number
  maxPlayers: number
  serverGuid: string
  gameMode: string
  levelName: string
  gameModeNumeric: number
  port: number
}

class MinecraftBedrockQuery {
  private host: string
  private port: number

  constructor(host: string, port = 19132) {
    this.host = host
    this.port = port
  }

  public async query() {
    try {
      return await this.queryDirect()
    } catch {
      return null
    }
  }

  private async queryDirect(): Promise<BedrockServerStatus> {
    return new Promise((resolve, reject) => {
      const client = dgram.createSocket('udp4')
      const message = this.createUnconnectedPingPacket()

      const timer = setTimeout(() => {
        client.close()
        reject(new Error('Query timed out'))
      }, 5000)

      client.on('error', (err) => {
        client.close()
        reject(err)
      })

      client.on('message', (msg) => {
        clearTimeout(timer)
        client.close()
        try {
          const status = this.parseResponse(msg)
          resolve(status)
        } catch (error) {
          reject(error)
        }
      })

      client.send(message, this.port, this.host, (err) => {
        if (err) {
          client.close()
          reject(err)
        }
      })
    })
  }

  private createUnconnectedPingPacket(): Buffer {
    const packet = Buffer.alloc(1 + 8 + 8 + 16)
    let offset = 0

    packet.writeUInt8(0x01, offset++) // Packet ID (1 for unconnected ping)
    packet.writeBigInt64BE(BigInt(Date.now()), offset) // Time
    offset += 8

    // Magic
    const magic = Buffer.from('00ffff00fefefefefdfdfdfd12345678', 'hex')
    magic.copy(packet, offset)
    offset += 16

    // Client GUID
    packet.writeBigInt64BE(BigInt(2), offset)

    return packet
  }

  private parseResponse(data: Buffer): BedrockServerStatus {
    let offset = 25 // Skip packet ID
    const serverInfoLength = data.readUInt16BE(offset)
    offset += 2
    const serverInfo = data.slice(offset, offset + serverInfoLength).toString('utf8')
    const res = serverInfo.split(';')

    return {
      motd: res[1],
      levelName: res[7],
      protocol: Number.parseInt(res[2], 10),
      version: res[3],
      currentPlayers: Number.parseInt(res[4], 10),
      maxPlayers: Number.parseInt(res[5], 10),
      serverGuid: res[6],
      gameMode: res[8],
      gameModeNumeric: Number.parseInt(res[9], 10),
      port: Number.parseInt(res[10], 10)
    }
  }
}

// Usage example
async function main() {
  const query = new MinecraftBedrockQuery('192.168.1.7')
  try {
    const status = await query.query()
    console.log(JSON.stringify(status, null, 2))
  } catch (error) {
    console.error('Error querying server:', error)
  }
}

main()
