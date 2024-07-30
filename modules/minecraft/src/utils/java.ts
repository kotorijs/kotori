import net from 'node:net'

interface ServerStatus {
  version: {
    name: string
    protocol: number
  }
  players: {
    max: number
    online: number
    sample: { name: string; id: string }[]
  }
  description: {
    text: string
  }
  favicon: string
}

class MinecraftServerQuery {
  private host: string
  private port: number

  constructor(host: string, port = 25565) {
    this.host = host
    this.port = port
  }

  public async query(): Promise<ServerStatus> {
    return new Promise((resolve, reject) => {
      const socket = new net.Socket()

      socket.on('error', (error) => {
        reject(error)
      })

      socket.on('timeout', () => {
        socket.destroy()
        reject(new Error('Connection timed out'))
      })

      socket.connect(this.port, this.host, () => {
        this.sendHandshake(socket)
          .then(() => this.sendStatusRequest(socket))
          .then((status) => {
            socket.destroy()
            resolve(status)
          })
          .catch((error) => {
            socket.destroy()
            reject(error)
          })
      })

      socket.setTimeout(5000) // 5 seconds timeout
    })
  }

  private async sendHandshake(socket: net.Socket): Promise<void> {
    return new Promise((resolve, reject) => {
      const handshakeBuffer = this.createHandshakePacket()
      socket.write(handshakeBuffer, (err) => {
        if (err) reject(new Error(`Failed to send handshake: ${err.message}`))
        else resolve()
      })
    })
  }

  private async sendStatusRequest(socket: net.Socket): Promise<ServerStatus> {
    return new Promise((resolve, reject) => {
      const statusRequestBuffer = Buffer.from([0x01, 0x00])
      socket.write(statusRequestBuffer, (err) => {
        if (err) reject(new Error(`Failed to send status request: ${err.message}`))
      })

      let responseData = Buffer.alloc(0)

      socket.on('data', (data) => {
        responseData = Buffer.concat([responseData, data])

        try {
          const status = this.parseResponse(responseData)
          resolve(status)
        } catch (error) {
          reject(error)
        }
      })
    })
  }

  private createHandshakePacket(): Buffer {
    const hostBuffer = Buffer.from(this.host, 'utf8')
    const packet = Buffer.alloc(10 + hostBuffer.length)
    let offset = 0

    packet.writeInt8(0x00, offset++) // Packet ID
    packet.writeInt8(0x47, offset++) // Protocol version (71)
    packet.writeInt8(hostBuffer.length, offset++) // Host length
    hostBuffer.copy(packet, offset)
    offset += hostBuffer.length
    packet.writeUInt16BE(this.port, offset)
    offset += 2
    packet.writeInt8(0x01, offset++) // Next state (1 for status)

    const packetLength = Buffer.alloc(1)
    packetLength.writeInt8(packet.length)

    return Buffer.concat([packetLength, packet])
  }

  private parseResponse(data: Buffer): ServerStatus {
    let offset = 0

    // Skip packet length and packet ID
    offset += 5

    // Read JSON length
    const jsonLength = data.readInt32BE(offset)
    offset += 4

    // Read JSON data
    const jsonData = data.slice(offset, offset + jsonLength).toString('utf8')

    return JSON.parse(jsonData)
  }
}

// Usage example
async function main() {
  const query = new MinecraftServerQuery('mc.hypixel.net')
  try {
    const status = await query.query()
    console.log(JSON.stringify(status, null, 2))
  } catch (error) {
    console.error('Error querying server:', error)
  }
}

main()
