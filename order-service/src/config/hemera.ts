import Hemera from 'hemera'
import nats from 'nats'

const nc = nats.connect({
    servers: ['nats://nats:4222']
})

const hemera = new Hemera(nc)
export default hemera